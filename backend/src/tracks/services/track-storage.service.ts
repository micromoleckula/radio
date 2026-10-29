import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { createReadStream } from "node:fs";
import { stat, unlink } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { Readable } from "node:stream";
import { parseByteRange } from "../storage/byte-range";
import { TRACK_STORAGE_DIRECTORY } from "../storage/track-storage.paths";

export interface AudioStream {
  stream: Readable;
  statusCode: 200 | 206 | 416;
  headers: Record<string, string>;
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
}

function isMissingFileError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}
