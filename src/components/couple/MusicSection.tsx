import React, { useState, useRef, useEffect } from 'react';
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

export default function MusicSection({ tracks, activeTrackId, onSetActive, onUpload, onDelete }: MusicSectionProps) {
  const [showUpload, setShowUpload] = useState(false);
  const [headerRef, headerVisible] = useIntersection({ threshold: 0.15 });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = 0.7;
    }
    const a = audioRef.current;
    const onTimeUpdate = () => setProgress(a.currentTime);
    const onLoaded = () => setDuration(a.duration);
    const onEnded = () => { setIsPlaying(false); onSetActive(null); };
    a.addEventListener('timeupdate', onTimeUpdate);
    a.addEventListener('loadedmetadata', onLoaded);
    a.addEventListener('ended', onEnded);
    return () => {
      a.removeEventListener('timeupdate', onTimeUpdate);
      a.removeEventListener('loadedmetadata', onLoaded);
      a.removeEventListener('ended', onEnded);
    };
  }, [onSetActive]);

  const playTrack = (id: string) => {
    if (!audioRef.current) return;
    if (activeTrackId === id && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }
    if (activeTrackId !== id) {
      audioRef.current.src = musicApi.getFileUrl(id);
      onSetActive(id);
    }
    audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const fmtTime = (s: number) => {
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
          {tracks.map((track) => (
            <TrackRow
              key={track.id}
              track={track}
              isActive={activeTrackId === track.id}
              isPlaying={isPlaying && activeTrackId === track.id}
              progress={activeTrackId === track.id ? progress : 0}
              duration={activeTrackId === track.id ? duration : 0}
              onPlay={() => playTrack(track.id)}
              onDelete={() => { if (activeTrackId === track.id) { audioRef.current?.pause(); onSetActive(null); } onDelete(track.id); }}
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

function TrackRow({ track, isActive, isPlaying, progress, duration, onPlay, onDelete, fmtTime }: any) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className={`track-row ${isActive ? 'track-active' : ''}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button className="track-play-btn" onClick={onPlay}>
        {isPlaying ? '‖' : '▶'}
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
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">♪ Ajouter une musique</h3>
        <div className="modal-field">
          <label>Fichier audio *</label>
          <div
            className="file-drop-zone"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
          >
            {file ? (
              <span className="file-selected">♪ {file.name}</span>
            ) : (
              <span>Glissez un fichier MP3 ou cliquez</span>
            )}
          </div>
          <input ref={fileRef} type="file" accept="audio/*" style={{ display: 'none' }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); if (!title) setTitle(f.name.replace(/\.[^.]+$/, '')); } }}
          />
        </div>
        <div className="modal-field">
          <label>Titre *</label>
          <input placeholder="Nom de la chanson" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="modal-field">
          <label>Artiste</label>
          <input placeholder="Nom de l'artiste" value={artist} onChange={(e) => setArtist(e.target.value)} />
        </div>
        <div className="modal-actions">
          <button className="outline-btn" onClick={onClose}>Annuler</button>
          <button className="filled-btn" onClick={handleSubmit} disabled={!file || !title.trim()}>
            Ajouter ♡
          </button>
        </div>
      </div>
    </div>
  );
}
