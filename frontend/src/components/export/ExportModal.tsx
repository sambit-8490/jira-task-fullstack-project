import { useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';
import { useTriggerExport, useExportStatus, useExportHistory, EXPORT_STATUS_KEY } from '../../hooks/useExports';
import { exportService } from '../../services/export.service';
import { Export, ExportStatus } from '../../types/api';
import { useQueryClient } from '@tanstack/react-query';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  activeExportId: string | null;
  onExportStarted: (exportId: string) => void;
}

const STATUS_LABELS: Record<ExportStatus, string> = {
  pending: 'Queued',
  processing: 'Processing…',
  completed: 'Ready',
  failed: 'Failed',
};

const STATUS_COLORS: Record<ExportStatus, string> = {
  pending: 'text-slate-400',
  processing: 'text-blue-400',
  completed: 'text-emerald-400',
  failed: 'text-red-400',
};

export const ExportModal = ({
  isOpen,
  onClose,
  projectId,
  activeExportId,
  onExportStarted,
}: ExportModalProps) => {
  const queryClient = useQueryClient();
  const { mutate: triggerExport, isPending: triggering } = useTriggerExport(projectId);
  const { data: exportStatus } = useExportStatus(activeExportId);
  const { data: exportHistory, isLoading: loadingHistory } = useExportHistory();

  const isPolling =
    !!activeExportId &&
    exportStatus?.status !== 'completed' &&
    exportStatus?.status !== 'failed';

  // Toast when export fails — useEffect prevents side-effect in render
  useEffect(() => {
    if (exportStatus?.status === 'failed') {
      toast.error('Export failed. Please try again.');
      // Clear the active export so the user can retry
      queryClient.removeQueries({ queryKey: EXPORT_STATUS_KEY(activeExportId ?? '') });
    }
  }, [exportStatus?.status, activeExportId, queryClient]);

  const handleTrigger = () => {
    triggerExport(undefined, {
      onSuccess: (data) => onExportStarted(data.id),
    });
  };

  const projectExports = exportHistory?.filter((e) => e.projectId === projectId) ?? [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Project" maxWidth="max-w-md">
      <div className="space-y-5">
        {/* Current export action */}
        <div className="bg-slate-800/60 rounded-xl p-4 space-y-3">
          <p className="text-sm text-slate-400">
            Exports generate a CSV with all project details, tasks, and a summary breakdown.
            The file is prepared asynchronously — you can close this modal while it processes.
          </p>

          {exportStatus?.status === 'completed' && activeExportId ? (
            <a
              href={exportService.getDownloadUrl(activeExportId)}
              className="btn-primary w-full justify-center"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download CSV
            </a>
          ) : (
            <button
              className="btn-primary w-full justify-center"
              onClick={handleTrigger}
              disabled={triggering || isPolling}
            >
              {triggering || isPolling ? (
                <>
                  <Spinner size="sm" />
                  {isPolling ? 'Preparing export…' : 'Starting…'}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export to CSV
                </>
              )}
            </button>
          )}

          {isPolling && (
            <p className="text-xs text-slate-500 text-center">
              Checking every 3 seconds…
            </p>
          )}
        </div>

        {/* Export history */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Export History
          </h3>

          {loadingHistory && (
            <div className="flex justify-center py-4">
              <Spinner size="sm" />
            </div>
          )}

          {!loadingHistory && projectExports.length === 0 && (
            <p className="text-sm text-slate-600 text-center py-3">No exports yet</p>
          )}

          {projectExports.length > 0 && (
            <div className="space-y-1">
              {projectExports.map((exp) => (
                <ExportHistoryRow key={exp.id} export={exp} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

const ExportHistoryRow = ({ export: exp }: { export: Export }) => (
  <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-800/50 transition-colors">
    <div className="flex items-center gap-3 min-w-0">
      <span className={`text-xs font-medium flex-shrink-0 ${STATUS_COLORS[exp.status]}`}>
        {STATUS_LABELS[exp.status]}
      </span>
      <span className="text-xs text-slate-600 truncate">
        {format(new Date(exp.createdAt), 'MMM d, yyyy · HH:mm')}
      </span>
    </div>
    {exp.status === 'completed' && (
      <a
        href={exportService.getDownloadUrl(exp.id)}
        className="text-xs text-primary-400 hover:text-primary-300 flex-shrink-0 ml-2"
        target="_blank"
        rel="noopener noreferrer"
      >
        Download
      </a>
    )}
    {exp.status === 'processing' && (
      <Spinner size="sm" className="flex-shrink-0 ml-2" />
    )}
  </div>
);
