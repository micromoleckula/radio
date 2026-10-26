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
import { Readable } from "node:stream";

export const TRACK_STORAGE_DIRECTORY = resolve(
  __dirname,
  "../../storage/tracks",
);
export const COVER_STORAGE_DIRECTORY = resolve(
  __dirname,
  "../../storage/covers",
);

export interface AudioStream {
  stream: Readable;
  statusCode: 200 | 206 | 416;
  headers: Record<string, string>;
}

interface ByteRange {
  start: number;
  end: number;
}

@Injectable()
export class TrackStorageService {
  async openStream(filename: string, range?: string): Promise<AudioStream> {
    const safeFilename = basename(filename);

    if (!safeFilename || safeFilename !== filename) {
      throw new InternalServerErrorException("Invalid stored audio filename");
    }

    const path = resolve(TRACK_STORAGE_DIRECTORY, safeFilename);
    let fileStats;

    try {
      fileStats = await stat(path);
    } catch {
      throw new NotFoundException("Audio file not found");
    }

    if (!fileStats.isFile()) {
      throw new NotFoundException("Audio file not found");
    }

    const baseHeaders = {
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, max-age=0, must-revalidate",
      "Content-Type": "audio/mpeg",
    };

    if (range === undefined) {
      return {
        stream: createReadStream(path),
        statusCode: 200,
        headers: {
          ...baseHeaders,
          "Content-Length": fileStats.size.toString(),
        },
      };
    }

    const byteRange = parseByteRange(range, fileStats.size);

    if (!byteRange) {
      return {
        stream: Readable.from([]),
        statusCode: 416,
        headers: {
          ...baseHeaders,
          "Content-Range": `bytes */${fileStats.size.toString()}`,
          "Content-Length": "0",
        },
      };
    }

    return {
      stream: createReadStream(path, {
        start: byteRange.start,
        end: byteRange.end,
      }),
      statusCode: 206,
      headers: {
        ...baseHeaders,
        "Content-Length": (byteRange.end - byteRange.start + 1).toString(),
        "Content-Range": `bytes ${byteRange.start.toString()}-${byteRange.end.toString()}/${fileStats.size.toString()}`,
      },
    };
  }

  async saveCover(data: Uint8Array, mimeType: string): Promise<string> {
    const { fileTypeFromBuffer } = await import("file-type");
    const detectedType = await fileTypeFromBuffer(data);

    if (
      !detectedType ||
      detectedType.mime !== mimeType ||
      data.byteLength > 10 * 1024 * 1024
    ) {
      throw new BadRequestException("Cover must be a valid image under 10 MB");
    }

    const extension = coverExtension(mimeType);

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

  async openCover(filename: string): Promise<AudioStream> {
    const safeFilename = basename(filename);

    if (!safeFilename || safeFilename !== filename) {
      throw new InternalServerErrorException("Invalid stored cover filename");
    }

    const path = resolve(COVER_STORAGE_DIRECTORY, safeFilename);
    let fileStats;

    try {
      fileStats = await stat(path);
    } catch {
      throw new NotFoundException("Cover image not found");
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
        "Content-Type": coverMimeType(extname(safeFilename)),
        "X-Content-Type-Options": "nosniff",
      },
    };
  }

  async remove(filename: string): Promise<void> {
    const safeFilename = basename(filename);

    if (safeFilename !== filename) {
      return;
    }

    await unlink(resolve(TRACK_STORAGE_DIRECTORY, safeFilename)).catch(
      (error: unknown) => {
        if (isMissingFileError(error)) {
          return;
        }

        throw error;
      },
    );
  }

  async removeCover(filename: string | null): Promise<void> {
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

function coverExtension(mimeType: string): string | null {
  const extensions: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };
  return extensions[mimeType] ?? null;
}

function coverMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
  };
  return mimeTypes[extension] ?? "application/octet-stream";
}

function parseByteRange(value: string, fileSize: number): ByteRange | null {
  const match = /^bytes=(\d*)-(\d*)$/.exec(value);

  if (!match || (!match[1] && !match[2]) || fileSize === 0) {
    return null;
  }

  const startValue = match[1] ? Number(match[1]) : undefined;
  const endValue = match[2] ? Number(match[2]) : undefined;

  if (startValue === undefined) {
    if (endValue === undefined || endValue === 0) {
      return null;
    }

    return {
      start: Math.max(fileSize - endValue, 0),
      end: fileSize - 1,
    };
  }

  const end = endValue === undefined ? fileSize - 1 : endValue;

  if (
    !Number.isSafeInteger(startValue) ||
    !Number.isSafeInteger(end) ||
    startValue >= fileSize ||
    end < startValue
  ) {
    return null;
  }

  return { start: startValue, end: Math.min(end, fileSize - 1) };
}

function isMissingFileError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}
