import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PlaylistTrack } from "../entities/playlist-track.entity";

export interface PlaylistTrackCount {
  playlistId: number;
  trackCount: string;
}

@Injectable()
export class PlaylistTrackQueriesRepository {
  constructor(
    @InjectRepository(PlaylistTrack)
    private readonly repository: Repository<PlaylistTrack>,
  ) {}

  getTrackCountsByPlaylistIds(
    playlistIds: number[],
  ): Promise<PlaylistTrackCount[]> {
    if (playlistIds.length === 0) {
      return Promise.resolve([]);
    }

    return this.repository
      .createQueryBuilder("playlistTrack")
      .select("playlistTrack.playlistId", "playlistId")
      .addSelect("COUNT(*)", "trackCount")
      .where("playlistTrack.playlistId IN (:...playlistIds)", { playlistIds })
      .groupBy("playlistTrack.playlistId")
      .getRawMany<PlaylistTrackCount>();
  }

  async getPlaylistIdsContainingTrack(
    playlistIds: number[],
    trackId: number,
  ): Promise<number[]> {
    if (playlistIds.length === 0) {
      return [];
    }

    const rows = await this.repository
      .createQueryBuilder("playlistTrack")
      .select("playlistTrack.playlistId", "playlistId")
      .where("playlistTrack.playlistId IN (:...playlistIds)", { playlistIds })
      .andWhere("playlistTrack.trackId = :trackId", { trackId })
      .getRawMany<{ playlistId: number }>();

    return rows.map(({ playlistId }) => playlistId);
  }
}
