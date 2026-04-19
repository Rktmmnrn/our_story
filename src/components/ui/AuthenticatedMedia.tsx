import React, { useEffect, useState, useRef } from 'react';

interface AuthMediaProps {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

function getToken(): string | null {
  return localStorage.getItem('access_token');
}

async function fetchBlob(url: string): Promise<string | null> {
  const token = getToken();
  try {
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

// ── Image authentifiée ────────────────────────────────────────────────────────
export function AuthImage({ src, alt, className, style, onClick }: AuthMediaProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const prevUrl = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    fetchBlob(src).then(url => {
      if (cancelled) {
        if (url) URL.revokeObjectURL(url);
        return;
      }
      if (url) {
        // Révoquer l'ancienne URL blob
        if (prevUrl.current) URL.revokeObjectURL(prevUrl.current);
        prevUrl.current = url;
        setBlobUrl(url);
      } else {
        setError(true);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [src]);

  // Cleanup à la destruction
  useEffect(() => {
    return () => {
      if (prevUrl.current) URL.revokeObjectURL(prevUrl.current);
    };
  }, []);

  if (loading) {
    return (
      <div
        className={className}
        style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--or-light)',
        }}
      >
        <div style={{ opacity: 0.4, fontSize: 24 }}>♡</div>
      </div>
    );
  }

  if (error || !blobUrl) {
    return (
      <div
        className={className}
        style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--or-light)',
          cursor: onClick ? 'pointer' : 'default',
        }}
        onClick={onClick}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          width="32"
          height="32"
          style={{ opacity: 0.3 }}
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={blobUrl}
      alt={alt || ''}
      className={className}
      style={style}
      onClick={onClick}
      loading="lazy"
    />
  );
}

// ── Vidéo authentifiée ────────────────────────────────────────────────────────
export function AuthVideo({ src, className, style, onClick }: AuthMediaProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const prevUrl = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchBlob(src).then(url => {
      if (cancelled) {
        if (url) URL.revokeObjectURL(url);
        return;
      }
      if (url) {
        if (prevUrl.current) URL.revokeObjectURL(prevUrl.current);
        prevUrl.current = url;
        setBlobUrl(url);
      }
    });
    return () => { cancelled = true; };
  }, [src]);

  useEffect(() => {
    return () => {
      if (prevUrl.current) URL.revokeObjectURL(prevUrl.current);
    };
  }, []);

  if (!blobUrl) {
    return (
      <div
        className={className}
        style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1a1a2e',
          cursor: onClick ? 'pointer' : 'default',
        }}
        onClick={onClick}
      >
        <div style={{ fontSize: 32, opacity: 0.5 }}>▶</div>
      </div>
    );
  }

  return (
    <video
      src={blobUrl}
      className={className}
      style={{ ...style, objectFit: 'cover' }}
      onClick={onClick}
      muted
      playsInline
    />
  );
}

// ── Audio authentifié ─────────────────────────────────────────────────────────
interface AuthAudioProps {
  src: string;
  audioRef: React.RefObject<HTMLAudioElement>;
  onReady?: () => void;
}

export function useAuthAudio(src: string | null) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const prevUrl = useRef<string | null>(null);

  useEffect(() => {
    if (!src) {
      setBlobUrl(null);
      return;
    }

    let cancelled = false;
    fetchBlob(src).then(url => {
      if (cancelled) {
        if (url) URL.revokeObjectURL(url);
        return;
      }
      if (url) {
        if (prevUrl.current) URL.revokeObjectURL(prevUrl.current);
        prevUrl.current = url;
        setBlobUrl(url);
      }
    });

    return () => { cancelled = true; };
  }, [src]);

  useEffect(() => {
    return () => {
      if (prevUrl.current) URL.revokeObjectURL(prevUrl.current);
    };
  }, []);

  return blobUrl;
}