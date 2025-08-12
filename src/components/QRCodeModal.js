// client/src/components/QRCodeModal.js
"use client";

import { QRCodeCanvas } from 'qrcode.react'; // <-- CORRECTION 1 : Import nommé

export default function QRCodeModal({ url, onClose }) {
  if (!url) return null;

  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-code-canvas');
    if (canvas) {
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      let downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = 'menu-qrcode.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl text-center max-w-sm mx-4">
        <h2 className="text-2xl font-bold mb-4">Scannez pour voir le menu !</h2>
        
        <div className="p-4 border-2 border-gray-300 inline-block">
          {/* CORRECTION 2 : Utiliser le bon nom de composant */}
          <QRCodeCanvas
            id="qr-code-canvas"
            value={url}
            size={256}
            level={"H"}
            includeMargin={true}
          />
        </div>

        <p className="text-gray-600 mt-4 break-all text-xs">URL: {url}</p>

        <div className="mt-6 space-y-2 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <button
            onClick={downloadQRCode}
            className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            Télécharger
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mt-2 sm:mt-0"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}