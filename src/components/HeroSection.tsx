import React from 'react';
import { CONFIG } from '../constants';
import Counter from './Counter';

// ============================================================
//  COMPONENT — HeroSection
// ============================================================
interface HeroSectionProps {
  quote: string;
}

function HeroSection({ quote }: HeroSectionProps): React.JSX.Element {
  return (
    <section id="hero" className="hero">
      <p className="hero-ornament">✦ &nbsp; Depuis le premier jour &nbsp; ✦</p>
      <h1 className="hero-title">
        {CONFIG.coupleNames.split('&').map((part, i) => (
          <span key={i}>{i === 1 ? <em>&amp;{part}</em> : part}</span>
        ))}
      </h1>
      <p className="hero-quote">"{quote}"</p>
      <Counter />
    </section>
  );
}

export default HeroSection;
