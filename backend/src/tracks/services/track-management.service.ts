import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { basename, extname } from "node:path";
import { Repository, type DeepPartial } from "typeorm";
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
      const durationSeconds = this.validateAudioMetadata(metadata);

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

      return toTrackListItem(savedTrack, true);
    } catch (error) {
      await this.cleanupUploadedFiles(files);
      if (coverPath && coverPath !== files.cover?.filename) {
        await this.coverStorage.remove(coverPath);
      }
      throw error;
    }
  }

  async updateTrackData(
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
      const durationSeconds = metadata
        ? this.validateAudioMetadata(metadata)
        : track.durationSeconds;

      if (files.audio && !files.cover && metadata?.cover) {
        nextCoverPath = await this.coverStorage.save(
          metadata.cover.data,
          metadata.cover.mimeType,
        );
      }

      updatedTrack = await this.trackRepository.save(
        this.buildTrackUpdateData({
          track,
          dto,
          metadata,
          audioFile: files.audio,
          durationSeconds,
          coverPath: nextCoverPath,
        }),
      );
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

    return toTrackListItem(
      updatedTrack,
      await this.trackStorage.isAvailable(updatedTrack.audioPath),
      await this.coverStorage.isAvailable(updatedTrack.coverPath),
    );
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

  private validateAudioMetadata(metadata: ExtractedTrackMetadata): number {
    const durationSeconds = metadata.durationSeconds;

    if (
      durationSeconds === null ||
      !Number.isFinite(durationSeconds) ||
      durationSeconds <= 0
    ) {
      throw new BadRequestException(
        "Could not determine a valid track duration from the audio file",
      );
    }

    if (durationSeconds > MAX_TRACK_DURATION_SECONDS) {
      throw new BadRequestException(
        "Track duration must not exceed one hour",
      );
    }

    return durationSeconds;
  }

  private buildTrackUpdateData({
    track,
    dto,
    metadata,
    audioFile,
    durationSeconds,
    coverPath,
  }: {
    track: Track;
    dto: UpdateTrackDto;
    metadata: ExtractedTrackMetadata | null;
    audioFile: TrackUploadFiles["audio"];
    durationSeconds: number;
    coverPath: string | null;
  }): DeepPartial<Track> {
    return {
      id: track.id,
      title:
        dto.title?.trim() ||
        metadata?.title ||
        (audioFile
          ? basename(
              audioFile.originalname,
              extname(audioFile.originalname),
            )
          : track.title),
      artist: dto.artist?.trim() || metadata?.artist || track.artist,
      album:
        dto.album !== undefined
          ? dto.album.trim() || null
          : metadata?.album || track.album,
      durationSeconds,
      audioPath: audioFile?.filename ?? track.audioPath,
      coverPath,
      createdAt: track.createdAt,
    };
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
