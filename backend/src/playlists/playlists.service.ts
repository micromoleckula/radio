import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { User } from "../auth/entities/user.entity";
import { Track } from "../tracks/entities/track.entity";
import { toTrackListItem } from "../tracks/domain/track.mapper";
import { TrackCoverStorageService } from "../tracks/services/track-cover-storage.service";
import { TrackStorageService } from "../tracks/services/track-storage.service";
import { CreatePlaylistDto } from "./dto/create-playlist.dto";
import { ListPlaylistsDto } from "./dto/list-playlists.dto";
import {
  PlaylistDetailDto,
  PlaylistListResponseDto,
  PlaylistSummaryDto,
} from "./dto/playlist-response.dto";
import { PlaylistTrack } from "./entities/playlist-track.entity";
import { Playlist } from "./entities/playlist.entity";
import { PlaylistTrackQueriesRepository } from "./repositories/playlist-track-queries.repository";
import {
  toPlaylistDetailDto,
  toPlaylistSummaryDto,
} from "./domain/playlist-response.mapper";

@Injectable()
export class PlaylistsService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Playlist)
    private readonly playlistRepository: Repository<Playlist>,
    @InjectRepository(PlaylistTrack)
    private readonly playlistTrackRepository: Repository<PlaylistTrack>,
    @InjectRepository(Track)
    private readonly trackRepository: Repository<Track>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly playlistTrackQueries: PlaylistTrackQueriesRepository,
    private readonly trackStorage: TrackStorageService,
    private readonly coverStorage: TrackCoverStorageService,
  ) {}

  async list(
    ownerId: number,
    query: ListPlaylistsDto,
  ): Promise<PlaylistListResponseDto> {
    const [playlists, total] = await this.playlistRepository.findAndCount({
      where: { ownerId },
      order: { createdAt: "DESC", id: "DESC" },
      skip: query.offset,
      take: query.limit,
    });
    const playlistIds = playlists.map((playlist) => playlist.id);
    const trackCounts =
      await this.playlistTrackQueries.getTrackCountsByPlaylistIds(playlistIds);
    const trackCountByPlaylistId = new Map(
      trackCounts.map(({ playlistId, trackCount }) => [
        playlistId,
        Number(trackCount),
      ]),
    );
    const playlistIdsContainingTrack =
      query.trackId === undefined
        ? new Set<number>()
        : new Set(
            await this.playlistTrackQueries.getPlaylistIdsContainingTrack(
              playlistIds,
              query.trackId,
            ),
          );

    return new PlaylistListResponseDto({
      items: playlists.map(
        (playlist) =>
          toPlaylistSummaryDto(
            playlist,
            trackCountByPlaylistId.get(playlist.id) ?? 0,
            query.trackId === undefined
              ? undefined
              : playlistIdsContainingTrack.has(playlist.id),
          ),
      ),
      total,
      limit: query.limit,
      offset: query.offset,
    });
  }

  async create(
    ownerId: number,
    dto: CreatePlaylistDto,
  ): Promise<PlaylistSummaryDto> {
    const ownerExists = await this.userRepository.existsBy({ id: ownerId });

    if (!ownerExists) {
      throw new NotFoundException("User not found");
    }

    const playlist = await this.playlistRepository.save(
      this.playlistRepository.create({ title: dto.title, ownerId }),
    );

    return toPlaylistSummaryDto(playlist, 0);
  }

  async get(ownerId: number, playlistId: number): Promise<PlaylistDetailDto> {
    const playlist = await this.playlistRepository
      .createQueryBuilder("playlist")
      .leftJoinAndSelect("playlist.playlistTracks", "playlistTrack")
      .leftJoinAndSelect("playlistTrack.track", "track")
      .addSelect("track.audioPath")
      .where("playlist.id = :playlistId", { playlistId })
      .andWhere("playlist.ownerId = :ownerId", { ownerId })
      .orderBy("playlistTrack.position", "ASC")
      .addOrderBy("playlistTrack.addedAt", "ASC")
      .getOne();

    if (!playlist) {
      throw new NotFoundException("Playlist not found");
    }

    return toPlaylistDetailDto(
      playlist,
      await Promise.all(
        playlist.playlistTracks.map(async ({ track }) =>
          toTrackListItem(
            track,
            await this.trackStorage.isAvailable(track.audioPath),
            await this.coverStorage.isAvailable(track.coverPath),
          ),
        ),
      ),
    );
  }

  async rename(
    ownerId: number,
    playlistId: number,
    dto: CreatePlaylistDto,
  ): Promise<PlaylistDetailDto> {
    const playlist = await this.requireOwnedPlaylist(ownerId, playlistId);
    playlist.title = dto.title;
    await this.playlistRepository.save(playlist);
    return this.get(ownerId, playlistId);
  }

  async delete(ownerId: number, playlistId: number): Promise<void> {
    const result = await this.playlistRepository.delete({
      id: playlistId,
      ownerId,
    });

    if (!result.affected) {
      throw new NotFoundException("Playlist not found");
    }
  }

  async addTrack(
    ownerId: number,
    playlistId: number,
    trackId: number,
  ): Promise<PlaylistDetailDto> {
    await this.requireOwnedPlaylist(ownerId, playlistId);
    const trackExists = await this.trackRepository.existsBy({ id: trackId });

    if (!trackExists) {
      throw new NotFoundException("Track not found");
    }

    const position = await this.playlistTrackRepository.countBy({ playlistId });
    await this.playlistTrackRepository
      .createQueryBuilder()
      .insert()
      .values({ playlistId, trackId, position })
      .orIgnore()
      .execute();

    return this.get(ownerId, playlistId);
  }

  async removeTrack(
    ownerId: number,
    playlistId: number,
    trackId: number,
  ): Promise<PlaylistDetailDto> {
    await this.requireOwnedPlaylist(ownerId, playlistId);
    await this.playlistTrackRepository.delete({ playlistId, trackId });
    return this.get(ownerId, playlistId);
  }

  async reorderTracks(
    ownerId: number,
    playlistId: number,
    trackIds: number[],
  ): Promise<PlaylistDetailDto> {
    await this.requireOwnedPlaylist(ownerId, playlistId);
    const currentTracks = await this.playlistTrackRepository.find({
      where: { playlistId },
      order: { position: "ASC", addedAt: "ASC" },
    });
    const currentTrackIds = new Set(currentTracks.map((item) => item.trackId));

    if (
      trackIds.length !== currentTracks.length ||
      trackIds.some((trackId) => !currentTrackIds.has(trackId))
    ) {
      throw new BadRequestException(
        "Track order must contain every playlist track exactly once",
      );
    }

    await this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(PlaylistTrack);

      for (const [position, trackId] of trackIds.entries()) {
        await repository.update({ playlistId, trackId }, { position });
      }
    });

    return this.get(ownerId, playlistId);
  }

  private async requireOwnedPlaylist(
    ownerId: number,
    playlistId: number,
  ): Promise<Playlist> {
    const playlist = await this.playlistRepository.findOneBy({
      id: playlistId,
      ownerId,
    });

    if (!playlist) {
      throw new NotFoundException("Playlist not found");
    }

    return playlist;
  }
}
