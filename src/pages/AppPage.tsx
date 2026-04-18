import React, { useEffect, useState, useCallback } from 'react';
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

type Section = 'hero' | 'galerie' | 'timeline' | 'musique' | 'citations' | 'message';

export default function AppPage() {
  const navigate = useNavigate();
  const { user, logout, setCouple } = useAuthStore();

  const [couple, setCoupleLocal] = useState<Couple | null>(null);
  const [timer, setTimer] = useState<CoupleTimer | null>(null);
  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [dates, setDates] = useState<SpecialDate[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);

  // Redirect admin
  useEffect(() => {
    if (user?.role === 'admin') navigate('/admin');
  }, [user, navigate]);

  // Load couple
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
        setPhotos(mediaRes.data.filter((m) => m.media_type === 'photo'));
        setTracks(musicRes);
        setDates(datesRes);
        setQuotes(quotesRes);
      } catch (err: any) {
        if (err?.response?.status === 403) {
          setShowSetup(true);
        }
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
    try {
      const t = await coupleApi.timer();
      setTimer(t);
    } catch { /* ignore */ }
  };

  const handlePhotoUpload = useCallback(async (files: File[]) => {
    const toastId = toast.loading(`Upload de ${files.length} photo(s)...`);
    try {
      for (const file of files) {
        await mediaApi.upload(file, 'photo');
      }
      const res = await mediaApi.list(1, 50);
      setPhotos(res.data.filter((m) => m.media_type === 'photo'));
      toast.success('Photos ajoutées ♡', { id: toastId });
    } catch {
      toast.error('Erreur lors de l\'upload', { id: toastId });
    }
  }, []);

  const handlePhotoDelete = useCallback(async (id: string) => {
    try {
      await mediaApi.delete(id);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      toast.success('Photo supprimée');
    } catch {
      toast.error('Impossible de supprimer');
    }
  }, []);

  const handleMusicUpload = useCallback(async (file: File, title: string, artist?: string) => {
    const toastId = toast.loading('Upload en cours...');
    try {
      const track = await musicApi.upload(file, title, artist);
      setTracks((prev) => [track, ...prev]);
      toast.success('Musique ajoutée ♡', { id: toastId });
    } catch {
      toast.error('Erreur lors de l\'upload audio', { id: toastId });
    }
  }, []);

  const handleMusicDelete = useCallback(async (id: string) => {
    try {
      await musicApi.delete(id);
      setTracks((prev) => prev.filter((t) => t.id !== id));
      toast.success('Piste supprimée');
    } catch {
      toast.error('Impossible de supprimer');
    }
  }, []);

  const handleDateCreate = useCallback(async (payload: {
    title: string; event_date: string; description?: string; emoji?: string;
  }) => {
    try {
      await datesApi.create(payload);
      const updated = await datesApi.list();
      setDates(updated);
      toast.success('Moment ajouté ♡');
    } catch {
      toast.error('Erreur lors de l\'ajout');
    }
  }, []);

  const handleDateDelete = useCallback(async (id: string) => {
    try {
      await datesApi.delete(id);
      setDates((prev) => prev.filter((d) => d.id !== id));
      toast.success('Moment supprimé');
    } catch {
      toast.error('Impossible de supprimer');
    }
  }, []);

  const handleQuoteCreate = useCallback(async (text: string, author?: string) => {
    try {
      await quotesApi.create(text, author);
      const updated = await quotesApi.list();
      setQuotes(updated);
      toast.success('Citation ajoutée ♡');
    } catch {
      toast.error('Erreur lors de l\'ajout');
    }
  }, []);

  const handleQuoteToggleFav = useCallback(async (id: string, current: boolean) => {
    try {
      await quotesApi.update(id, { is_favorite: !current });
      setQuotes((prev) => prev.map((q) => q.id === id ? { ...q, is_favorite: !current } : q));
    } catch {
      toast.error('Erreur');
    }
  }, []);

  const handleQuoteDelete = useCallback(async (id: string) => {
    try {
      await quotesApi.delete(id);
      setQuotes((prev) => prev.filter((q) => q.id !== id));
      toast.success('Citation supprimée');
    } catch {
      toast.error('Impossible de supprimer');
    }
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
      />

      <HeroSection couple={couple} timer={timer} user={user} />

      <GalerieSection
        photos={photos}
        onUpload={handlePhotoUpload}
        onDelete={handlePhotoDelete}
        onLightbox={(id) => setLightboxSrc(mediaApi.getFileUrl(id))}
      />

      <TimelineSection
        dates={dates}
        onAdd={handleDateCreate}
        onDelete={handleDateDelete}
      />

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

      <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />

      {showSetup && (
        <CoupleSetupModal
          onComplete={handleSetupComplete}
          onClose={() => setShowSetup(false)}
        />
      )}

      {showInvite && couple && (
        <InviteModal
          coupleId={couple.id}
          onClose={() => setShowInvite(false)}
        />
      )}
    </>
  );
}
