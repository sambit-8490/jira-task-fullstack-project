import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Task, TaskStatus, Priority, ProjectMember } from '../../types/api';
import { KanbanColumn } from './KanbanColumn';
import { TaskCardOverlay } from './TaskCard';
import { useUpdateTask } from '../../hooks/useTasks';

interface KanbanBoardProps {
  tasks: Task[];
  projectId: string;
  priorityFilter: Priority | 'all';
  members: ProjectMember[];
  isOwner: boolean;
}

const COLUMNS: { id: TaskStatus; title: string; accentClass: string }[] = [
  { id: 'todo', title: 'To Do', accentClass: 'bg-slate-500' },
  { id: 'in_progress', title: 'In Progress', accentClass: 'bg-blue-500' },
  { id: 'done', title: 'Done', accentClass: 'bg-emerald-500' },
];

export const KanbanBoard = ({
  tasks,
  projectId,
  priorityFilter,
  members,
  isOwner,
}: KanbanBoardProps) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const { mutate: updateTask } = useUpdateTask(projectId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const filteredTasks =
    priorityFilter === 'all' ? tasks : tasks.filter((t) => t.priority === priorityFilter);

  const getColumnTasks = (status: TaskStatus) =>
    filteredTasks.filter((t) => t.status === status);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    const targetColumn = COLUMNS.find((c) => c.id === overId);
    const targetTask = tasks.find((t) => t.id === overId);
    const newStatus: TaskStatus | undefined = targetColumn?.id ?? targetTask?.status;

    if (!newStatus) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    updateTask({ id: taskId, input: { status: newStatus } });
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            tasks={getColumnTasks(col.id)}
            accentClass={col.accentClass}
            projectId={projectId}
            members={members}
            isOwner={isOwner}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCardOverlay task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
};
