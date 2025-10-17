import { DataSource } from 'typeorm';
import { SubscriptionPlan, PlanName } from '../entities/SubscriptionPlan';

const seedPlansData = [
  {
    name: PlanName.FREE,
    displayName: 'Gratuit',
    description: 'Plan parfait pour découvrir et tester HostYourBot',
    price: 0,
    billingPeriod: 'monthly',
    features: {
      maxBots: 2,
      maxReplicas: 1,
      maxCpuPerBot: '250m',
      maxMemoryPerBot: '256Mi',
      prioritySupport: false,
      customDomain: false,
      advancedAnalytics: false,
      apiAccess: false,
    },
  },
  {
    name: PlanName.PREMIUM,
    displayName: 'Premium',
    description: 'Pour les créateurs de bots qui veulent plus de puissance',
    price: 9.99,
    billingPeriod: 'monthly',
    features: {
      maxBots: 10,
      maxReplicas: 3,
      maxCpuPerBot: '1000m',
      maxMemoryPerBot: '1Gi',
      prioritySupport: true,
      customDomain: true,
      advancedAnalytics: true,
      apiAccess: true,
    },
  },
  {
    name: PlanName.ENTERPRISE,
    displayName: 'Enterprise',
    description: 'Solution complète pour les professionnels et équipes',
    price: 49.99,
    billingPeriod: 'monthly',
    features: {
      maxBots: 999999,
      maxReplicas: 10,
      maxCpuPerBot: '2000m',
      maxMemoryPerBot: '4Gi',
      prioritySupport: true,
      customDomain: true,
      advancedAnalytics: true,
      apiAccess: true,
    },
  },
];

export async function seedSubscriptionPlans(dataSource: DataSource): Promise<boolean> {
  try {
    const planRepository = dataSource.getRepository(SubscriptionPlan);

    let createdCount = 0;
    let skippedCount = 0;

    for (const planData of seedPlansData) {
      const existingPlan = await planRepository.findOne({
        where: { name: planData.name },
      });

      if (existingPlan) {
        skippedCount++;
        continue;
      }

      const plan = planRepository.create(planData);
      await planRepository.save(plan);
      createdCount++;
    }

    if (createdCount > 0) {
      console.log(`✅ ${createdCount} subscription plan(s) created`);
    }
    if (skippedCount > 0) {
      console.log(`⏭️  ${skippedCount} subscription plan(s) already exist`);
    }

    return true;
  } catch (error) {
    console.error('❌ Error seeding subscription plans:', error);
    return false;
  }
}
