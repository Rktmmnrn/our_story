import React, { useState, useCallback } from 'react';
import { QUOTES, DEFAULT_TIMELINE } from './constants';
import type { TimelineItem } from './types';

import IntroScreen from './components/IntroScreen';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import GalerieSection from './components/GalerieSection';
import TimelineSection from './components/TimelineSection';
import MessageSection from './components/MessageSection';
import MusicButton from './components/MusicButton';
import Lightbox from './components/Lightbox';

// ============================================================
//  APP
// ============================================================
function App(): React.JSX.Element {
  const [entered, setEntered] = useState(false);

  const [photos, setPhotos] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('nh_photos') ?? '[]') as string[];
    } catch {
      return [];
    }
  });

  const [moments, setMoments] = useState<TimelineItem[]>(() => {
    try {
      return (
        (JSON.parse(localStorage.getItem('nh_timeline') ?? 'null') as TimelineItem[] | null) ??
        DEFAULT_TIMELINE
      );
    } catch {
      return DEFAULT_TIMELINE;
    }
  });

  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [quote] = useState<string>(
    () => QUOTES[Math.floor(Math.random() * QUOTES.length)]
  );

  const addPhotos = useCallback((newOnes: string[]): void => {
    setPhotos((prev) => {
      const updated = [...prev, ...newOnes];
      localStorage.setItem('nh_photos', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addMoment = useCallback((item: TimelineItem): void => {
    setMoments((prev) => {
      const updated = [...prev, item];
      localStorage.setItem('nh_timeline', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <>
      {!entered && <IntroScreen onEnter={() => setEntered(true)} />}
      {entered && (
        <>
          <Navbar />
          <HeroSection quote={quote} />
          <GalerieSection photos={photos} onAddPhotos={addPhotos} onLightbox={setLightboxSrc} />
          <TimelineSection moments={moments} onAddMoment={addMoment} />
          <MessageSection />
          <footer className="footer">
            <p>
              Fait avec <span style={{ color: '#d4607a' }}>♡</span> rien que pour toi · Notre
              Histoire
            </p>
          </footer>
          <MusicButton />
          <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
        </>
      )}
    </>
  );
}

export default App;
