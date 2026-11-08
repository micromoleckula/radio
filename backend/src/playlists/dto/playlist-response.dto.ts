import type { TrackListItem } from "../../tracks/domain/tracks.types";

export class PlaylistSummaryDto {
  constructor(
    readonly id: number,
    readonly title: string,
    readonly createdAt: Date,
    readonly trackCount: number,
    readonly containsTrack?: boolean,
  ) {}
}

export class PlaylistDetailDto {
  constructor(
    readonly id: number,
    readonly title: string,
    readonly createdAt: Date,
    readonly tracks: TrackListItem[],
  ) {}
}

export class PlaylistListResponseDto {
  readonly items: PlaylistSummaryDto[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;

  constructor(data: {
    items: PlaylistSummaryDto[];
    total: number;
    limit: number;
    offset: number;
  }) {
    this.items = data.items;
    this.total = data.total;
    this.limit = data.limit;
    this.offset = data.offset;
  }
}
