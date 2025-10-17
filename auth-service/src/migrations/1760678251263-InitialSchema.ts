import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1760678251263 implements MigrationInterface {
    name = 'InitialSchema1760678251263'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "subscription_plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "displayName" character varying NOT NULL, "description" text, "price" numeric(10,2) NOT NULL DEFAULT '0', "billingPeriod" character varying NOT NULL DEFAULT 'monthly', "features" jsonb NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ae18a0f6e0143f06474aa8cef1f" UNIQUE ("name"), CONSTRAINT "PK_9ab8fe6918451ab3d0a4fb6bb0c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying, "password" character varying, "discordId" character varying, "discordUsername" character varying, "discordAvatar" character varying, "resetPasswordToken" character varying, "resetPasswordExpires" TIMESTAMP, "twoFactorSecret" character varying, "twoFactorEnabled" boolean NOT NULL DEFAULT false, "role" character varying NOT NULL DEFAULT 'user', "subscriptionPlan" character varying NOT NULL DEFAULT 'free', "subscriptionStatus" character varying NOT NULL DEFAULT 'active', "subscriptionStartDate" TIMESTAMP NOT NULL DEFAULT now(), "subscriptionEndDate" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_ae4a93a6b25195ccc2a97e13f0d" UNIQUE ("discordId"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "subscription_plans"`);
    }

}
