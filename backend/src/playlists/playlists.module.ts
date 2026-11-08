import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../auth/entities/user.entity";
import { Track } from "../tracks/entities/track.entity";
import { TracksModule } from "../tracks/tracks.module";
import { Playlist } from "./entities/playlist.entity";
import { PlaylistTrack } from "./entities/playlist-track.entity";
import { PlaylistsController } from "./playlists.controller";
import { PlaylistsService } from "./playlists.service";
import { PlaylistTrackQueriesRepository } from "./repositories/playlist-track-queries.repository";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Track, Playlist, PlaylistTrack]),
    TracksModule,
  ],
  controllers: [PlaylistsController],
  providers: [PlaylistsService, PlaylistTrackQueriesRepository],
})
export class PlaylistsModule {}
