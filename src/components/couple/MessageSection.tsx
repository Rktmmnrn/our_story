import React from 'react';
import type { Couple } from '../../types';
import { useIntersection } from '../../hooks/useIntersection';

const DEFAULT_MESSAGE = 'Avec toi, chaque instant devient un souvenir que je veux garder pour toujours.';

export default function MessageSection({ couple }: { couple: Couple | null }) {
  const [ref, visible] = useIntersection({ threshold: 0.2 });

  return (
    <div id="message" className="message-section">
      <div ref={ref} className={`msg-inner reveal ${visible ? 'visible' : ''}`}>
        <p className="msg-quote">"{DEFAULT_MESSAGE}"</p>
        <div className="msg-line" />
        <p className="msg-from">Avec tout mon amour ♡</p>
        {couple?.couple_name && (
          <p className="msg-couple-name">{couple.couple_name}</p>
        )}
      </div>
    </div>
  );
}
