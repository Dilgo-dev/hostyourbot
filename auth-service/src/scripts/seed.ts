import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { SubscriptionPlan, PlanName } from '../entities/SubscriptionPlan';

const seedPlans = [
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

async function seed() {
  try {
    console.log('🌱 Démarrage du seeding...');

    await AppDataSource.initialize();
    console.log('✅ Connexion à la base de données établie');

    const planRepository = AppDataSource.getRepository(SubscriptionPlan);

    for (const planData of seedPlans) {
      const existingPlan = await planRepository.findOne({
        where: { name: planData.name },
      });

      if (existingPlan) {
        console.log(`⏭️  Plan "${planData.displayName}" existe déjà, ignoré`);
        continue;
      }

      const plan = planRepository.create(planData);
      await planRepository.save(plan);
      console.log(`✅ Plan "${planData.displayName}" créé avec succès`);
    }

    console.log('🎉 Seeding terminé avec succès !');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    process.exit(1);
  }
}

seed();
