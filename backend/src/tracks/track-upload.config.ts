import { BadRequestException } from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import type { Request } from "express";
import { extname } from "node:path";
import {
  MAX_AUDIO_UPLOAD_SIZE_BYTES,
  MAX_MEDIA_UPLOAD_FILES,
  SUPPORTED_AUDIO_UPLOAD_MIME_TYPES,
  SUPPORTED_COVER_EXTENSIONS,
  SUPPORTED_COVER_MIME_TYPES,
} from "./track.constants";
import {
  COVER_STORAGE_DIRECTORY,
  TRACK_STORAGE_DIRECTORY,
} from "./track-storage.service";
import type { TrackUploadFiles } from "./tracks.types";

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
  limits: {
    fileSize: MAX_AUDIO_UPLOAD_SIZE_BYTES,
    files: MAX_MEDIA_UPLOAD_FILES,
  },
  fileFilter: (
    _request: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ): void => {
    const isValidAudio =
      file.fieldname === "audio" &&
      SUPPORTED_AUDIO_UPLOAD_MIME_TYPES.includes(file.mimetype) &&
      extname(file.originalname).toLowerCase() === ".mp3";
    const isValidCover =
      file.fieldname === "cover" &&
      SUPPORTED_COVER_MIME_TYPES.includes(file.mimetype) &&
      SUPPORTED_COVER_EXTENSIONS.includes(
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

export const trackUploadInterceptor = FileFieldsInterceptor(
  [
    { name: "audio", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ],
  mediaUploadOptions,
);

export function toTrackUploadFiles(files: {
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
