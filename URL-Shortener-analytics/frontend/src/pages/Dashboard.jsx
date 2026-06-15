import { useState, useEffect, useRef } from 'react';
import { Inbox, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import CreateUrlForm from '../components/CreateUrlForm';
import UrlCard from '../components/UrlCard';
import QrModal from '../components/QrModal';
import EditUrlModal from '../components/EditUrlModal';
import Modal from '../components/Modal';
import Loader from '../components/Loader';

const Dashboard = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [qrUrl, setQrUrl] = useState(null);
  const [editUrl, setEditUrl] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchUrls = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { data } = await api.get('/urls');
      setUrls(data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Could not load your links. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleCreated = (newUrl) => {
    setUrls((prev) => [newUrl, ...prev]);
  };

  const handleUpdated = (updated) => {
    setUrls((prev) => prev.map((u) => (u._id === updated._id ? { ...u, ...updated } : u)));
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/urls/${deleteTarget._id}`);
      setUrls((prev) => prev.filter((u) => u._id !== deleteTarget._id));
      toast.success('Link deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete link');
    } finally {
      setDeleting(false);
    }
  };

  const handleCsvUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkUploading(true);
    try {
      const text = await file.text();
      const urlList = text
        .split(/\r?\n/)
        .map((line) => line.split(',')[0].trim())
        .filter((line) => line && line.toLowerCase() !== 'url' && line.toLowerCase() !== 'originalurl');

      if (urlList.length === 0) {
        toast.error('No URLs found in that file');
        return;
      }

      const { data } = await api.post('/urls/bulk', { urls: urlList });
      const successCount = data.results.filter((r) => r.status === 'success').length;
      const failCount = data.results.length - successCount;

      toast.success(`Created ${successCount} short link${successCount === 1 ? '' : 's'}${failCount ? `, ${failCount} failed` : ''}`);
      fetchUrls();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk upload failed');
    } finally {
      setBulkUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-text">Your links</h1>
          <p className="mt-1 text-sm text-text-dim">Create, manage and track every short link in one place.</p>
        </div>

        <div>
          <input
            type="file"
            accept=".csv,.txt"
            ref={fileInputRef}
            onChange={handleCsvUpload}
            className="hidden"
            id="csv-upload"
          />
          <label
            htmlFor="csv-upload"
            className="flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-text-dim hover:text-text hover:border-mint/40 transition-colors cursor-pointer"
          >
            {bulkUploading ? <Loader size={15} /> : <Upload size={15} />}
            Bulk upload (CSV)
          </label>
        </div>
      </div>

      <CreateUrlForm onCreated={handleCreated} />

      <div className="mt-6 space-y-3">
        {loading && (
          <div className="flex justify-center py-16">
            <Loader size={28} />
          </div>
        )}

        {!loading && errorMsg && (
          <div className="rounded-xl border border-coral/30 bg-coral/5 p-6 text-center">
            <p className="text-sm text-coral">{errorMsg}</p>
            <button
              onClick={fetchUrls}
              className="mt-3 rounded-lg border border-coral/40 px-4 py-1.5 text-sm font-medium text-coral hover:bg-coral/10 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !errorMsg && urls.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-hi text-text-dim">
              <Inbox size={22} />
            </span>
            <p className="font-medium text-text">No short links yet</p>
            <p className="mt-1 text-sm text-text-dim">Paste a long URL above to create your first one.</p>
          </div>
        )}

        {!loading && !errorMsg && urls.map((url) => (
          <UrlCard
            key={url._id}
            url={url}
            onShowQr={setQrUrl}
            onEdit={setEditUrl}
            onDelete={setDeleteTarget}
          />
        ))}
      </div>

      {qrUrl && <QrModal url={qrUrl} onClose={() => setQrUrl(null)} />}
      {editUrl && (
        <EditUrlModal url={editUrl} onClose={() => setEditUrl(null)} onUpdated={handleUpdated} />
      )}
      {deleteTarget && (
        <Modal title="Delete short link?" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-text-dim">
            This will permanently delete{' '}
            <span className="font-mono text-text">{deleteTarget.shortUrl.replace(/^https?:\/\//, '')}</span> and
            all of its analytics. This can't be undone.
          </p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setDeleteTarget(null)}
              className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text hover:bg-surface-hi transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleting}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-coral px-4 py-2 text-sm font-semibold text-ink hover:opacity-90 disabled:opacity-60 transition-opacity cursor-pointer"
            >
              {deleting ? <Loader size={15} /> : 'Delete'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;
