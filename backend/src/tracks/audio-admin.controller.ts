import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { UnlockAudioAdminDto } from "./dto/unlock-audio-admin.dto";
import { AudioAdminService } from "./audio-admin.service";
import { AudioAdminGuard } from "./audio-admin.guard";

@Controller("audio-admin")
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
