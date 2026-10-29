import { apiDelete, apiGet, apiPatch, apiRequest } from "./api";
import { PLAYLISTS_PAGE_SIZE } from "./constants";
import type { Track } from "./tracks";

export interface PlaylistSummary {
  id: number;
  title: string;
  createdAt: string;
  trackCount: number;
}

export interface PlaylistDetail extends Omit<PlaylistSummary, "trackCount"> {
  tracks: Track[];
}

export interface PlaylistListResponse {
  items: PlaylistSummary[];
  total: number;
  limit: number;
  offset: number;
}

export function fetchPlaylists(offset: number): Promise<PlaylistListResponse> {
  const params = new URLSearchParams({
    limit: String(PLAYLISTS_PAGE_SIZE),
    offset: String(offset),
  });

  return apiGet<PlaylistListResponse>(`/playlists?${params.toString()}`, true);
}

export function fetchPlaylist(id: number): Promise<PlaylistDetail> {
  return apiGet<PlaylistDetail>(`/playlists/${id.toString()}`, true);
}

export function createPlaylist(title: string): Promise<PlaylistSummary> {
  return apiRequest<PlaylistSummary>("/playlists", { title }, true);
}

export function renamePlaylist(
  id: number,
  title: string,
): Promise<PlaylistDetail> {
  return apiPatch<PlaylistDetail>(
    `/playlists/${id.toString()}`,
    { title },
    true,
  );
}

export function deletePlaylist(id: number): Promise<void> {
  return apiDelete(`/playlists/${id.toString()}`, true);
}

export function addTrackToPlaylist(
  playlistId: number,
  trackId: number,
): Promise<PlaylistDetail> {
  return apiRequest<PlaylistDetail>(
    `/playlists/${playlistId.toString()}/tracks/${trackId.toString()}`,
    {},
    true,
  );
}

export function removeTrackFromPlaylist(
  playlistId: number,
  trackId: number,
): Promise<PlaylistDetail> {
  return apiDelete<PlaylistDetail>(
    `/playlists/${playlistId.toString()}/tracks/${trackId.toString()}`,
    true,
  );
}

export function reorderPlaylistTracks(
  playlistId: number,
  trackIds: number[],
): Promise<PlaylistDetail> {
  return apiPatch<PlaylistDetail>(
    `/playlists/${playlistId.toString()}/tracks/order`,
    { trackIds },
    true,
  );
}