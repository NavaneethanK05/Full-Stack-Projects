import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from './Modal';
import Loader from './Loader';
import api from '../api/axios';

const EditUrlModal = ({ url, onClose, onUpdated }) => {
  const [originalUrl, setOriginalUrl] = useState(url.originalUrl);
  const [expiresAt, setExpiresAt] = useState(
    url.expiresAt ? new Date(url.expiresAt).toISOString().slice(0, 16) : ''
  );
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      new URL(originalUrl);
    } catch {
      setError('Please enter a valid URL including http:// or https://');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.put(`/urls/${url._id}`, {
        originalUrl,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      });
      toast.success('Link updated');
      onUpdated(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update link');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Edit destination" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text">Destination URL</label>
          <input
            type="text"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-hi px-3 py-2 text-sm text-text outline-none focus:border-mint"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text">
            Expiry date <span className="text-text-dim">(optional)</span>
          </label>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-hi px-3 py-2 text-sm text-text outline-none focus:border-mint [color-scheme:dark]"
          />
        </div>
        {error && <p className="text-xs text-coral">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-mint px-4 py-2.5 text-sm font-semibold text-ink hover:opacity-90 disabled:opacity-60 transition-opacity cursor-pointer"
        >
          {submitting ? <Loader size={16} /> : 'Save changes'}
        </button>
      </form>
    </Modal>
  );
};

export default EditUrlModal;
