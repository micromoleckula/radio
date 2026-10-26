import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Column,
} from "typeorm";
import { Track } from "../../tracks/entities/track.entity";
import { Playlist } from "./playlist.entity";

@Entity("playlist_tracks")
export class PlaylistTrack {
  @PrimaryColumn({ name: "playlist_id", type: "integer" })
  playlistId!: number;

  @PrimaryColumn({ name: "track_id", type: "integer" })
  trackId!: number;

  @Column({ type: "integer", default: 0 })
  position!: number;

  @CreateDateColumn({ name: "added_at", type: "timestamptz" })
  addedAt!: Date;

  @ManyToOne(() => Playlist, (playlist) => playlist.playlistTracks, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "playlist_id" })
  playlist!: Playlist;

  @ManyToOne(() => Track, (track) => track.playlistTracks, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "track_id" })
  track!: Track;
}
