import React, { useState, useEffect } from 'react';
import { CONFIG } from '../constants';
import { calcDiff } from '../utils/time';
import type { TimeDiff } from '../types';

// ============================================================
//  COMPONENT — Counter
// ============================================================
interface CounterItem {
  val: number;
  label: string;
}

function Counter(): React.JSX.Element {
  const [diff, setDiff] = useState<TimeDiff>(() => calcDiff(CONFIG.startDate));

  useEffect(() => {
    const t = setInterval(() => setDiff(calcDiff(CONFIG.startDate)), 60000);
    return () => clearInterval(t);
  }, []);

  const items: CounterItem[] = [
    { val: diff.years, label: 'Années' },
    { val: diff.months, label: 'Mois' },
    { val: diff.days, label: 'Jours' },
    { val: diff.hours, label: 'Heures' },
  ];

  return (
    <div className="counter-wrap">
      {items.map((item, i) => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 32 }}>
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

export default Counter;
