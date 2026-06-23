import { createClient } from '@supabase/supabase-js';
import type { Location, SipReview } from '../types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.local'
  );
}

export type Database = {
  public: {
    Tables: {
      locations: {
        Row: Location;
        Insert: Omit<Location, 'id' | 'created_at' | 'sip_score' | 'sip_score_updated_at'>;
        Update: Partial<Omit<Location, 'id' | 'created_at'>>;
      };
      reviews: {
        Row: SipReview;
        Insert: Omit<SipReview, 'id' | 'created_at'>;
        Update: Partial<Omit<SipReview, 'id' | 'created_at'>>;
      };
      saved_locations: {
        Row: { user_id: string; location_id: string; created_at: string };
        Insert: { user_id: string; location_id: string };
        Update: never;
      };
    };
  };
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
