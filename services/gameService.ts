import { supabase } from '@/lib/supabase';
import { MAX_TAPS_THRESHOLD, COOLDOWN_SESSIONS, COOLDOWN_MINUTES } from '@/lib/constants';

export async function checkCooldown(userId: string): Promise<boolean> {
  const tenMinutesAgo = new Date(Date.now() - COOLDOWN_MINUTES * 60 * 1000).toISOString();
  const { count } = await supabase
    .from('tap_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', tenMinutesAgo);

  return (count ?? 0) < COOLDOWN_SESSIONS;
}

export async function saveTapSession(
  userId: string,
  side: 'WANTAM' | 'TUTAM',
  tapCount: number,
): Promise<{ sessionId: string; validated: boolean; suspicious: boolean } | { error: string }> {
  const suspicious = tapCount > MAX_TAPS_THRESHOLD;
  const validated = !suspicious;

  const { data, error } = await supabase
    .from('tap_sessions')
    .insert({
      user_id: userId,
      side,
      tap_count: tapCount,
      duration_seconds: 60,
      validated,
      suspicious,
    })
    .select('id')
    .single();

  if (error) return { error: error.message };

  // Upsert supporter record
  await supabase.from('supporters').upsert(
    { user_id: userId, side },
    { onConflict: 'user_id,side' }
  );

  return { sessionId: data.id, validated, suspicious };
}

export interface TapSession {
  id: string;
  user_id: string;
  side: 'WANTAM' | 'TUTAM';
  tap_count: number;
  duration_seconds: number;
  validated: boolean;
  suspicious: boolean;
  created_at: string;
}

export async function getSession(sessionId: string): Promise<TapSession | null> {
  const { data } = await supabase
    .from('tap_sessions')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle();
  return data;
}

export async function getGlobalRank(tapCount: number): Promise<number> {
  const { count } = await supabase
    .from('tap_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('validated', true)
    .gt('tap_count', tapCount);
  return (count ?? 0) + 1;
}

export async function getUserStats(userId: string): Promise<{ bestScore: number; totalGames: number; totalTaps: number }> {
  const { data } = await supabase
    .from('tap_sessions')
    .select('tap_count')
    .eq('user_id', userId)
    .eq('validated', true);

  if (!data || data.length === 0) {
    return { bestScore: 0, totalGames: 0, totalTaps: 0 };
  }

  const best = data.reduce((max, s) => Math.max(max, s.tap_count), 0);
  const total = data.reduce((sum, s) => sum + s.tap_count, 0);
  return { bestScore: best, totalGames: data.length, totalTaps: total };
}
