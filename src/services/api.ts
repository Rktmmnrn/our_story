// src/services/api.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';
import type {
  User, Couple, MediaItem, MusicTrack, SpecialDate, Quote,
  AuthTokens, AdminStats, CoupleTimer, ApiResponse, PaginatedResponse
} from '../types';
import { notifyTokenRefresh } from '../store/authStore';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// ── Configuration Retry ──────────────────────────────────────
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_BASE = 1000; // 1s
const RETRY_STATUS_CODES = [408, 429, 500, 502, 503, 504];

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
}

// ── Instance Axios ───────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000, // 30s timeout par défaut
});

// ── Utilities ────────────────────────────────────────────────
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getRetryDelay = (retryCount: number): number => {
  // Exponential backoff: 1s, 2s, 4s
  return RETRY_DELAY_BASE * Math.pow(2, retryCount);
};

const isNetworkError = (error: AxiosError): boolean => {
  return !error.response && Boolean(error.message);
};

const shouldRetry = (error: AxiosError, config: RetryConfig): boolean => {
  if (!config || config._retryCount! >= MAX_RETRY_ATTEMPTS) return false;

  // Retry sur erreurs réseau
  if (isNetworkError(error)) return true;

  // Retry sur certains status codes
  if (error.response && RETRY_STATUS_CODES.includes(error.response.status)) {
    return true;
  }

  return false;
};

// ── Request Interceptor ──────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor avec Retry Logic ───────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // ── Gestion 401 (Token Expired) ──────────────────────────
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Une requête de refresh est déjà en cours, on met en queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        isRefreshing = false;
        processQueue(new Error('No refresh token'), null);
        
        // Redirect vers login avec message
        const { useAuthStore } = await import('../store/authStore');
        useAuthStore.getState().logout('expired');
        
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, null, {
          params: { refresh_token: refreshToken },
        });
        
        const tokens = data.data as AuthTokens;
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);

        // Notifier les autres onglets
        notifyTokenRefresh(tokens.access_token, tokens.refresh_token);

        // Mettre à jour la requête originale
        originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`;
        
        isRefreshing = false;
        processQueue(null, tokens.access_token);

        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);

        // Refresh token expiré ou invalide
        const { useAuthStore } = await import('../store/authStore');
        useAuthStore.getState().logout('refresh_failed');

        return Promise.reject(refreshError);
      }
    }

    // ── Retry Logic (Network errors, 5xx, etc.) ─────────────
    if (shouldRetry(error, originalRequest)) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      const delay = getRetryDelay(originalRequest._retryCount - 1);

      // Message utilisateur pour les uploads longs
      if (originalRequest.headers['Content-Type']?.includes('multipart/form-data')) {
        if (originalRequest._retryCount === 1) {
          toast.loading(
            `Problème réseau détecté, nouvelle tentative... (${originalRequest._retryCount}/${MAX_RETRY_ATTEMPTS})`,
            { id: 'retry-toast' }
          );
        } else {
          toast.loading(
            `Tentative ${originalRequest._retryCount}/${MAX_RETRY_ATTEMPTS}...`,
            { id: 'retry-toast' }
          );
        }
      }

      await sleep(delay);

      return api(originalRequest).catch((retryError) => {
        // Si dernière tentative échouée
        if (originalRequest._retryCount === MAX_RETRY_ATTEMPTS) {
          toast.dismiss('retry-toast');
          
          if (isNetworkError(retryError as AxiosError)) {
            toast.error('Impossible de joindre le serveur. Vérifiez votre connexion ♡', {
              duration: 5000,
            });
          } else {
            toast.error('Une erreur est survenue. Veuillez réessayer plus tard ♡', {
              duration: 5000,
            });
          }
        }
        return Promise.reject(retryError);
      });
    }

    // ── Gestion erreurs spécifiques ──────────────────────────
    if (error.response?.status === 403) {
      toast.error("Vous n'avez pas la permission d'effectuer cette action ♡");
    } else if (error.response?.status === 404) {
      // Silencieux pour les 404, géré par les composants
    } else if (error.response?.status === 422) {
      // Erreur de validation, géré par les formulaires
    } else if (error.response?.status >= 500) {
      toast.error('Le serveur rencontre des difficultés. Veuillez réessayer ♡', {
        duration: 5000,
      });
    }

    return Promise.reject(error);
  }
);

// ============================================================
//  AUTH
// ============================================================
export const authApi = {
  register: async (email: string, password: string, display_name: string) => {
    const { data } = await api.post<ApiResponse<User>>('/auth/register', null, {
      params: { email, password, display_name },
    });
    return data.data;
  },

  login: async (email: string, password: string): Promise<AuthTokens> => {
    const { data } = await api.post<ApiResponse<AuthTokens>>('/auth/login', null, {
      params: { email, password },
    });
    return data.data;
  },

  logout: async (refresh_token: string) => {
    await api.post('/auth/logout', null, { params: { refresh_token } });
  },

  me: async (): Promise<User> => {
    const { data } = await api.get<ApiResponse<User>>('/auth/me');
    return data.data;
  },

  updateMe: async (display_name?: string) => {
    const { data } = await api.patch<ApiResponse<{ display_name: string }>>('/auth/me', null, {
      params: { display_name },
    });
    return data.data;
  },

  uploadAvatar: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post<ApiResponse<{ avatar_url: string }>>('/auth/me/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000, // 60s pour upload
    });
    return data.data;
  },
};

// ============================================================
//  COUPLE
// ============================================================
export const coupleApi = {
  create: async (anniversary_date: string, couple_name?: string) => {
    const { data } = await api.post<ApiResponse<Couple>>('/couple/', null, {
      params: { anniversary_date, couple_name },
    });
    return data.data;
  },

  get: async (): Promise<Couple> => {
    const { data } = await api.get<ApiResponse<Couple>>('/couple/');
    return data.data;
  },

  update: async (anniversary_date?: string, couple_name?: string) => {
    const { data } = await api.patch<ApiResponse<Couple>>('/couple/', null, {
      params: { anniversary_date, couple_name },
    });
    return data.data;
  },

  dissolve: async () => {
    await api.delete('/couple/');
  },

  invite: async (recipient_email: string) => {
    const { data } = await api.post('/couple/invite', null, {
      params: { recipient_email },
    });
    return data.data;
  },

  join: async (token: string) => {
    const { data } = await api.post(`/couple/join/${token}`);
    return data.data;
  },

  timer: async (): Promise<CoupleTimer> => {
    const { data } = await api.get<ApiResponse<CoupleTimer>>('/couple/timer');
    return data.data;
  },
};

// ============================================================
//  MEDIA
// ============================================================
export const mediaApi = {
  list: async (page = 1, per_page = 20): Promise<PaginatedResponse<MediaItem>> => {
    const { data } = await api.get<PaginatedResponse<MediaItem>>('/media/', {
      params: { page, per_page },
    });
    return data;
  },

  upload: async (
    file: File,
    media_type: 'photo' | 'video',
    opts?: { title?: string; description?: string; taken_at?: string }
  ) => {
    const form = new FormData();
    form.append('file', file);
    form.append('media_type', media_type);
    if (opts?.title) form.append('title', opts.title);
    if (opts?.description) form.append('description', opts.description);
    if (opts?.taken_at) form.append('taken_at', opts.taken_at);
    
    const { data } = await api.post<ApiResponse<{ id: string }>>('/media/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000, // 2min pour uploads vidéo
    });
    return data.data;
  },

  delete: async (id: string) => {
    await api.delete(`/media/${id}`);
  },

  getFileUrl: (id: string) => `${BASE_URL}/media/${id}/file`,
};

// ============================================================
//  MUSIC
// ============================================================
export const musicApi = {
  list: async (): Promise<MusicTrack[]> => {
    const { data } = await api.get<ApiResponse<MusicTrack[]>>('/music/');
    return data.data;
  },

  upload: async (file: File, title: string, artist?: string) => {
    const form = new FormData();
    form.append('file', file);
    form.append('title', title);
    if (artist) form.append('artist', artist);
    
    const { data } = await api.post<ApiResponse<MusicTrack>>('/music/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000, // 2min
    });
    return data.data;
  },

  update: async (id: string, updates: { title?: string; artist?: string; is_active?: boolean }) => {
    const { data } = await api.patch(`/music/${id}`, null, { params: updates });
    return data.data;
  },

  delete: async (id: string) => {
    await api.delete(`/music/${id}`);
  },

  getFileUrl: (id: string) => `${BASE_URL}/music/${id}/file`,
};

// ============================================================
//  DATES SPÉCIALES
// ============================================================
export const datesApi = {
  list: async (): Promise<SpecialDate[]> => {
    const { data } = await api.get<ApiResponse<SpecialDate[]>>('/dates/');
    return data.data;
  },

  create: async (payload: { title: string; event_date: string; description?: string; emoji?: string }) => {
    const { data } = await api.post('/dates/', null, { params: payload });
    return data.data;
  },

  update: async (id: string, payload: Partial<{ title: string; event_date: string; description: string; emoji: string }>) => {
    const { data } = await api.patch(`/dates/${id}`, null, { params: payload });
    return data.data;
  },

  delete: async (id: string) => {
    await api.delete(`/dates/${id}`);
  },
};

// ============================================================
//  QUOTES
// ============================================================
export const quotesApi = {
  list: async (favorites_only = false): Promise<Quote[]> => {
    const { data } = await api.get<ApiResponse<Quote[]>>('/quotes/', {
      params: { favorites_only },
    });
    return data.data;
  },

  create: async (text: string, author?: string) => {
    const { data } = await api.post('/quotes/', null, { params: { text, author } });
    return data.data;
  },

  update: async (id: string, updates: { text?: string; author?: string; is_favorite?: boolean }) => {
    const { data } = await api.patch(`/quotes/${id}`, null, { params: updates });
    return data.data;
  },

  delete: async (id: string) => {
    await api.delete(`/quotes/${id}`);
  },
};

// ============================================================
//  ADMIN
// ============================================================
export const adminApi = {
  stats: async (): Promise<AdminStats> => {
    const { data } = await api.get<ApiResponse<AdminStats>>('/admin/stats');
    return data.data;
  },

  listUsers: async (page = 1, per_page = 20) => {
    const { data } = await api.get<PaginatedResponse<User>>('/admin/users', {
      params: { page, per_page },
    });
    return data;
  },

  getUser: async (id: string): Promise<User> => {
    const { data } = await api.get<ApiResponse<User>>(`/admin/users/${id}`);
    return data.data;
  },

  updateUser: async (id: string, updates: { is_active?: boolean; role?: string }) => {
    const { data } = await api.patch(`/admin/users/${id}`, null, { params: updates });
    return data.data;
  },

  deleteUser: async (id: string) => {
    await api.delete(`/admin/users/${id}`);
  },

  listCouples: async (page = 1, per_page = 20) => {
    const { data } = await api.get('/admin/couples', { params: { page, per_page } });
    return data;
  },

  deleteCouple: async (id: string) => {
    await api.delete(`/admin/couples/${id}`);
  },

  listMedia: async (page = 1, per_page = 20) => {
    const { data } = await api.get('/admin/media', { params: { page, per_page } });
    return data;
  },

  deleteMedia: async (id: string) => {
    await api.delete(`/admin/media/${id}`);
  },
};

export default api;