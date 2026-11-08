import type { TrackListItem } from "../../tracks/domain/tracks.types";
import {
  PlaylistDetailDto,
  PlaylistSummaryDto,
} from "../dto/playlist-response.dto";
import type { Playlist } from "../entities/playlist.entity";

export function toPlaylistSummaryDto(
  playlist: Playlist,
  trackCount: number,
  containsTrack?: boolean,
): PlaylistSummaryDto {
  return new PlaylistSummaryDto(
    playlist.id,
    playlist.title,
    playlist.createdAt,
    trackCount,
    containsTrack,
  );
}

export function toPlaylistDetailDto(
  playlist: Playlist,
  tracks: TrackListItem[],
): PlaylistDetailDto {
  return new PlaylistDetailDto(
    playlist.id,
    playlist.title,
    playlist.createdAt,
    tracks,
  );
}
