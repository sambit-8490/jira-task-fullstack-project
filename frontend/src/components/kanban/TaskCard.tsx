import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { Task, ProjectMember } from '../../types/api';
import { PriorityBadge } from '../ui/Badge';
import { EditTaskModal } from '../tasks/EditTaskModal';

interface TaskCardProps {
  task: Task;
  projectId: string;
  members: ProjectMember[];
  isOwner: boolean;
}

export const TaskCard = ({ task, projectId, members, isOwner }: TaskCardProps) => {
  const [showEdit, setShowEdit] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`bg-slate-800 border border-slate-700 rounded-lg p-3 select-none hover:border-slate-600 transition-colors group ${isDragging ? 'shadow-2xl' : ''}`}
      >
        {/* Drag handle + title row */}
        <div className="flex items-start gap-2">
          <div
            {...attributes}
            {...listeners}
            className="mt-0.5 cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 flex-shrink-0"
            title="Drag to move"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
              <circle cx="5" cy="4" r="1.2" />
              <circle cx="11" cy="4" r="1.2" />
              <circle cx="5" cy="8" r="1.2" />
              <circle cx="11" cy="8" r="1.2" />
              <circle cx="5" cy="12" r="1.2" />
              <circle cx="11" cy="12" r="1.2" />
            </svg>
          </div>

          <button
            className="text-sm font-medium text-slate-100 text-left line-clamp-2 flex-1 hover:text-primary-400 transition-colors"
            onClick={() => setShowEdit(true)}
          >
            {task.title}
          </button>

          <button
            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-300 flex-shrink-0 p-0.5 transition-opacity"
            onClick={() => setShowEdit(true)}
            title="Edit task"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>

        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
          <PriorityBadge priority={task.priority} />
        </div>

        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
          <span>
            {task.assignee ? (
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 bg-primary-700 rounded-full inline-flex items-center justify-center text-[9px] text-white font-bold">
                  {task.assignee.name[0]?.toUpperCase()}
                </span>
                {task.assignee.name}
              </span>
            ) : (
              <span className="text-slate-600">Unassigned</span>
            )}
          </span>
          {task.dueDate && (
            <span className="text-slate-600">
              {format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}
        </div>
      </div>

      <EditTaskModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        task={task}
        projectId={projectId}
        members={members}
        isOwner={isOwner}
      />
    </>
  );
};

export const TaskCardOverlay = ({ task }: { task: Task }) => (
  <div className="bg-slate-800 border border-primary-500 rounded-lg p-3 shadow-2xl rotate-2 opacity-90">
    <p className="text-sm font-medium text-slate-100">{task.title}</p>
    <div className="mt-1.5">
      <PriorityBadge priority={task.priority} />
    </div>
  </div>
);
