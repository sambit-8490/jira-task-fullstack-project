import apiClient from './api';
import { ApiSuccess, ApiPaginated, Project, ProjectSummary, CreateProjectInput } from '../types/api';

export const projectService = {
  list: async (page = 1, limit = 10): Promise<ApiPaginated<ProjectSummary>> => {
    const { data } = await apiClient.get<ApiPaginated<ProjectSummary>>('/projects', {
      params: { page, limit },
    });
    return data;
  },

  create: async (input: CreateProjectInput): Promise<Project> => {
    const { data } = await apiClient.post<ApiSuccess<Project>>('/projects', input);
    return data.data;
  },

  getById: async (id: string): Promise<Project> => {
    const { data } = await apiClient.get<ApiSuccess<Project>>(`/projects/${id}`);
    return data.data;
  },

  addMember: async (projectId: string, email: string): Promise<{ id: string; name: string; email: string }> => {
    const { data } = await apiClient.post<ApiSuccess<{ id: string; name: string; email: string }>>(
      `/projects/${projectId}/members`,
      { email },
    );
    return data.data;
  },

  removeMember: async (projectId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/members/${userId}`);
  },
};
