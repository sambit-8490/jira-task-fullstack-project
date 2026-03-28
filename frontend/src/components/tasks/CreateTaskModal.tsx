import { useState, FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';
import { useCreateTask } from '../../hooks/useTasks';
import { ProjectMember, Priority, TaskStatus } from '../../types/api';


interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  members: ProjectMember[];
}

export const CreateTaskModal = ({ isOpen, onClose, projectId, members }: CreateTaskModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const { mutate: createTask, isPending } = useCreateTask(projectId);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    createTask(
      {
        projectId,
        title,
        description: description || undefined,
        priority,
        status,
        assignedTo: assignedTo || undefined,
        dueDate: dueDate || undefined,
      },
      {
        onSuccess: () => {
          setTitle('');
          setDescription('');
          setPriority('medium');
          setStatus('todo');
          setAssignedTo('');
          setDueDate('');
          onClose();
        },
      },
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Title *</label>
          <input
            type="text"
            className="input"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="Optional description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Priority</label>
            <select
              className="input"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">Assignee</label>
          <select
            className="input"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.user.id} value={m.user.id}>
                {m.user.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Due date</label>
          <input
            type="date"
            className="input"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" className="btn-primary flex-1" disabled={isPending}>
            {isPending ? <><Spinner size="sm" /> Adding...</> : 'Add Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
