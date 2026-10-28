import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import { CreateTrackDto } from "./dto/create-track.dto";
import { ListTracksDto } from "./dto/list-tracks.dto";
import { UpdateTrackDto } from "./dto/update-track.dto";
import { Track } from "./entities/track.entity";
import { toTrackListItem } from "./track.mapper";
import { TrackCoverStorageService } from "./track-cover-storage.service";
import { TrackStorageService, type AudioStream } from "./track-storage.service";
import { TrackManagementService } from "./track-management.service";
import type {
  TrackListItem,
  TrackListResponse,
  TrackUploadFiles,
} from "./tracks.types";

@Injectable()
export class TracksService {
  constructor(
    @InjectRepository(Track)
    private readonly trackRepository: Repository<Track>,
    private readonly trackStorage: TrackStorageService,
    private readonly coverStorage: TrackCoverStorageService,
    private readonly trackManagement: TrackManagementService,
  ) {}

  async list(query: ListTracksDto): Promise<TrackListResponse> {
    const search = query.q ? `%${escapeLikePattern(query.q)}%` : undefined;
    const [tracks, total] = await this.trackRepository.findAndCount({
      ...(search
        ? {
            where: [
              { title: ILike(search) },
              { artist: ILike(search) },
              { album: ILike(search) },
            ],
          }
        : {}),
      order: { title: "ASC", id: "ASC" },
      skip: query.offset,
      take: query.limit,
    });

    return {
      items: tracks.map(toTrackListItem),
      total,
      limit: query.limit,
      offset: query.offset,
    };
  }

  create(dto: CreateTrackDto, files: TrackUploadFiles): Promise<TrackListItem> {
    return this.trackManagement.create(dto, files);
  }

  update(
    trackId: number,
    dto: UpdateTrackDto,
    files: TrackUploadFiles,
  ): Promise<TrackListItem> {
    return this.trackManagement.update(trackId, dto, files);
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
