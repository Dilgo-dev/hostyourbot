import { K8sClient } from './k8sClient';
import { Deployment, Container, Service } from '../types/k8s';
import { Bot, BotConfig, BotStatus, BotType } from '../types/bot';

export class BotDeploymentService {
  private k8sClient: K8sClient;
  private readonly baseNamespace = 'hostyourbot-bots';

  constructor() {
    this.k8sClient = new K8sClient();
  }

  private generateBotId(name: string): string {
    return `bot-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  }

  private createDeploymentManifest(botId: string, config: BotConfig): Deployment {
    const labels = {
      app: botId,
      'bot-type': config.type,
      'managed-by': 'hostyourbot',
    };

    const container: Container = {
      name: botId,
      image: config.image,
      env: [
        { name: 'BOT_TOKEN', value: config.token },
        { name: 'BOT_TYPE', value: config.type },
        ...(config.env
          ? Object.entries(config.env).map(([name, value]) => ({ name, value }))
          : []),
      ],
      resources: config.resources,
    };

    if (config.port) {
      container.ports = [{ containerPort: config.port }];
    }

    return {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name: botId,
        namespace: this.baseNamespace,
        labels,
      },
      spec: {
        replicas: config.replicas || 1,
        selector: {
          matchLabels: { app: botId },
        },
        template: {
          metadata: {
            labels,
          },
          spec: {
            containers: [container],
          },
        },
      },
    };
  }

  private createServiceManifest(botId: string, port: number): Service {
    return {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: {
        name: botId,
        namespace: this.baseNamespace,
        labels: {
          app: botId,
          'managed-by': 'hostyourbot',
        },
      },
      spec: {
        type: 'ClusterIP',
        selector: { app: botId },
        ports: [
          {
            port,
            targetPort: port,
            protocol: 'TCP',
          },
        ],
      },
    };
  }

  private async ensureNamespace(): Promise<void> {
    try {
      await this.k8sClient.getNamespace(this.baseNamespace);
    } catch {
      await this.k8sClient.createNamespace({
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: {
          name: this.baseNamespace,
          labels: {
            'managed-by': 'hostyourbot',
          },
        },
      });
    }
  }

  private mapDeploymentToBot(deployment: Deployment): Bot {
    const status = deployment.status?.availableReplicas
      ? BotStatus.RUNNING
      : deployment.status?.replicas
      ? BotStatus.PENDING
      : BotStatus.UNKNOWN;

    return {
      id: deployment.metadata.name,
      name: deployment.metadata.name.replace('bot-', ''),
      type: (deployment.metadata.labels?.['bot-type'] as BotType) || BotType.CUSTOM,
      status,
      namespace: deployment.metadata.namespace || this.baseNamespace,
      image: deployment.spec.template.spec.containers[0]?.image || '',
      replicas: deployment.spec.replicas,
      createdAt: deployment.metadata.creationTimestamp || new Date().toISOString(),
      podInfo: {
        ready: deployment.status?.readyReplicas || 0,
        total: deployment.spec.replicas,
      },
    };
  }

  async deployBot(config: BotConfig): Promise<Bot> {
    await this.ensureNamespace();

    const botId = this.generateBotId(config.name);

    const deploymentManifest = this.createDeploymentManifest(botId, config);
    const deployment = await this.k8sClient.createDeployment(
      deploymentManifest,
      this.baseNamespace
    );

    if (config.port) {
      await this.k8sClient.createService(
        this.createServiceManifest(botId, config.port),
        this.baseNamespace
      );
    }

    return this.mapDeploymentToBot(deployment);
  }

  async listBots(): Promise<Bot[]> {
    try {
      const deploymentsList = await this.k8sClient.listDeployments(this.baseNamespace);
      return deploymentsList.items
        .filter((d) => d.metadata.labels?.['managed-by'] === 'hostyourbot')
        .map((d) => this.mapDeploymentToBot(d));
    } catch (error: any) {
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  }

  async getBot(botId: string): Promise<Bot> {
    const deployment = await this.k8sClient.getDeployment(botId, this.baseNamespace);
    return this.mapDeploymentToBot(deployment);
  }

  async deleteBot(botId: string): Promise<void> {
    await this.k8sClient.deleteDeployment(botId, this.baseNamespace);

    try {
      await this.k8sClient.deleteService(botId, this.baseNamespace);
    } catch {
    }
  }

  async scaleBot(botId: string, replicas: number): Promise<Bot> {
    const deployment = await this.k8sClient.scaleDeployment(
      botId,
      replicas,
      this.baseNamespace
    );
    return this.mapDeploymentToBot(deployment);
  }

  async stopBot(botId: string): Promise<Bot> {
    return this.scaleBot(botId, 0);
  }

  async startBot(botId: string): Promise<Bot> {
    return this.scaleBot(botId, 1);
  }

  async restartBot(botId: string): Promise<Bot> {
    await this.k8sClient.deleteDeployment(botId, this.baseNamespace);

    const deployment = await this.k8sClient.getDeployment(botId, this.baseNamespace);
    const recreated = await this.k8sClient.createDeployment(deployment, this.baseNamespace);

    return this.mapDeploymentToBot(recreated);
  }

  async getBotLogs(botId: string, tailLines?: number): Promise<string> {
    const pods = await this.k8sClient.listPods(this.baseNamespace);
    const botPods = pods.items.filter(
      (pod) => pod.metadata.labels?.app === botId
    );

    if (botPods.length === 0) {
      throw new Error('No pods found for this bot');
    }

    const podName = botPods[0].metadata.name;
    return this.k8sClient.getPodLogs(podName, this.baseNamespace, tailLines);
  }
}
