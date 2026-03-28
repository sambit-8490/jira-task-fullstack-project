import { useState, FormEvent, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';
import { useUpdateTask, useDeleteTask } from '../../hooks/useTasks';
import { Task, ProjectMember, Priority, TaskStatus } from '../../types/api';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  projectId: string;
  members: ProjectMember[];
  isOwner: boolean;
}

export const EditTaskModal = ({
  isOpen,
  onClose,
  task,
  projectId,
  members,
  isOwner,
}: EditTaskModalProps) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [assignedTo, setAssignedTo] = useState(task.assignedTo ?? '');
  const [dueDate, setDueDate] = useState(
    task.dueDate ? task.dueDate.split('T')[0] : '',
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { mutate: updateTask, isPending: updating } = useUpdateTask(projectId);
  const { mutate: deleteTask, isPending: deleting } = useDeleteTask(projectId);

  // Sync form when task prop changes (e.g. after drag updates status)
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description ?? '');
    setPriority(task.priority);
    setStatus(task.status);
    setAssignedTo(task.assignedTo ?? '');
    setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
  }, [task]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateTask(
      {
        id: task.id,
        input: {
          title,
          description: description || null,
          priority,
          status,
          assignedTo: assignedTo || null,
          dueDate: dueDate || null,
        },
      },
      { onSuccess: onClose },
    );
  };

  const handleDelete = () => {
    deleteTask(task.id, { onSuccess: onClose });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Task">
      {!showDeleteConfirm ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input
              type="text"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input resize-none"
              rows={3}
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

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            {isOwner ? (
              <button
                type="button"
                className="btn-danger text-sm"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Task
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={updating}>
                {updating ? <><Spinner size="sm" /> Saving…</> : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-sm text-red-300 font-medium mb-1">Delete task?</p>
            <p className="text-sm text-slate-400">
              "<span className="text-slate-300">{task.title}</span>" will be permanently removed.
              This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              className="btn-secondary flex-1"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </button>
            <button
              className="btn-danger flex-1"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? <><Spinner size="sm" /> Deleting…</> : 'Yes, Delete'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
