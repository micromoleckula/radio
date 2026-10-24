import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

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
        };
      },
    }),
  ],
})
export class AppModule {}
