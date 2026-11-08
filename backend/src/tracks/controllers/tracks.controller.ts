import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Param,
  Patch,
  ParseIntPipe,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import type { Response } from "express";
import { CreateTrackDto } from "../dto/create-track.dto";
import { ListTracksDto } from "../dto/list-tracks.dto";
import { TrackListResponseDto } from "../dto/track-list-response.dto";
import { UpdateTrackDto } from "../dto/update-track.dto";
import { AudioAdminGuard } from "../guards/audio-admin.guard";
import {
  toTrackUploadFiles,
  trackUploadInterceptor,
} from "../storage/track-upload.config";
import { TracksService } from "../services/tracks.service";
import type { TrackListItem } from "../domain/tracks.types";

@Controller("tracks")
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @Get()
  list(@Query() query: ListTracksDto): Promise<TrackListResponseDto> {
    return this.tracksService.list(query);
  }

  @UseGuards(AudioAdminGuard)
  @UseInterceptors(trackUploadInterceptor)
  @Post()
  create(
    @Body() dto: CreateTrackDto,
    @UploadedFiles()
    files:
      | { audio?: Express.Multer.File[]; cover?: Express.Multer.File[] }
      | undefined,
  ): Promise<TrackListItem> {
    return this.tracksService.create(dto, toTrackUploadFiles(files ?? {}));
  }

  @UseGuards(AudioAdminGuard)
  @UseInterceptors(trackUploadInterceptor)
  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateTrackDto,
    @UploadedFiles()
    files:
      | { audio?: Express.Multer.File[]; cover?: Express.Multer.File[] }
      | undefined,
  ): Promise<TrackListItem> {
    return this.tracksService.updateTrackData(
      id,
      dto,
      toTrackUploadFiles(files ?? {}),
    );
  }

  @UseGuards(AudioAdminGuard)
  @HttpCode(204)
  @Delete(":id")
  delete(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return this.tracksService.delete(id);
  }

  @Get(":id/cover")
  async cover(
    @Param("id", ParseIntPipe) id: number,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile> {
    const image = await this.tracksService.openCoverStream(id);
    response.status(image.statusCode).set(image.headers);
    return new StreamableFile(image.stream);
  }

  @Get(":id/stream")
  async stream(
    @Param("id", ParseIntPipe) id: number,
    @Headers("range") range: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile> {
    const audio = await this.tracksService.openAudioStream(id, range);
    response.status(audio.statusCode).set(audio.headers);
    return new StreamableFile(audio.stream);
  }
}
