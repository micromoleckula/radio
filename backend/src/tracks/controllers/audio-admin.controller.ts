import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { UnlockAudioAdminDto } from "../dto/unlock-audio-admin.dto";
import { AudioAdminService } from "../services/audio-admin.service";
import { AudioAdminGuard } from "../guards/audio-admin.guard";
import { AUDIO_ADMIN_ROUTE } from "../../common/constants/auth.constants";

@Controller(AUDIO_ADMIN_ROUTE)
export class AudioAdminController {
  constructor(private readonly audioAdminService: AudioAdminService) {}

  @Post("unlock")
  unlock(@Body() dto: UnlockAudioAdminDto): Promise<{ access_token: string }> {
    return this.audioAdminService.unlock(dto);
  }

  @Get("session")
  @UseGuards(AudioAdminGuard)
  session(): { active: true } {
    return { active: true };
  }
}
