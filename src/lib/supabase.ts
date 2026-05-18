import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client only if proper configuration exists
export const supabase = supabaseUrl && supabaseUrl !== 'your_supabase_url' && supabaseAnonKey && supabaseAnonKey !== 'your_supabase_anon_key'
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Export a function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return (
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'your_supabase_url' &&
    supabaseAnonKey !== 'your_supabase_anon_key'
  );
};