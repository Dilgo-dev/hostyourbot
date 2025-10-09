import { K8sGrpcClient } from '../services/k8sGrpcClient';
import { DiscordWebhookService } from '../services/discordWebhook';
import { config } from '../config/env';

export class AlertsJob {
  private k8sClient: K8sGrpcClient;
  private discordService: DiscordWebhookService;
  private interval: NodeJS.Timeout | null = null;
  private lastAlerts: Set<string> = new Set();

  constructor() {
    this.k8sClient = new K8sGrpcClient();
    this.discordService = new DiscordWebhookService();
  }

  async execute(): Promise<void> {
    try {
      const metrics = await this.k8sClient.getClusterMetrics();
      const currentAlerts = new Set<string>();

      const capacityPercent =
        ((metrics.max_pods_capacity - metrics.available_pods_capacity) / metrics.max_pods_capacity) * 100;

      if (capacityPercent >= config.thresholds.capacityCritical) {
        const alertKey = `capacity-critical-${Math.floor(capacityPercent)}`;
        currentAlerts.add(alertKey);

        if (!this.lastAlerts.has(alertKey)) {
          await this.discordService.sendAlert(
            'critical',
            'Capacité Critique',
            `Le cluster a atteint ${capacityPercent.toFixed(1)}% de sa capacité maximale !`,
            [
              {
                name: 'Pods utilisés',
                value: `${metrics.max_pods_capacity - metrics.available_pods_capacity}/${metrics.max_pods_capacity}`,
              },
              {
                name: 'Pods disponibles',
                value: `${metrics.available_pods_capacity}`,
              },
            ]
          );
        }
      } else if (capacityPercent >= config.thresholds.capacityWarning) {
        const alertKey = `capacity-warning-${Math.floor(capacityPercent / 5) * 5}`;
        currentAlerts.add(alertKey);

        if (!this.lastAlerts.has(alertKey)) {
          await this.discordService.sendAlert(
            'warning',
            'Avertissement Capacité',
            `Le cluster approche de sa capacité maximale : ${capacityPercent.toFixed(1)}%`,
            [
              {
                name: 'Pods utilisés',
                value: `${metrics.max_pods_capacity - metrics.available_pods_capacity}/${metrics.max_pods_capacity}`,
              },
              {
                name: 'Pods disponibles',
                value: `${metrics.available_pods_capacity}`,
              },
            ]
          );
        }
      }

      if (metrics.failed_pods > 0) {
        const alertKey = `failed-pods-${metrics.failed_pods}`;
        currentAlerts.add(alertKey);

        if (!this.lastAlerts.has(alertKey)) {
          await this.discordService.sendAlert(
            'critical',
            'Pods en Échec',
            `${metrics.failed_pods} pod(s) sont en état d'échec`,
            [
              {
                name: 'Pods échoués',
                value: `${metrics.failed_pods}`,
              },
              {
                name: 'Pods en cours',
                value: `${metrics.running_pods}`,
              },
            ]
          );
        }
      }

      if (metrics.pending_pods > 10) {
        const alertKey = `pending-pods-${Math.floor(metrics.pending_pods / 5) * 5}`;
        currentAlerts.add(alertKey);

        if (!this.lastAlerts.has(alertKey)) {
          await this.discordService.sendAlert(
            'warning',
            'Pods en Attente',
            `${metrics.pending_pods} pod(s) sont en attente de démarrage`,
            [
              {
                name: 'Pods en attente',
                value: `${metrics.pending_pods}`,
              },
            ]
          );
        }
      }

      const notReadyNodes = metrics.total_nodes - metrics.ready_nodes;
      if (notReadyNodes > 0) {
        const alertKey = `nodes-not-ready-${notReadyNodes}`;
        currentAlerts.add(alertKey);

        if (!this.lastAlerts.has(alertKey)) {
          await this.discordService.sendAlert(
            'critical',
            'Nodes Indisponibles',
            `${notReadyNodes} node(s) ne sont pas prêts`,
            [
              {
                name: 'Nodes actifs',
                value: `${metrics.ready_nodes}/${metrics.total_nodes}`,
              },
            ]
          );
        }
      }

      this.lastAlerts = currentAlerts;
    } catch (error: any) {
      console.error('Erreur lors de la vérification des alertes:', error.message);
    }
  }

  start(): void {
    console.log(`Démarrage de la surveillance des alertes (intervalle: ${config.schedule.checkInterval}ms)`);

    this.interval = setInterval(async () => {
      await this.execute();
    }, config.schedule.checkInterval);

    this.execute();

    console.log('Surveillance des alertes démarrée');
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      console.log('Surveillance des alertes arrêtée');
    }
  }
}
