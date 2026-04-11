import React, { useRef } from 'react';
import { PHOTO_CAPTIONS } from '../constants';
import useIntersection from '../hooks/useIntersection';

// ============================================================
//  COMPONENT — PhotoCard
// ============================================================
interface PhotoCardProps {
  src: string;
  caption: string;
  index: number;
  onClick: (src: string) => void;
}

function PhotoCard({ src, caption, index, onClick }: PhotoCardProps): React.JSX.Element {
  const style =
    index === 1 ? { marginTop: 32 } : index === 4 ? { marginTop: -32 } : {};
  return (
    <div className="photo-card" style={style} onClick={() => onClick(src)}>
      <img src={src} alt="souvenir" loading="lazy" />
      <div className="photo-overlay">
        <span className="photo-caption">{caption}</span>
      </div>
    </div>
  );
}

// ============================================================
//  COMPONENT — PlaceholderCard
// ============================================================
interface PlaceholderCardProps {
  onClick: () => void;
}

function PlaceholderCard({ onClick }: PlaceholderCardProps): React.JSX.Element {
  return (
    <div className="photo-card photo-placeholder-card" onClick={onClick}>
      <div className="photo-placeholder">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          width="32"
          height="32"
          style={{ opacity: 0.5 }}
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
        <span>Ajouter</span>
      </div>
    </div>
  );
}

// ============================================================
//  COMPONENT — GalerieSection
// ============================================================
interface GalerieSectionProps {
  photos: string[];
  onAddPhotos: (newPhotos: string[]) => void;
  onLightbox: (src: string) => void;
}

function GalerieSection({ photos, onAddPhotos, onLightbox }: GalerieSectionProps): React.JSX.Element {
  const fileRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const headerVisible = useIntersection(headerRef, { threshold: 0.15 });
  const placeholders = Math.max(6 - photos.length, 0);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(e.target.files ?? []);
    const newPhotos: string[] = [];
    let loaded = 0;
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          newPhotos.push(ev.target.result as string);
        }
        loaded++;
        if (loaded === files.length) onAddPhotos(newPhotos);
      };
      reader.readAsDataURL(f);
    });
  };

  return (
    <div id="galerie" className="galerie-section">
      <div ref={headerRef} className={`section-header reveal ${headerVisible ? 'visible' : ''}`}>
        <p className="section-tag">✦ Nos souvenirs</p>
        <h2 className="section-title">
          Notre <em>Galerie</em>
        </h2>
        <div className="divider" />
      </div>
      <div className="photo-grid">
        {photos.map((src, i) => (
          <PhotoCard
            key={i}
            src={src}
            caption={PHOTO_CAPTIONS[i % PHOTO_CAPTIONS.length]}
            index={i}
            onClick={onLightbox}
          />
        ))}
        {Array.from({ length: placeholders }).map((_, i) => (
          <PlaceholderCard key={`ph-${i}`} onClick={() => fileRef.current?.click()} />
        ))}
      </div>
      <div style={{ textAlign: 'center' }}>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleFiles}
        />
        <button className="outline-btn" onClick={() => fileRef.current?.click()}>
          + Ajouter des photos
        </button>
      </div>
    </div>
  );
}

export default GalerieSection;
