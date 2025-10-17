import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { seedSubscriptionPlans } from './seedPlans';

async function seed() {
  try {
    console.log('🌱 Démarrage du seeding...');

    await AppDataSource.initialize();
    console.log('✅ Connexion à la base de données établie');

    const success = await seedSubscriptionPlans(AppDataSource);

    if (success) {
      console.log('🎉 Seeding terminé avec succès !');
    } else {
      console.log('⚠️  Seeding terminé avec des erreurs');
    }

    await AppDataSource.destroy();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    process.exit(1);
  }
}

seed();
