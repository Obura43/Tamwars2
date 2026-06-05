import { supabase } from '@/lib/supabase';

export interface SideStats {
  side: string;
  unique_supporters: number;
  total_taps: number;
}

export async function getSideStats(): Promise<SideStats[]> {
  const { data, error } = await supabase.from('side_stats').select('*');
  if (error || !data) return [];
  return data;
}
