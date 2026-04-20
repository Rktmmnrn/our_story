import React, { useRef, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useImageCompressor } from '../../hooks/useImageCompressor';
import { useIntersection } from '../../hooks/useIntersection';
import type { MediaItem } from '../../types';
import { mediaApi } from '../../services/api';
import { AuthImage, AuthVideo } from '../ui/AuthenticatedMedia';

interface GalerieSectionProps {
  photos: MediaItem[];
  onUpload: (files: File[], onProgress: (file: File, percent: number) => void) => void;
  onDelete: (id: string) => void;
  onLightbox: (id: string, type: 'photo' | 'video') => void;
}

const CAPTIONS = [
  'Notre histoire', 'Un moment précieux', 'Rien que nous deux',
  'Un souvenir gravé', 'Toujours ensemble', 'Plein de bonheur',
];

export default function GalerieSection({ photos, onUpload, onDelete, onLightbox }: GalerieSectionProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [headerRef, headerVisible] = useIntersection({ threshold: 0.15 });
  const placeholders = Math.max(6 - photos.length, 0);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const { compressImage } = useImageCompressor();

  const handleProgress = useCallback((file: File, percent: number) => {
    setUploadProgress(prev => {
      if (percent >= 100) {
        setTimeout(() => setUploadProgress(p => {
          const n = { ...p };
          delete n[file.name];
          return n;
        }), 800);
      }
      return { ...prev, [file.name]: percent };
    });
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const filesToUpload = await Promise.all(
      acceptedFiles.map(file => compressImage(file))
    );

    onUpload(filesToUpload, handleProgress);
  }, [compressImage, onUpload, handleProgress]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [], 'video/*': [] },
    maxSize: 200 * 1024 * 1024, // 200 Mo max par fichier
    onDrop,
    multiple: true,
    noClick: true,
    noKeyboard: true,
  });

  const activeUploads = Object.entries(uploadProgress).filter(([, p]) => p < 100);

  return (
    <div id="galerie" className="galerie-section">
      <div ref={headerRef} className={`section-header reveal ${headerVisible ? 'visible' : ''}`}>
        <p className="section-tag">✦ Nos souvenirs</p>
        <h2 className="section-title">Notre <em>Galerie</em></h2>
        <div className="divider" />
      </div>

      {activeUploads.length > 0 && (
        <div className="upload-progress-container">
          {activeUploads.map(([name, percent]) => (
            <div key={name} className="upload-progress-item">
              <div className="upload-progress-header">
                <span className="upload-filename">
                  {name.length > 30 ? name.slice(0, 27) + '…' : name}
                </span>
                <span className="upload-percent">{percent}%</span>
              </div>
              <div className="upload-progress-bar">
                <div className="upload-progress-fill" style={{ width: `${percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        {...getRootProps()}
        className={`photo-grid ${isDragActive ? 'drop-active' : ''}`}
      >
        <input {...getInputProps()} />
        {photos.map((item, i) => (
          <MediaCard
            key={item.id}
            item={item}
            caption={CAPTIONS[i % CAPTIONS.length]}
            index={i}
            onLightbox={() => onLightbox(item.id, item.media_type)}
            onDelete={() => onDelete(item.id)}
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
          onChange={async (e) => {
            const files = Array.from(e.target.files ?? []);
            if (!files.length) return;

            const init: Record<string, number> = {};
            files.forEach(f => { init[f.name] = 0; });
            setUploadProgress(prev => ({ ...prev, ...init }));

            const filesToUpload = await Promise.all(files.map(f => compressImage(f)));

            onUpload(filesToUpload, handleProgress);
            e.target.value = '';
          }}
        />
        <button className="outline-btn" onClick={() => fileRef.current?.click()}>
          + Ajouter des photos / vidéos
        </button>
      </div>
    </div>
  );
}

function MediaCard({ item, caption, index, onLightbox, onDelete }: {
  item: MediaItem;
  caption: string;
  index: number;
  onLightbox: () => void;
  onDelete: () => void;
}) {
  const style = index === 1 ? { marginTop: 32 } : index === 4 ? { marginTop: -32 } : {};
  const fileUrl = mediaApi.getFileUrl(item.id);
  const isVideo = item.media_type === 'video';

  return (
    <div className="photo-card" style={style} onClick={onLightbox}>
      {isVideo ? (
        <AuthVideo src={fileUrl} style={{ width: '100%', height: '100%' }} />
      ) : (
        <AuthImage
          src={fileUrl}
          alt={item.title || 'souvenir'}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      )}
      {isVideo && (
        <div style={{
          position: 'absolute', top: 10, left: 10,
          background: 'rgba(42,26,32,0.7)', color: 'white',
          fontSize: 10, padding: '2px 8px', letterSpacing: '0.15em',
          textTransform: 'uppercase', borderRadius: 2,
        }}>
          Vidéo
        </div>
      )}
      <div className="photo-overlay">
        <span className="photo-caption">{item.title || caption}</span>
        <button
          className="photo-delete-btn"
          onClick={e => { e.stopPropagation(); onDelete(); }}
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