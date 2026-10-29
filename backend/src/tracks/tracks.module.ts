import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { AudioAdminController } from "./controllers/audio-admin.controller";
import { AudioAdminGuard } from "./guards/audio-admin.guard";
import { AudioAdminService } from "./services/audio-admin.service";
import { Track } from "./entities/track.entity";
import { TracksController } from "./controllers/tracks.controller";
import { TracksService } from "./services/tracks.service";
import { TrackStorageService } from "./services/track-storage.service";
import { TrackMetadataService } from "./services/track-metadata.service";
import { TrackManagementService } from "./services/track-management.service";
import { TrackCoverStorageService } from "./services/track-cover-storage.service";

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Track])],
  controllers: [AudioAdminController, TracksController],
  providers: [
    AudioAdminGuard,
    AudioAdminService,
    TrackMetadataService,
    TrackManagementService,
    TrackCoverStorageService,
    TracksService,
    TrackStorageService,
  ],
  exports: [TracksService],
})
export class TracksModule {}
