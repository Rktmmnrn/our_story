// src/store/authStore.ts
import { create } from 'zustand';
import toast from 'react-hot-toast';
import type { User, Couple } from '../types';
import { authApi } from '../services/api';

const AUTH_CHANNEL = 'amourflow_auth_sync';

interface AuthState {
  user: User | null;
  couple: Couple | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionExpiredMessage: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: (reason?: 'manual' | 'expired' | 'refresh_failed') => Promise<void>;
  fetchMe: () => Promise<void>;
  setCouple: (couple: Couple | null) => void;
  setUser: (user: User) => void;
  clearSessionExpiredMessage: () => void;
}

// BroadcastChannel pour sync multi-onglets
let authChannel: BroadcastChannel | null = null;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  authChannel = new BroadcastChannel(AUTH_CHANNEL);
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Écoute des messages inter-onglets
  authChannel?.addEventListener('message', (event) => {
    const { type, payload } = event.data;

    switch (type) {
      case 'LOGOUT':
        // Un autre onglet s'est déconnecté
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({
          user: null,
          couple: null,
          isAuthenticated: false,
          sessionExpiredMessage: payload?.message || null,
        });
        
        // Redirection silencieuse si pas déjà sur /login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        break;

      case 'LOGIN':
        // Un autre onglet s'est connecté
        set({
          user: payload.user,
          isAuthenticated: true,
          sessionExpiredMessage: null,
        });
        break;

      case 'TOKEN_REFRESH':
        // Token rafraîchi dans un autre onglet
        localStorage.setItem('access_token', payload.access_token);
        localStorage.setItem('refresh_token', payload.refresh_token);
        break;
    }
  });

  return {
    user: null,
    couple: null,
    isLoading: false,
    isAuthenticated: !!localStorage.getItem('access_token'),
    sessionExpiredMessage: null,

    login: async (email, password) => {
      set({ isLoading: true });
      try {
        const tokens = await authApi.login(email, password);
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
        
        const user = await authApi.me();
        
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          sessionExpiredMessage: null,
        });

        // Notifier les autres onglets
        authChannel?.postMessage({ type: 'LOGIN', payload: { user } });
        
        toast.success(`Bienvenue ${user.display_name} ♡`);
      } catch (err: any) {
        set({ isLoading: false });
        throw err;
      }
    },

    logout: async (reason = 'manual') => {
      const refreshToken = localStorage.getItem('refresh_token');
      
      // Message personnalisé selon la raison
      let message: string | null = null;
      if (reason === 'expired') {
        message = 'Votre session a expiré, reconnectez-vous ♡';
      } else if (reason === 'refresh_failed') {
        message = 'Votre session a expiré, reconnectez-vous ♡';
      }

      // Tentative de logout côté serveur (best effort)
      if (refreshToken && reason === 'manual') {
        try {
          await authApi.logout(refreshToken);
        } catch {
          // Ignore les erreurs de logout serveur
        }
      }

      // Nettoyage local
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      set({
        user: null,
        couple: null,
        isAuthenticated: false,
        sessionExpiredMessage: message,
      });

      // Notifier les autres onglets
      authChannel?.postMessage({
        type: 'LOGOUT',
        payload: { message },
      });

      // Afficher le message si déconnexion automatique
      if (message && reason !== 'manual') {
        toast.error(message, { duration: 5000 });
      }
    },

    fetchMe: async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      set({ isLoading: true });
      try {
        const user = await authApi.me();
        set({ user, isAuthenticated: true, isLoading: false });
      } catch (err: any) {
        // Si erreur 401, le refresh sera tenté automatiquement par l'interceptor
        // Si ça échoue, on nettoie
        if (err.response?.status === 401) {
          get().logout('expired');
        }
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    },

    setCouple: (couple) => set({ couple }),
    setUser: (user) => set({ user }),
    clearSessionExpiredMessage: () => set({ sessionExpiredMessage: null }),
  };
});

// Fonction utilitaire pour notifier les autres onglets d'un refresh token
export const notifyTokenRefresh = (access_token: string, refresh_token: string) => {
  authChannel?.postMessage({
    type: 'TOKEN_REFRESH',
    payload: { access_token, refresh_token },
  });
};