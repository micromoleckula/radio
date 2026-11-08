export const queryKeys = {
  authSession: ["auth-session"] as const,
  audioAdminSession: ["audio-admin-session"] as const,
  tracks: (query?: string) =>
    query === undefined ? (["tracks"] as const) : (["tracks", query] as const),
  playlists: ["playlists"] as const,
  playlistsForTrack: (trackId: number) =>
    ["playlists", "track", trackId] as const,
  playlistPrefix: ["playlist"] as const,
  playlist: (id: number) => ["playlist", id] as const,
};
