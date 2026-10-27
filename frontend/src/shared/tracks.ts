import { API_BASE_URL, apiGet } from "./api";
import { TRACKS_PAGE_SIZE } from "./constants";

export interface Track {
  id: number;
  title: string;
  artist: string;
  album: string | null;
  durationSeconds: number;
  createdAt: string;
  coverAvailable: boolean;
}

export interface TrackListResponse {
  items: Track[];
  total: number;
  limit: number;
  offset: number;
}

export async function fetchTracks(
  query: string,
  offset: number,
): Promise<TrackListResponse> {
  const params = new URLSearchParams({
    limit: String(TRACKS_PAGE_SIZE),
    offset: String(offset),
  });

  if (query) {
    params.set("q", query);
  }

  return apiGet<TrackListResponse>(`/tracks?${params.toString()}`);
}

export function getTrackStreamUrl(trackId: number): string {
  return `${API_BASE_URL}/tracks/${trackId.toString()}/stream`;
}

export function getTrackCoverUrl(trackId: number): string {
  return `${API_BASE_URL}/tracks/${trackId.toString()}/cover`;
}