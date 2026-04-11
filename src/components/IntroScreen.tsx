import React from 'react';
import { PETALS, CONFIG } from '../constants';

// ============================================================
//  COMPONENT — IntroScreen
// ============================================================
interface IntroScreenProps {
  onEnter: () => void;
}

function IntroScreen({ onEnter }: IntroScreenProps): React.JSX.Element {
  return (
    <div className="intro">
      <div className="petals-container">
        {PETALS.map((p) => (
          <div
            key={p.id}
            className="petal"
            style={{
              left: p.left,
              background: p.color,
              animationDuration: p.duration,
              animationDelay: p.delay,
              width: p.width,
              height: p.height,
              transform: `rotate(${p.rotate})`,
            }}
          />
        ))}
      </div>
      <div className="intro-heart">♡</div>
      <h1 className="intro-title">Notre Histoire</h1>
      <p className="intro-subtitle">{CONFIG.subtitle}</p>
      <button className="intro-btn" onClick={onEnter}>
        Entrer ✦
      </button>
    </div>
  );
}

export default IntroScreen;
