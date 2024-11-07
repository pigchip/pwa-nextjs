"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TwitterIcon from '@mui/icons-material/Twitter';

const LiveLocationComponent: React.FC = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('La geolocalización no es compatible con tu navegador');
      return;
    }

    const success = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      setLocation({ latitude, longitude });
      const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
      setShareUrl(url);
    };

    const error = () => {
      setError('No se puede obtener tu ubicación');
    };

    navigator.geolocation.getCurrentPosition(success, error);
  }, []);

  const handleCopyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      alert('¡Enlace copiado al portapapeles!');
    }
  };

  return (
    <div className="p-4">
      {error && <p className="text-red-500">{error}</p>}
      {location ? (
        <div>
          <p>Latitud: {location.latitude}</p>
          <p>Longitud: {location.longitude}</p>
          <p>
            Comparte este enlace: {shareUrl && <Link href={shareUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">{shareUrl}</Link>}
          </p>
          <div className="flex space-x-2 mt-2">
            <button onClick={handleCopyToClipboard} className="bg-[#6ABDA6] text-white px-4 py-2 rounded flex items-center space-x-1 hover:bg-[#5aa58e]">
              <ContentCopyIcon />
              <span>Copiar enlace</span>
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=Mi%20ubicación%20actual%20es%20${encodeURIComponent(shareUrl ?? '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#6ABDA6] text-white px-4 py-2 rounded flex items-center space-x-1 hover:bg-[#5aa58e]"
            >
              <TwitterIcon />
              <span>Compartir en Twitter</span>
            </a>
          </div>
        </div>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
};

export default LiveLocationComponent;