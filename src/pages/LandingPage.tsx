import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AuthModal from '../components/auth/AuthModal';

// Petals config
const PETAL_COLORS = ['#f2a7bb', '#d4607a', '#f5e6c0', '#c9a84c', '#fdf0f4'];
const PETALS = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
  duration: `${5 + Math.random() * 7}s`,
  delay: `${Math.random() * 6}s`,
  size: `${14 + Math.random() * 16}px`,
  rotate: `${Math.random() * 360}deg`,
}));

const FEATURES = [
  {
    icon: '🖼️',
    title: 'Galerie Partagée',
    desc: 'Uploadez vos photos et vidéos directement depuis votre appareil. Une galerie privée, rien que pour vous deux.',
  },
  {
    icon: '📅',
    title: 'Dates Précieuses',
    desc: 'Créez une timeline de vos moments magiques. Premier regard, premier voyage, chaque instant mémorable.',
  },
  {
    icon: '♪',
    title: 'Votre Musique',
    desc: 'Uploadez vos chansons préférées et créez la bande-son de votre histoire.',
  },
  {
    icon: '💬',
    title: 'Citations & Vœux',
    desc: 'Écrivez vos mots du cœur, partagez des citations qui vous touchent, marquez vos favoris.',
  },
  {
    icon: '⏱️',
    title: 'Compteur d\'Amour',
    desc: 'Depuis combien de jours êtes-vous ensemble ? Le temps s\'affiche en temps réel.',
  },
  {
    icon: '🔒',
    title: 'Entièrement Privé',
    desc: 'Votre espace personnel, accessible uniquement par vous deux grâce à une invitation sécurisée.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [scrolled, setScrolled] = useState(false);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/admin' : '/app');
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const openLogin = () => { setAuthMode('login'); setShowAuth(true); };
  const openRegister = () => { setAuthMode('register'); setShowAuth(true); };

  return (
    <div className="landing">
      {/* Petals */}
      <div className="petals-container" aria-hidden>
        {PETALS.map((p) => (
          <div
            key={p.id}
            className="petal"
            style={{
              left: p.left,
              background: p.color,
              animationDuration: p.duration,
              animationDelay: p.delay,
              width: p.size,
              height: p.size,
              transform: `rotate(${p.rotate})`,
            }}
          />
        ))}
      </div>

      {/* Navbar */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-brand">
          <span className="nav-heart">♡</span>
          <span className="nav-title">Notre Histoire</span>
        </div>
        <div className="nav-actions">
          <button className="nav-link-btn" onClick={openLogin}>Se connecter</button>
          <button className="nav-cta-btn" onClick={openRegister}>Commencer</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-badge">✦ &nbsp;Votre espace d'amour&nbsp; ✦</div>
        <h1 className="hero-title">
          Chaque histoire mérite<br />
          <em>d'être préservée</em>
        </h1>
        <p className="hero-subtitle">
          Notre Histoire est un espace intime et élégant pour archiver,<br />
          célébrer et revivre les moments qui vous définissent en tant que couple.
        </p>
        <div className="hero-cta-group">
          <button className="hero-cta-primary" onClick={openRegister}>
            Créer notre espace ♡
          </button>
          <button className="hero-cta-secondary" onClick={openLogin}>
            Déjà un compte
          </button>
        </div>
        <div className="hero-scroll-hint" onClick={() => featuresRef.current?.scrollIntoView({ behavior: 'smooth' })}>
          <span>Découvrir</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </div>
      </section>

      {/* Stats band */}
      <div className="stats-band">
        {[
          { n: '∞', l: 'Photos' },
          { n: '24/7', l: 'Accessible' },
          { n: '100%', l: 'Privé' },
          { n: '♡', l: 'Avec amour' },
        ].map((s) => (
          <div key={s.l} className="stat-item">
            <div className="stat-num">{s.n}</div>
            <div className="stat-label">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <section className="features-section" ref={featuresRef}>
        <div className="section-header">
          <p className="section-tag">✦ Fonctionnalités</p>
          <h2 className="section-title">Tout ce dont vous avez<br /><em>besoin</em></h2>
          <div className="divider" />
        </div>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-inner">
          <div className="cta-heart">♡</div>
          <h2 className="cta-title">Prêts à écrire<br /><em>votre histoire ?</em></h2>
          <p className="cta-sub">Créez votre espace en quelques secondes. Invitez votre partenaire.</p>
          <button className="hero-cta-primary" onClick={openRegister}>
            Commencer maintenant ✦
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>Fait avec <span style={{ color: '#d4607a' }}>♡</span> pour vos souvenirs · Notre Histoire</p>
      </footer>

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuth(false)}
          onSwitchMode={(m) => setAuthMode(m)}
        />
      )}
    </div>
  );
}
