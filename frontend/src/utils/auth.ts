const ACCESS_TOKEN_KEY = 'fsa_access_token';
const REFRESH_TOKEN_KEY = 'fsa_refresh_token';
const USER_KEY = 'fsa_user';

import { User } from '../types/api';

export const getAccessToken = (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY);
export const getStoredUser = (): User | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

export const setTokens = (accessToken: string, refreshToken: string, user: User): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const updateAccessToken = (accessToken: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
};

export const clearAuth = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const isAuthenticated = (): boolean => !!getAccessToken();
