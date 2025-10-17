import { authApi, k8sApi } from './api';

export interface AdminUser {
  id: string;
  email: string | null;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
  twoFactorEnabled: boolean;
  discordId?: string | null;
  discordUsername?: string | null;
  discordAvatar?: string | null;
}

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetUsersResponse {
  users: AdminUser[];
  pagination: PaginationData;
}

export interface UserStatsResponse {
  total: number;
  admins: number;
  users: number;
  newToday: number;
  withDiscord: number;
  withEmail: number;
  with2FA: number;
}

export interface AdminBot {
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
  podInfo?: {
    ready: number;
    total: number;
  };
  replicas?: number;
}

export interface BotStatsResponse {
  total: number;
  running: number;
  stopped: number;
  error: number;
}

export const adminService = {
  async getUsers(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    role: string = '',
    sortBy: string = 'createdAt',
    sortOrder: 'ASC' | 'DESC' = 'DESC'
  ): Promise<GetUsersResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
    });

    if (search) params.append('search', search);
    if (role) params.append('role', role);

    const response = await authApi.get<GetUsersResponse>(`/api/admin/users?${params.toString()}`);
    return response.data;
  },

  async getUserById(id: string): Promise<{ user: AdminUser }> {
    const response = await authApi.get<{ user: AdminUser }>(`/api/admin/users/${id}`);
    return response.data;
  },

  async updateUserRole(id: string, role: 'user' | 'admin'): Promise<{ message: string; user: AdminUser }> {
    const response = await authApi.put<{ message: string; user: AdminUser }>(
      `/api/admin/users/${id}/role`,
      { role }
    );
    return response.data;
  },

  async deleteUser(id: string): Promise<{ message: string }> {
    const response = await authApi.delete<{ message: string }>(`/api/admin/users/${id}`);
    return response.data;
  },

  async getUserStats(): Promise<UserStatsResponse> {
    const response = await authApi.get<UserStatsResponse>('/api/admin/users/stats');
    return response.data;
  },

  async getBots(): Promise<AdminBot[]> {
    const response = await k8sApi.get<{ bots: AdminBot[] }>('/api/v1/admin/bots');
    return response.data.bots || [];
  },

  async getBotStats(): Promise<BotStatsResponse> {
    const response = await k8sApi.get<BotStatsResponse>('/api/v1/admin/bots/stats');
    return response.data || { total: 0, running: 0, stopped: 0, error: 0 };
  },

  async startBot(id: string): Promise<{ bot: AdminBot }> {
    const response = await k8sApi.post<{ bot: AdminBot }>(`/api/v1/admin/bots/${id}/start`);
    return response.data;
  },

  async stopBot(id: string): Promise<{ bot: AdminBot }> {
    const response = await k8sApi.post<{ bot: AdminBot }>(`/api/v1/admin/bots/${id}/stop`);
    return response.data;
  },

  async deleteBot(id: string): Promise<void> {
    await k8sApi.delete(`/api/v1/admin/bots/${id}`);
  },
};
