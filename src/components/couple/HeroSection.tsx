import React, { useEffect, useState } from 'react';
import type { Couple, CoupleTimer, User } from '../../types';

interface HeroSectionProps {
  couple: Couple | null;
  timer: CoupleTimer | null;
  user: User | null;
}

function calcLive(anniversary_date: string) {
  const start = new Date(anniversary_date).getTime();
  const diff = Date.now() - start;
  if (diff < 0) return { years: 0, months: 0, days: 0, hours: 0 };
  const totalDays = Math.floor(diff / 86400000);
  return {
    years: Math.floor(totalDays / 365),
    months: Math.floor((totalDays % 365) / 30),
    days: totalDays % 30,
    hours: Math.floor((diff % 86400000) / 3600000),
  };
}

const QUOTES = [
  'Il y a toi, et puis il y a tout le reste.',
  'Tu es mon aventure préférée.',
  'Je t\'aime plus qu\'hier, moins que demain.',
  'Avec toi, même les lundis sont beaux.',
  'Je t\'aime.',
];

export default function HeroSection({ couple, timer, user }: HeroSectionProps) {
  const [diff, setDiff] = useState(() =>
    couple?.anniversary_date ? calcLive(couple.anniversary_date) : null
  );
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  useEffect(() => {
    if (!couple?.anniversary_date) return;
    setDiff(calcLive(couple.anniversary_date));
    const t = setInterval(() => setDiff(calcLive(couple.anniversary_date)), 60000);
    return () => clearInterval(t);
  }, [couple?.anniversary_date]);

  const coupleName = couple?.couple_name || user?.display_name || 'Notre Histoire';

  return (
    <section id="hero" className="hero">
      <p className="hero-ornament">✦ &nbsp;Depuis le premier jour&nbsp; ✦</p>
      <h1 className="hero-title">
        {coupleName.includes('&')
          ? coupleName.split('&').map((part, i) => (
              <span key={i}>{i === 1 ? <em>&amp;{part}</em> : part}</span>
            ))
          : <span>{coupleName}</span>
        }
      </h1>
      <p className="hero-quote">"{quote}"</p>

      {diff ? (
        <div className="counter-wrap">
          {[
            { val: diff.years, label: 'Années' },
            { val: diff.months, label: 'Mois' },
            { val: diff.days, label: 'Jours' },
            { val: diff.hours, label: 'Heures' },
          ].map((item, i) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 32 }}>
              {i > 0 && <span className="counter-sep">·</span>}
              <div className="counter-item">
                <div className="counter-num">{item.val}</div>
                <div className="counter-label">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="hero-no-couple">
          <p>Configurez votre date d'anniversaire pour voir votre compteur ♡</p>
        </div>
      )}

      {timer && (
        <p className="hero-next-ann">
          Prochain anniversaire dans <strong>{timer.next_anniversary_in_days} jours</strong>
        </p>
      )}
    </section>
  );
}
