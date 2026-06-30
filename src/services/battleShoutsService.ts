import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface BattleShout {
  id: string;
  user_id: string;
  username: string;
  side: 'WANTAM' | 'TUTAM';
  message_id: string;
  created_at: string;
}

export async function getBattleShouts(limit = 60): Promise<BattleShout[]> {
  const { data } = await supabase
    .from('battle_shouts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function postBattleShout(messageId: string): Promise<{ success: true } | { success: false; error: string }> {
  const { error } = await supabase.rpc('post_battle_shout', {
    p_message_id: messageId,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export function subscribeToBattleShouts(onInsert: (shout: BattleShout) => void): RealtimeChannel {
  const channel = supabase
    .channel('battle-shouts-feed')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'battle_shouts' },
      (payload) => {
        onInsert(payload.new as BattleShout);
      }
    )
    .subscribe();

  return channel;
}
