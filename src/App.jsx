import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
//  CONFIG
// ============================================================
const CONFIG = {
  startDate: new Date("2025-04-21T00:00:00"),
  coupleNames: "Just for you",
  subtitle: "Une histoire à deux",
  loveMessage: "Avec toi, chaque instant devient un souvenir que je veux garder pour toujours.",
  musicUrl: "",
};

const QUOTES = [
  "Il y a toi, et puis il y a tout le reste.",
  "Tu es ma chose préférée.",
  "Avec toi, même les lundis sont beaux.",
  "Tu es mon aventure préférée.",
  "Je t'aime plus qu'hier, moins que demain.",
];

const DEFAULT_TIMELINE = [
  { date: "Février 2023", title: "Notre premier regard", desc: "Le moment où tout a commencé, un regard qui a tout changé.", emoji: "👀" },
  { date: "Mars 2023", title: "Notre premier rendez-vous", desc: "Ce soir là, on a parlé pendant des heures sans voir le temps passer.", emoji: "☕" },
  { date: "Juin 2023", title: "Notre premier voyage", desc: "La première aventure à deux, le premier « nous ».", emoji: "✈️" },
  { date: "Décembre 2023", title: "Notre premier Noël", desc: "Enveloppés dans la magie de l'hiver, ensemble.", emoji: "🎄" },
  { date: "Février 2024", title: "Notre premier anniversaire", desc: "Un an de bonheur, de rires, et d'amour grandissant.", emoji: "🌹" },
];

const PHOTO_CAPTIONS = ["Notre histoire", "Un moment précieux", "Rien que nous deux", "Un souvenir gravé", "Toujours ensemble", "Plein de bonheur"];
const PETAL_COLORS = ["#f2a7bb", "#d4607a", "#f5e6c0", "#c9a84c", "#fdf0f4"];

// ============================================================
//  UTILS
// ============================================================
function calcDiff(start) {
  const ms = Date.now() - start.getTime();
  const totalDays = Math.floor(ms / 86400000);
  return {
    years: Math.floor(totalDays / 365),
    months: Math.floor((totalDays % 365) / 30),
    days: totalDays % 30,
    hours: Math.floor((ms % 86400000) / 3600000),
  };
}

function useIntersection(ref, options = {}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, options);
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return visible;
}

// ============================================================
//  PETALS
// ============================================================
const PETALS = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
  duration: `${3 + Math.random() * 5}s`,
  delay: `${Math.random() * 4}s`,
  width: `${8 + Math.random() * 8}px`,
  height: `${10 + Math.random() * 10}px`,
  rotate: `${Math.random() * 360}deg`,
}));

// ============================================================
//  COMPONENTS
// ============================================================

function IntroScreen({ onEnter }) {
  return (
    <div className="intro">
      <div className="petals-container">
        {PETALS.map(p => (
          <div key={p.id} className="petal" style={{
            left: p.left, background: p.color,
            animationDuration: p.duration, animationDelay: p.delay,
            width: p.width, height: p.height, transform: `rotate(${p.rotate})`,
          }} />
        ))}
      </div>
      <div className="intro-heart">♡</div>
      <h1 className="intro-title">Notre Histoire</h1>
      <p className="intro-subtitle">{CONFIG.subtitle}</p>
      <button className="intro-btn" onClick={onEnter}>Entrer ✦</button>
    </div>
  );
}

function Navbar() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <nav className="navbar">
      <div className="nav-logo">Notre Histoire</div>
      <ul className="nav-links">
        {[["hero", "Accueil"], ["galerie", "Photos"], ["timeline", "Nos Moments"], ["message", "Message"]].map(([id, label]) => (
          <li key={id}><a onClick={() => scrollTo(id)}>{label}</a></li>
        ))}
      </ul>
    </nav>
  );
}

function Counter() {
  const [diff, setDiff] = useState(() => calcDiff(CONFIG.startDate));
  useEffect(() => {
    const t = setInterval(() => setDiff(calcDiff(CONFIG.startDate)), 60000);
    return () => clearInterval(t);
  }, []);
  const items = [
    { val: diff.years, label: "Années" },
    { val: diff.months, label: "Mois" },
    { val: diff.days, label: "Jours" },
    { val: diff.hours, label: "Heures" },
  ];
  return (
    <div className="counter-wrap">
      {items.map((item, i) => (
        <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: 32 }}>
          {i > 0 && <span className="counter-sep">·</span>}
          <div className="counter-item">
            <div className="counter-num">{item.val}</div>
            <div className="counter-label">{item.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function HeroSection({ quote }) {
  return (
    <section id="hero" className="hero">
      <p className="hero-ornament">✦ &nbsp; Depuis le premier jour &nbsp; ✦</p>
      <h1 className="hero-title">
        {CONFIG.coupleNames.split("&").map((part, i) => (
          <span key={i}>{i === 1 ? <em>&amp;{part}</em> : part}</span>
        ))}
      </h1>
      <p className="hero-quote">"{quote}"</p>
      <Counter />
    </section>
  );
}

function PhotoCard({ src, caption, index, onClick }) {
  return (
    <div className="photo-card" style={index === 1 ? { marginTop: 32 } : index === 4 ? { marginTop: -32 } : {}} onClick={() => onClick(src)}>
      <img src={src} alt="souvenir" loading="lazy" />
      <div className="photo-overlay"><span className="photo-caption">{caption}</span></div>
    </div>
  );
}

function PlaceholderCard({ onClick }) {
  return (
    <div className="photo-card photo-placeholder-card" onClick={onClick}>
      <div className="photo-placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" width="32" height="32" style={{ opacity: 0.5 }}>
          <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
        <span>Ajouter</span>
      </div>
    </div>
  );
}

function GalerieSection({ photos, onAddPhotos, onLightbox }) {
  const fileRef = useRef(null);
  const headerRef = useRef(null);
  const headerVisible = useIntersection(headerRef, { threshold: 0.15 });
  const placeholders = Math.max(6 - photos.length, 0);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = [];
    let loaded = 0;
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        newPhotos.push(ev.target.result);
        loaded++;
        if (loaded === files.length) onAddPhotos(newPhotos);
      };
      reader.readAsDataURL(f);
    });
  };

  return (
    <div id="galerie" className="galerie-section">
      <div ref={headerRef} className={`section-header reveal ${headerVisible ? "visible" : ""}`}>
        <p className="section-tag">✦ Nos souvenirs</p>
        <h2 className="section-title">Notre <em>Galerie</em></h2>
        <div className="divider" />
      </div>
      <div className="photo-grid">
        {photos.map((src, i) => (
          <PhotoCard key={i} src={src} caption={PHOTO_CAPTIONS[i % PHOTO_CAPTIONS.length]} index={i} onClick={onLightbox} />
        ))}
        {Array.from({ length: placeholders }).map((_, i) => (
          <PlaceholderCard key={`ph-${i}`} onClick={() => fileRef.current?.click()} />
        ))}
      </div>
      <div style={{ textAlign: "center" }}>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleFiles} />
        <button className="outline-btn" onClick={() => fileRef.current?.click()}>+ Ajouter des photos</button>
      </div>
    </div>
  );
}

function TimelineItem({ item, index }) {
  const ref = useRef(null);
  const visible = useIntersection(ref, { threshold: 0.2 });
  const isOdd = index % 2 === 0;
  return (
    <div className={`tl-item ${isOdd ? "tl-odd" : "tl-even"}`}>
      <div className="tl-dot" />
      <div ref={ref} className={`tl-content ${visible ? "visible" : ""}`}>
        <span className="tl-emoji">{item.emoji}</span>
        <div className="tl-date">{item.date}</div>
        <div className="tl-title">{item.title}</div>
        <p className="tl-desc">{item.desc}</p>
      </div>
    </div>
  );
}

function AddMomentModal({ onSave, onClose }) {
  const [form, setForm] = useState({ date: "", title: "", desc: "", emoji: "♡" });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">✦ Nouveau moment</h3>
        <div className="modal-field">
          <label>Date</label>
          <input placeholder="ex: Juillet 2024" value={form.date} onChange={set("date")} />
        </div>
        <div className="modal-field">
          <label>Titre</label>
          <input placeholder="Notre premier..." value={form.title} onChange={set("title")} />
        </div>
        <div className="modal-field">
          <label>Description</label>
          <textarea placeholder="Ce moment était..." value={form.desc} onChange={set("desc")} rows={3} />
        </div>
        <div className="modal-field">
          <label>Emoji</label>
          <input placeholder="🌺" value={form.emoji} onChange={set("emoji")} style={{ width: 80 }} />
        </div>
        <div className="modal-actions">
          <button className="outline-btn" onClick={onClose}>Annuler</button>
          <button className="filled-btn" onClick={() => { if (form.date && form.title) { onSave(form); onClose(); } }}>Ajouter ♡</button>
        </div>
      </div>
    </div>
  );
}

function TimelineSection({ moments, onAddMoment }) {
  const [showModal, setShowModal] = useState(false);
  const headerRef = useRef(null);
  const headerVisible = useIntersection(headerRef, { threshold: 0.15 });

  return (
    <section id="timeline" className="timeline-section">
      <div ref={headerRef} className={`section-header reveal ${headerVisible ? "visible" : ""}`}>
        <p className="section-tag">✦ Notre chemin</p>
        <h2 className="section-title">Nos <em>Moments</em></h2>
        <div className="divider" />
      </div>
      <div className="timeline">
        {moments.map((item, i) => <TimelineItem key={i} item={item} index={i} />)}
      </div>
      <div style={{ textAlign: "center", marginTop: 48 }}>
        <button className="outline-btn" onClick={() => setShowModal(true)}>+ Ajouter un moment</button>
      </div>
      {showModal && <AddMomentModal onSave={onAddMoment} onClose={() => setShowModal(false)} />}
    </section>
  );
}

function MessageSection() {
  const ref = useRef(null);
  const visible = useIntersection(ref, { threshold: 0.2 });
  return (
    <div id="message" className="message-section">
      <div ref={ref} className={`msg-inner reveal ${visible ? "visible" : ""}`}>
        <p className="msg-quote">"{CONFIG.loveMessage}"</p>
        <div className="msg-line" />
        <p className="msg-from">Avec tout mon amour ♡</p>
      </div>
    </div>
  );
}

function MusicButton() {
  const [playing, setPlaying] = useState(false);
  const [url, setUrl] = useState(CONFIG.musicUrl);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    audioRef.current.volume = 0.35;
    return () => audioRef.current?.pause();
  }, []);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      let src = url;
      if (!src) {
        src = prompt("Colle l'URL d'une musique MP3 :");
        if (!src) return;
        setUrl(src);
        audioRef.current.src = src;
      } else if (!audioRef.current.src) {
        audioRef.current.src = src;
      }
      audioRef.current.play().catch(() => alert("Impossible de lire ce fichier. Essaie un lien MP3 direct."));
      setPlaying(true);
    }
  };

  return (
    <button className={`music-btn ${playing ? "playing" : ""}`} onClick={toggle} title="Musique">
      {playing ? "‖" : "♪"}
    </button>
  );
}

function Lightbox({ src, onClose }) {
  useEffect(() => {
    const esc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);
  if (!src) return null;
  return (
    <div className="lightbox" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose}>✕</button>
      <img src={src} alt="" onClick={e => e.stopPropagation()} />
    </div>
  );
}

// ============================================================
//  APP
// ============================================================
export default function App() {
  const [entered, setEntered] = useState(false);
  const [photos, setPhotos] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nh_photos") || "[]"); } catch { return []; }
  });
  const [moments, setMoments] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nh_timeline") || "null") || DEFAULT_TIMELINE; } catch { return DEFAULT_TIMELINE; }
  });
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  const addPhotos = useCallback((newOnes) => {
    setPhotos(prev => {
      const updated = [...prev, ...newOnes];
      localStorage.setItem("nh_photos", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addMoment = useCallback((item) => {
    setMoments(prev => {
      const updated = [...prev, item];
      localStorage.setItem("nh_timeline", JSON.stringify(updated));
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
            <p>Fait avec <span style={{ color: "#d4607a" }}>♡</span> rien que pour toi · Notre Histoire</p>
          </footer>
          <MusicButton />
          <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
        </>
      )}
    </>
  );
}
