import React, { useState, useEffect, useRef } from 'react';
import { CONFIG } from '../constants';

// ============================================================
//  COMPONENT — MusicButton
// ============================================================
function MusicButton(): React.JSX.Element {
  const [playing, setPlaying] = useState(false);
  const [url, setUrl] = useState<string>(CONFIG.musicUrl);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    audioRef.current.volume = 0.35;
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const toggle = (): void => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      let src = url;
      if (!src) {
        const input = prompt('Colle l\'URL d\'une musique MP3 :');
        if (!input) return;
        src = input;
        setUrl(src);
        audioRef.current.src = src;
      } else if (!audioRef.current.src) {
        audioRef.current.src = src;
      }
      audioRef.current
        .play()
        .catch(() => alert('Impossible de lire ce fichier. Essaie un lien MP3 direct.'));
      setPlaying(true);
    }
  };

  return (
    <button
      className={`music-btn ${playing ? 'playing' : ''}`}
      onClick={toggle}
      title="Musique"
    >
      {playing ? '‖' : '♪'}
    </button>
  );
}

export default MusicButton;
