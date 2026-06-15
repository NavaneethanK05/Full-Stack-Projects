import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Link2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const next = {};
    if (!name.trim()) next.name = 'Name is required';
    if (!email.trim()) next.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email address';
    if (!password) next.password = 'Password is required';
    else if (password.length < 6) next.password = 'Password must be at least 6 characters';
    if (confirmPassword !== password) next.confirmPassword = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await signup(name, email, password);
      toast.success('Account created! Welcome to shrnk.io');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed. Please try again.');
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
          <h1 className="font-display text-2xl font-bold text-text">Create your account</h1>
          <p className="mt-1 text-sm text-text-dim">Start shortening and tracking your links</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="rounded-2xl border border-border bg-surface p-6 space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-text">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className={`w-full rounded-lg border bg-surface-hi px-3 py-2 text-sm text-text placeholder:text-text-dim/50 outline-none transition-colors focus:border-mint ${
                errors.name ? 'border-coral' : 'border-border'
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-coral">{errors.name}</p>}
          </div>

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
              placeholder="At least 6 characters"
              className={`w-full rounded-lg border bg-surface-hi px-3 py-2 text-sm text-text placeholder:text-text-dim/50 outline-none transition-colors focus:border-mint ${
                errors.password ? 'border-coral' : 'border-border'
              }`}
            />
            {errors.password && <p className="mt-1 text-xs text-coral">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-text">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full rounded-lg border bg-surface-hi px-3 py-2 text-sm text-text placeholder:text-text-dim/50 outline-none transition-colors focus:border-mint ${
                errors.confirmPassword ? 'border-coral' : 'border-border'
              }`}
            />
            {errors.confirmPassword && <p className="mt-1 text-xs text-coral">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-mint px-4 py-2.5 text-sm font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-60 cursor-pointer"
          >
            {submitting ? <Loader size={16} /> : (
              <>
                Create account <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-dim">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-mint hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
