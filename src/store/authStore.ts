import { create } from 'zustand';
import toast from 'react-hot-toast';
import type { User, Couple } from '../types';
import { authApi, authEvents } from '../services/api';

// ── BroadcastChannel multi-onglets ───────────────────────────
const AUTH_CHANNEL = 'notre_histoire_auth';
let authChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  authChannel = new BroadcastChannel(AUTH_CHANNEL);
}

interface AuthState {
  user: User | null;
  couple: Couple | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: (reason?: 'manual' | 'expired' | 'refresh_failed') => Promise<void>;
  fetchMe: () => Promise<void>;
  setCouple: (couple: Couple | null) => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // ── Abonnement aux événements API (évite l'import circulaire) ──
  authEvents.on('logout:expired', () => get().logout('expired'));
  authEvents.on('logout:refresh_failed', () => get().logout('refresh_failed'));
  authEvents.on('token:refreshed', (payload) => {
    if (payload?.access_token && payload?.refresh_token) {
      // Notifier les autres onglets du refresh
      authChannel?.postMessage({ type: 'TOKEN_REFRESH', payload });
    }
  });

  // ── Sync multi-onglets ───────────────────────────────────────
  authChannel?.addEventListener('message', event => {
    const { type, payload } = event.data;
    switch (type) {
      case 'LOGOUT':
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, couple: null, isAuthenticated: false });
        if (window.location.pathname !== '/') window.location.href = '/';
        break;
      case 'LOGIN':
        set({ user: payload.user, isAuthenticated: true });
        break;
      case 'TOKEN_REFRESH':
        localStorage.setItem('access_token', payload.access_token);
        localStorage.setItem('refresh_token', payload.refresh_token);
        break;
    }
  });

  return {
    user: null,
    couple: null,
    isLoading: false,
    isAuthenticated: !!(
      localStorage.getItem('access_token') || !!localStorage.getItem('refresh_token')
    ),

    login: async (email, password) => {
      set({ isLoading: true });
      try {
        const tokens = await authApi.login(email, password);
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
        const user = await authApi.me();
        set({ user, isAuthenticated: true, isLoading: false });
        authChannel?.postMessage({ type: 'LOGIN', payload: { user } });
      } catch (err) {
        set({ isLoading: false });
        throw err;
      }
    },

    logout: async (reason = 'manual') => {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken && reason === 'manual') {
        try { await authApi.logout(refreshToken); } catch { /* best effort */ }
      }
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({ user: null, couple: null, isAuthenticated: false });
      authChannel?.postMessage({ type: 'LOGOUT', payload: { reason } });

      if (reason === 'expired' || reason === 'refresh_failed') {
        toast.error('Session expirée, reconnectez-vous ♡', { duration: 5000 });
        setTimeout(() => { window.location.href = '/'; }, 1500);
      }
    },

    fetchMe: async () => {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      if (!accessToken && refreshToken) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }
      set({ isLoading: true });

      if (!accessToken && refreshToken) {
        try {
          const tokens = await authApi.refresh(refreshToken);
          localStorage.setItem('access_token', tokens.access_token);
          localStorage.setItem('refresh_token', tokens.refresh_token);
        } catch {
          // Refresh token invalide/expiré → déconnexion silencieuse
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          set({ user: null, isAuthenticated: false, isLoading: false });
          return;
        }
      }
      try {
        const user = await authApi.me();
        set({ user, isAuthenticated: true, isLoading: false });
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    },

    setCouple: couple => set({ couple }),
    setUser: user => set({ user }),
  };
});
