import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  User, Couple, MediaItem, MusicTrack, SpecialDate, Quote,
  AuthTokens, AdminStats, CoupleTimer, ApiResponse, PaginatedResponse
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// ── Auth event bus ────────────────────────────────────────────────────────────
type AuthEventType = 'logout:expired' | 'logout:refresh_failed' | 'token:refreshed';
type AuthEventHandler = (payload?: { access_token?: string; refresh_token?: string }) => void;
const authListeners = new Map<AuthEventType, AuthEventHandler[]>();

export const authEvents = {
  on(event: AuthEventType, handler: AuthEventHandler) {
    const list = authListeners.get(event) || [];
    authListeners.set(event, [...list, handler]);
  },
  off(event: AuthEventType, handler: AuthEventHandler) {
    const list = authListeners.get(event) || [];
    authListeners.set(event, list.filter(h => h !== handler));
  },
  emit(event: AuthEventType, payload?: { access_token?: string; refresh_token?: string }) {
    (authListeners.get(event) || []).forEach(h => h(payload));
  },
};

// ── Retry config ──────────────────────────────────────────────────────────────
const MAX_RETRIES = 3;
const RETRY_CODES = [408, 429, 500, 502, 503, 504];
interface RetryConfig extends InternalAxiosRequestConfig { _retry?: boolean; _retryCount?: number; }
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── Instance Axios ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// ── Request interceptor ───────────────────────────────────────────────────────
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor ──────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v?: unknown) => void; reject: (e?: unknown) => void }> = [];
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token));
  failedQueue = [];
};

api.interceptors.response.use(
  res => res,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig;
    if (!original) return Promise.reject(error);

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        isRefreshing = false;
        processQueue(new Error('No refresh token'), null);
        authEvents.emit('logout:expired');
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, null, {
          params: { refresh_token: refreshToken },
        });
        const tokens = data.data as AuthTokens;
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
        authEvents.emit('token:refreshed', { access_token: tokens.access_token, refresh_token: tokens.refresh_token });
        original.headers.Authorization = `Bearer ${tokens.access_token}`;
        isRefreshing = false;
        processQueue(null, tokens.access_token);
        return api(original);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        authEvents.emit('logout:refresh_failed');
        return Promise.reject(refreshError);
      }
    }

    const retryCount = original._retryCount || 0;
    const noResponse = !error.response && !!error.message;
    const retryStatus = error.response && RETRY_CODES.includes(error.response.status);
    if (retryCount < MAX_RETRIES && (noResponse || retryStatus)) {
      original._retryCount = retryCount + 1;
      await sleep(1000 * Math.pow(2, retryCount));
      return api(original);
    }

    return Promise.reject(error);
  }
);

// ── Upload XHR avec progression réelle ────────────────────────────────────────
/**
 * Upload un fichier avec suivi de progression réel (0–100%).
 * Utilise XMLHttpRequest pour avoir accès aux events de progression.
 */
export function uploadWithProgress(
  endpoint: string,
  formData: FormData,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const token = localStorage.getItem('access_token');

    xhr.open('POST', `${BASE_URL}${endpoint}`);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    // Progression upload
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          resolve(xhr.responseText);
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err?.detail || `HTTP ${xhr.status}`));
        } catch {
          reject(new Error(`HTTP ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Erreur réseau lors de l\'upload')));
    xhr.addEventListener('abort', () => reject(new Error('Upload annulé')));

    // Support AbortController
    if (signal) {
      signal.addEventListener('abort', () => xhr.abort());
    }

    xhr.send(formData);
  });
}

// ============================================================
//  AUTH
// ============================================================
export const authApi = {
  register: async (email: string, password: string, display_name: string): Promise<User> => {
    const { data } = await api.post<ApiResponse<User>>('/auth/register', new URLSearchParams({ email, password, display_name }));
    return data.data;
  },
  login: async (email: string, password: string): Promise<AuthTokens> => {
    const { data } = await api.post<ApiResponse<AuthTokens>>('/auth/login', new URLSearchParams({ email, password }));
    return data.data;
  },
  refresh: async (refresh_token: string): Promise<AuthTokens> => {
    const { data } = await axios.post<ApiResponse<AuthTokens>>(
      `${BASE_URL}/auth/refresh`,
      new URLSearchParams({ refresh_token }),
    );
    return data.data;
  },
  logout: async (refresh_token: string): Promise<void> => {
    await api.post('/auth/logout', new URLSearchParams({ refresh_token }));
  },
  me: async (): Promise<User> => {
    const { data } = await api.get<ApiResponse<User>>('/auth/me');
    return data.data;
  },
  updateMe: async (display_name?: string) => {
    const { data } = await api.patch<ApiResponse<{ display_name: string }>>('/auth/me', null, { params: { display_name } });
    return data.data;
  },
  uploadAvatar: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post<ApiResponse<{ avatar_url: string }>>('/auth/me/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    return data.data;
  },
};

// ============================================================
//  COUPLE
// ============================================================
export const coupleApi = {
  create: async (anniversary_date: string, couple_name?: string): Promise<Couple> => {
    const { data } = await api.post<ApiResponse<Couple>>('/couple/', null, { params: { anniversary_date, couple_name } });
    return data.data;
  },
  get: async (): Promise<Couple> => {
    const { data } = await api.get<ApiResponse<Couple>>('/couple/');
    return data.data;
  },
  update: async (anniversary_date?: string, couple_name?: string): Promise<Couple> => {
    const { data } = await api.patch<ApiResponse<Couple>>('/couple/', null, { params: { anniversary_date, couple_name } });
    return data.data;
  },
  dissolve: async (): Promise<void> => { await api.delete('/couple/'); },
  invite: async (recipient_email: string) => {
    const { data } = await api.post('/couple/invite', null, { params: { recipient_email } });
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
//  MEDIA — upload avec progression
// ============================================================
export const mediaApi = {
  list: async (page = 1, per_page = 50): Promise<PaginatedResponse<MediaItem>> => {
    const { data } = await api.get<PaginatedResponse<MediaItem>>('/media/', { params: { page, per_page } });
    return data;
  },
  /**
   * Upload avec barre de progression.
   * @param onProgress callback (0–100)
   * @param signal AbortController.signal pour annuler
   */
  upload: async (
    file: File,
    media_type: 'photo' | 'video',
    opts?: { title?: string; description?: string; taken_at?: string },
    onProgress?: (percent: number) => void,
    signal?: AbortSignal,
  ) => {
    const form = new FormData();
    form.append('file', file);
    form.append('media_type', media_type);
    if (opts?.title) form.append('title', opts.title);
    if (opts?.description) form.append('description', opts.description);
    if (opts?.taken_at) form.append('taken_at', opts.taken_at);

    const result = await uploadWithProgress('/media/', form, onProgress, signal) as ApiResponse<{ id: string }>;
    return result.data;
  },
  delete: async (id: string): Promise<void> => { await api.delete(`/media/${id}`); },
  getFileUrl: (id: string) => `${BASE_URL}/media/${id}/file`,
};

// ============================================================
//  MUSIC — upload avec progression
// ============================================================
export const musicApi = {
  list: async (): Promise<MusicTrack[]> => {
    const { data } = await api.get<ApiResponse<MusicTrack[]>>('/music/');
    return data.data;
  },
  upload: async (
    file: File,
    title: string,
    artist?: string,
    onProgress?: (percent: number) => void,
  ): Promise<MusicTrack> => {
    const form = new FormData();
    form.append('file', file);
    form.append('title', title);
    if (artist) form.append('artist', artist);

    const result = await uploadWithProgress('/music/', form, onProgress) as ApiResponse<MusicTrack>;
    return result.data;
  },
  update: async (id: string, updates: { title?: string; artist?: string; is_active?: boolean }) => {
    const { data } = await api.patch(`/music/${id}`, null, { params: updates });
    return data.data;
  },
  delete: async (id: string): Promise<void> => { await api.delete(`/music/${id}`); },
  getFileUrl: (id: string) => `${BASE_URL}/music/${id}/file`,
};

// ============================================================
//  DATES
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
  delete: async (id: string): Promise<void> => { await api.delete(`/dates/${id}`); },
};

// ============================================================
//  QUOTES
// ============================================================
export const quotesApi = {
  list: async (favorites_only = false): Promise<Quote[]> => {
    const { data } = await api.get<ApiResponse<Quote[]>>('/quotes/', { params: { favorites_only } });
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
  delete: async (id: string): Promise<void> => { await api.delete(`/quotes/${id}`); },
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
    const { data } = await api.get<PaginatedResponse<User>>('/admin/users', { params: { page, per_page } });
    return data;
  },
  updateUser: async (id: string, updates: { is_active?: boolean; role?: string }) => {
    const { data } = await api.patch(`/admin/users/${id}`, null, { params: updates });
    return data.data;
  },
  deleteUser: async (id: string): Promise<void> => { await api.delete(`/admin/users/${id}`); },
  listCouples: async (page = 1, per_page = 20) => {
    const { data } = await api.get('/admin/couples', { params: { page, per_page } });
    return data;
  },
  deleteCouple: async (id: string): Promise<void> => { await api.delete(`/admin/couples/${id}`); },
  listMedia: async (page = 1, per_page = 20) => {
    const { data } = await api.get('/admin/media', { params: { page, per_page } });
    return data;
  },
  deleteMedia: async (id: string): Promise<void> => { await api.delete(`/admin/media/${id}`); },
};

export default api;