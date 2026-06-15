import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Link2, MousePointerClick, Clock, Calendar } from 'lucide-react';
import api, { API_BASE_URL } from '../api/axios';
import Loader from '../components/Loader';

const formatDateTime = (dateStr) => {
  if (!dateStr) return 'Never';
  return new Date(dateStr).toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const PublicStats = () => {
  const { shortCode } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: res } = await api.get(`/public/${shortCode}`);
        setData(res);
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'This short link could not be found.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [shortCode]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-mint/10 text-mint">
            <Link2 size={24} strokeWidth={2.5} />
          </span>
          <h1 className="font-display text-xl font-bold text-text">Public link stats</h1>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          {loading && (
            <div className="flex justify-center py-6">
              <Loader size={24} />
            </div>
          )}

          {!loading && errorMsg && (
            <p className="text-center text-sm text-coral">{errorMsg}</p>
          )}

          {!loading && data && (
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-text-dim mb-1">Short link</p>
                <p className="font-mono text-mint font-semibold break-all">
                  {data.shortUrl.replace(/^https?:\/\//, '')}
                </p>
                {data.isExpired && (
                  <span className="mt-2 inline-block rounded-full bg-coral/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-coral">
                    Expired
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-text-dim">
                    <MousePointerClick size={15} /> Total clicks
                  </span>
                  <span className="font-display text-lg font-bold text-text">{data.totalClicks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-text-dim">
                    <Clock size={15} /> Last visited
                  </span>
                  <span className="text-sm text-text">{formatDateTime(data.lastVisitedAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-text-dim">
                    <Calendar size={15} /> Created
                  </span>
                  <span className="text-sm text-text">{formatDateTime(data.createdAt)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-text-dim">
          <Link to="/login" className="text-mint hover:underline">
            Go to shrnk.io
          </Link>
        </p>
      </div>
    </div>
  );
};

export default PublicStats;
