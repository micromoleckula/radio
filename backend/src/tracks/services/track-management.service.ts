import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { basename, extname } from "node:path";
import { Repository } from "typeorm";
import { CreateTrackDto } from "../dto/create-track.dto";
import { UpdateTrackDto } from "../dto/update-track.dto";
import { Track } from "../entities/track.entity";
import {
  DEFAULT_TRACK_ARTIST,
  MAX_COVER_SIZE_BYTES,
  MAX_COVER_SIZE_MEBIBYTES,
  MAX_TRACK_DURATION_SECONDS,
} from "../domain/track.constants";
import { toTrackListItem } from "../domain/track.mapper";
import {
  TrackMetadataService,
  type ExtractedTrackMetadata,
} from "./track-metadata.service";
import { TrackCoverStorageService } from "./track-cover-storage.service";
import { TrackStorageService } from "./track-storage.service";
import type { TrackListItem, TrackUploadFiles } from "../domain/tracks.types";

@Injectable()
export class TrackManagementService {
  constructor(
    @InjectRepository(Track)
    private readonly trackRepository: Repository<Track>,
    private readonly trackStorage: TrackStorageService,
    private readonly coverStorage: TrackCoverStorageService,
    private readonly trackMetadata: TrackMetadataService,
  ) {}

  async create(
    dto: CreateTrackDto,
    files: TrackUploadFiles,
  ): Promise<TrackListItem> {
    if (!files.audio) {
      await this.cleanupUploadedFiles(files);
      throw new BadRequestException("An MP3 audio file is required");
    }

    if (files.cover && files.cover.size > MAX_COVER_SIZE_BYTES) {
      await this.cleanupUploadedFiles(files);
      throw new BadRequestException(
        `Cover image must not exceed ${MAX_COVER_SIZE_MEBIBYTES.toString()} MiB`,
      );
    }

    let coverPath = files.cover?.filename ?? null;

    try {
      const metadata = await this.readMetadata(files.audio.path);
      const durationSeconds = metadata.durationSeconds;

      if (!durationSeconds) {
        throw new BadRequestException(
          "Could not determine a valid track duration from the audio file",
        );
      }

      if (durationSeconds > MAX_TRACK_DURATION_SECONDS) {
        throw new BadRequestException(
          "Track duration must not exceed one hour",
        );
      }

      if (!files.cover && metadata.cover) {
        coverPath = await this.coverStorage.save(
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
          artist: dto.artist?.trim() || metadata.artist || DEFAULT_TRACK_ARTIST,
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
        await this.coverStorage.remove(coverPath);
      }
      throw error;
    }
  }

  async update(
    trackId: number,
    dto: UpdateTrackDto,
    files: TrackUploadFiles,
  ): Promise<TrackListItem> {
    if (files.cover && files.cover.size > MAX_COVER_SIZE_BYTES) {
      await this.cleanupUploadedFiles(files);
      throw new BadRequestException(
        `Cover image must not exceed ${MAX_COVER_SIZE_MEBIBYTES.toString()} MiB`,
      );
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
      const durationSeconds = files.audio
        ? metadata?.durationSeconds
        : track.durationSeconds;

      if (!durationSeconds) {
        throw new BadRequestException(
          "Could not determine a valid track duration from the audio file",
        );
      }

      if (durationSeconds > MAX_TRACK_DURATION_SECONDS) {
        throw new BadRequestException(
          "Track duration must not exceed one hour",
        );
      }

      if (files.audio && !files.cover && metadata?.cover) {
        nextCoverPath = await this.coverStorage.save(
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
        await this.coverStorage.remove(nextCoverPath);
      }
      throw error;
    }

    const replacedFiles: Promise<void>[] = [];
    if (files.audio && files.audio.filename !== track.audioPath) {
      replacedFiles.push(this.trackStorage.remove(track.audioPath));
    }
    if (nextCoverPath !== track.coverPath) {
      replacedFiles.push(this.coverStorage.remove(track.coverPath));
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
      this.coverStorage.remove(track.coverPath),
    ]);
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
        ? this.coverStorage.remove(files.cover.filename)
        : undefined,
    ]);
  }
}
