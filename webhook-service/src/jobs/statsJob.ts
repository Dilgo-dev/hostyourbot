import cron from 'node-cron';
import { K8sGrpcClient } from '../services/k8sGrpcClient';
import { DiscordWebhookService } from '../services/discordWebhook';
import { config } from '../config/env';

export class StatsJob {
  private k8sClient: K8sGrpcClient;
  private discordService: DiscordWebhookService;
  private task: cron.ScheduledTask | null = null;

  constructor() {
    this.k8sClient = new K8sGrpcClient();
    this.discordService = new DiscordWebhookService();
  }

  async execute(): Promise<void> {
    try {
      console.log('Exécution du job de statistiques...');

      const metrics = await this.k8sClient.getClusterMetrics();

      await this.discordService.sendStatsEmbed(
        metrics.total_nodes,
        metrics.ready_nodes,
        metrics.total_pods,
        metrics.running_pods,
        metrics.pending_pods,
        metrics.failed_pods,
        metrics.cpu_usage_percent,
        metrics.memory_usage_percent,
        metrics.max_pods_capacity,
        metrics.available_pods_capacity
      );

      console.log('Statistiques envoyées avec succès');
    } catch (error: any) {
      console.error('Erreur lors de l\'exécution du job de statistiques:', error.message);
    }
  }

  start(): void {
    console.log(`Planification du job de statistiques: ${config.schedule.statsCron}`);

    this.task = cron.schedule(config.schedule.statsCron, async () => {
      await this.execute();
    });

    console.log('Job de statistiques démarré');
  }

  stop(): void {
    if (this.task) {
      this.task.stop();
      console.log('Job de statistiques arrêté');
    }
  }
}
