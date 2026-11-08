import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTracksTable1760000000002 implements MigrationInterface {
  name = "CreateTracksTable1760000000002";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF to_regclass('public.tracks') IS NULL THEN
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
          );
          COMMENT ON TABLE "tracks" IS 'radio:CreateTracksTable1760000000002';
        END IF;
      END $$
    `);

    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_tracks_title_artist" ON "tracks" ("title", "artist")',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF to_regclass('public.tracks') IS NOT NULL
          AND obj_description('public.tracks'::regclass, 'pg_class') = 'radio:CreateTracksTable1760000000002'
        THEN
          DROP TABLE "tracks";
        END IF;
      END $$
    `);
  }
}
