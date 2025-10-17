import { authApi } from './api';

export interface User {
  id: string;
  email: string | null;
  role?: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
  twoFactorEnabled?: boolean;
  discordId?: string | null;
  discordUsername?: string | null;
  discordAvatar?: string | null;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface LoginResponse {
  message: string;
  user: User;
  requires2FA?: boolean;
  tempToken?: string;
}

export const authService = {
  async register(email: string, password: string): Promise<RegisterResponse> {
    const response = await authApi.post<RegisterResponse>('/api/auth/register', {
      email,
      password,
    });
    return response.data;
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await authApi.post<LoginResponse>('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  async getCurrentUser(): Promise<{ user: User }> {
    const response = await authApi.get<{ user: User }>('/api/auth/me');
    return response.data;
  },

  async logout(): Promise<void> {
    await authApi.post('/api/auth/logout');
  },
};
