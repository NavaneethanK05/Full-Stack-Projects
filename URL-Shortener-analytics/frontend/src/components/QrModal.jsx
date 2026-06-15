import { QRCodeCanvas } from 'qrcode.react';
import { Download } from 'lucide-react';
import Modal from './Modal';

const QrModal = ({ url, onClose }) => {
  const handleDownload = () => {
    const canvas = document.getElementById('qr-canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${url.shortCode}-qrcode.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <Modal title="QR code" onClose={onClose}>
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-xl bg-white p-4">
          <QRCodeCanvas id="qr-canvas" value={url.shortUrl} size={200} />
        </div>
        <p className="font-mono text-sm text-mint break-all text-center">{url.shortUrl}</p>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 rounded-lg bg-mint px-4 py-2 text-sm font-semibold text-ink hover:opacity-90 transition-opacity cursor-pointer"
        >
          <Download size={15} /> Download PNG
        </button>
      </div>
    </Modal>
  );
};

export default QrModal;
