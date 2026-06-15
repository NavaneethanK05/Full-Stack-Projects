import { Link, useNavigate } from 'react-router-dom';
import { Link2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-border bg-surface/60 backdrop-blur-sm sticky top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-4">
        <Link to={user ? '/dashboard' : '/login'} className="flex items-center gap-2 group">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-mint/10 text-mint group-hover:bg-mint/20 transition-colors">
            <Link2 size={18} strokeWidth={2.5} />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-text">
            shrnk<span className="text-mint">.</span>io
          </span>
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-text-dim">
              Signed in as <span className="text-text font-medium">{user.name}</span>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-dim hover:text-coral hover:border-coral/40 transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
