import { config } from './config/env';
import { StatsJob } from './jobs/statsJob';
import { AlertsJob } from './jobs/alertsJob';

console.log('===========================================');
console.log('   HostYourBot Webhook Service');
console.log('===========================================');
console.log(`Environnement: ${config.environment}`);
console.log(`Discord Webhook configuré: ${config.discord.webhookUrl ? 'Oui' : 'Non'}`);
console.log(`K8s gRPC URL: ${config.k8s.grpcUrl}`);
console.log('-------------------------------------------');

const statsJob = new StatsJob();
const alertsJob = new AlertsJob();

statsJob.start();
alertsJob.start();

console.log('-------------------------------------------');
console.log('Service webhook démarré avec succès');
console.log('===========================================');

process.on('SIGTERM', () => {
  console.log('Signal SIGTERM reçu, arrêt du service...');
  statsJob.stop();
  alertsJob.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Signal SIGINT reçu, arrêt du service...');
  statsJob.stop();
  alertsJob.stop();
  process.exit(0);
});
