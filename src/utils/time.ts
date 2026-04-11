import type { TimeDiff } from '../types';

// ============================================================
//  UTILS — time
// ============================================================
export function calcDiff(start: Date): TimeDiff {
  const ms = Date.now() - start.getTime();
  const totalDays = Math.floor(ms / 86400000);
  return {
    years: Math.floor(totalDays / 365),
    months: Math.floor((totalDays % 365) / 30),
    days: totalDays % 30,
    hours: Math.floor((ms % 86400000) / 3600000),
  };
}
