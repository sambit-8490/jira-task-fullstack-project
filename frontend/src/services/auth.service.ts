import apiClient from './api';
import { ApiSuccess, AuthTokens, LoginInput, RegisterInput } from '../types/api';

export const authService = {
  register: async (input: RegisterInput): Promise<AuthTokens> => {
    const { data } = await apiClient.post<ApiSuccess<AuthTokens>>('/auth/register', input);
    return data.data;
  },

  login: async (input: LoginInput): Promise<AuthTokens> => {
    const { data } = await apiClient.post<ApiSuccess<AuthTokens>>('/auth/login', input);
    return data.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await apiClient.post('/auth/logout', { refreshToken });
  },
};
