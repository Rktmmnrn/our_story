import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { coupleApi, mediaApi, musicApi, datesApi, quotesApi } from '../services/api';
import type { Couple, MediaItem, MusicTrack, SpecialDate, Quote, CoupleTimer } from '../types';

import AppNavbar from '../components/layout/AppNavbar';
import HeroSection from '../components/couple/HeroSection';
import GalerieSection from '../components/couple/GalerieSection';
import TimelineSection from '../components/couple/TimelineSection';
import MusicSection from '../components/couple/MusicSection';
import QuotesSection from '../components/couple/QuotesSection';
import MessageSection from '../components/couple/MessageSection';
import CoupleSetupModal from '../components/couple/CoupleSetupModal';
import InviteModal from '../components/couple/InviteModal';
import Lightbox from '../components/ui/Lightbox';

export default function AppPage() {
  const navigate = useNavigate();
  const { user, logout, setCouple } = useAuthStore();

  const [couple, setCoupleLocal] = useState<Couple | null>(null);
  const [timer, setTimer] = useState<CoupleTimer | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [dates, setDates] = useState<SpecialDate[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);

  // Compteur d'uploads en cours pour bloquer le refresh navigateur
  const uploadCountRef = useRef(0);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (uploadCountRef.current > 0) {
        e.preventDefault();
        e.returnValue = 'Des uploads sont en cours. Voulez-vous vraiment quitter ?';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') navigate('/admin');
  }, [user, navigate]);

  useEffect(() => {
    const init = async () => {
      try {
        const c = await coupleApi.get();
        setCoupleLocal(c);
        setCouple(c);
        const [t, mediaRes, musicRes, datesRes, quotesRes] = await Promise.all([
          coupleApi.timer(),
          mediaApi.list(1, 50),
          musicApi.list(),
          datesApi.list(),
          quotesApi.list(),
        ]);
        setTimer(t);
        // Garder photos ET vidéos
        setMediaItems(mediaRes.data);
        setTracks(musicRes);
        setDates(datesRes);
        setQuotes(quotesRes);
      } catch (err: any) {
        if (err?.response?.status === 403) setShowSetup(true);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [setCouple]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSetupComplete = async (c: Couple) => {
    setCoupleLocal(c);
    setCouple(c);
    setShowSetup(false);
    try { setTimer(await coupleApi.timer()); } catch { /* ignore */ }
  };

  const handleMediaUpload = useCallback(async (
    files: File[],
    onProgress: (file: File, percent: number) => void,
  ) => {
    uploadCountRef.current += files.length;
    const toastId = toast.loading(`Upload de ${files.length} fichier(s)...`);

    // Batch adaptatif selon la connexion
    const effectiveType = (navigator as any).connection?.effectiveType;
    const BATCH_SIZE = effectiveType === '4g' || effectiveType === '5g' ? 5 : 3;
    try {
      for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batch = files.slice(i, i + BATCH_SIZE);
        await Promise.all(
          batch.map(async file => {
            try {
              await mediaApi.upload(
                file,
                file.type.startsWith('video/') ? 'video' : 'photo',
                undefined,
                (percent) => onProgress(file, percent),
              );
            } finally {
              uploadCountRef.current = Math.max(0, uploadCountRef.current - 1);
            }
          })
        );
      }
      const res = await mediaApi.list(1, 50);
      setMediaItems(res.data);
      toast.success('Fichiers ajoutés ♡', { id: toastId });
    } catch {
      toast.error('Erreur lors de l\'upload', { id: toastId });
      uploadCountRef.current = 0;
    }
  }, []);

  const handlePhotoDelete = useCallback(async (id: string) => {
    try {
      await mediaApi.delete(id);
      setMediaItems(prev => prev.filter(p => p.id !== id));
      toast.success('Fichier supprimé');
    } catch {
      toast.error('Impossible de supprimer');
    }
  }, []);

  const handleLightbox = useCallback((id: string, type: 'photo' | 'video') => {
    const index = mediaItems.findIndex(m => m.id === id);
    if (index !== -1) setLightboxIndex(index);
  }, [mediaItems]);

  const handleMusicUpload = useCallback(async (file: File, title: string, artist?: string) => {
    const toastId = toast.loading('Upload en cours...');
    uploadCountRef.current += 1;
    try {
      const track = await musicApi.upload(file, title, artist, (percent) => {
        if (percent < 100) toast.loading(`Upload ${percent}%...`, { id: toastId });
      });
      setTracks(prev => [track, ...prev]);
      toast.success('Musique ajoutée ♡', { id: toastId });
    } catch {
      toast.error('Erreur lors de l\'upload audio', { id: toastId });
    } finally {
      uploadCountRef.current = Math.max(0, uploadCountRef.current - 1);
    }
  }, []);

  const handleMusicDelete = useCallback(async (id: string) => {
    try {
      await musicApi.delete(id);
      setTracks(prev => prev.filter(t => t.id !== id));
      toast.success('Piste supprimée');
    } catch { toast.error('Impossible de supprimer'); }
  }, []);

  const handleDateCreate = useCallback(async (payload: {
    title: string; event_date: string; description?: string; emoji?: string;
  }) => {
    try {
      await datesApi.create(payload);
      setDates(await datesApi.list());
      toast.success('Moment ajouté ♡');
    } catch { toast.error('Erreur lors de l\'ajout'); }
  }, []);

  const handleDateDelete = useCallback(async (id: string) => {
    try {
      await datesApi.delete(id);
      setDates(prev => prev.filter(d => d.id !== id));
      toast.success('Moment supprimé');
    } catch { toast.error('Impossible de supprimer'); }
  }, []);

  const handleQuoteCreate = useCallback(async (text: string, author?: string) => {
    try {
      await quotesApi.create(text, author);
      setQuotes(await quotesApi.list());
      toast.success('Citation ajoutée ♡');
    } catch { toast.error('Erreur lors de l\'ajout'); }
  }, []);

  const handleQuoteToggleFav = useCallback(async (id: string, current: boolean) => {
    try {
      await quotesApi.update(id, { is_favorite: !current });
      setQuotes(prev => prev.map(q => q.id === id ? { ...q, is_favorite: !current } : q));
    } catch { toast.error('Erreur'); }
  }, []);

  const handleQuoteDelete = useCallback(async (id: string) => {
    try {
      await quotesApi.delete(id);
      setQuotes(prev => prev.filter(q => q.id !== id));
      toast.success('Citation supprimée');
    } catch { toast.error('Impossible de supprimer'); }
  }, []);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-heart">♡</div>
        <p>Chargement de votre histoire...</p>
      </div>
    );
  }

  return (
    <>
      <AppNavbar
        user={user}
        couple={couple}
        onLogout={handleLogout}
        onInvite={() => setShowInvite(true)}
        onCoupleUpdated={c => setCoupleLocal(c)}
      />

      <HeroSection couple={couple} timer={timer} user={user} />

      <GalerieSection
        photos={mediaItems}
        onUpload={handleMediaUpload}
        onDelete={handlePhotoDelete}
        onLightbox={handleLightbox}
      />

      <TimelineSection dates={dates} onAdd={handleDateCreate} onDelete={handleDateDelete} />

      <MusicSection
        tracks={tracks}
        activeTrackId={activeTrackId}
        onSetActive={setActiveTrackId}
        onUpload={handleMusicUpload}
        onDelete={handleMusicDelete}
      />

      <QuotesSection
        quotes={quotes}
        onCreate={handleQuoteCreate}
        onToggleFav={handleQuoteToggleFav}
        onDelete={handleQuoteDelete}
      />

      <MessageSection couple={couple} />

      <footer className="app-footer">
        <p>Fait avec <span style={{ color: '#d4607a' }}>♡</span> rien que pour vous · Notre Histoire</p>
      </footer>

      {lightboxIndex !== null && (
        <Lightbox
          src={mediaApi.getFileUrl(mediaItems[lightboxIndex].id)}
          mediaType={mediaItems[lightboxIndex].media_type}
          onClose={() => setLightboxIndex(null)}
          hasPrev={lightboxIndex > 0}
          hasNext={lightboxIndex < mediaItems.length - 1}
          onPrev={() => setLightboxIndex(i => i! - 1)}
          onNext={() => setLightboxIndex(i => i! + 1)}
        />
      )}

      {showSetup && (
        <CoupleSetupModal onComplete={handleSetupComplete} onClose={() => setShowSetup(false)} />
      )}
      {showInvite && couple && (
        <InviteModal coupleId={couple.id} onClose={() => setShowInvite(false)} />
      )}
    </>
  );
}