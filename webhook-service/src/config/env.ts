import dotenv from 'dotenv';

dotenv.config();

export const config = {
  environment: process.env.WEBHOOK_ENVIRONMENT || 'development',
  discord: {
    webhookUrl: process.env.DISCORD_WEBHOOK_URL || '',
  },
  k8s: {
    grpcUrl: process.env.K8S_GRPC_URL || 'k8s-service:50054',
  },
  schedule: {
    statsCron: process.env.STATS_CRON || '0 9 * * *',
    checkInterval: parseInt(process.env.CHECK_INTERVAL || '300000', 10),
  },
  thresholds: {
    capacityWarning: parseFloat(process.env.CAPACITY_WARNING_THRESHOLD || '80'),
    capacityCritical: parseFloat(process.env.CAPACITY_CRITICAL_THRESHOLD || '90'),
    podsWarningPercent: parseFloat(process.env.PODS_WARNING_THRESHOLD || '90'),
  },
};
