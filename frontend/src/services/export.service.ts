import apiClient from './api';
import { ApiSuccess, Export } from '../types/api';

export const exportService = {
  trigger: async (projectId: string): Promise<Export> => {
    const { data } = await apiClient.post<ApiSuccess<Export>>(`/projects/${projectId}/export`);
    return data.data;
  },

  getStatus: async (exportId: string): Promise<Export> => {
    const { data } = await apiClient.get<ApiSuccess<Export>>(`/exports/${exportId}`);
    return data.data;
  },

  list: async (): Promise<Export[]> => {
    const { data } = await apiClient.get<ApiSuccess<Export[]>>('/exports');
    return data.data;
  },

  getDownloadUrl: (exportId: string): string => `/api/exports/${exportId}/download`,
};
