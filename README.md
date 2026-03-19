# Notre Histoire ♡ — React App

Un site web romantique pour partager vos souvenirs à deux.

## 🚀 Démarrage rapide

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Build pour la production
npm run build
```

## ⚙️ Personnalisation

Ouvre `src/App.jsx` et modifie le bloc `CONFIG` en haut du fichier :

```js
const CONFIG = {
  startDate: new Date("2023-02-14"),  // ← Votre vrai premier jour
  coupleNames: "Toi & Moi",          // ← Vos prénoms
  subtitle: "Une histoire à deux",
  loveMessage: "Ton message d'amour ici...",
  musicUrl: "",                       // ← URL MP3 direct (optionnel)
};
```

Modifie aussi `DEFAULT_TIMELINE` pour y mettre vos vrais moments.

## 📦 Déploiement gratuit

### Netlify (recommandé)
1. `npm run build`
2. Glisse le dossier `dist/` sur [netlify.com/drop](https://app.netlify.com/drop)

### Vercel
```bash
npm i -g vercel
vercel
```

### GitHub Pages
```bash
# Dans vite.config.js, ajoute: base: '/nom-du-repo/'
npm run build
# Push le dossier dist/ sur la branche gh-pages
```

## 🗂️ Structure des composants

```
src/
├── App.jsx          # Composants + logique principale
├── index.css        # Tous les styles
└── main.jsx         # Point d'entrée React
```

### Composants principaux
- `IntroScreen` — Écran d'accueil avec pétales animées
- `Navbar` — Navigation fixe
- `HeroSection` — Section principale avec compteur
- `Counter` — Compteur temps réel depuis votre premier jour
- `GalerieSection` — Grille photos avec upload + lightbox
- `TimelineSection` — Timeline de vos moments
- `AddMomentModal` — Modal pour ajouter un moment
- `MessageSection` — Section message d'amour
- `MusicButton` — Bouton lecture musique
- `Lightbox` — Visionneuse photos plein écran

## 💾 Stockage

Les photos et la timeline sont sauvegardées dans le `localStorage` du navigateur, donc elles persistent entre les visites depuis le même appareil/navigateur.

Pour un stockage cloud (accessible depuis n'importe quel appareil), il faudra intégrer Firebase ou Supabase.
# our_story
