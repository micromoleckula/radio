import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../auth/entities/user.entity";
import { Track } from "../tracks/entities/track.entity";
import { Playlist } from "./entities/playlist.entity";
import { PlaylistTrack } from "./entities/playlist-track.entity";
import { PlaylistsController } from "./playlists.controller";
import { PlaylistsService } from "./playlists.service";

@Module({
  imports: [TypeOrmModule.forFeature([User, Track, Playlist, PlaylistTrack])],
  controllers: [PlaylistsController],
  providers: [PlaylistsService],
})
export class PlaylistsModule {}
