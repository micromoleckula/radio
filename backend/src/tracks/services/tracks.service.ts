import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateTrackDto } from "../dto/create-track.dto";
import { ListTracksDto } from "../dto/list-tracks.dto";
import { TrackListResponseDto } from "../dto/track-list-response.dto";
import { UpdateTrackDto } from "../dto/update-track.dto";
import { Track } from "../entities/track.entity";
import { toTrackListItem } from "../domain/track.mapper";
import { TrackCoverStorageService } from "./track-cover-storage.service";
import { TrackStorageService, type AudioStream } from "./track-storage.service";
import { TrackManagementService } from "./track-management.service";
import type {
  TrackListItem,
  TrackUploadFiles,
} from "../domain/tracks.types";

@Injectable()
export class TracksService {
  constructor(
    @InjectRepository(Track)
    private readonly trackRepository: Repository<Track>,
    private readonly trackStorage: TrackStorageService,
    private readonly coverStorage: TrackCoverStorageService,
    private readonly trackManagement: TrackManagementService,
  ) {}

  async list(query: ListTracksDto): Promise<TrackListResponseDto> {
    const search = query.q ? `%${escapeLikePattern(query.q)}%` : undefined;
    const queryBuilder = this.trackRepository
      .createQueryBuilder("track")
      .addSelect("track.audioPath")
      .orderBy("track.title", "ASC")
      .addOrderBy("track.id", "ASC")
      .skip(query.offset)
      .take(query.limit);

    if (search) {
      queryBuilder.where(
        "track.title ILIKE :search OR track.artist ILIKE :search OR track.album ILIKE :search",
        { search },
      );
    }

    const [tracks, total] = await queryBuilder.getManyAndCount();

    return new TrackListResponseDto(
      await Promise.all(
        tracks.map(async (track) =>
          toTrackListItem(
            track,
            await this.trackStorage.isAvailable(track.audioPath),
            await this.coverStorage.isAvailable(track.coverPath),
          ),
        ),
      ),
      total,
      query.limit,
      query.offset,
    );
  }

  create(dto: CreateTrackDto, files: TrackUploadFiles): Promise<TrackListItem> {
    return this.trackManagement.create(dto, files);
  }

  updateTrackData(
    trackId: number,
    dto: UpdateTrackDto,
    files: TrackUploadFiles,
  ): Promise<TrackListItem> {
    return this.trackManagement.updateTrackData(trackId, dto, files);
  }

  delete(trackId: number): Promise<void> {
    return this.trackManagement.delete(trackId);
  }

  async openCoverStream(trackId: number): Promise<AudioStream> {
    const track = await this.trackRepository
      .createQueryBuilder("track")
      .addSelect("track.coverPath")
      .where("track.id = :trackId", { trackId })
      .getOne();

    if (!track?.coverPath) {
      throw new NotFoundException("Cover image not found");
    }

    return this.coverStorage.open(track.coverPath);
  }

  async openAudioStream(trackId: number, range?: string): Promise<AudioStream> {
    const track = await this.trackRepository
      .createQueryBuilder("track")
      .addSelect("track.audioPath")
      .where("track.id = :trackId", { trackId })
      .getOne();

    if (!track) {
      throw new NotFoundException("Track not found");
    }

    return this.trackStorage.openStream(track.audioPath, range);
  }
}

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}
