import { useNavigate, Link } from 'react-router-dom';
import { useLogout, useCurrentUser } from '../../hooks/useAuth';
import { Spinner } from '../ui/Spinner';

interface NavbarProps {
  /** If provided, renders a back arrow that navigates to this path */
  backTo?: string;
  /** Title shown in the center/left of the navbar */
  title?: string;
  /** Subtitle shown below the title */
  subtitle?: string;
  /** Extra content rendered on the right side (before the user/logout) */
  rightContent?: React.ReactNode;
}

export const Navbar = ({ backTo, title, subtitle, rightContent }: NavbarProps) => {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const { mutate: logout, isPending: loggingOut } = useLogout();

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 h-16">
          {backTo ? (
            <button onClick={() => navigate(backTo)} className="btn-ghost p-2 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="font-semibold text-slate-100 hidden sm:block">PMA</span>
            </Link>
          )}

          {(title || subtitle) && (
            <div className="flex-1 min-w-0">
              {title && (
                <p className="text-base font-semibold text-slate-100 truncate">{title}</p>
              )}
              {subtitle && (
                <p className="text-xs text-slate-500 truncate">{subtitle}</p>
              )}
            </div>
          )}

          {!title && <div className="flex-1" />}

          <div className="flex items-center gap-3 flex-shrink-0">
            {rightContent}
            <span className="text-sm text-slate-400 hidden md:block">{user?.name}</span>
            <button
              className="btn-ghost text-sm"
              onClick={() => logout()}
              disabled={loggingOut}
            >
              {loggingOut ? <Spinner size="sm" /> : 'Sign out'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
