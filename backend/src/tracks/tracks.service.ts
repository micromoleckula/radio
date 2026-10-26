import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { basename, extname } from "node:path";
import { ILike, Repository } from "typeorm";
import { CreateTrackDto } from "./dto/create-track.dto";
import { ListTracksDto } from "./dto/list-tracks.dto";
import { UpdateTrackDto } from "./dto/update-track.dto";
import { Track } from "./entities/track.entity";
import {
  TrackMetadataService,
  type ExtractedTrackMetadata,
} from "./track-metadata.service";
import { TrackStorageService, type AudioStream } from "./track-storage.service";

export interface UploadedMediaFile {
  filename: string;
  path: string;
  originalname: string;
  mimetype: string;
  size: number;
}

export interface TrackUploadFiles {
  audio?: UploadedMediaFile;
  cover?: UploadedMediaFile;
}

export interface TrackListItem {
  id: number;
  title: string;
  artist: string;
  album: string | null;
  durationSeconds: number;
  createdAt: Date;
  coverAvailable: boolean;
}

export interface TrackListResponse {
  items: TrackListItem[];
  total: number;
  limit: number;
  offset: number;
}

@Injectable()
export class TracksService {
  constructor(
    @InjectRepository(Track)
    private readonly trackRepository: Repository<Track>,
    private readonly trackStorage: TrackStorageService,
    private readonly trackMetadata: TrackMetadataService,
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

  async create(
    dto: CreateTrackDto,
    files: TrackUploadFiles,
  ): Promise<TrackListItem> {
    if (!files.audio) {
      await this.cleanupUploadedFiles(files);
      throw new BadRequestException("An MP3 audio file is required");
    }

    if (files.cover && files.cover.size > 10 * 1024 * 1024) {
      await this.cleanupUploadedFiles(files);
      throw new BadRequestException("Cover image must not exceed 10 MB");
    }

    let coverPath = files.cover?.filename ?? null;

    try {
      const metadata = await this.readMetadata(files.audio.path);
      const durationSeconds =
        dto.durationSeconds ?? metadata.durationSeconds ?? undefined;

      if (!durationSeconds || durationSeconds > 3600) {
        throw new BadRequestException(
          "Could not determine a valid track duration from the audio file",
        );
      }

      if (!files.cover && metadata.cover) {
        coverPath = await this.trackStorage.saveCover(
          metadata.cover.data,
          metadata.cover.mimeType,
        );
      }

      const savedTrack = await this.trackRepository.save(
        this.trackRepository.create({
          title:
            dto.title?.trim() ||
            metadata.title ||
            basename(
              files.audio.originalname,
              extname(files.audio.originalname),
            ),
          artist: dto.artist?.trim() || metadata.artist || "Unknown artist",
          album: dto.album?.trim() || metadata.album || null,
          durationSeconds,
          audioPath: files.audio.filename,
          coverPath,
        }),
      );

      return toTrackListItem(savedTrack);
    } catch (error) {
      await this.cleanupUploadedFiles(files);
      if (coverPath && coverPath !== files.cover?.filename) {
        await this.trackStorage.removeCover(coverPath);
      }
      throw error;
    }
  }

  async update(
    trackId: number,
    dto: UpdateTrackDto,
    files: TrackUploadFiles,
  ): Promise<TrackListItem> {
    if (files.cover && files.cover.size > 10 * 1024 * 1024) {
      await this.cleanupUploadedFiles(files);
      throw new BadRequestException("Cover image must not exceed 10 MB");
    }

    const track = await this.findTrackWithFilePaths(trackId);

    if (!track) {
      await this.cleanupUploadedFiles(files);
      throw new NotFoundException("Track not found");
    }

    let nextCoverPath = files.cover?.filename ?? track.coverPath;
    let updatedTrack: Track;

    try {
      const metadata = files.audio
        ? await this.readMetadata(files.audio.path)
        : null;
      const durationSeconds =
        dto.durationSeconds ??
        metadata?.durationSeconds ??
        track.durationSeconds;

      if (durationSeconds > 3600) {
        throw new BadRequestException(
          "Track duration must not exceed one hour",
        );
      }

      if (files.audio && !files.cover && metadata?.cover) {
        nextCoverPath = await this.trackStorage.saveCover(
          metadata.cover.data,
          metadata.cover.mimeType,
        );
      }

      updatedTrack = await this.trackRepository.save({
        id: track.id,
        title:
          dto.title?.trim() ||
          metadata?.title ||
          (files.audio
            ? basename(
                files.audio.originalname,
                extname(files.audio.originalname),
              )
            : track.title),
        artist: dto.artist?.trim() || metadata?.artist || track.artist,
        album:
          dto.album !== undefined
            ? dto.album.trim() || null
            : metadata?.album || track.album,
        durationSeconds,
        audioPath: files.audio?.filename ?? track.audioPath,
        coverPath: nextCoverPath,
        createdAt: track.createdAt,
      });
    } catch (error) {
      await this.cleanupUploadedFiles(files);
      if (
        nextCoverPath &&
        nextCoverPath !== files.cover?.filename &&
        nextCoverPath !== track.coverPath
      ) {
        await this.trackStorage.removeCover(nextCoverPath);
      }
      throw error;
    }

    const replacedFiles: Promise<void>[] = [];
    if (files.audio && files.audio.filename !== track.audioPath) {
      replacedFiles.push(this.trackStorage.remove(track.audioPath));
    }
    if (nextCoverPath !== track.coverPath) {
      replacedFiles.push(this.trackStorage.removeCover(track.coverPath));
    }
    await Promise.allSettled(replacedFiles);

    return toTrackListItem(updatedTrack);
  }

  async delete(trackId: number): Promise<void> {
    const track = await this.findTrackWithFilePaths(trackId);

    if (!track) {
      throw new NotFoundException("Track not found");
    }

    await this.trackRepository.delete(trackId);
    await Promise.allSettled([
      this.trackStorage.remove(track.audioPath),
      this.trackStorage.removeCover(track.coverPath),
    ]);
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

    return this.trackStorage.openCover(track.coverPath);
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

  private async findTrackWithFilePaths(trackId: number): Promise<Track | null> {
    return this.trackRepository
      .createQueryBuilder("track")
      .addSelect("track.audioPath")
      .addSelect("track.coverPath")
      .where("track.id = :trackId", { trackId })
      .getOne();
  }

  private async readMetadata(
    filePath: string,
  ): Promise<ExtractedTrackMetadata> {
    try {
      return await this.trackMetadata.extract(filePath);
    } catch {
      throw new BadRequestException("Unable to read audio metadata");
    }
  }

  private async cleanupUploadedFiles(files: TrackUploadFiles): Promise<void> {
    await Promise.all([
      files.audio ? this.trackStorage.remove(files.audio.filename) : undefined,
      files.cover
        ? this.trackStorage.removeCover(files.cover.filename)
        : undefined,
    ]);
  }
}

function toTrackListItem(track: Track): TrackListItem {
  return {
    id: track.id,
    title: track.title,
    artist: track.artist,
    album: track.album,
    durationSeconds: track.durationSeconds,
    createdAt: track.createdAt,
    coverAvailable: Boolean(track.coverPath),
  };
}

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}
