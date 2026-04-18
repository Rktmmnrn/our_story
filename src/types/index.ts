// ============================================================
//  TYPES — Notre Histoire Frontend
// ============================================================

export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
}

export interface Couple {
  id: string;
  couple_name: string | null;
  anniversary_date: string;
  user1_id: string;
  user2_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface MediaItem {
  id: string;
  media_type: 'photo' | 'video';
  original_filename: string;
  title: string | null;
  description: string | null;
  file_size_bytes: number;
  mime_type: string;
  taken_at: string | null;
  created_at: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string | null;
  duration_seconds: number | null;
  is_active: boolean;
  created_at: string;
}

export interface SpecialDate {
  id: string;
  title: string;
  event_date: string;
  description: string | null;
  emoji: string | null;
  created_at: string;
}

export interface Quote {
  id: string;
  text: string;
  author: string | null;
  is_favorite: boolean;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AdminStats {
  total_users: number;
  active_users: number;
  total_couples: number;
  active_couples: number;
  total_media: number;
  total_photos: number;
  total_videos: number;
  total_music_tracks: number;
  total_special_dates: number;
  total_quotes: number;
  disk_usage_mb: Record<string, number>;
  recent_users: User[];
}

export interface CoupleTimer {
  days_together: number;
  anniversary_date: string;
  next_anniversary_in_days: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  message: string;
}
