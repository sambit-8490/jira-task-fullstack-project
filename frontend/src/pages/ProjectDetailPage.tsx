import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../hooks/useProjects';
import { useCurrentUser } from '../hooks/useAuth';
import { Navbar } from '../components/layout/Navbar';
import { MembersSidebar } from '../components/projects/MembersSidebar';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal';
import { ExportButton } from '../components/export/ExportButton';
import { RoleBadge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { Priority } from '../types/api';

const PRIORITY_OPTIONS: Array<{ value: Priority | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { data: project, isLoading, isError } = useProject(id!);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load project or access denied</p>
          <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isOwner = project.ownerId === currentUser?.id;
  const currentMember = project.members.find((m) => m.userId === currentUser?.id);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar
        backTo="/dashboard"
        title={project.name}
        subtitle={project.description ?? undefined}
        rightContent={
          <div className="flex items-center gap-2">
            {currentMember && <RoleBadge role={currentMember.role} />}
            {/* Only owner can trigger exports */}
            {isOwner && <ExportButton projectId={project.id} />}
          </div>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Members sidebar — desktop only */}
        <aside className="w-64 border-r border-slate-800 bg-slate-900/30 overflow-y-auto flex-shrink-0 hidden lg:block">
          <MembersSidebar
            projectId={project.id}
            members={project.members}
            isOwner={isOwner}
            currentUserId={currentUser?.id ?? ''}
          />
        </aside>

        {/* Main board area */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {/* Toolbar */}
          <div className="px-4 sm:px-6 py-3 border-b border-slate-800 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 mr-1">Priority:</span>
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPriorityFilter(opt.value)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    priorityFilter === opt.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
              {/* Tasks count */}
              <span className="text-xs text-slate-600 hidden sm:block">
                {project.tasks.length} task{project.tasks.length !== 1 ? 's' : ''}
              </span>
              <button
                className="btn-primary text-sm"
                onClick={() => setShowCreateTask(true)}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Task
              </button>
            </div>
          </div>

          {/* Kanban Board */}
          <div className="flex-1 overflow-auto p-4 sm:p-6">
            <KanbanBoard
              tasks={project.tasks}
              projectId={project.id}
              priorityFilter={priorityFilter}
              members={project.members}
              isOwner={isOwner}
            />
          </div>
        </main>
      </div>

      <CreateTaskModal
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        projectId={project.id}
        members={project.members}
      />
    </div>
  );
};
