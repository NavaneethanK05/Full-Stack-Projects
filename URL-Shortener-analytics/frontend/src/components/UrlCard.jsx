import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, QrCode, BarChart3, Trash2, ExternalLink, Pencil, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const UrlCard = ({ url, onDelete, onShowQr, onEdit }) => {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url.shortUrl);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Could not copy link');
    }
  };

  return (
    <div className="tag-notch rounded-xl border border-border bg-surface p-4 sm:p-5 transition-colors hover:border-mint/30">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: link info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={url.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm font-semibold text-mint hover:underline truncate"
            >
              {url.shortUrl.replace(/^https?:\/\//, '')}
            </a>
            {url.isExpired && (
              <span className="rounded-full bg-coral/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-coral">
                Expired
              </span>
            )}
            {url.isCustomAlias && (
              <span className="rounded-full bg-amber/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber">
                Custom
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-sm text-text-dim" title={url.originalUrl}>
            {url.originalUrl}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-dim">
            <span>Created {formatDate(url.createdAt)}</span>
            {url.expiresAt && (
              <span className="flex items-center gap-1">
                <Clock size={12} /> Expires {formatDate(url.expiresAt)}
              </span>
            )}
          </div>
        </div>

        {/* Middle: click count */}
        <div className="flex sm:flex-col items-center sm:items-end gap-1 sm:w-24 shrink-0">
          <span className="font-display text-2xl font-bold text-text">{url.clickCount}</span>
          <span className="text-xs text-text-dim">total clicks</span>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1.5 shrink-0 border-t border-border pt-3 sm:border-t-0 sm:pt-0 sm:border-l sm:pl-4 sm:ml-1">
          <button
            onClick={handleCopy}
            title="Copy short link"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-dim hover:text-mint hover:border-mint/40 transition-colors cursor-pointer"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
          </button>
          <button
            onClick={() => onShowQr(url)}
            title="QR code"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-dim hover:text-mint hover:border-mint/40 transition-colors cursor-pointer"
          >
            <QrCode size={15} />
          </button>
          <button
            onClick={() => onEdit(url)}
            title="Edit destination"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-dim hover:text-amber hover:border-amber/40 transition-colors cursor-pointer"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => navigate(`/analytics/${url._id}`)}
            title="View analytics"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-dim hover:text-mint hover:border-mint/40 transition-colors cursor-pointer"
          >
            <BarChart3 size={15} />
          </button>
          <a
            href={url.shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Visit link"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-dim hover:text-mint hover:border-mint/40 transition-colors cursor-pointer"
          >
            <ExternalLink size={15} />
          </a>
          <button
            onClick={() => onDelete(url)}
            title="Delete"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-dim hover:text-coral hover:border-coral/40 transition-colors cursor-pointer"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UrlCard;
