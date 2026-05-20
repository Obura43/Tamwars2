import { supabase } from '@/lib/supabase';

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  username: string;
  side: 'WANTAM' | 'TUTAM';
  tap_count: number;
  county: string;
  created_at: string;
  rank: number;
}

export async function getLeaderboard(
  timeFilter: 'today' | 'week' | 'alltime',
  sideFilter: 'all' | 'WANTAM' | 'TUTAM',
): Promise<LeaderboardEntry[]> {
  const viewName =
    timeFilter === 'today'
      ? 'daily_leaderboard'
      : timeFilter === 'week'
      ? 'weekly_leaderboard'
      : 'alltime_leaderboard';

  let query = supabase
    .from(viewName)
    .select('*')
    .order('rank', { ascending: true })
    .limit(100);

  if (sideFilter !== 'all') {
    query = query.eq('side', sideFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Leaderboard error:', error);
    return [];
  }

  return data ?? [];
}