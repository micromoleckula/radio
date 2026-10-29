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
import type { TrackListItem } from "../tracks/domain/tracks.types";
import { CreatePlaylistDto } from "./dto/create-playlist.dto";
import { ListPlaylistsDto } from "./dto/list-playlists.dto";
import { PlaylistTrack } from "./entities/playlist-track.entity";
import { Playlist } from "./entities/playlist.entity";

export interface PlaylistSummary {
  id: number;
  title: string;
  createdAt: Date;
  trackCount: number;
}

export interface PlaylistDetail extends Omit<PlaylistSummary, "trackCount"> {
  tracks: TrackListItem[];
}

export interface PlaylistListResponse {
  items: PlaylistSummary[];
  total: number;
  limit: number;
  offset: number;
}

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
  ) {}

  async list(
    ownerId: number,
    query: ListPlaylistsDto,
  ): Promise<PlaylistListResponse> {
    const [playlists, total] = await this.playlistRepository.findAndCount({
      where: { ownerId },
      order: { createdAt: "DESC", id: "DESC" },
      skip: query.offset,
      take: query.limit,
    });
    const playlistIds = playlists.map((playlist) => playlist.id);
    const trackCounts =
      playlistIds.length > 0
        ? await this.playlistTrackRepository
            .createQueryBuilder("playlistTrack")
            .select("playlistTrack.playlistId", "playlistId")
            .addSelect("COUNT(*)", "trackCount")
            .where("playlistTrack.playlistId IN (:...playlistIds)", {
              playlistIds,
            })
            .groupBy("playlistTrack.playlistId")
            .getRawMany<{
              playlistId: number;
              trackCount: string;
            }>()
        : [];
    const trackCountByPlaylistId = new Map(
      trackCounts.map(({ playlistId, trackCount }) => [
        playlistId,
        Number(trackCount),
      ]),
    );

    return {
      items: playlists.map((playlist) => ({
        id: playlist.id,
        title: playlist.title,
        createdAt: playlist.createdAt,
        trackCount: trackCountByPlaylistId.get(playlist.id) ?? 0,
      })),
      total,
      limit: query.limit,
      offset: query.offset,
    };
  }

  async create(
    ownerId: number,
    dto: CreatePlaylistDto,
  ): Promise<PlaylistSummary> {
    const ownerExists = await this.userRepository.existsBy({ id: ownerId });

    if (!ownerExists) {
      throw new NotFoundException("User not found");
    }

    const playlist = await this.playlistRepository.save(
      this.playlistRepository.create({ title: dto.title, ownerId }),
    );

    return {
      id: playlist.id,
      title: playlist.title,
      createdAt: playlist.createdAt,
      trackCount: 0,
    };
  }

  async get(ownerId: number, playlistId: number): Promise<PlaylistDetail> {
    const playlist = await this.playlistRepository
      .createQueryBuilder("playlist")
      .leftJoinAndSelect("playlist.playlistTracks", "playlistTrack")
      .leftJoinAndSelect("playlistTrack.track", "track")
      .where("playlist.id = :playlistId", { playlistId })
      .andWhere("playlist.ownerId = :ownerId", { ownerId })
      .orderBy("playlistTrack.position", "ASC")
      .addOrderBy("playlistTrack.addedAt", "ASC")
      .getOne();

    if (!playlist) {
      throw new NotFoundException("Playlist not found");
    }

    return {
      id: playlist.id,
      title: playlist.title,
      createdAt: playlist.createdAt,
      tracks: playlist.playlistTracks.map(({ track }) =>
        toTrackListItem(track),
      ),
    };
  }

  async rename(
    ownerId: number,
    playlistId: number,
    dto: CreatePlaylistDto,
  ): Promise<PlaylistDetail> {
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
  ): Promise<PlaylistDetail> {
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
  ): Promise<PlaylistDetail> {
    await this.requireOwnedPlaylist(ownerId, playlistId);
    await this.playlistTrackRepository.delete({ playlistId, trackId });
    return this.get(ownerId, playlistId);
  }

  async reorderTracks(
    ownerId: number,
    playlistId: number,
    trackIds: number[],
  ): Promise<PlaylistDetail> {
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
