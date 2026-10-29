export const TRACKS_PAGE_SIZE = 30;
export const PLAYLISTS_PAGE_SIZE = 20;
export const MILLISECONDS_PER_SECOND = 1_000;

export const AUDIO_ADMIN_IDENTIFIER = "audio-admin";
export const AUDIO_ADMIN_ROUTE = `/${AUDIO_ADMIN_IDENTIFIER}`;

export const AUTH_SCOPES = {
  USER: "user",
  AUDIO_ADMIN: AUDIO_ADMIN_IDENTIFIER,
} as const;

export type AuthScope = (typeof AUTH_SCOPES)[keyof typeof AUTH_SCOPES];

export const DURATION_FORMAT_OPTIONS = {
  colonNotation: true,
  secondsDecimalDigits: 0,
} as const;
