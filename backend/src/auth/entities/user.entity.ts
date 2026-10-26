import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Playlist } from "../../playlists/entities/playlist.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, length: 254 })
  email!: string;

  @Column({ name: "password_hash", select: false })
  passwordHash!: string;

  @OneToMany(() => Playlist, (playlist) => playlist.owner)
  playlists!: Playlist[];
}
