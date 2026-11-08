import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1760000000001 implements MigrationInterface {
  name = "CreateUsersTable1760000000001";

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
          COMMENT ON TABLE "users" IS 'radio:CreateUsersTable1760000000001';
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
          COMMENT ON COLUMN "users"."password_hash" IS 'radio:CreateUsersTable1760000000001';
        END IF;
      END $$
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF to_regclass('public.users') IS NOT NULL
          AND obj_description('public.users'::regclass, 'pg_class') = 'radio:CreateUsersTable1760000000001'
        THEN
          DROP TABLE "users";
        ELSIF EXISTS (
          SELECT 1 FROM pg_catalog.pg_attribute attribute
          JOIN pg_catalog.pg_class relation ON relation.oid = attribute.attrelid
          JOIN pg_catalog.pg_namespace schema ON schema.oid = relation.relnamespace
          WHERE schema.nspname = 'public'
            AND relation.relname = 'users'
            AND attribute.attname = 'password_hash'
            AND NOT attribute.attisdropped
            AND col_description(relation.oid, attribute.attnum) = 'radio:CreateUsersTable1760000000001'
        ) THEN
          COMMENT ON COLUMN "users"."password_hash" IS NULL;
          ALTER TABLE "users" RENAME COLUMN "password_hash" TO "passwordHash";
        END IF;
      END $$
    `);
  }
}
