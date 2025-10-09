import axios from 'axios';
import { config } from '../config/env';

export interface DiscordEmbed {
  title: string;
  description?: string;
  color: number;
  fields?: {
    name: string;
    value: string;
    inline?: boolean;
  }[];
  timestamp?: string;
  footer?: {
    text: string;
  };
}

export class DiscordWebhookService {
  private webhookUrl: string;

  constructor() {
    this.webhookUrl = config.discord.webhookUrl;
  }

  async sendEmbed(embed: DiscordEmbed): Promise<void> {
    if (!this.webhookUrl) {
      console.warn('Discord webhook URL non configurée');
      return;
    }

    try {
      await axios.post(this.webhookUrl, {
        embeds: [embed],
      });
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du webhook Discord:', error.message);
    }
  }

  async sendStatsEmbed(
    totalNodes: number,
    readyNodes: number,
    totalPods: number,
    runningPods: number,
    pendingPods: number,
    failedPods: number,
    cpuUsage: number,
    memoryUsage: number,
    maxPodsCapacity: number,
    availablePodsCapacity: number
  ): Promise<void> {
    const capacityPercent = ((maxPodsCapacity - availablePodsCapacity) / maxPodsCapacity) * 100;

    let color = 0x00ff00;
    if (capacityPercent >= config.thresholds.capacityCritical) {
      color = 0xff0000;
    } else if (capacityPercent >= config.thresholds.capacityWarning) {
      color = 0xffa500;
    }

    const embed: DiscordEmbed = {
      title: '📊 Statistiques du Cluster Kubernetes',
      color: color,
      fields: [
        {
          name: '🖥️ Nodes',
          value: `${readyNodes}/${totalNodes} actifs`,
          inline: true,
        },
        {
          name: '📦 Pods',
          value: `${runningPods}/${totalPods} en cours`,
          inline: true,
        },
        {
          name: '⚠️ En attente',
          value: `${pendingPods} pods`,
          inline: true,
        },
        {
          name: '❌ Échoués',
          value: `${failedPods} pods`,
          inline: true,
        },
        {
          name: '💻 CPU',
          value: `${cpuUsage.toFixed(1)}%`,
          inline: true,
        },
        {
          name: '💾 Mémoire',
          value: `${memoryUsage.toFixed(1)}%`,
          inline: true,
        },
        {
          name: '📈 Capacité',
          value: `${maxPodsCapacity - availablePodsCapacity}/${maxPodsCapacity} pods (${capacityPercent.toFixed(1)}%)`,
          inline: false,
        },
        {
          name: '✅ Disponible',
          value: `${availablePodsCapacity} pods`,
          inline: true,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'HostYourBot Monitoring',
      },
    };

    await this.sendEmbed(embed);
  }

  async sendAlert(
    level: 'warning' | 'critical',
    title: string,
    message: string,
    details?: { name: string; value: string }[]
  ): Promise<void> {
    const color = level === 'critical' ? 0xff0000 : 0xffa500;
    const emoji = level === 'critical' ? '🔴' : '⚠️';

    const embed: DiscordEmbed = {
      title: `${emoji} ${title}`,
      description: message,
      color: color,
      fields: details || [],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'HostYourBot Monitoring',
      },
    };

    await this.sendEmbed(embed);
  }
}
