import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { exportService } from '../services/export.service';
import { ExportStatus } from '../types/api';

export const EXPORTS_KEY = 'exports';
export const EXPORT_STATUS_KEY = (id: string) => ['export', id];

export const useExportStatus = (exportId: string | null, enabled = true) => {
  return useQuery({
    queryKey: EXPORT_STATUS_KEY(exportId ?? ''),
    queryFn: () => exportService.getStatus(exportId!),
    enabled: !!exportId && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status as ExportStatus | undefined;
      if (status === 'completed' || status === 'failed') return false;
      return 3000;
    },
  });
};

export const useExportHistory = () => {
  return useQuery({
    queryKey: [EXPORTS_KEY],
    queryFn: () => exportService.list(),
  });
};

export const useTriggerExport = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => exportService.trigger(projectId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [EXPORTS_KEY] });
      toast.success('Export started!');
      return data;
    },
    onError: () => toast.error('Failed to start export'),
  });
};
