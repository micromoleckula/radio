import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";

interface AudioAdminToken {
  scope?: string;
}

@Injectable()
export class AudioAdminGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

    if (!token) {
      throw new UnauthorizedException("Audio manager access is required");
    }

    try {
      const payload = await this.jwtService.verifyAsync<AudioAdminToken>(token);

      if (payload.scope !== "audio-admin") {
        throw new UnauthorizedException("Audio manager access is required");
      }
    } catch {
      throw new UnauthorizedException("Audio manager session has expired");
    }

    return true;
  }
}
