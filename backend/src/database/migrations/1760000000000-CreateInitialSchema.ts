import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialSchema1760000000000 implements MigrationInterface {
  name = "CreateInitialSchema1760000000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF to_regclass('public.users') IS NULL THEN
          CREATE TABLE "users" (
            "id" SERIAL PRIMARY KEY,
            "email" VARCHAR(254) NOT NULL UNIQUE,
            "password_hash" VARCHAR NOT NULL
          );
          COMMENT ON TABLE "users" IS 'radio:CreateInitialSchema1760000000000';
        ELSIF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'users'
            AND column_name = 'passwordHash'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'users'
            AND column_name = 'password_hash'
        ) THEN
          ALTER TABLE "users" RENAME COLUMN "passwordHash" TO "password_hash";
        END IF;
      END $$
    `);

    await queryRunner.query(`
      CREATE TABLE "tracks" (
        "id" SERIAL PRIMARY KEY,
        "title" VARCHAR(200) NOT NULL,
        "artist" VARCHAR(200) NOT NULL,
        "album" VARCHAR(200),
        "duration_seconds" INTEGER NOT NULL,
        "audio_path" TEXT NOT NULL,
        "cover_path" TEXT,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_tracks_duration_positive" CHECK ("duration_seconds" > 0)
      )
    `);

    await queryRunner.query(
      'CREATE INDEX "IDX_tracks_title_artist" ON "tracks" ("title", "artist")',
    );

    await queryRunner.query(`
      CREATE TABLE "playlists" (
        "id" SERIAL PRIMARY KEY,
        "title" VARCHAR(120) NOT NULL,
        "owner_id" INTEGER NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "FK_playlists_owner" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      'CREATE INDEX "IDX_playlists_owner_id" ON "playlists" ("owner_id")',
    );

    await queryRunner.query(`
      CREATE TABLE "playlist_tracks" (
        "playlist_id" INTEGER NOT NULL,
        "track_id" INTEGER NOT NULL,
        "position" INTEGER NOT NULL DEFAULT 0,
        "added_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_playlist_tracks" PRIMARY KEY ("playlist_id", "track_id"),
        CONSTRAINT "FK_playlist_tracks_playlist" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_playlist_tracks_track" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      'CREATE INDEX "IDX_playlist_tracks_track_id" ON "playlist_tracks" ("track_id")',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "playlist_tracks"');
    await queryRunner.query('DROP TABLE "playlists"');
    await queryRunner.query('DROP TABLE "tracks"');
    await queryRunner.query(`
      DO $$
      BEGIN
        IF obj_description('public.users'::regclass, 'pg_class') = 'radio:CreateInitialSchema1760000000000' THEN
          DROP TABLE "users";
        ELSIF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'users'
            AND column_name = 'password_hash'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'users'
            AND column_name = 'passwordHash'
        ) THEN
          ALTER TABLE "users" RENAME COLUMN "password_hash" TO "passwordHash";
        END IF;
      END $$
    `);
  }
}
