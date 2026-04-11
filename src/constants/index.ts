import type { AppConfig, PetalConfig, TimelineItem } from '../types';

// ============================================================
//  CONFIG
// ============================================================
export const CONFIG: AppConfig = {
  startDate: new Date("2025-04-21T00:00:00"),
  coupleNames: "Just for you",
  subtitle: "Une histoire à deux",
  loveMessage: "Avec toi, chaque instant devient un souvenir que je veux garder pour toujours.",
  musicUrl: "",
};

export const QUOTES: string[] = [
  "Il y a toi, et puis il y a tout le reste.",
  "Tu es ma chose préférée.",
  "Avec toi, même les lundis sont beaux",
  "Tu es mon aventure préférée.",
  "Je t'aime plus qu'hier, moins que demain.",
];

export const DEFAULT_TIMELINE: TimelineItem[] = [
  { date: "Février 2023", title: "Notre premier regard", desc: "Le moment où tout a commencé, un regard qui a tout changé.", emoji: "👀" },
  { date: "Mars 2023", title: "Notre premier rendez-vous", desc: "Ce soir là, on a parlé pendant des heures sans voir le temps passer.", emoji: "☕" },
  { date: "Juin 2023", title: "Notre premier voyage", desc: "La première aventure à deux, le premier « nous ».", emoji: "✈️" },
  { date: "Décembre 2023", title: "Notre premier Noël", desc: "Enveloppés dans la magie de l'hiver, ensemble.", emoji: "🎄" },
  { date: "Février 2024", title: "Notre premier anniversaire", desc: "Un an de bonheur, de rires, et d'amour grandissant.", emoji: "🌹" },
];

export const PHOTO_CAPTIONS: string[] = [
  "Notre histoire",
  "Un moment précieux",
  "Rien que nous deux",
  "Un souvenir gravé",
  "Toujours ensemble",
  "Plein de bonheur",
];

export const PETAL_COLORS: string[] = [
  "#f2a7bb",
  "#d4607a",
  "#f5e6c0",
  "#c9a84c",
  "#fdf0f4",
];

export const PETALS: PetalConfig[] = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
  duration: `${3 + Math.random() * 5}s`,
  delay: `${Math.random() * 4}s`,
  width: `${8 + Math.random() * 8}px`,
  height: `${10 + Math.random() * 10}px`,
  rotate: `${Math.random() * 360}deg`,
}));
