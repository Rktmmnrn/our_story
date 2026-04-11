import React, { useRef } from 'react';
import { CONFIG } from '../constants';
import useIntersection from '../hooks/useIntersection';

// ============================================================
//  COMPONENT — MessageSection
// ============================================================
function MessageSection(): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useIntersection(ref, { threshold: 0.2 });

  return (
    <div id="message" className="message-section">
      <div ref={ref} className={`msg-inner reveal ${visible ? 'visible' : ''}`}>
        <p className="msg-quote">"{CONFIG.loveMessage}"</p>
        <div className="msg-line" />
        <p className="msg-from">Avec tout mon amour ♡</p>
      </div>
    </div>
  );
}

export default MessageSection;
