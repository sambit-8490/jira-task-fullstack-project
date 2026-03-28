import { useState, FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';
import { useCreateProject } from '../../hooks/useProjects';


interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateProjectModal = ({ isOpen, onClose }: CreateProjectModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { mutate: createProject, isPending } = useCreateProject();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    createProject(
      { name, description: description || undefined },
      {
        onSuccess: () => {
          setName('');
          setDescription('');
          onClose();
        },
      },
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="project-name">Project name *</label>
          <input
            id="project-name"
            type="text"
            className="input"
            placeholder="My awesome project"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="project-desc">Description</label>
          <textarea
            id="project-desc"
            className="input resize-none"
            rows={3}
            placeholder="What is this project about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" className="btn-primary flex-1" disabled={isPending}>
            {isPending ? <><Spinner size="sm" /> Creating...</> : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
