import { Link } from 'react-router-dom';
import { Link2 } from 'lucide-react';

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
    <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-mint/10 text-mint">
      <Link2 size={24} strokeWidth={2.5} />
    </span>
    <h1 className="font-display text-3xl font-bold text-text">404</h1>
    <p className="mt-2 text-sm text-text-dim">This page doesn't exist.</p>
    <Link to="/dashboard" className="mt-4 text-sm font-medium text-mint hover:underline">
      Back to dashboard
    </Link>
  </div>
);

export default NotFound;
