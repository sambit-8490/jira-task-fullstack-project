import apiClient from './api';
import { ApiSuccess, ApiPaginated, Task, CreateTaskInput, UpdateTaskInput, TaskFilters } from '../types/api';

export const taskService = {
  list: async (filters: TaskFilters = {}): Promise<ApiPaginated<Task>> => {
    const { data } = await apiClient.get<ApiPaginated<Task>>('/tasks', { params: filters });
    return data;
  },

  create: async (input: CreateTaskInput): Promise<Task> => {
    const { data } = await apiClient.post<ApiSuccess<Task>>('/tasks', input);
    return data.data;
  },

  update: async (id: string, input: UpdateTaskInput): Promise<Task> => {
    const { data } = await apiClient.patch<ApiSuccess<Task>>(`/tasks/${id}`, input);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },
};
