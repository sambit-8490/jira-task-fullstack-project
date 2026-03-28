import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { Navbar } from '../components/layout/Navbar';
import { ProjectCard } from '../components/projects/ProjectCard';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import { SkeletonList } from '../components/ui/SkeletonCard';

export const DashboardPage = () => {
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data, isLoading, isError } = useProjects(page, 10);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar
        rightContent={
          <button className="btn-primary text-sm" onClick={() => setShowCreateModal(true)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-100">Projects</h1>
          <p className="text-slate-400 text-sm mt-1">
            {data
              ? `${data.pagination.total} project${data.pagination.total !== 1 ? 's' : ''}`
              : '\u00A0'}
          </p>
        </div>

        {isLoading && <SkeletonList />}

        {isError && (
          <div className="text-center py-16">
            <p className="text-red-400">Failed to load projects. Please try again.</p>
          </div>
        )}

        {data && data.data.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-2">No projects yet</h3>
            <p className="text-slate-500 text-sm mb-6">Create your first project to get started</p>
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              Create Project
            </button>
          </div>
        )}

        {data && data.data.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.data.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => navigate(`/projects/${project.id}`)}
              />
            ))}
          </div>
        )}

        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              className="btn-secondary px-3 py-1.5 text-sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <span className="text-sm text-slate-400">
              Page {data.pagination.page} of {data.pagination.totalPages}
            </span>
            <button
              className="btn-secondary px-3 py-1.5 text-sm"
              disabled={page === data.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </main>

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};
