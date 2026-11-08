import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1760000000001 implements MigrationInterface {
  name = "CreateUsersTable1760000000001";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL PRIMARY KEY,
        "email" VARCHAR(254) NOT NULL UNIQUE,
        "password_hash" VARCHAR NOT NULL
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "users"');
  }
}
