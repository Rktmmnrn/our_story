import React, { useEffect } from 'react';
import { useAuthAudio } from './AuthenticatedMedia';

interface LightboxProps {
  src: string | null;
  mediaType?: 'photo' | 'video';
  onClose: () => void;
}

export default function Lightbox({ src, mediaType = 'photo', onClose }: LightboxProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!src) return null;

  return (
    <div className="lightbox" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose}>✕</button>
      {mediaType === 'video' ? (
        <AuthVideoLightbox src={src} />
      ) : (
        <AuthImageLightbox src={src} onClose={onClose} />
      )}
    </div>
  );
}

// ── Image en lightbox avec fetch authentifié ──────────────────────────────────
function AuthImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  const [blobUrl, setBlobUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const token = localStorage.getItem('access_token');
    let objectUrl: string | null = null;

    fetch(src, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.blob())
      .then(blob => {
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      })
      .catch(() => {});

    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [src]);

  if (!blobUrl) {
    return (
      <div style={{ color: 'white', fontSize: 14, opacity: 0.6 }}>
        Chargement...
      </div>
    );
  }

  return (
    <img
      src={blobUrl}
      alt=""
      onClick={e => e.stopPropagation()}
    />
  );
}

// ── Vidéo en lightbox avec fetch authentifié ──────────────────────────────────
function AuthVideoLightbox({ src }: { src: string }) {
  const [blobUrl, setBlobUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const token = localStorage.getItem('access_token');
    let objectUrl: string | null = null;

    fetch(src, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.blob())
      .then(blob => {
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      })
      .catch(() => {});

    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [src]);

  if (!blobUrl) {
    return (
      <div style={{ color: 'white', fontSize: 14, opacity: 0.6 }}>
        Chargement de la vidéo...
      </div>
    );
  }

  return (
    <video
      src={blobUrl}
      controls
      autoPlay
      style={{ maxWidth: '88vw', maxHeight: '88vh' }}
      onClick={e => e.stopPropagation()}
    />
  );
}