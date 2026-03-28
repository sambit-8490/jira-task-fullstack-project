import { useState } from 'react';
import { ExportModal } from './ExportModal';
import { Spinner } from '../ui/Spinner';
import { useExportStatus } from '../../hooks/useExports';

interface ExportButtonProps {
  projectId: string;
}

export const ExportButton = ({ projectId }: ExportButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeExportId, setActiveExportId] = useState<string | null>(null);
  const { data: exportStatus } = useExportStatus(activeExportId);

  const isPolling =
    !!activeExportId &&
    exportStatus?.status !== 'completed' &&
    exportStatus?.status !== 'failed';

  const isReady = exportStatus?.status === 'completed' && !!activeExportId;

  return (
    <>
      <button
        className={`btn-secondary text-sm ${isReady ? 'text-emerald-400 border-emerald-500/30' : ''}`}
        onClick={() => setIsOpen(true)}
        title="Export project to CSV"
      >
        {isPolling ? (
          <><Spinner size="sm" /> Exporting…</>
        ) : isReady ? (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Ready to Download
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </>
        )}
      </button>

      <ExportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        projectId={projectId}
        activeExportId={activeExportId}
        onExportStarted={(id) => setActiveExportId(id)}
      />
    </>
  );
};
