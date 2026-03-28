import { format } from 'date-fns';
import { RoleBadge } from '../ui/Badge';
import { ProjectSummary } from '../../types/api';

interface ProjectCardProps {
  project: ProjectSummary;
  onClick: () => void;
}

export const ProjectCard = ({ project, onClick }: ProjectCardProps) => (
  <button
    className="card text-left hover:border-slate-600 hover:bg-slate-800/50 transition-all cursor-pointer group w-full"
    onClick={onClick}
  >
    <div className="flex items-start justify-between mb-2">
      <h3 className="font-semibold text-slate-100 group-hover:text-primary-400 transition-colors line-clamp-1">
        {project.name}
      </h3>
      <RoleBadge role={project.role} />
    </div>

    {project.description && (
      <p className="text-sm text-slate-500 line-clamp-2 mb-4">{project.description}</p>
    )}

    <div className="flex items-center gap-4 mt-auto pt-3 border-t border-slate-800">
      <span className="text-xs text-slate-500 flex items-center gap-1">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {project.memberCount}
      </span>
      <span className="text-xs text-slate-500 flex items-center gap-1">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        {project.taskCount} tasks
      </span>
      <span className="text-xs text-slate-600 ml-auto">
        {format(new Date(project.createdAt), 'MMM d, yyyy')}
      </span>
    </div>
  </button>
);
