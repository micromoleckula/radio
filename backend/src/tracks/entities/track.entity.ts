import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PlaylistTrack } from "../../playlists/entities/playlist-track.entity";

@Entity("tracks")
export class Track {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 200 })
  title!: string;

  @Column({ length: 200 })
  artist!: string;

  @Column({ type: "varchar", length: 200, nullable: true })
  album!: string | null;

  @Column({ name: "duration_seconds", type: "integer" })
  durationSeconds!: number;

  @Column({ name: "audio_path", type: "text", select: false })
  audioPath!: string;

  @Column({ name: "cover_path", type: "text", nullable: true })
  coverPath!: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @OneToMany(() => PlaylistTrack, (playlistTrack) => playlistTrack.track)
  playlistTracks!: PlaylistTrack[];
}
