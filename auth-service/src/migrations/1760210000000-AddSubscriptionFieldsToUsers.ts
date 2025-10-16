import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSubscriptionFieldsToUsers1760210000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "subscriptionPlan" character varying NOT NULL DEFAULT 'free'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "subscriptionStatus" character varying NOT NULL DEFAULT 'active'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "subscriptionStartDate" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ADD "subscriptionEndDate" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "subscriptionEndDate"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "subscriptionStartDate"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "subscriptionStatus"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "subscriptionPlan"`);
    }

}
