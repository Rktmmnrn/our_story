# Notre Histoire ♡ — React + TypeScript App

Un site web romantique et moderne pour partager vos souvenirs à deux.

## 🌟 Fonctionnalités

- ✨ Animation de pétales lors du lancement
- 🖼️ Galerie de photos interactive avec lightbox
- 📅 Timeline pour vos moments spéciaux
- 📊 Compteur du temps passé ensemble
- 🎵 Lecteur de musique intégré
- 💾 Stockage local (localStorage) des photos et moments
- 📱 Design responsive et élégant
- 🏗️ Architecture modulaire en TypeScript

## 🚀 Démarrage rapide

### Installation
```bash
npm install
```

### Mode développement
```bash
npm run dev
```
Le site s'ouvrira sur `http://localhost:5173`

### Build pour production
```bash
npm run build
```
Crée un dossier `dist/` prêt pour le déploiement.

## ⚙️ Personnalisation

### 1. Modifier les informations du couple

Édite `src/constants/index.ts` et modifie le bloc `CONFIG` :

```typescript
export const CONFIG: AppConfig = {
  startDate: new Date("2025-04-21T00:00:00"),  // Votre date spéciale
  coupleNames: "Just for you",                  // Vos prénoms
  subtitle: "Une histoire à deux",
  loveMessage: "Avec toi, chaque instant...",  // Votre message
  musicUrl: "",                                 // URL MP3 (optionnel)
};
```

### 2. Personnaliser les citations

Dans `src/constants/index.ts`, modifie le tableau `QUOTES` :

```typescript
export const QUOTES: string[] = [
  "Il y a toi, et puis il y a tout le reste.",
  "Tu es ma chose préférée.",
  // Ajoute vos citations...
];
```

### 3. Ajouter la timeline

Modifie `DEFAULT_TIMELINE` dans `src/constants/index.ts` :

```typescript
export const DEFAULT_TIMELINE: TimelineItem[] = [
  { 
    date: "Février 2023", 
    title: "Notre premier regard", 
    desc: "Le moment où tout a commencé...", 
    emoji: "👀" 
  },
  // Ajoute vos moments...
];
```

### 4. Ajouter une musique

Remplace `musicUrl` par un lien direct vers un fichier MP3 :

```typescript
musicUrl: "https://example.com/ta-chanson.mp3"
```

## 📁 Structure du projet

```
src/
├── components/          # Composants React (modularisés)
│   ├── IntroScreen.tsx
│   ├── Navbar.tsx
│   ├── HeroSection.tsx
│   ├── GalerieSection.tsx
│   ├── TimelineSection.tsx
│   ├── MessageSection.tsx
│   ├── MusicButton.tsx
│   ├── Lightbox.tsx
│   └── Counter.tsx
├── constants/index.ts   # Configuration globale
├── types/index.ts       # Types TypeScript
├── utils/time.ts        # Utilitaires (calcul du temps)
├── hooks/useIntersection.ts  # React Hooks
├── App.tsx              # Composant principal
├── main.tsx             # Point d'entrée
└── index.css            # Styles globaux
```

## 🎨 Personnaliser les couleurs

Dans `src/index.css`, modifie les variables CSS :

```css
:root {
  --rose: #f2a7bb;        /* Rose clair */
  --rose-deep: #d4607a;   /* Rose foncé */
  --or: #c9a84c;          /* Doré */
  --cream: #fdf8f2;       /* Crème */
  --dark: #2a1a20;        /* Noir */
}
```

## 💾 Stockage des données

Le site utilise `localStorage` pour sauvegarder :
- Les photos ajoutées via la galerie (`nh_photos`)
- La timeline modifiée (`nh_timeline`)

Les données sont stockées dans le navigateur et peuvent être supprimées via les outils de développement.

## 📦 Déploiement gratuit

### Netlify (recommandé) ⭐
1. Connecte-toi sur [netlify.com](https://netlify.com)
2. Clique en glisse-dépose `npm run build` → dossier `dist/`
3. Ou connecte ton repo GitHub pour un déploiement continu

### Vercel
```bash
npm i -g vercel
vercel
```

### GitHub Pages
1. Ajoute à `vite.config.ts` :
```typescript
export default defineConfig({
  base: '/nom-de-ton-repo/',
  plugins: [react()],
})
```

2. Build et déploie :
```bash
npm run build
git add dist/
git commit -m "Deploy"
git push origin main
```

3. Ajoute une GitHub Actions ou déploie manuellement sur `gh-pages`

## 🛠️ Stack technique

- **React 18** - Libraire UI
- **TypeScript** - Typage statique
- **Vite** - Bundler ultra-rapide
- **CSS3** - Animations et responsivité

## 📝 Licence

Créé avec ❤️ pour vos souvenirs
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
