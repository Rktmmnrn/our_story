import React, { useState } from 'react';
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

export default function AppNavbar({ user, couple, onLogout, onInvite, onCoupleUpdated }: AppNavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showCoupleSettings, setShowCoupleSettings] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
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
            {user?.avatar_url
              ? <img src={user.avatar_url} alt={user.display_name} />
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
                <button className="nav-dropdown-item nav-dropdown-logout" onClick={onLogout}>
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
    </>
  );
}
