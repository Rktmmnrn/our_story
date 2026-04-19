import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { MusicTrack } from '../../types';
import { musicApi } from '../../services/api';
import { useIntersection } from '../../hooks/useIntersection';

interface MusicSectionProps {
  tracks: MusicTrack[];
  activeTrackId: string | null;
  onSetActive: (id: string | null) => void;
  onUpload: (file: File, title: string, artist?: string) => void;
  onDelete: (id: string) => void;
}

async function fetchAudioBlob(url: string): Promise<string> {
  const token = localStorage.getItem('access_token');
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export default function MusicSection({ tracks, activeTrackId, onSetActive, onUpload, onDelete }: MusicSectionProps) {
  const [showUpload, setShowUpload] = useState(false);
  const [headerRef, headerVisible] = useIntersection({ threshold: 0.15 });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingTrackId, setLoadingTrackId] = useState<string | null>(null);

  // Créer l'élément audio une seule fois
  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0.7;
    audioRef.current = audio;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration);
    const onEnded = () => { setIsPlaying(false); onSetActive(null); };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('ended', onEnded);
      // Cleanup du blob URL
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playTrack = useCallback(async (id: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    // Pause si on reclique sur la piste active
    if (activeTrackId === id && isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    // Resume si on reclique sur la piste active en pause
    if (activeTrackId === id && !isPlaying) {
      await audio.play();
      setIsPlaying(true);
      return;
    }

    // Nouvelle piste : charger le blob authentifié
    audio.pause();
    setIsPlaying(false);
    setLoadingTrackId(id);
    onSetActive(id);

    try {
      // Révoquer l'ancien blob
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }

      const blobUrl = await fetchAudioBlob(musicApi.getFileUrl(id));
      blobUrlRef.current = blobUrl;
      audio.src = blobUrl;
      setProgress(0);
      setDuration(0);
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error('Erreur lecture audio:', err);
      onSetActive(null);
    } finally {
      setLoadingTrackId(null);
    }
  }, [activeTrackId, isPlaying, onSetActive]);

  const fmtTime = (s: number) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <section id="musique" className="music-section">
      <div ref={headerRef} className={`section-header reveal ${headerVisible ? 'visible' : ''}`}>
        <p className="section-tag">✦ Notre bande-son</p>
        <h2 className="section-title">Notre <em>Musique</em></h2>
        <div className="divider" />
      </div>

      {tracks.length === 0 ? (
        <div className="music-empty">
          <div className="music-empty-icon">♪</div>
          <p>Ajoutez votre première chanson ♡</p>
        </div>
      ) : (
        <div className="tracks-list">
          {tracks.map(track => (
            <TrackRow
              key={track.id}
              track={track}
              isActive={activeTrackId === track.id}
              isPlaying={isPlaying && activeTrackId === track.id}
              isLoading={loadingTrackId === track.id}
              progress={activeTrackId === track.id ? progress : 0}
              duration={activeTrackId === track.id ? duration : 0}
              onPlay={() => playTrack(track.id)}
              onDelete={() => {
                if (activeTrackId === track.id) {
                  audioRef.current?.pause();
                  onSetActive(null);
                  setIsPlaying(false);
                  if (blobUrlRef.current) {
                    URL.revokeObjectURL(blobUrlRef.current);
                    blobUrlRef.current = null;
                  }
                }
                onDelete(track.id);
              }}
              fmtTime={fmtTime}
            />
          ))}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <button className="outline-btn" onClick={() => setShowUpload(true)}>
          ♪ Ajouter une musique
        </button>
      </div>

      {showUpload && (
        <UploadMusicModal
          onSave={onUpload}
          onClose={() => setShowUpload(false)}
        />
      )}
    </section>
  );
}

function TrackRow({ track, isActive, isPlaying, isLoading, progress, duration, onPlay, onDelete, fmtTime }: {
  track: MusicTrack;
  isActive: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  progress: number;
  duration: number;
  onPlay: () => void;
  onDelete: () => void;
  fmtTime: (s: number) => string;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className={`track-row ${isActive ? 'track-active' : ''}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button className="track-play-btn" onClick={onPlay} disabled={isLoading}>
        {isLoading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : isPlaying ? '‖' : '▶'}
      </button>
      <div className="track-info">
        <div className="track-title">{track.title}</div>
        {track.artist && <div className="track-artist">{track.artist}</div>}
        {isActive && duration > 0 && (
          <div className="track-progress-bar">
            <div className="track-progress-fill" style={{ width: `${(progress / duration) * 100}%` }} />
          </div>
        )}
      </div>
      {isActive && duration > 0 && (
        <div className="track-time">{fmtTime(progress)} / {fmtTime(duration)}</div>
      )}
      {hover && (
        <button className="track-delete-btn" onClick={onDelete} title="Supprimer">✕</button>
      )}
    </div>
  );
}

function UploadMusicModal({ onSave, onClose }: {
  onSave: (file: File, title: string, artist?: string) => void;
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!file || !title.trim()) return;
    onSave(file, title, artist || undefined);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">♪ Ajouter une musique</h3>
        <div className="modal-field">
          <label>Fichier audio *</label>
          <div
            className="file-drop-zone"
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f) { setFile(f); if (!title) setTitle(f.name.replace(/\.[^.]+$/, '')); }
            }}
          >
            {file ? (
              <span className="file-selected">♪ {file.name}</span>
            ) : (
              <span>Glissez un fichier MP3 ou cliquez</span>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="audio/*"
            style={{ display: 'none' }}
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) { setFile(f); if (!title) setTitle(f.name.replace(/\.[^.]+$/, '')); }
            }}
          />
        </div>
        <div className="modal-field">
          <label>Titre *</label>
          <input
            placeholder="Nom de la chanson"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        <div className="modal-field">
          <label>Artiste</label>
          <input
            placeholder="Nom de l'artiste"
            value={artist}
            onChange={e => setArtist(e.target.value)}
          />
        </div>
        <div className="modal-actions">
          <button className="outline-btn" onClick={onClose}>Annuler</button>
          <button
            className="filled-btn"
            onClick={handleSubmit}
            disabled={!file || !title.trim()}
          >
            Ajouter ♡
          </button>
        </div>
      </div>
    </div>
  );
}