import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { taskService } from '../services/task.service';
import { PROJECT_KEY } from './useProjects';
import { CreateTaskInput, UpdateTaskInput, TaskFilters, Task } from '../types/api';

export const TASKS_KEY = (filters: TaskFilters) => ['tasks', filters];

export const useTasks = (filters: TaskFilters = {}) => {
  return useQuery({
    queryKey: TASKS_KEY(filters),
    queryFn: () => taskService.list(filters),
    enabled: !!filters.project_id,
  });
};

export const useCreateTask = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => taskService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEY(projectId) });
      toast.success('Task created!');
    },
    onError: () => toast.error('Failed to create task'),
  });
};

export const useUpdateTask = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      taskService.update(id, input),

    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: PROJECT_KEY(projectId) });
      const previousProject = queryClient.getQueryData(PROJECT_KEY(projectId));

      queryClient.setQueryData(PROJECT_KEY(projectId), (old: { tasks?: Task[] } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          tasks: old.tasks?.map((t) => (t.id === id ? { ...t, ...input } : t)),
        };
      });

      return { previousProject };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData(PROJECT_KEY(projectId), context.previousProject);
      }
      toast.error('Failed to update task');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEY(projectId) });
    },
  });
};

export const useDeleteTask = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEY(projectId) });
      toast.success('Task deleted');
    },
    onError: () => toast.error('Failed to delete task'),
  });
};
