import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { projectService } from '../services/project.service';
import { CreateProjectInput } from '../types/api';

export const PROJECTS_KEY = 'projects';
export const PROJECT_KEY = (id: string) => ['project', id];

export const useProjects = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: [PROJECTS_KEY, page, limit],
    queryFn: () => projectService.list(page, limit),
  });
};

export const useProject = (id: string) => {
  return useQuery({
    queryKey: PROJECT_KEY(id),
    queryFn: () => projectService.getById(id),
    enabled: !!id,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectInput) => projectService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
      toast.success('Project created!');
    },
    onError: () => toast.error('Failed to create project'),
  });
};

export const useAddMember = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) => projectService.addMember(projectId, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEY(projectId) });
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
      toast.success('Member added!');
    },
    onError: (error: unknown) => {
      const msg = getErrorMessage(error);
      toast.error(msg);
    },
  });
};

export const useRemoveMember = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => projectService.removeMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEY(projectId) });
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
      toast.success('Member removed');
    },
    onError: () => toast.error('Failed to remove member'),
  });
};

const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosErr = error as { response?: { data?: { error?: { message?: string } } } };
    return axiosErr.response?.data?.error?.message ?? 'Something went wrong';
  }
  return 'Something went wrong';
};
