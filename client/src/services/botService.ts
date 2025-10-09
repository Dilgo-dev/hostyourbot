import { k8sApi } from './api';

export interface Bot {
  id: string;
  name: string;
  language: 'nodejs' | 'python' | 'go' | 'rust';
  version: string;
  status: 'running' | 'stopped' | 'error' | 'deploying';
  createdAt: string;
  updatedAt?: string;
  uptime?: number;
  image?: string;
  namespace?: string;
  podInfo?: {
    ready: number;
    total: number;
  };
  replicas?: number;
}

export interface EnvVar {
  key: string;
  value: string;
}

export interface CreateBotRequest {
  name: string;
  language: string;
  version: string;
  zipFile: File | null;
  envVars: EnvVar[];
  startCommand?: string;
  userId?: string;
}

export interface BotStats {
  totalBots: number;
  runningBots: number;
  stoppedBots: number;
  errorBots: number;
  totalUptime: number;
}

export const botService = {
  async getBots(): Promise<Bot[]> {
    const response = await k8sApi.get<{ bots: Bot[] }>('/api/v1/bots');
    return response.data.bots;
  },

  async getBot(id: string): Promise<Bot> {
    const response = await k8sApi.get<Bot | { bot: Bot }>(`/api/v1/bots/${id}`);
    if ('bot' in response.data) {
      return response.data.bot;
    }
    return response.data as Bot;
  },

  async createBot(data: CreateBotRequest): Promise<Bot> {
    const formData = new FormData();

    formData.append('name', data.name);
    formData.append('language', data.language);
    formData.append('version', data.version);

    if (data.userId) {
      formData.append('userId', data.userId);
    }

    if (data.zipFile) {
      formData.append('zipFile', data.zipFile);
    }

    if (data.startCommand) {
      formData.append('startCommand', data.startCommand);
    }

    formData.append('envVars', JSON.stringify(data.envVars));

    const response = await k8sApi.post<{ bot: Bot }>('/api/v1/bots', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.bot;
  },

  async updateBot(id: string, data: Partial<CreateBotRequest>): Promise<Bot> {
    const response = await k8sApi.patch<{ bot: Bot }>(`/api/v1/bots/${id}`, data);
    return response.data.bot;
  },

  async deleteBot(id: string): Promise<void> {
    await k8sApi.delete(`/api/v1/bots/${id}`);
  },

  async startBot(id: string): Promise<Bot> {
    const response = await k8sApi.post<{ bot: Bot }>(`/api/v1/bots/${id}/start`);
    return response.data.bot;
  },

  async stopBot(id: string): Promise<Bot> {
    const response = await k8sApi.post<{ bot: Bot }>(`/api/v1/bots/${id}/stop`);
    return response.data.bot;
  },

  async restartBot(id: string): Promise<Bot> {
    const response = await k8sApi.post<{ bot: Bot }>(`/api/v1/bots/${id}/restart`);
    return response.data.bot;
  },

  async getStats(): Promise<BotStats> {
    const response = await k8sApi.get<BotStats>('/api/v1/bots/stats');
    return response.data;
  },

  async getLogs(id: string, lines: number = 100): Promise<string[]> {
    const response = await k8sApi.get<{ logs: string | string[] }>(`/api/v1/bots/${id}/logs?lines=${lines}`);
    const logs = response.data.logs;

    if (typeof logs === 'string') {
      return logs.split('\n').filter(line => line.trim() !== '');
    }

    return logs;
  },
};
