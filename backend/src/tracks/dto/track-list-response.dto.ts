import type { TrackListItem } from "../domain/tracks.types";

export class TrackListResponseDto {
  constructor(
    readonly items: TrackListItem[],
    readonly total: number,
    readonly limit: number,
    readonly offset: number,
  ) {}
}
