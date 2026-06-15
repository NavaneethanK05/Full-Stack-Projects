import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MousePointerClick, Clock, Globe, Copy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';
import api from '../api/axios';
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

const formatShortDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
};

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border border-border bg-surface p-4">
    <div className="flex items-center gap-2 text-text-dim">
      <Icon size={15} />
      <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
    </div>
    <p className="mt-2 font-display text-2xl font-bold text-text break-words">{value}</p>
  </div>
);

const Analytics = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const { data: res } = await api.get(`/urls/${id}/analytics`);
        setData(res);
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'Could not load analytics for this link.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [id]);

  const handleCopy = async () => {
    if (!data) return;
    await navigator.clipboard.writeText(data.shortUrl);
    toast.success('Copied to clipboard');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader size={28} />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-sm text-coral">{errorMsg}</p>
        <Link to="/dashboard" className="mt-4 inline-block text-sm text-mint hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  const chartData = data.dailyTrend.map((d) => ({
    date: formatShortDate(d._id),
    clicks: d.count,
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <Link to="/dashboard" className="mb-4 inline-flex items-center gap-1.5 text-sm text-text-dim hover:text-text transition-colors">
        <ArrowLeft size={15} /> Back to dashboard
      </Link>

      <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
        <p className="text-xs uppercase tracking-wide text-text-dim mb-1">Short link</p>
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={data.shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-lg font-semibold text-mint hover:underline break-all"
          >
            {data.shortUrl.replace(/^https?:\/\//, '')}
          </a>
          <button
            onClick={handleCopy}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-dim hover:text-mint hover:border-mint/40 transition-colors cursor-pointer"
          >
            <Copy size={14} />
          </button>
        </div>
        <p className="mt-2 text-sm text-text-dim break-all">→ {data.originalUrl}</p>
      </div>

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard icon={MousePointerClick} label="Total clicks" value={data.totalClicks} />
        <StatCard icon={Clock} label="Last visited" value={formatDateTime(data.lastVisitedAt)} />
        <StatCard icon={Globe} label="Created" value={formatDateTime(data.createdAt)} />
      </div>

      <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
        <h2 className="mb-4 font-display text-lg font-bold text-text">Clicks — last 14 days</h2>
        {chartData.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-dim">No click activity yet in this period.</p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2C313C" vertical={false} />
                <XAxis dataKey="date" stroke="#9AA1AE" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9AA1AE" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#1A1D24', border: '1px solid #2C313C', borderRadius: '8px', fontSize: '13px' }}
                  labelStyle={{ color: '#E7E9EE' }}
                  cursor={{ fill: 'rgba(110, 231, 183, 0.06)' }}
                />
                <Bar dataKey="clicks" fill="#6EE7B7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="mb-4 font-display text-lg font-bold text-text">Recent visits</h2>
        {data.recentVisits.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-dim">No visits recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-text-dim">
                  <th className="py-2 pr-4 font-medium">Time</th>
                  <th className="py-2 pr-4 font-medium">Referrer</th>
                  <th className="py-2 font-medium">User agent</th>
                </tr>
              </thead>
              <tbody>
                {data.recentVisits.map((visit, idx) => (
                  <tr key={idx} className="border-b border-border/50 last:border-0">
                    <td className="py-2 pr-4 whitespace-nowrap text-text">{formatDateTime(visit.timestamp)}</td>
                    <td className="py-2 pr-4 text-text-dim truncate max-w-[160px]">{visit.referrer || 'Direct'}</td>
                    <td className="py-2 text-text-dim truncate max-w-xs">{visit.userAgent || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
