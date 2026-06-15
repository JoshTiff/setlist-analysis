export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      artists: {
        Row: {
          mbid: string;
          name: string;
          sort_name: string | null;
          disambiguation: string | null;
          slug: string;
          setlistfm_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          mbid: string;
          name: string;
          sort_name?: string | null;
          disambiguation?: string | null;
          slug: string;
          setlistfm_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          mbid?: string;
          name?: string;
          sort_name?: string | null;
          disambiguation?: string | null;
          slug?: string;
          setlistfm_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tours: {
        Row: {
          id: string;
          artist_mbid: string;
          name: string;
          slug: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          artist_mbid: string;
          name: string;
          slug: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          artist_mbid?: string;
          name?: string;
          slug?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      shows: {
        Row: {
          setlistfm_id: string;
          version_id: string | null;
          artist_mbid: string;
          tour_id: string | null;
          tour_name: string;
          tour_slug: string;
          event_date: string | null;
          venue_name: string | null;
          city_name: string | null;
          state_name: string | null;
          state_code: string | null;
          country_name: string | null;
          country_code: string | null;
          setlistfm_url: string | null;
          info: string | null;
          last_updated: string | null;
          refreshed_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          setlistfm_id: string;
          version_id?: string | null;
          artist_mbid: string;
          tour_id?: string | null;
          tour_name: string;
          tour_slug: string;
          event_date?: string | null;
          venue_name?: string | null;
          city_name?: string | null;
          state_name?: string | null;
          state_code?: string | null;
          country_name?: string | null;
          country_code?: string | null;
          setlistfm_url?: string | null;
          info?: string | null;
          last_updated?: string | null;
          refreshed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          setlistfm_id?: string;
          version_id?: string | null;
          artist_mbid?: string;
          tour_id?: string | null;
          tour_name?: string;
          tour_slug?: string;
          event_date?: string | null;
          venue_name?: string | null;
          city_name?: string | null;
          state_name?: string | null;
          state_code?: string | null;
          country_name?: string | null;
          country_code?: string | null;
          setlistfm_url?: string | null;
          info?: string | null;
          last_updated?: string | null;
          refreshed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      songs: {
        Row: {
          id: string;
          artist_mbid: string;
          name: string;
          normalized_name: string;
          slug: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          artist_mbid: string;
          name: string;
          normalized_name: string;
          slug: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          artist_mbid?: string;
          name?: string;
          normalized_name?: string;
          slug?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      show_songs: {
        Row: {
          id: string;
          show_setlistfm_id: string;
          artist_mbid: string;
          song_id: string | null;
          song_name: string;
          song_slug: string;
          set_index: number;
          set_name: string | null;
          encore: number | null;
          position_in_set: number;
          absolute_position: number;
          info: string | null;
          is_tape: boolean;
          is_cover: boolean;
          cover_artist_mbid: string | null;
          cover_artist_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          show_setlistfm_id: string;
          artist_mbid: string;
          song_id?: string | null;
          song_name: string;
          song_slug: string;
          set_index: number;
          set_name?: string | null;
          encore?: number | null;
          position_in_set: number;
          absolute_position: number;
          info?: string | null;
          is_tape?: boolean;
          is_cover?: boolean;
          cover_artist_mbid?: string | null;
          cover_artist_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          show_setlistfm_id?: string;
          artist_mbid?: string;
          song_id?: string | null;
          song_name?: string;
          song_slug?: string;
          set_index?: number;
          set_name?: string | null;
          encore?: number | null;
          position_in_set?: number;
          absolute_position?: number;
          info?: string | null;
          is_tape?: boolean;
          is_cover?: boolean;
          cover_artist_mbid?: string | null;
          cover_artist_name?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};