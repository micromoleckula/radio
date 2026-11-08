import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePlaylistTracksTable1760000000004
  implements MigrationInterface
{
  name = "CreatePlaylistTracksTable1760000000004";

  async up(queryRunner: QueryRunner): Promise<void> {
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
  }
}
