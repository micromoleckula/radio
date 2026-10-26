import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { PlaylistsModule } from "./playlists/playlists.module";
import { TracksModule } from "./tracks/tracks.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const port = Number(configService.getOrThrow<string>("DB_PORT"));

        if (!Number.isInteger(port) || port < 1 || port > 65535) {
          throw new Error("DB_PORT must be a valid TCP port");
        }

        return {
          type: "postgres" as const,
          host: configService.getOrThrow<string>("DB_HOST"),
          port,
          username: configService.getOrThrow<string>("DB_USER"),
          password: configService.getOrThrow<string>("DB_PASSWORD"),
          database: configService.getOrThrow<string>("DB_NAME"),
          autoLoadEntities: true,
          migrations: [__dirname + "/database/migrations/*{.js,.ts}"],
          migrationsTableName: "typeorm_migrations",
          synchronize: false,
        };
      },
    }),
    AuthModule,
    PlaylistsModule,
    TracksModule,
  ],
})
export class AppModule {}
