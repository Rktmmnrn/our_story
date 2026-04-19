# Notre Histoire ♡ — Frontend v2.0

Frontend React + TypeScript connecté au backend FastAPI.

## 🚀 Démarrage rapide

```bash
npm install
cp .env.example .env.local
# Éditer .env.local avec l'URL de votre backend
npm run dev
```

## 🏗️ Architecture

```
notre-histoire/
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── admin/
│   │   │   └── AdminUsersTable.tsx
│   │   ├── auth/            # AuthModal (login/register)
│   │   │   ├── AuthModal.tsx
│   │   │   └── ProfileModal.tsx
│   │   ├── couple/          # Composants du dashboard couple
│   │   │   ├── HeroSection.tsx       # Section héros (photo + date)
│   │   │   ├── GalerieSection.tsx    # Galerie photos/vidéos
│   │   │   ├── TimelineSection.tsx   # Chronologie des événements
│   │   │   ├── MusicSection.tsx      # Playlist partagée
│   │   │   ├── QuotesSection.tsx     # Citations romantiques
│   │   │   ├── MessageSection.tsx    # Messages entre partenaires
│   │   │   ├── CoupleSetupModal.tsx  # Configuration du couple
│   │   │   └── InviteModal.tsx       # Invitation partenaire
│   │   ├── layout/          # Composants de mise en page
│   │   │   ├── AppNavbar.tsx         # Navigation principale
│   │   ├── ui/              # Composants UI génériques
│   │   │   ├── Lightbox.tsx          # Visionneuse média
│   │   └── ProtectedRoute.tsx        # Route protégée par auth
│   │   └── ErrorBoundary.tsx        # Route protégée par auth
│   ├── pages/               # Pages principales
│   │   ├── LandingPage.tsx  # Page d'accueil publique
│   │   ├── AppPage.tsx      # Dashboard couple (protégé)
│   │   ├── AdminPage.tsx    # Dashboard admin (protégé)
│   │   └── JoinPage.tsx     # Rejoindre via token
│   ├── services/            # Couche API
│   │   ├── api.ts           # Instance Axios + intercepteurs
│   ├── store/               # State management Zustand
│   │   ├── authStore.ts     # Store authentification
│   ├── hooks/               # Hooks personnalisés
│   │   ├── useIntersection.ts    # Intersection Observer
│   │   ├── useNetworkStatus.ts
│   ├── types/               # Types TypeScript
│   │   └── index.ts         # Types globaux
│   ├── styles/
│   │   └── index.css
│   ├── App.tsx              # Routeur principal
│   ├── main.tsx             # Point d'entrée
│   └── vite-env.d.ts
```

## 🔐 Flux d'authentification

1. Landing → bouton "Se connecter" → AuthModal
2. Login API → JWT stocké en localStorage
3. Détection auto du rôle `admin` → redirect `/admin`
4. Rôle `user` → redirect `/app`
5. Refresh token automatique via intercepteur Axios

## 🛠️ Corrections backend appliquées

Voir les fichiers `BACKEND_PATCH_*.py` pour les méthodes CRUD manquantes à ajouter.

## 📦 Déploiement

### Vercel (recommandé)
```bash
npm run build
# Connecter le repo GitHub à Vercel
# Ajouter VITE_API_URL dans les variables d'environnement Vercel
```

### Render
```bash
# Build command: npm run build
# Output directory: dist
# Ajouter VITE_API_URL dans les env vars Render
```

