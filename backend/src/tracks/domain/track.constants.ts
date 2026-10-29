export const SECONDS_PER_MINUTE = 60;
export const MINUTES_PER_HOUR = 60;
export const MAX_TRACK_DURATION_SECONDS =
  SECONDS_PER_MINUTE * MINUTES_PER_HOUR;

export const BYTES_PER_MEBIBYTE = 1024 * 1024;
export const MAX_AUDIO_UPLOAD_SIZE_MEBIBYTES = 100;
export const MAX_AUDIO_UPLOAD_SIZE_BYTES =
  MAX_AUDIO_UPLOAD_SIZE_MEBIBYTES * BYTES_PER_MEBIBYTE;
export const MAX_COVER_SIZE_MEBIBYTES = 10;
export const MAX_COVER_SIZE_BYTES =
  MAX_COVER_SIZE_MEBIBYTES * BYTES_PER_MEBIBYTE;

export const MAX_TRACK_AUDIO_FILES_PER_UPLOAD = 1;
export const MAX_TRACK_COVER_FILES_PER_UPLOAD = 1;
export const MAX_MEDIA_UPLOAD_FILES =
  MAX_TRACK_AUDIO_FILES_PER_UPLOAD + MAX_TRACK_COVER_FILES_PER_UPLOAD;

export const DEFAULT_TRACK_ARTIST = "Unknown artist";
export const AUDIO_MIME_TYPE = "audio/mpeg";

export const SUPPORTED_AUDIO_UPLOAD_MIME_TYPES: readonly string[] = [
  AUDIO_MIME_TYPE,
  "audio/mp3",
  "audio/x-mpeg",
];
export const SUPPORTED_COVER_MIME_TYPES: readonly string[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
];
export const SUPPORTED_COVER_EXTENSIONS: readonly string[] = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
];

export const COVER_EXTENSION_BY_MIME_TYPE: Readonly<Record<string, string>> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export const COVER_MIME_TYPE_BY_EXTENSION: Readonly<Record<string, string>> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};
