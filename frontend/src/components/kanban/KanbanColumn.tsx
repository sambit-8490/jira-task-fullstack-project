import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskStatus, ProjectMember } from '../../types/api';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  accentClass: string;
  projectId: string;
  members: ProjectMember[];
  isOwner: boolean;
}

export const KanbanColumn = ({
  id,
  title,
  tasks,
  accentClass,
  projectId,
  members,
  isOwner,
}: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex flex-col min-w-[280px] flex-1">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={`w-2 h-2 rounded-full ${accentClass}`} />
        <h3 className="text-sm font-semibold text-slate-300">{title}</h3>
        <span className="ml-auto text-xs text-slate-600 bg-slate-800 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 rounded-xl p-2 min-h-[200px] transition-colors ${
          isOver ? 'bg-slate-800/80 ring-1 ring-primary-500/50' : 'bg-slate-900/50'
        }`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                projectId={projectId}
                members={members}
                isOwner={isOwner}
              />
            ))}
          </div>
        </SortableContext>

        {tasks.length === 0 && (
          <div className="h-20 flex items-center justify-center">
            <p className="text-xs text-slate-700">Drop tasks here</p>
          </div>
        )}
      </div>
    </div>
  );
};
