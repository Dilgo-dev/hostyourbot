import { k8sApi } from './api';
import { authService } from './authService';

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
  userId?: string;
  workflowId?: string;
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
  workflowId?: string;
}

export interface BotStats {
  totalBots: number;
  runningBots: number;
  stoppedBots: number;
  errorBots: number;
  totalUptime: number;
}

export interface BotDetailedStatus {
  stage: 'validation' | 'upload' | 'config' | 'restart' | 'complete' | 'error';
  deployment: {
    ready: boolean;
    replicas: { ready: number; total: number };
    conditions: any[];
    generation?: number;
    observedGeneration?: number;
  };
  pods: Array<{
    name: string;
    phase: string;
    ready: boolean;
    restartCount: number;
    age?: number;
    containerState?: any;
  }>;
  configMap: {
    updated: boolean;
    lastModified: string;
  } | null;
}

export const botService = {
  async getUserId(): Promise<string | undefined> {
    try {
      const response = await authService.getCurrentUser();
      const { user } = response;
      if (!user) {
        return undefined;
      }
      return user.id;
    } catch (error) {
      return undefined;
    }
  },

  async getBots(): Promise<Bot[]> {
    const userId = await this.getUserId();
    const response = await k8sApi.get<{ bots: Bot[] }>('/api/v1/bots', {
      params: { userId },
    });
    return response.data.bots;
  },

  async getBot(id: string): Promise<Bot> {
    const userId = await this.getUserId();
    const response = await k8sApi.get<Bot | { bot: Bot }>(`/api/v1/bots/${id}`, {
      params: { userId },
    });

    const bot = 'bot' in response.data ? response.data.bot : response.data;

    if (!bot || !bot.id) {
      throw new Error('Le serveur n\'a pas retourné de bot valide');
    }

    return bot;
  },

  async createBot(data: CreateBotRequest): Promise<Bot> {
    const userId = await this.getUserId();
    const formData = new FormData();

    formData.append('name', data.name);
    formData.append('language', data.language);
    formData.append('version', data.version);

    if (userId) {
      formData.append('userId', userId);
    }

    if (data.zipFile) {
      formData.append('zipFile', data.zipFile);
    }

    if (data.startCommand) {
      formData.append('startCommand', data.startCommand);
    }

    if (data.workflowId) {
      formData.append('workflowId', data.workflowId);
    }

    formData.append('envVars', JSON.stringify(data.envVars));

    const response = await k8sApi.post<Bot | { bot: Bot }>('/api/v1/bots', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const bot = 'bot' in response.data ? response.data.bot : response.data;

    if (!bot) {
      throw new Error('Le serveur n\'a pas retourné de bot valide');
    }

    if (!bot.id) {
      throw new Error('Le bot retourné n\'a pas d\'ID valide');
    }

    return bot;
  },

  async updateBot(id: string, data: Partial<CreateBotRequest>): Promise<Bot> {
    const userId = await this.getUserId();
    const formData = new FormData();

    if (data.name) {
      formData.append('name', data.name);
    }

    if (data.language) {
      formData.append('language', data.language);
    }

    if (data.version) {
      formData.append('version', data.version);
    }

    if (userId) {
      formData.append('userId', userId);
    }

    if (data.zipFile) {
      formData.append('zipFile', data.zipFile);
    }

    if (data.startCommand) {
      formData.append('startCommand', data.startCommand);
    }

    if (data.workflowId) {
      formData.append('workflowId', data.workflowId);
    }

    if (data.envVars) {
      formData.append('envVars', JSON.stringify(data.envVars));
    }

    const response = await k8sApi.put<Bot | { bot: Bot }>(`/api/v1/bots/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const bot = 'bot' in response.data ? response.data.bot : response.data;

    if (!bot || !bot.id) {
      throw new Error('Le serveur n\'a pas retourné de bot valide');
    }

    return bot;
  },

  async deleteBot(id: string): Promise<void> {
    const userId = await this.getUserId();
    await k8sApi.delete(`/api/v1/bots/${id}`, {
      params: { userId },
    });
  },

  async startBot(id: string): Promise<Bot> {
    const userId = await this.getUserId();
    const response = await k8sApi.post<{ bot: Bot }>(`/api/v1/bots/${id}/start`, null, {
      params: { userId },
    });
    return response.data.bot;
  },

  async stopBot(id: string): Promise<Bot> {
    const userId = await this.getUserId();
    const response = await k8sApi.post<{ bot: Bot }>(`/api/v1/bots/${id}/stop`, null, {
      params: { userId },
    });
    return response.data.bot;
  },

  async restartBot(id: string): Promise<Bot> {
    const userId = await this.getUserId();
    const response = await k8sApi.post<{ bot: Bot }>(`/api/v1/bots/${id}/restart`, null, {
      params: { userId },
    });
    return response.data.bot;
  },

  async getStats(): Promise<BotStats> {
    const userId = await this.getUserId();
    const response = await k8sApi.get<BotStats>('/api/v1/bots/stats', {
      params: { userId },
    });
    return response.data;
  },

  async getLogs(id: string, lines: number = 100): Promise<string[]> {
    const userId = await this.getUserId();
    const response = await k8sApi.get<{ logs: string | string[] }>(`/api/v1/bots/${id}/logs`, {
      params: { userId, lines },
    });
    const logs = response.data.logs;

    if (typeof logs === 'string') {
      return logs.split('\n').filter(line => line.trim() !== '');
    }

    return logs;
  },

  async getBotStatus(id: string): Promise<BotDetailedStatus> {
    const userId = await this.getUserId();
    const response = await k8sApi.get<BotDetailedStatus>(`/api/v1/bots/${id}/status`, {
      params: { userId },
    });
    return response.data;
  },

  async execCommand(id: string, command: string): Promise<{ output: string; error?: string }> {
    const response = await k8sApi.post<{ output: string; error?: string }>(
      `/api/v1/admin/bots/${id}/exec`,
      { command }
    );
    return response.data;
  },
};
