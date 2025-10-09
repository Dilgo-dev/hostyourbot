import { config } from './config/env';
import { StatsJob } from './jobs/statsJob';
import { AlertsJob } from './jobs/alertsJob';
import { DiscordWebhookService } from './services/discordWebhook';
import { K8sGrpcClient } from './services/k8sGrpcClient';

async function startup() {
  console.log('===========================================');
  console.log('   HostYourBot Webhook Service');
  console.log('===========================================');
  console.log(`Environnement: ${config.environment}`);
  console.log(`Discord Webhook configuré: ${config.discord.webhookUrl ? 'Oui' : 'Non'}`);
  console.log(`K8s gRPC URL: ${config.k8s.grpcUrl}`);
  console.log('-------------------------------------------');
  console.log('🔍 Vérification des connexions...');
  console.log('-------------------------------------------');

  const discordService = new DiscordWebhookService();
  const k8sClient = new K8sGrpcClient();

  let hasErrors = false;

  if (discordService.isConfigured()) {
    const discordOk = await discordService.testConnection();
    if (!discordOk) {
      hasErrors = true;
    }
  } else {
    console.warn('⚠️  Discord webhook non configuré - les notifications ne seront pas envoyées');
  }

  const k8sOk = await k8sClient.testConnection();
  if (!k8sOk) {
    hasErrors = true;
    console.error('❌ Impossible de se connecter au service K8s - arrêt du service');
    process.exit(1);
  }

  if (hasErrors && discordService.isConfigured()) {
    console.warn('⚠️  Certaines vérifications ont échoué mais le service continue');
  }

  console.log('-------------------------------------------');
  console.log('✅ Toutes les vérifications sont passées');
  console.log('-------------------------------------------');

  statsJob = new StatsJob();
  alertsJob = new AlertsJob();

  console.log('🚀 Exécution des premiers checks...');
  await statsJob.execute();
  await alertsJob.execute();

  console.log('-------------------------------------------');
  console.log('📅 Démarrage des jobs planifiés...');

  statsJob.start();
  alertsJob.start();

  console.log('-------------------------------------------');
  console.log('✅ Service webhook démarré avec succès');
  console.log('===========================================');
}

let statsJob: StatsJob | undefined;
let alertsJob: AlertsJob | undefined;

startup().catch((error) => {
  console.error('❌ Erreur fatale au démarrage:', error);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('Signal SIGTERM reçu, arrêt du service...');
  if (statsJob) statsJob.stop();
  if (alertsJob) alertsJob.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Signal SIGINT reçu, arrêt du service...');
  if (statsJob) statsJob.stop();
  if (alertsJob) alertsJob.stop();
  process.exit(0);
});
