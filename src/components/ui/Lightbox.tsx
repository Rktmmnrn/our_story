import React, { useEffect, useCallback } from 'react';

interface LightboxProps {
  src: string | null;
  mediaType?: 'photo' | 'video';
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export default function Lightbox({ src, mediaType = 'photo', onClose, onPrev, onNext, hasPrev, hasNext }: LightboxProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft' && hasPrev && onPrev) onPrev();
    if (e.key === 'ArrowRight' && hasNext && onNext) onNext();
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!src) return null;

  return (
    <div className="lightbox" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose}>✕</button>

      {/* Bouton précédent */}
      {hasPrev && onPrev && (
        <button
          className="lightbox-nav lightbox-prev"
          onClick={e => { e.stopPropagation(); onPrev(); }}
          title="Image précédente (←)"
        >
          ‹
        </button>
      )}

      {/* Media */}
      {mediaType === 'video' ? (
        <AuthVideoLightbox src={src} />
      ) : (
        <AuthImageLightbox src={src} onClose={onClose} />
      )}

      {/* Bouton suivant */}
      {hasNext && onNext && (
        <button
          className="lightbox-nav lightbox-next"
          onClick={e => { e.stopPropagation(); onNext(); }}
          title="Image suivante (→)"
        >
          ›
        </button>
      )}
    </div>
  );
}

function AuthImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  const [blobUrl, setBlobUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    setBlobUrl(null); // reset à chaque changement de src
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

function AuthVideoLightbox({ src }: { src: string }) {
  const [blobUrl, setBlobUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    setBlobUrl(null);
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