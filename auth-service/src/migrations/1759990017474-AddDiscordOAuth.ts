import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDiscordOAuth1759990017474 implements MigrationInterface {
    name = 'AddDiscordOAuth1759990017474'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "discordId" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_ae4a93a6b25195ccc2a97e13f0d" UNIQUE ("discordId")`);
        await queryRunner.query(`ALTER TABLE "users" ADD "discordUsername" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "discordAvatar" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "discordAvatar"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "discordUsername"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_ae4a93a6b25195ccc2a97e13f0d"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "discordId"`);
    }

}
