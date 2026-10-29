import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { timingSafeEqual } from "node:crypto";
import { UnlockAudioAdminDto } from "../dto/unlock-audio-admin.dto";
import { AUDIO_ADMIN_SCOPE } from "../../common/constants/auth.constants";

@Injectable()
export class AudioAdminService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async unlock(dto: UnlockAudioAdminDto): Promise<{ access_token: string }> {
    const configuredPassword =
      this.configService.get<string>("AUDIO_ADMIN_PASSWORD");

    if (!configuredPassword) {
      throw new ServiceUnavailableException(
        "Audio management is not configured",
      );
    }

    if (!matchesPassword(dto.password, configuredPassword)) {
      throw new UnauthorizedException("Invalid audio manager password");
    }

    return {
      access_token: await this.jwtService.signAsync(
        { scope: AUDIO_ADMIN_SCOPE },
        { expiresIn: "8h" },
      ),
    };
  }
}

function matchesPassword(candidate: string, expected: string): boolean {
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);

  return (
    candidateBuffer.length === expectedBuffer.length &&
    timingSafeEqual(candidateBuffer, expectedBuffer)
  );
}
