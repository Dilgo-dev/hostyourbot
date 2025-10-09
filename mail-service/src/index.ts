import { config } from './config/env';
import { startGrpcServer } from './grpc/mailGrpcServer';

console.log('[MailService] Démarrage du service mail...');
console.log(`[MailService] Environnement: ${config.environment}`);
console.log(`[MailService] Port gRPC: ${config.grpcPort}`);
console.log(`[MailService] SMTP Host: ${config.smtp.host}`);

const server = startGrpcServer(config.grpcPort);

const shutdown = () => {
  console.log('\n[MailService] Arrêt du serveur...');
  server.tryShutdown(() => {
    console.log('[MailService] Serveur arrêté');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
