import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Link2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const next = {};
    if (!email.trim()) next.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email address';
    if (!password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-mint/10 text-mint">
            <Link2 size={24} strokeWidth={2.5} />
          </span>
          <h1 className="font-display text-2xl font-bold text-text">Welcome back</h1>
          <p className="mt-1 text-sm text-text-dim">Log in to manage your short links</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="rounded-2xl border border-border bg-surface p-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={`w-full rounded-lg border bg-surface-hi px-3 py-2 text-sm text-text placeholder:text-text-dim/50 outline-none transition-colors focus:border-mint ${
                errors.email ? 'border-coral' : 'border-border'
              }`}
            />
            {errors.email && <p className="mt-1 text-xs text-coral">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-text">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full rounded-lg border bg-surface-hi px-3 py-2 text-sm text-text placeholder:text-text-dim/50 outline-none transition-colors focus:border-mint ${
                errors.password ? 'border-coral' : 'border-border'
              }`}
            />
            {errors.password && <p className="mt-1 text-xs text-coral">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-mint px-4 py-2.5 text-sm font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-60 cursor-pointer"
          >
            {submitting ? <Loader size={16} /> : (
              <>
                Log in <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-dim">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-mint hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
