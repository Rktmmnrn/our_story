import React, { useState, useEffect, useRef } from 'react';
import type { User, Couple } from '../../types';
import ProfileModal from '../auth/ProfileModal';
import CoupleSettingsModal from '../couple/CoupleSettingsModal';

interface AppNavbarProps {
  user: User | null;
  couple: Couple | null;
  onLogout: () => void;
  onInvite: () => void;
  onCoupleUpdated?: (couple: Couple) => void;
}

const NAV_LINKS = [
  { id: 'hero', label: 'Accueil' },
  { id: 'galerie', label: 'Photos' },
  { id: 'timeline', label: 'Moments' },
  { id: 'musique', label: 'Musique' },
  { id: 'citations', label: 'Citations' },
  { id: 'message', label: 'Message' },
];

function useAuthImage(src: string | null | undefined) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const prevUrl = useRef<string | null>(null);

  useEffect(() => {
    if (!src) {
      setBlobUrl(null);
      return;
    }

    let cancelled = false;
    const token = localStorage.getItem('access_token');
    const absoluteSrc = src.startsWith('http') ? src : `${window.location.origin}${src}`;

    fetch(absoluteSrc, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        if (prevUrl.current) URL.revokeObjectURL(prevUrl.current);
        prevUrl.current = url;
        setBlobUrl(url);
      })
      .catch(() => {
        if (!cancelled) setBlobUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [src]);

  useEffect(() => {
    return () => {
      if (prevUrl.current) URL.revokeObjectURL(prevUrl.current);
    };
  }, []);

  return blobUrl;
}

export default function AppNavbar({ user, couple, onLogout, onInvite, onCoupleUpdated }: AppNavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showCoupleSettings, setShowCoupleSettings] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const avatarBlobUrl = useAuthImage(user?.avatar_url);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ 'behavior': 'smooth' });
    setMenuOpen(false);
  };

  const handleLogoutClick = () => {
    setMenuOpen(false);
    setShowLogoutConfirm(true);
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-logo" onClick={() => scrollTo('hero')} style={{ cursor: 'pointer' }}>
          {couple?.couple_name || 'Notre Histoire'}
        </div>

        <ul className="nav-links">
          {NAV_LINKS.map(({ id, label }) => (
            <li key={id}><a onClick={() => scrollTo(id)}>{label}</a></li>
          ))}
        </ul>

        <div className="nav-user-actions">
          {couple && !couple.user2_id && (
            <button className="nav-invite-btn" onClick={onInvite}>Inviter ♡</button>
          )}
          <div className="nav-avatar" onClick={() => setMenuOpen(!menuOpen)}>
            {avatarBlobUrl
              ? <img src={avatarBlobUrl} alt={user?.display_name} />
              : <span>{user?.display_name?.[0]?.toUpperCase()}</span>
            }
          </div>

          {menuOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 98 }} onClick={() => setMenuOpen(false)} />
              <div className="nav-dropdown">
                <div className="nav-dropdown-header">
                  <strong>{user?.display_name}</strong>
                  <span>{user?.email}</span>
                </div>
                <button className="nav-dropdown-item" onClick={() => { setShowProfile(true); setMenuOpen(false); }}>
                  👤 Mon profil
                </button>
                {couple && (
                  <button className="nav-dropdown-item" onClick={() => { setShowCoupleSettings(true); setMenuOpen(false); }}>
                    ⚙ Paramètres du couple
                  </button>
                )}
                <div className="nav-dropdown-divider" />
                <button className="nav-dropdown-item nav-dropdown-logout" onClick={handleLogoutClick}>
                  Déconnexion
                </button>
              </div>
            </>
          )}
        </div>
      </nav>

      {showProfile && user && (
        <ProfileModal user={user} onClose={() => setShowProfile(false)} />
      )}
      {showCoupleSettings && couple && (
        <CoupleSettingsModal
          couple={couple}
          onUpdated={(updated) => { onCoupleUpdated?.(updated); setShowCoupleSettings(false); }}
          onClose={() => setShowCoupleSettings(false)}
        />
      )}

      {/* ── Modale de confirmation de déconnexion ── */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 400, textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>♡</div>
            <h3 className="modal-title" style={{ marginBottom: 8 }}>Vous partez déjà ?</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
              Votre histoire vous attendra ici, promise ♡
            </p>
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button className="outline-btn" onClick={() => setShowLogoutConfirm(false)}>
                Rester
              </button>
              <button
                className="filled-btn"
                style={{ background: '#c0392b', borderColor: '#c0392b' }}
                onClick={() => { setShowLogoutConfirm(false); onLogout(); }}
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}