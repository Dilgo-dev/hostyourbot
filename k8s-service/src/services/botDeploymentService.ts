import { K8sClient } from './k8sClient';
import { Deployment, Container, Service, ConfigMap, Volume, VolumeMount } from '../types/k8s';
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
    const labels: Record<string, string> = {
      app: botId,
      'bot-language': config.language,
      'bot-version': config.version,
      'managed-by': 'hostyourbot',
      'user-id': config.userId || 'unknown',
    };

    if (config.workflowId) {
      labels['workflow-id'] = config.workflowId;
    }

    const volumes: Volume[] = [];
    const initContainers: Container[] = [];

    if (config.zipFileBase64) {
      volumes.push({
        name: 'bot-code',
        emptyDir: {},
      });
      volumes.push({
        name: 'bot-zip',
        configMap: {
          name: `${botId}-code`,
        },
      });

      initContainers.push({
        name: 'unzip-code',
        image: 'alpine:latest',
        command: ['sh', '-c'],
        args: [
          'echo "Installing unzip..." && ' +
          'apk add --no-cache unzip && ' +
          'echo "Checking /zip content..." && ' +
          'ls -la /zip && ' +
          'echo "Unzipping bot.zip to /tmp..." && ' +
          'unzip -o /zip/bot.zip -d /tmp && ' +
          'echo "Checking /tmp content..." && ' +
          'ls -la /tmp && ' +
          'echo "Moving files to /app..." && ' +
          'if [ $(ls -A /tmp | wc -l) -eq 1 ] && [ -d "/tmp/$(ls /tmp)" ]; then ' +
          '  echo "Single directory detected, moving contents up one level..."; ' +
          '  mv /tmp/*/* /app/ && rm -rf /tmp/*; ' +
          'else ' +
          '  echo "Multiple files/directories detected, moving all to /app..."; ' +
          '  mv /tmp/* /app/; ' +
          'fi && ' +
          'echo "Checking final /app content..." && ' +
          'ls -la /app && ' +
          'chmod -R 755 /app && ' +
          'echo "Init container completed successfully!"'
        ],
        volumeMounts: [
          { name: 'bot-zip', mountPath: '/zip', readOnly: true },
          { name: 'bot-code', mountPath: '/app' },
        ],
      });
    }

    const container: Container = {
      name: botId,
      image: config.image,
      env: config.env
        ? config.env.map((envVar) => ({ name: envVar.key, value: envVar.value }))
        : [],
    };

    if (config.zipFileBase64) {
      container.volumeMounts = [
        { name: 'bot-code', mountPath: '/app' },
      ];
      container.env = container.env || [];
      container.env.push({ name: 'WORKDIR', value: '/app' });
    }

    if (config.startCommand) {
      const commandParts = config.startCommand.trim().split(/\s+/);
      container.command = ['sh', '-c'];
      container.args = [`cd /app && npm install && ${config.startCommand}`];
    } else {
      container.command = ['tail'];
      container.args = ['-f', '/dev/null'];
    }

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
        replicas: 1,
        selector: {
          matchLabels: { app: botId },
        },
        template: {
          metadata: {
            labels,
          },
          spec: {
            containers: [container],
            initContainers: initContainers.length > 0 ? initContainers : undefined,
            volumes: volumes.length > 0 ? volumes : undefined,
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
      language: deployment.metadata.labels?.['bot-language'] || 'unknown',
      version: deployment.metadata.labels?.['bot-version'] || 'unknown',
      status,
      namespace: deployment.metadata.namespace || this.baseNamespace,
      image: deployment.spec.template.spec.containers[0]?.image || '',
      replicas: deployment.spec.replicas,
      userId: deployment.metadata.labels?.['user-id'],
      workflowId: deployment.metadata.labels?.['workflow-id'],
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

    if (config.zipFileBase64) {
      const configMap: ConfigMap = {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: {
          name: `${botId}-code`,
          namespace: this.baseNamespace,
          labels: {
            app: botId,
            'managed-by': 'hostyourbot',
          },
        },
        binaryData: {
          'bot.zip': config.zipFileBase64,
        },
      };

      await this.k8sClient.createConfigMap(configMap, this.baseNamespace);
    }

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

  async listBots(userId?: string): Promise<Bot[]> {
    try {
      const deploymentsList = await this.k8sClient.listDeployments(this.baseNamespace);
      return deploymentsList.items
        .filter((d) => {
          const isManagedByHostYourBot = d.metadata.labels?.['managed-by'] === 'hostyourbot';
          if (!isManagedByHostYourBot) return false;

          if (userId) {
            return d.metadata.labels?.['user-id'] === userId;
          }
          return true;
        })
        .map((d) => this.mapDeploymentToBot(d));
    } catch (error: any) {
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  }

  async getBot(botId: string, userId?: string): Promise<Bot> {
    const deployment = await this.k8sClient.getDeployment(botId, this.baseNamespace);
    const bot = this.mapDeploymentToBot(deployment);

    if (userId && bot.userId !== userId) {
      throw new Error('Unauthorized: You do not have access to this bot');
    }

    return bot;
  }

  async deleteBot(botId: string, userId?: string): Promise<void> {
    if (userId) {
      const bot = await this.getBot(botId, userId);
      if (bot.userId !== userId) {
        throw new Error('Unauthorized: You do not have access to this bot');
      }
    }

    await this.k8sClient.deleteDeployment(botId, this.baseNamespace);

    try {
      await this.k8sClient.deleteService(botId, this.baseNamespace);
    } catch {
    }

    try {
      await this.k8sClient.deleteConfigMap(`${botId}-code`, this.baseNamespace);
    } catch {
    }
  }

  async scaleBot(botId: string, replicas: number, userId?: string): Promise<Bot> {
    if (userId) {
      const bot = await this.getBot(botId, userId);
      if (bot.userId !== userId) {
        throw new Error('Unauthorized: You do not have access to this bot');
      }
    }

    const deployment = await this.k8sClient.scaleDeployment(
      botId,
      replicas,
      this.baseNamespace
    );
    return this.mapDeploymentToBot(deployment);
  }

  async stopBot(botId: string, userId?: string): Promise<Bot> {
    return this.scaleBot(botId, 0, userId);
  }

  async startBot(botId: string, userId?: string): Promise<Bot> {
    return this.scaleBot(botId, 1, userId);
  }

  async restartBot(botId: string, userId?: string): Promise<Bot> {
    if (userId) {
      const bot = await this.getBot(botId, userId);
      if (bot.userId !== userId) {
        throw new Error('Unauthorized: You do not have access to this bot');
      }
    }

    await this.k8sClient.deleteDeployment(botId, this.baseNamespace);

    const deployment = await this.k8sClient.getDeployment(botId, this.baseNamespace);
    const recreated = await this.k8sClient.createDeployment(deployment, this.baseNamespace);

    return this.mapDeploymentToBot(recreated);
  }

  async getBotLogs(botId: string, tailLines?: number, userId?: string): Promise<string> {
    if (userId) {
      const bot = await this.getBot(botId, userId);
      if (bot.userId !== userId) {
        throw new Error('Unauthorized: You do not have access to this bot');
      }
    }

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

  async deleteUserBots(userId: string): Promise<void> {
    try {
      const deploymentsList = await this.k8sClient.listDeployments(this.baseNamespace);
      const userBots = deploymentsList.items.filter(
        (d) => d.metadata.labels?.['user-id'] === userId && d.metadata.labels?.['managed-by'] === 'hostyourbot'
      );

      for (const deployment of userBots) {
        const botId = deployment.metadata.name;
        await this.deleteBot(botId);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        return;
      }
      throw error;
    }
  }

  async listAllBots(): Promise<Bot[]> {
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

  async getBotStats(): Promise<{
    total: number;
    running: number;
    stopped: number;
    error: number;
  }> {
    const bots = await this.listAllBots();

    const stats = {
      total: bots.length,
      running: bots.filter((b) => b.status === BotStatus.RUNNING).length,
      stopped: bots.filter((b) => b.status === BotStatus.STOPPED || b.replicas === 0).length,
      error: bots.filter((b) => b.status === BotStatus.ERROR).length,
    };

    return stats;
  }

  async deleteBotAsAdmin(botId: string): Promise<void> {
    await this.k8sClient.deleteDeployment(botId, this.baseNamespace);

    try {
      await this.k8sClient.deleteService(botId, this.baseNamespace);
    } catch {
    }

    try {
      await this.k8sClient.deleteConfigMap(`${botId}-code`, this.baseNamespace);
    } catch {
    }
  }

  async stopBotAsAdmin(botId: string): Promise<Bot> {
    const deployment = await this.k8sClient.scaleDeployment(
      botId,
      0,
      this.baseNamespace
    );
    return this.mapDeploymentToBot(deployment);
  }

  async startBotAsAdmin(botId: string): Promise<Bot> {
    const deployment = await this.k8sClient.scaleDeployment(
      botId,
      1,
      this.baseNamespace
    );
    return this.mapDeploymentToBot(deployment);
  }
}
