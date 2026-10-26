import "reflect-metadata";
import { config } from "dotenv";
import { resolve } from "node:path";
import { DataSource } from "typeorm";
import { User } from "../auth/entities/user.entity";
import { Playlist } from "../playlists/entities/playlist.entity";
import { PlaylistTrack } from "../playlists/entities/playlist-track.entity";
import { Track } from "../tracks/entities/track.entity";

config({ path: resolve(__dirname, "../../.env") });

const port = Number(process.env.DB_PORT ?? 5432);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("DB_PORT must be a valid TCP port");
}

export const AppDataSource = new DataSource({
  type: "postgres",
  host: requiredEnvironmentValue("DB_HOST"),
  port,
  username: requiredEnvironmentValue("DB_USER"),
  password: requiredEnvironmentValue("DB_PASSWORD"),
  database: requiredEnvironmentValue("DB_NAME"),
  entities: [User, Track, Playlist, PlaylistTrack],
  migrations: [resolve(__dirname, "migrations/*{.js,.ts}")],
  migrationsTableName: "typeorm_migrations",
  synchronize: false,
});

function requiredEnvironmentValue(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} must be configured`);
  }

  return value;
}
