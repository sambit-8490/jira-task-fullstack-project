import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, getRefreshToken, updateAccessToken, clearAuth, setTokens, getStoredUser } from '../utils/auth';
import { RefreshedTokens } from '../types/api';

const BASE_URL = import.meta.env['VITE_API_URL'] ?? '/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach access token ──────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// ── Response interceptor: handle 401, refresh token, retry ───────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else if (token) prom.resolve(token);
  });
  failedQueue = [];
};

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearAuth();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post<{ success: true; data: RefreshedTokens }>(
        `${BASE_URL}/auth/refresh`,
        { refreshToken },
      );
      const { accessToken, refreshToken: newRefreshToken } = data.data;
      // Use setTokens to keep user intact and update both tokens via the auth util
      const currentUser = getStoredUser();
      if (currentUser) setTokens(accessToken, newRefreshToken, currentUser);
      else updateAccessToken(accessToken);

      apiClient.defaults.headers['Authorization'] = `Bearer ${accessToken}`;
      originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

      processQueue(null, accessToken);
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearAuth();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;
