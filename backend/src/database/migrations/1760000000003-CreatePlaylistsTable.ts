import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePlaylistsTable1760000000003 implements MigrationInterface {
  name = "CreatePlaylistsTable1760000000003";

  async up(queryRunner: QueryRunner): Promise<void> {
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
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "playlists"');
  }
}
