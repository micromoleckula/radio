import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Param,
  Patch,
  ParseIntPipe,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import type { Request, Response } from "express";
import { extname } from "node:path";
import { CreateTrackDto } from "./dto/create-track.dto";
import { ListTracksDto } from "./dto/list-tracks.dto";
import { UpdateTrackDto } from "./dto/update-track.dto";
import { AudioAdminGuard } from "./audio-admin.guard";
import {
  TracksService,
  type TrackListItem,
  type TrackListResponse,
  type TrackUploadFiles,
} from "./tracks.service";
import {
  COVER_STORAGE_DIRECTORY,
  TRACK_STORAGE_DIRECTORY,
} from "./track-storage.service";

const mediaUploadOptions = {
  storage: diskStorage({
    destination: (_request, file, callback) => {
      const destination =
        file.fieldname === "cover"
          ? COVER_STORAGE_DIRECTORY
          : TRACK_STORAGE_DIRECTORY;

      void mkdir(destination, { recursive: true })
        .then(() => {
          callback(null, destination);
        })
        .catch((error: unknown) => {
          callback(
            error instanceof Error ? error : new Error("Storage unavailable"),
            destination,
          );
        });
    },
    filename: (_request, file, callback) => {
      const extension =
        file.fieldname === "audio"
          ? ".mp3"
          : normalizeCoverExtension(extname(file.originalname));
      callback(null, `${randomUUID()}${extension}`);
    },
  }),
  limits: { fileSize: 100 * 1024 * 1024, files: 2 },
  fileFilter: (
    _request: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ): void => {
    const isValidAudio =
      file.fieldname === "audio" &&
      ["audio/mpeg", "audio/mp3", "audio/x-mpeg"].includes(file.mimetype) &&
      extname(file.originalname).toLowerCase() === ".mp3";
    const isValidCover =
      file.fieldname === "cover" &&
      ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype) &&
      [".jpg", ".jpeg", ".png", ".webp"].includes(
        extname(file.originalname).toLowerCase(),
      );

    if (!isValidAudio && !isValidCover) {
      callback(
        new BadRequestException(
          "Upload an MP3 file and an optional JPG, PNG, or WebP cover",
        ),
        false,
      );
      return;
    }

    callback(null, true);
  },
};

@Controller("tracks")
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @Get()
  list(@Query() query: ListTracksDto): Promise<TrackListResponse> {
    return this.tracksService.list(query);
  }

  @UseGuards(AudioAdminGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "audio", maxCount: 1 },
        { name: "cover", maxCount: 1 },
      ],
      mediaUploadOptions,
    ),
  )
  @Post()
  create(
    @Body() dto: CreateTrackDto,
    @UploadedFiles()
    files:
      | { audio?: Express.Multer.File[]; cover?: Express.Multer.File[] }
      | undefined,
  ): Promise<TrackListItem> {
    return this.tracksService.create(dto, toTrackUploadFiles(files ?? {}));
  }

  @UseGuards(AudioAdminGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "audio", maxCount: 1 },
        { name: "cover", maxCount: 1 },
      ],
      mediaUploadOptions,
    ),
  )
  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateTrackDto,
    @UploadedFiles()
    files:
      | { audio?: Express.Multer.File[]; cover?: Express.Multer.File[] }
      | undefined,
  ): Promise<TrackListItem> {
    return this.tracksService.update(id, dto, toTrackUploadFiles(files ?? {}));
  }

  @UseGuards(AudioAdminGuard)
  @HttpCode(204)
  @Delete(":id")
  delete(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return this.tracksService.delete(id);
  }

  @Get(":id/cover")
  async cover(
    @Param("id", ParseIntPipe) id: number,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile> {
    const image = await this.tracksService.openCoverStream(id);
    response.status(image.statusCode).set(image.headers);
    return new StreamableFile(image.stream);
  }

  @Get(":id/stream")
  async stream(
    @Param("id", ParseIntPipe) id: number,
    @Headers("range") range: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile> {
    const audio = await this.tracksService.openAudioStream(id, range);
    response.status(audio.statusCode).set(audio.headers);
    return new StreamableFile(audio.stream);
  }
}

function toTrackUploadFiles(files: {
  audio?: Express.Multer.File[];
  cover?: Express.Multer.File[];
}): TrackUploadFiles {
  const audio = files.audio?.[0];
  const cover = files.cover?.[0];

  return {
    audio: audio
      ? {
          filename: audio.filename,
          path: audio.path,
          originalname: audio.originalname,
          mimetype: audio.mimetype,
          size: audio.size,
        }
      : undefined,
    cover: cover
      ? {
          filename: cover.filename,
          path: cover.path,
          originalname: cover.originalname,
          mimetype: cover.mimetype,
          size: cover.size,
        }
      : undefined,
  };
}

function normalizeCoverExtension(extension: string): string {
  return extension.toLowerCase() === ".jpeg" ? ".jpg" : extension.toLowerCase();
}
