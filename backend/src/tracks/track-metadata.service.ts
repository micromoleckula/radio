import { Injectable } from "@nestjs/common";

export interface ExtractedTrackMetadata {
  title: string | null;
  artist: string | null;
  album: string | null;
  durationSeconds: number | null;
  cover: {
    data: Uint8Array;
    mimeType: string;
  } | null;
}

@Injectable()
export class TrackMetadataService {
  async extract(filePath: string): Promise<ExtractedTrackMetadata> {
    const { fileTypeFromFile } = await import("file-type");
    const fileType = await fileTypeFromFile(filePath);

    if (fileType?.mime !== "audio/mpeg") {
      throw new Error("The uploaded file is not an MP3 audio stream");
    }

    const { parseFile } = await import("music-metadata");
    const metadata = await parseFile(filePath, { duration: true });
    const picture = metadata.common.picture?.[0];
    const duration = metadata.format.duration;

    return {
      title: metadata.common.title?.trim() || null,
      artist: metadata.common.artist?.trim() || null,
      album: metadata.common.album?.trim() || null,
      durationSeconds:
        duration && Number.isFinite(duration) ? Math.round(duration) : null,
      cover: picture ? { data: picture.data, mimeType: picture.format } : null,
    };
  }
}
