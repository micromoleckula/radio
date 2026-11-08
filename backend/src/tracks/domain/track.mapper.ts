import type { Track } from "../entities/track.entity";
import type { TrackListItem } from "./tracks.types";

export function toTrackListItem(
  track: Track,
  audioAvailable: boolean,
  coverAvailable = Boolean(track.coverPath),
): TrackListItem {
  return {
    id: track.id,
    title: track.title,
    artist: track.artist,
    album: track.album,
    durationSeconds: track.durationSeconds,
    createdAt: track.createdAt,
    audioAvailable,
    coverAvailable,
  };
}
