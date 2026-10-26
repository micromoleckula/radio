import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { AudioAdminController } from "./audio-admin.controller";
import { AudioAdminGuard } from "./audio-admin.guard";
import { AudioAdminService } from "./audio-admin.service";
import { Track } from "./entities/track.entity";
import { TracksController } from "./tracks.controller";
import { TracksService } from "./tracks.service";
import { TrackStorageService } from "./track-storage.service";
import { TrackMetadataService } from "./track-metadata.service";

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Track])],
  controllers: [AudioAdminController, TracksController],
  providers: [
    AudioAdminGuard,
    AudioAdminService,
    TrackMetadataService,
    TracksService,
    TrackStorageService,
  ],
  exports: [TracksService],
})
export class TracksModule {}
