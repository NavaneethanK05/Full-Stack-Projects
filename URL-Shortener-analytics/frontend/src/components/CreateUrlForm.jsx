import { useState } from 'react';
import { Settings2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from './Loader';
import api from '../api/axios';

const CreateUrlForm = ({ onCreated }) => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!originalUrl.trim()) {
      setError('Please enter a URL to shorten');
      return;
    }

    try {
      const parsed = new URL(originalUrl);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error();
      }
    } catch {
      setError('Enter a valid URL, including http:// or https://');
      return;
    }

    setSubmitting(true);
    try {
      const payload = { originalUrl };
      if (customAlias.trim()) payload.customAlias = customAlias.trim();
      if (expiresAt) payload.expiresAt = new Date(expiresAt).toISOString();

      const { data } = await api.post('/urls', payload);
      toast.success('Short link created!');
      onCreated(data);
      setOriginalUrl('');
      setCustomAlias('');
      setExpiresAt('');
      setShowOptions(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create short link');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          placeholder="Paste a long URL — https://example.com/very/long/path"
          className="flex-1 rounded-lg border border-border bg-surface-hi px-3.5 py-2.5 text-sm text-text placeholder:text-text-dim/50 outline-none focus:border-mint"
        />
        <button
          type="button"
          onClick={() => setShowOptions((v) => !v)}
          title="More options"
          className={`flex items-center justify-center gap-1.5 rounded-lg border px-3.5 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
            showOptions ? 'border-mint/40 text-mint bg-mint/5' : 'border-border text-text-dim hover:text-text'
          }`}
        >
          <Settings2 size={15} />
          <span className="hidden sm:inline">Options</span>
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center justify-center gap-2 rounded-lg bg-mint px-5 py-2.5 text-sm font-semibold text-ink hover:opacity-90 disabled:opacity-60 transition-opacity cursor-pointer"
        >
          {submitting ? <Loader size={16} /> : <>Shorten <ArrowRight size={15} /></>}
        </button>
      </div>

      {showOptions && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-border pt-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-dim">
              Custom alias (optional)
            </label>
            <input
              type="text"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value)}
              placeholder="e.g. my-resume"
              className="w-full rounded-lg border border-border bg-surface-hi px-3 py-2 text-sm font-mono text-text placeholder:text-text-dim/50 outline-none focus:border-mint"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-dim">
              Expiry date (optional)
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-hi px-3 py-2 text-sm text-text outline-none focus:border-mint [color-scheme:dark]"
            />
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-coral">{error}</p>}
    </form>
  );
};

export default CreateUrlForm;
