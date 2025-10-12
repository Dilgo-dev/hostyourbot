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
    console.log('[authService.getCurrentUser] Récupération de l\'utilisateur actuel');
    try {
      const response = await authApi.get<{ user: User }>('/api/auth/me');
      console.log('[authService.getCurrentUser] Réponse reçue:', response.data);
      if (!response.data) {
        console.error('[authService.getCurrentUser] response.data est undefined');
      }
      if (!response.data.user) {
        console.error('[authService.getCurrentUser] response.data.user est undefined');
      }
      return response.data;
    } catch (error) {
      console.error('[authService.getCurrentUser] Erreur lors de la récupération:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    await authApi.post('/api/auth/logout');
  },
};
