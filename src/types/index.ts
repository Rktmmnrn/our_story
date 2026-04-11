// ============================================================
//  TYPES
// ============================================================

export interface TimelineItem {
  date: string;
  title: string;
  desc: string;
  emoji: string;
}

export interface PetalConfig {
  id: number;
  left: string;
  color: string;
  duration: string;
  delay: string;
  width: string;
  height: string;
  rotate: string;
}

export interface AppConfig {
  startDate: Date;
  coupleNames: string;
  subtitle: string;
  loveMessage: string;
  musicUrl: string;
}

export interface TimeDiff {
  years: number;
  months: number;
  days: number;
  hours: number;
}
