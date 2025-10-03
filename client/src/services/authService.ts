import { api } from './api';

export interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

export const authService = {
  async register(email: string, password: string): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>('/api/auth/register', {
      email,
      password,
    });
    return response.data;
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  async getCurrentUser(): Promise<{ user: User }> {
    const response = await api.get<{ user: User }>('/api/auth/me');
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/api/auth/logout');
  },
};
