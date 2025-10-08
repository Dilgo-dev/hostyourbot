import { authApi } from './api';

export interface UpdatePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface UpdatePasswordResponse {
  message: string;
}

export interface DeleteAccountResponse {
  message: string;
}

export const accountService = {
  async updatePassword(oldPassword: string, newPassword: string): Promise<UpdatePasswordResponse> {
    const response = await authApi.put<UpdatePasswordResponse>('/api/auth/account/password', {
      oldPassword,
      newPassword,
    });
    return response.data;
  },

  async deleteAccount(): Promise<DeleteAccountResponse> {
    const response = await authApi.delete<DeleteAccountResponse>('/api/auth/account');
    return response.data;
  },
};
