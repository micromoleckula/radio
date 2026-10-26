import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Column,
} from "typeorm";
import { User } from "../../auth/entities/user.entity";
import { PlaylistTrack } from "./playlist-track.entity";

@Entity("playlists")
export class Playlist {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 120 })
  title!: string;

  @Column({ name: "owner_id", type: "integer" })
  ownerId!: number;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.playlists, { onDelete: "CASCADE" })
  @JoinColumn({ name: "owner_id" })
  owner!: User;

  @OneToMany(() => PlaylistTrack, (playlistTrack) => playlistTrack.playlist)
  playlistTracks!: PlaylistTrack[];
}
