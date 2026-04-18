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
src/
├── pages/
│   ├── LandingPage.tsx     # Page d'accueil publique
│   ├── AppPage.tsx         # Dashboard couple (protégé)
│   ├── AdminPage.tsx       # Dashboard admin (protégé)
│   └── JoinPage.tsx        # Page de rejoindre via token
├── components/
│   ├── auth/AuthModal.tsx  # Modal login/register
│   ├── layout/AppNavbar.tsx
│   ├── couple/             # Sections du dashboard couple
│   │   ├── HeroSection.tsx
│   │   ├── GalerieSection.tsx
│   │   ├── TimelineSection.tsx
│   │   ├── MusicSection.tsx
│   │   ├── QuotesSection.tsx
│   │   ├── MessageSection.tsx
│   │   ├── CoupleSetupModal.tsx
│   │   └── InviteModal.tsx
│   ├── ui/Lightbox.tsx
│   └── ProtectedRoute.tsx
├── services/api.ts          # Tous les appels API
├── store/authStore.ts       # Zustand store auth
├── hooks/useIntersection.ts
├── types/index.ts
└── styles/index.css
```

## 🔐 Flux d'authentification

1. Landing → bouton "Se connecter" → AuthModal
2. Login API → JWT stocké en localStorage
3. Détection auto du rôle `admin` → redirect `/admin`
4. Rôle `user` → redirect `/app`
5. Refresh token automatique via intercepteur Axios

## 🛠️ Corrections backend appliquées

Voir les fichiers `BACKEND_PATCH_*.py` pour les méthodes CRUD manquantes à ajouter.

### Erreurs corrigées :
1. `crud_user.count_active()` — méthode inexistante → ajoutée
2. `crud_user.list_recent()` — méthode inexistante → ajoutée
3. `crud_couple.count_active()` — méthode inexistante → ajoutée
4. `crud_media_item.list_all()` — méthode inexistante → ajoutée
5. `selectinload(MediaItem.uploaded_by)` → corriger en `selectinload(MediaItem.uploader)`
6. `requirements.txt` ligne cassée (`psycopg2-binary==2.9.9aiosqlite==0.20.0`) → séparée

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

