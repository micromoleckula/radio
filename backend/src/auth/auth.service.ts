import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { QueryFailedError, Repository } from "typeorm";
import { AuthDto } from "./dto/auth.dto";
import { User } from "./entities/user.entity";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: AuthDto): Promise<{ access_token: string }> {
    this.validatePasswordLength(dto.password);
    const email = dto.email.trim().toLowerCase();
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException("An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    let user: User;

    try {
      user = await this.userRepository.save(
        this.userRepository.create({ email, passwordHash }),
      );
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        throw new ConflictException(
          "An account with this email already exists",
        );
      }

      throw error;
    }

    return this.generateToken(user.id, user.email);
  }

  async login(dto: AuthDto): Promise<{ access_token: string }> {
    this.validatePasswordLength(dto.password);
    const email = dto.email.trim().toLowerCase();
    const user = await this.userRepository
      .createQueryBuilder("user")
      .addSelect("user.passwordHash")
      .where("user.email = :email", { email })
      .getOne();

    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    return this.generateToken(user.id, user.email);
  }

  private generateToken(id: number, email: string): { access_token: string } {
    const payload = { sub: id, email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  private validatePasswordLength(password: string): void {
    if (Buffer.byteLength(password, "utf8") > 72) {
      throw new BadRequestException("Password must not exceed 72 bytes");
    }
  }
}

function isUniqueConstraintViolation(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }

  const driverError = error.driverError as Record<string, unknown>;
  return driverError.code === "23505";
}