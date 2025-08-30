import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Confession = {
  is_verified: any;
  id: string;
  target_name: string;
  message: string;
  song_url?: string;
  song_embed_id?: string;
  is_approved: boolean;
  created_at: string;
  unique_slug: string;
   like_count?: number;     // field baru
  user_has_liked?: boolean;
};