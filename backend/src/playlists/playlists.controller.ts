import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../common/decorators/user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import type { AuthenticatedUser } from "../common/interfaces/jwt-payload.interface";
import { CreatePlaylistDto } from "./dto/create-playlist.dto";
import { ListPlaylistsDto } from "./dto/list-playlists.dto";
import { ReorderPlaylistDto } from "./dto/reorder-playlist.dto";
import {
  PlaylistsService,
  type PlaylistListResponse,
  type PlaylistDetail,
  type PlaylistSummary,
} from "./playlists.service";

@Controller("playlists")
@UseGuards(JwtAuthGuard)
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListPlaylistsDto,
  ): Promise<PlaylistListResponse> {
    return this.playlistsService.list(user.userId, query);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePlaylistDto,
  ): Promise<PlaylistSummary> {
    return this.playlistsService.create(user.userId, dto);
  }

  @Get(":id")
  get(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseIntPipe) playlistId: number,
  ): Promise<PlaylistDetail> {
    return this.playlistsService.get(user.userId, playlistId);
  }

  @Patch(":id")
  rename(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseIntPipe) playlistId: number,
    @Body() dto: CreatePlaylistDto,
  ): Promise<PlaylistDetail> {
    return this.playlistsService.rename(user.userId, playlistId, dto);
  }

  @HttpCode(204)
  @Delete(":id")
  delete(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseIntPipe) playlistId: number,
  ): Promise<void> {
    return this.playlistsService.delete(user.userId, playlistId);
  }

  @Post(":id/tracks/:trackId")
  addTrack(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseIntPipe) playlistId: number,
    @Param("trackId", ParseIntPipe) trackId: number,
  ): Promise<PlaylistDetail> {
    return this.playlistsService.addTrack(user.userId, playlistId, trackId);
  }

  @Delete(":id/tracks/:trackId")
  removeTrack(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseIntPipe) playlistId: number,
    @Param("trackId", ParseIntPipe) trackId: number,
  ): Promise<PlaylistDetail> {
    return this.playlistsService.removeTrack(user.userId, playlistId, trackId);
  }

  @Patch(":id/tracks/order")
  reorderTracks(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseIntPipe) playlistId: number,
    @Body() dto: ReorderPlaylistDto,
  ): Promise<PlaylistDetail> {
    return this.playlistsService.reorderTracks(
      user.userId,
      playlistId,
      dto.trackIds,
    );
  }
}
