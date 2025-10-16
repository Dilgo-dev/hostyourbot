import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSubscriptionPlans1760200000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "subscription_plans" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "displayName" character varying NOT NULL,
                "description" text,
                "price" decimal(10,2) NOT NULL DEFAULT 0,
                "billingPeriod" character varying NOT NULL DEFAULT 'monthly',
                "features" jsonb NOT NULL,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_subscription_plans" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_subscription_plans_name" UNIQUE ("name")
            )
        `);

        await queryRunner.query(`
            INSERT INTO "subscription_plans" ("name", "displayName", "description", "price", "billingPeriod", "features") VALUES
            ('free', 'Gratuit', 'Plan parfait pour découvrir et tester HostYourBot', 0, 'monthly',
             '{"maxBots": 2, "maxReplicas": 1, "maxCpuPerBot": "250m", "maxMemoryPerBot": "256Mi", "prioritySupport": false, "customDomain": false, "advancedAnalytics": false, "apiAccess": false}'::jsonb),
            ('premium', 'Premium', 'Pour les créateurs de bots qui veulent plus de puissance', 9.99, 'monthly',
             '{"maxBots": 10, "maxReplicas": 3, "maxCpuPerBot": "1000m", "maxMemoryPerBot": "1Gi", "prioritySupport": true, "customDomain": true, "advancedAnalytics": true, "apiAccess": true}'::jsonb),
            ('enterprise', 'Enterprise', 'Solution complète pour les professionnels et équipes', 49.99, 'monthly',
             '{"maxBots": 999999, "maxReplicas": 10, "maxCpuPerBot": "2000m", "maxMemoryPerBot": "4Gi", "prioritySupport": true, "customDomain": true, "advancedAnalytics": true, "apiAccess": true}'::jsonb)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "subscription_plans"`);
    }

}
