import { supabase } from '@/lib/supabase';

export interface Profile {
  id: string;
  username: string;
  county: string;
  university: string | null;
  preferred_side: 'WANTAM' | 'TUTAM';
  created_at: string;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  return data;
}

export async function hasProfile(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();
  return !!data;
}

export async function createProfile(profile: {
  id: string;
  username: string;
  county: string;
  university: string | null;
  preferred_side: 'WANTAM' | 'TUTAM';
}): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from('profiles').insert(profile);

  if (error) {
    if (error.message.includes('duplicate') || error.message.includes('unique') || error.code === '23505') {
      return { success: false, error: 'Username already taken' };
    }
    return { success: false, error: error.message };
  }

  // Register as supporter for preferred side
  await supabase.from('supporters').upsert(
    { user_id: profile.id, side: profile.preferred_side },
    { onConflict: 'user_id,side' }
  );

  return { success: true };
}
