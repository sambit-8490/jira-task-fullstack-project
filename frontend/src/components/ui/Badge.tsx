import { Priority, TaskStatus, MemberRole } from '../../types/api';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
}

const variantClasses = {
  default: 'bg-slate-700 text-slate-300',
  success: 'bg-emerald-500/20 text-emerald-400',
  warning: 'bg-amber-500/20 text-amber-400',
  danger: 'bg-red-500/20 text-red-400',
  info: 'bg-blue-500/20 text-blue-400',
  purple: 'bg-violet-500/20 text-violet-400',
};

export const Badge = ({ children, variant = 'default' }: BadgeProps) => (
  <span className={`badge ${variantClasses[variant]}`}>{children}</span>
);

export const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const map: Record<Priority, { label: string; variant: BadgeProps['variant'] }> = {
    low: { label: 'Low', variant: 'success' },
    medium: { label: 'Medium', variant: 'warning' },
    high: { label: 'High', variant: 'danger' },
  };
  const { label, variant } = map[priority];
  return <Badge variant={variant}>{label}</Badge>;
};

export const StatusBadge = ({ status }: { status: TaskStatus }) => {
  const map: Record<TaskStatus, { label: string; variant: BadgeProps['variant'] }> = {
    todo: { label: 'To Do', variant: 'default' },
    in_progress: { label: 'In Progress', variant: 'info' },
    done: { label: 'Done', variant: 'success' },
  };
  const { label, variant } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
};

export const RoleBadge = ({ role }: { role: MemberRole }) => (
  <Badge variant={role === 'owner' ? 'purple' : 'info'}>
    {role === 'owner' ? 'Owner' : 'Member'}
  </Badge>
);
