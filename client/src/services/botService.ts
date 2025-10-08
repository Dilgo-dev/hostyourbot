import { api } from './api';

export interface Bot {
  id: string;
  name: string;
  language: 'nodejs' | 'python' | 'go' | 'rust';
  version: string;
  status: 'running' | 'stopped' | 'error' | 'deploying';
  createdAt: string;
  updatedAt: string;
  uptime?: number;
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
    const response = await api.get<{ bots: Bot[] }>('/api/bots');
    return response.data.bots;
  },

  async getBot(id: string): Promise<Bot> {
    const response = await api.get<{ bot: Bot }>(`/api/bots/${id}`);
    return response.data.bot;
  },

  async createBot(data: CreateBotRequest): Promise<Bot> {
    const response = await api.post<{ bot: Bot }>('/api/bots', data);
    return response.data.bot;
  },

  async updateBot(id: string, data: Partial<CreateBotRequest>): Promise<Bot> {
    const response = await api.patch<{ bot: Bot }>(`/api/bots/${id}`, data);
    return response.data.bot;
  },

  async deleteBot(id: string): Promise<void> {
    await api.delete(`/api/bots/${id}`);
  },

  async startBot(id: string): Promise<Bot> {
    const response = await api.post<{ bot: Bot }>(`/api/bots/${id}/start`);
    return response.data.bot;
  },

  async stopBot(id: string): Promise<Bot> {
    const response = await api.post<{ bot: Bot }>(`/api/bots/${id}/stop`);
    return response.data.bot;
  },

  async restartBot(id: string): Promise<Bot> {
    const response = await api.post<{ bot: Bot }>(`/api/bots/${id}/restart`);
    return response.data.bot;
  },

  async getStats(): Promise<BotStats> {
    const response = await api.get<BotStats>('/api/bots/stats');
    return response.data;
  },

  async getLogs(id: string, lines: number = 100): Promise<string[]> {
    const response = await api.get<{ logs: string[] }>(`/api/bots/${id}/logs?lines=${lines}`);
    return response.data.logs;
  },
};
