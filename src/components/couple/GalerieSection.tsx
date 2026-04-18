import React, { useRef } from 'react';
import { useIntersection } from '../../hooks/useIntersection';
import type { MediaItem } from '../../types';
import { mediaApi } from '../../services/api';

interface GalerieSectionProps {
  photos: MediaItem[];
  onUpload: (files: File[]) => void;
  onDelete: (id: string) => void;
  onLightbox: (id: string) => void;
}

const CAPTIONS = [
  'Notre histoire', 'Un moment précieux', 'Rien que nous deux',
  'Un souvenir gravé', 'Toujours ensemble', 'Plein de bonheur',
];

export default function GalerieSection({ photos, onUpload, onDelete, onLightbox }: GalerieSectionProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [headerRef, headerVisible] = useIntersection({ threshold: 0.15 });
  const placeholders = Math.max(6 - photos.length, 0);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) onUpload(files);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (files.length) onUpload(files);
  };

  return (
    <div id="galerie" className="galerie-section">
      <div ref={headerRef} className={`section-header reveal ${headerVisible ? 'visible' : ''}`}>
        <p className="section-tag">✦ Nos souvenirs</p>
        <h2 className="section-title">Notre <em>Galerie</em></h2>
        <div className="divider" />
      </div>

      <div
        className="photo-grid"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {photos.map((photo, i) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            caption={CAPTIONS[i % CAPTIONS.length]}
            index={i}
            onLightbox={() => onLightbox(photo.id)}
            onDelete={() => onDelete(photo.id)}
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
          accept="image/*,video/*"
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

function PhotoCard({ photo, caption, index, onLightbox, onDelete }: {
  photo: MediaItem; caption: string; index: number;
  onLightbox: () => void; onDelete: () => void;
}) {
  const style = index === 1 ? { marginTop: 32 } : index === 4 ? { marginTop: -32 } : {};
  return (
    <div className="photo-card" style={style} onClick={onLightbox}>
      <img
        src={mediaApi.getFileUrl(photo.id)}
        alt={photo.title || 'souvenir'}
        loading="lazy"
      />
      <div className="photo-overlay">
        <span className="photo-caption">{photo.title || caption}</span>
        <button
          className="photo-delete-btn"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Supprimer"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function PlaceholderCard({ onClick }: { onClick: () => void }) {
  return (
    <div className="photo-card photo-placeholder-card" onClick={onClick}>
      <div className="photo-placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" width="32" height="32" style={{ opacity: 0.5 }}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
        <span>Ajouter</span>
      </div>
    </div>
  );
}
