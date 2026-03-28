import { FormEvent, useState } from 'react';
import { useAddMember, useRemoveMember } from '../../hooks/useProjects';
import { Spinner } from '../ui/Spinner';
import { RoleBadge } from '../ui/Badge';
import { ProjectMember } from '../../types/api';

interface MembersSidebarProps {
  projectId: string;
  members: ProjectMember[];
  isOwner: boolean;
  currentUserId: string;
}

export const MembersSidebar = ({
  projectId,
  members,
  isOwner,
  currentUserId,
}: MembersSidebarProps) => {
  const [email, setEmail] = useState('');
  const { mutate: addMember, isPending: adding } = useAddMember(projectId);
  const { mutate: removeMember } = useRemoveMember(projectId);

  const handleAddMember = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    addMember(email, { onSuccess: () => setEmail('') });
  };

  return (
    <div className="p-4 space-y-5">
      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Members ({members.length})
        </h3>

        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-2 group">
              <div className="w-7 h-7 bg-primary-800 rounded-full flex items-center justify-center text-xs font-bold text-primary-200 flex-shrink-0">
                {m.user.name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm text-slate-300 truncate">{m.user.name}</p>
                  <RoleBadge role={m.role} />
                </div>
                <p className="text-xs text-slate-600 truncate">{m.user.email}</p>
              </div>
              {isOwner && m.userId !== currentUserId && (
                <button
                  onClick={() => removeMember(m.userId)}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-0.5 transition-opacity"
                  title="Remove member"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        {isOwner && (
          <form onSubmit={handleAddMember} className="mt-3 flex gap-2">
            <input
              type="email"
              className="input text-xs py-1.5 flex-1"
              placeholder="Add by email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="submit"
              className="btn-primary py-1.5 px-2 text-xs"
              disabled={adding}
            >
              {adding ? <Spinner size="sm" /> : 'Add'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
