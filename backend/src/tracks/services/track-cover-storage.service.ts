import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, stat, unlink, writeFile } from "node:fs/promises";
import { basename, extname, resolve } from "node:path";
import type { AudioStream } from "./track-storage.service";
import {
  COVER_EXTENSION_BY_MIME_TYPE,
  COVER_MIME_TYPE_BY_EXTENSION,
  MAX_COVER_SIZE_BYTES,
  MAX_COVER_SIZE_MEBIBYTES,
} from "../domain/track.constants";
import { COVER_STORAGE_DIRECTORY } from "../storage/track-storage.paths";
import {
  isMissingFileError,
  isStoredFileAvailable,
} from "../storage/stored-file.utils";

@Injectable()
export class TrackCoverStorageService {
  async isAvailable(filename: string | null): Promise<boolean> {
    return isStoredFileAvailable(COVER_STORAGE_DIRECTORY, filename);
  }

  async save(data: Uint8Array, mimeType: string): Promise<string> {
    const { fileTypeFromBuffer } = await import("file-type");
    const detectedType = await fileTypeFromBuffer(data);

    if (
      !detectedType ||
      detectedType.mime !== mimeType ||
      data.byteLength > MAX_COVER_SIZE_BYTES
    ) {
      throw new BadRequestException(
        `Cover must be a valid image under ${MAX_COVER_SIZE_MEBIBYTES.toString()} MiB`,
      );
    }

    const extension = COVER_EXTENSION_BY_MIME_TYPE[mimeType];

    if (!extension) {
      throw new BadRequestException("Unsupported cover image type");
    }

    const filename = `${randomUUID()}${extension}`;
    await mkdir(COVER_STORAGE_DIRECTORY, { recursive: true });
    await writeFile(resolve(COVER_STORAGE_DIRECTORY, filename), data, {
      flag: "wx",
    });
    return filename;
  }

  async open(filename: string): Promise<AudioStream> {
    const safeFilename = basename(filename);

    if (!safeFilename || safeFilename !== filename) {
      throw new InternalServerErrorException("Invalid stored cover filename");
    }

    const path = resolve(COVER_STORAGE_DIRECTORY, safeFilename);
    let fileStats;

    try {
      fileStats = await stat(path);
    } catch (error) {
      if (isMissingFileError(error)) {
        throw new NotFoundException("Cover image not found");
      }
      throw error;
    }

    if (!fileStats.isFile()) {
      throw new NotFoundException("Cover image not found");
    }

    return {
      stream: createReadStream(path),
      statusCode: 200,
      headers: {
        "Cache-Control": "public, max-age=60",
        "Content-Length": fileStats.size.toString(),
        "Content-Type":
          COVER_MIME_TYPE_BY_EXTENSION[extname(safeFilename)] ??
          "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
      },
    };
  }

  async remove(filename: string | null): Promise<void> {
    if (!filename || basename(filename) !== filename) {
      return;
    }

    await unlink(resolve(COVER_STORAGE_DIRECTORY, filename)).catch(
      (error: unknown) => {
        if (isMissingFileError(error)) {
          return;
        }

        throw error;
      },
    );
  }
}
