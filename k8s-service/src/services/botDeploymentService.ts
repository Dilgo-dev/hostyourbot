import { K8sClient } from './k8sClient';
import { Deployment, Container, Service, ConfigMap, Volume, VolumeMount } from '../types/k8s';
import { Bot, BotConfig, BotStatus, BotType, BotDetailedStatus, UpdateStage } from '../types/bot';

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

  private async calculateBotUptime(botId: string): Promise<number | undefined> {
    try {
      const pods = await this.k8sClient.listPods(this.baseNamespace);
      const botPods = pods.items.filter(
        (pod) => pod.metadata.labels?.app === botId && pod.status?.phase === 'Running'
      );

      if (botPods.length === 0 || !botPods[0].status?.startTime) {
        return undefined;
      }

      const startTime = new Date(botPods[0].status.startTime).getTime();
      const now = Date.now();
      const uptimeSeconds = Math.floor((now - startTime) / 1000);

      return uptimeSeconds > 0 ? uptimeSeconds : undefined;
    } catch {
      return undefined;
    }
  }

  private getLastUpdateTime(deployment: Deployment): string | undefined {
    if (!deployment.status?.conditions || deployment.status.conditions.length === 0) {
      return undefined;
    }

    const progressingCondition = deployment.status.conditions.find(
      (condition) => condition.type === 'Progressing'
    );

    if (progressingCondition?.lastUpdateTime) {
      return progressingCondition.lastUpdateTime;
    }

    if (progressingCondition?.lastTransitionTime) {
      return progressingCondition.lastTransitionTime;
    }

    const latestCondition = deployment.status.conditions
      .filter((c) => c.lastUpdateTime || c.lastTransitionTime)
      .sort((a, b) => {
        const timeA = new Date(a.lastUpdateTime || a.lastTransitionTime || 0).getTime();
        const timeB = new Date(b.lastUpdateTime || b.lastTransitionTime || 0).getTime();
        return timeB - timeA;
      })[0];

    return latestCondition?.lastUpdateTime || latestCondition?.lastTransitionTime;
  }

  private async mapDeploymentToBot(deployment: Deployment): Promise<Bot> {
    const status = deployment.status?.availableReplicas
      ? BotStatus.RUNNING
      : deployment.status?.replicas
      ? BotStatus.PENDING
      : BotStatus.UNKNOWN;

    const uptime = await this.calculateBotUptime(deployment.metadata.name);
    const updatedAt = this.getLastUpdateTime(deployment);

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
      updatedAt,
      uptime,
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

    return await this.mapDeploymentToBot(deployment);
  }

  async listBots(userId?: string): Promise<Bot[]> {
    try {
      const deploymentsList = await this.k8sClient.listDeployments(this.baseNamespace);
      const filteredDeployments = deploymentsList.items.filter((d) => {
        const isManagedByHostYourBot = d.metadata.labels?.['managed-by'] === 'hostyourbot';
        if (!isManagedByHostYourBot) return false;

        if (userId) {
          return d.metadata.labels?.['user-id'] === userId;
        }
        return true;
      });

      return Promise.all(filteredDeployments.map((d) => this.mapDeploymentToBot(d)));
    } catch (error: any) {
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  }

  async getBot(botId: string, userId?: string): Promise<Bot> {
    const deployment = await this.k8sClient.getDeployment(botId, this.baseNamespace);
    const bot = await this.mapDeploymentToBot(deployment);

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
    return await this.mapDeploymentToBot(deployment);
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

    return await this.mapDeploymentToBot(recreated);
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
      const filteredDeployments = deploymentsList.items.filter(
        (d) => d.metadata.labels?.['managed-by'] === 'hostyourbot'
      );
      return Promise.all(filteredDeployments.map((d) => this.mapDeploymentToBot(d)));
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
    return await this.mapDeploymentToBot(deployment);
  }

  async startBotAsAdmin(botId: string): Promise<Bot> {
    const deployment = await this.k8sClient.scaleDeployment(
      botId,
      1,
      this.baseNamespace
    );
    return await this.mapDeploymentToBot(deployment);
  }

  async updateBot(botId: string, updateData: Partial<BotConfig> & { userId?: string }): Promise<Bot> {
    if (updateData.userId) {
      const bot = await this.getBot(botId, updateData.userId);
      if (bot.userId !== updateData.userId) {
        throw new Error('Unauthorized: You do not have access to this bot');
      }
    }

    let currentDeployment;
    try {
      currentDeployment = await this.k8sClient.getDeployment(botId, this.baseNamespace);
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Bot not found in Kubernetes cluster');
      }
      throw error;
    }

    if (updateData.name) {
      const newBotId = this.generateBotId(updateData.name);
      if (newBotId !== botId) {
        throw new Error('Cannot change bot name. Please create a new bot instead.');
      }
    }

    const hasChanges = updateData.zipFileBase64 ||
                       updateData.language ||
                       updateData.version ||
                       updateData.workflowId ||
                       updateData.image ||
                       updateData.env ||
                       updateData.startCommand;

    if (!hasChanges) {
      return await this.getBot(botId, updateData.userId);
    }

    if (updateData.zipFileBase64) {
      const configMapName = `${botId}-code`;

      try {
        await this.k8sClient.getConfigMap(configMapName, this.baseNamespace);

        const updatedConfigMap: ConfigMap = {
          apiVersion: 'v1',
          kind: 'ConfigMap',
          metadata: {
            name: configMapName,
            namespace: this.baseNamespace,
            labels: {
              app: botId,
              'managed-by': 'hostyourbot',
            },
          },
          binaryData: {
            'bot.zip': updateData.zipFileBase64,
          },
        };

        try {
          await this.k8sClient.getDeployment(botId, this.baseNamespace);
        } catch (deployError: any) {
          if (deployError.response?.status === 404) {
            throw new Error('Deployment has been deleted. Cannot update bot. Please redeploy the bot.');
          }
        }

        await this.k8sClient.updateConfigMap(configMapName, updatedConfigMap, this.baseNamespace);
      } catch (error: any) {
        if (error.response?.status === 404) {
          const newConfigMap: ConfigMap = {
            apiVersion: 'v1',
            kind: 'ConfigMap',
            metadata: {
              name: configMapName,
              namespace: this.baseNamespace,
              labels: {
                app: botId,
                'managed-by': 'hostyourbot',
              },
            },
            binaryData: {
              'bot.zip': updateData.zipFileBase64,
            },
          };

          await this.k8sClient.createConfigMap(newConfigMap, this.baseNamespace);
        } else {
          throw error;
        }
      }
    }

    if (updateData.language) {
      currentDeployment.metadata.labels = currentDeployment.metadata.labels || {};
      currentDeployment.metadata.labels['bot-language'] = updateData.language;
      currentDeployment.spec.template.metadata.labels = currentDeployment.spec.template.metadata.labels || {};
      currentDeployment.spec.template.metadata.labels['bot-language'] = updateData.language;
    }

    if (updateData.version) {
      currentDeployment.metadata.labels = currentDeployment.metadata.labels || {};
      currentDeployment.metadata.labels['bot-version'] = updateData.version;
      currentDeployment.spec.template.metadata.labels = currentDeployment.spec.template.metadata.labels || {};
      currentDeployment.spec.template.metadata.labels['bot-version'] = updateData.version;
    }

    if (updateData.workflowId) {
      currentDeployment.metadata.labels = currentDeployment.metadata.labels || {};
      currentDeployment.metadata.labels['workflow-id'] = updateData.workflowId;
      currentDeployment.spec.template.metadata.labels = currentDeployment.spec.template.metadata.labels || {};
      currentDeployment.spec.template.metadata.labels['workflow-id'] = updateData.workflowId;
    }

    if (updateData.image) {
      currentDeployment.spec.template.spec.containers[0].image = updateData.image;
    }

    if (updateData.env) {
      currentDeployment.spec.template.spec.containers[0].env = updateData.env.map((envVar) => ({
        name: envVar.key,
        value: envVar.value,
      }));
    }

    if (updateData.startCommand) {
      const container = currentDeployment.spec.template.spec.containers[0];
      container.command = ['sh', '-c'];
      container.args = [`cd /app && npm install && ${updateData.startCommand}`];
    }

    if (updateData.zipFileBase64 || updateData.startCommand || updateData.env) {
      currentDeployment.spec.template.metadata.annotations = currentDeployment.spec.template.metadata.annotations || {};
      currentDeployment.spec.template.metadata.annotations['kubectl.kubernetes.io/restartedAt'] = new Date().toISOString();
    }

    const updatedDeployment = await this.k8sClient.updateDeployment(
      botId,
      currentDeployment,
      this.baseNamespace
    );

    return await this.mapDeploymentToBot(updatedDeployment);
  }

  private calculatePodAge(startTime?: string): number | undefined {
    if (!startTime) return undefined;
    const start = new Date(startTime).getTime();
    const now = Date.now();
    return Math.floor((now - start) / 1000);
  }

  private determineUpdateStage(deployment: Deployment, pods: any[]): UpdateStage {
    if (pods.length === 0) {
      return 'config';
    }

    if (deployment.metadata.generation !== deployment.status?.observedGeneration) {
      return 'config';
    }

    const hasRestartingPods = pods.some(
      (p) =>
        p.status?.phase === 'Pending' ||
        p.status?.phase === 'ContainerCreating' ||
        p.status?.containerStatuses?.[0]?.state?.waiting
    );

    if (hasRestartingPods) {
      return 'restart';
    }

    const allPodsReady = pods.every(
      (p) =>
        p.status?.phase === 'Running' &&
        p.status?.conditions?.find((c: any) => c.type === 'Ready')?.status === 'True'
    );

    if (allPodsReady && deployment.status?.readyReplicas === deployment.spec.replicas) {
      return 'complete';
    }

    const hasErrorPods = pods.some(
      (p) =>
        p.status?.phase === 'Failed' ||
        p.status?.containerStatuses?.[0]?.state?.terminated?.reason === 'Error'
    );

    if (hasErrorPods) {
      return 'error';
    }

    return 'restart';
  }

  async getBotDetailedStatus(botId: string, userId?: string): Promise<BotDetailedStatus> {
    if (userId) {
      const bot = await this.getBot(botId, userId);
      if (bot.userId !== userId) {
        throw new Error('Unauthorized: You do not have access to this bot');
      }
    }

    const deployment = await this.k8sClient.getDeployment(botId, this.baseNamespace);

    const pods = await this.k8sClient.listPods(this.baseNamespace);
    const botPods = pods.items.filter((pod) => pod.metadata.labels?.app === botId);

    const configMapName = `${botId}-code`;
    let configMap = null;
    try {
      configMap = await this.k8sClient.getConfigMap(configMapName, this.baseNamespace);
    } catch {}

    const stage = this.determineUpdateStage(deployment, botPods);

    return {
      stage,
      deployment: {
        ready: deployment.status?.readyReplicas === deployment.spec.replicas,
        replicas: {
          ready: deployment.status?.readyReplicas || 0,
          total: deployment.spec.replicas || 0,
        },
        conditions: deployment.status?.conditions || [],
        generation: deployment.metadata.generation,
        observedGeneration: deployment.status?.observedGeneration,
      },
      pods: botPods.map((pod) => ({
        name: pod.metadata.name,
        phase: pod.status?.phase || 'Unknown',
        ready: pod.status?.conditions?.find((c) => c.type === 'Ready')?.status === 'True',
        restartCount: pod.status?.containerStatuses?.[0]?.restartCount || 0,
        age: this.calculatePodAge(pod.status?.startTime),
        containerState: pod.status?.containerStatuses?.[0]?.state,
      })),
      configMap: configMap
        ? {
            updated: true,
            lastModified: configMap.metadata.resourceVersion || '',
          }
        : null,
    };
  }

  async execCommandInBot(botId: string, command: string): Promise<{ output: string; error?: string }> {
    const pods = await this.k8sClient.listPods(this.baseNamespace);
    const botPods = pods.items.filter(
      (pod) => pod.metadata.labels?.app === botId && pod.status?.phase === 'Running'
    );

    if (botPods.length === 0) {
      return {
        output: '',
        error: 'No running pods found for this bot',
      };
    }

    const podName = botPods[0].metadata.name;
    const containerName = botId;

    const commandArray = ['sh', '-c', command];

    return await this.k8sClient.execCommand(
      podName,
      this.baseNamespace,
      commandArray,
      containerName
    );
  }

  async getBotMetrics(botId: string, userId?: string): Promise<any> {
    if (userId) {
      const bot = await this.getBot(botId, userId);
      if (bot.userId !== userId) {
        throw new Error('Unauthorized: You do not have access to this bot');
      }
    }

    const pods = await this.k8sClient.listPods(this.baseNamespace);
    const botPods = pods.items.filter((pod) => pod.metadata.labels?.app === botId);

    if (botPods.length === 0) {
      throw new Error('No pods found for this bot');
    }

    const podMetrics = await this.k8sClient.getPodMetrics(this.baseNamespace);

    const currentMetrics = {
      timestamp: new Date().toISOString(),
      cpu: 0,
      memory: 0,
      network: {
        received: 0,
        transmitted: 0,
      },
    };

    for (const podMetric of podMetrics.items) {
      const isPodFromBot = botPods.some((p) => p.metadata.name === podMetric.metadata.name);
      if (isPodFromBot && podMetric.containers) {
        for (const container of podMetric.containers) {
          const cpuNano = parseInt(container.usage.cpu.replace('n', ''));
          const memoryKi = parseInt(container.usage.memory.replace('Ki', ''));

          currentMetrics.cpu += cpuNano / 1_000_000;
          currentMetrics.memory += memoryKi / 1024;
        }
      }
    }

    currentMetrics.cpu = parseFloat(currentMetrics.cpu.toFixed(2));
    currentMetrics.memory = parseFloat(currentMetrics.memory.toFixed(2));

    return currentMetrics;
  }
}
