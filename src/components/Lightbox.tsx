import React, { useEffect } from 'react';

// ============================================================
//  COMPONENT — Lightbox
// ============================================================
interface LightboxProps {
  src: string | null;
  onClose: () => void;
}

function Lightbox({ src, onClose }: LightboxProps): React.JSX.Element | null {
  useEffect(() => {
    const esc = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);

  if (!src) return null;

  return (
    <div className="lightbox" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose}>
        ✕
      </button>
      <img src={src} alt="" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

export default Lightbox;
