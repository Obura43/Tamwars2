import { supabase } from '@/lib/supabase';

export interface TwsWalletTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type:
    | 'starter_bonus'
    | 'tap_earning'
    | 'drive_mission_reward'
    | 'rewarded_ad_bonus'
    | 'housing_purchase'
    | 'car_purchase'
    | 'purchase_refund';
  reference_type: string;
  reference_id: string;
  description: string | null;
  created_at: string;
}

export interface OwnedVirtualAsset {
  id: string;
  user_id: string;
  asset_type: 'housing' | 'car';
  asset_id: string;
  asset_name: string;
  price_tws: number;
  purchased_at: string;
}

export async function getTwsBalance(userId: string): Promise<number> {
  const { data } = await supabase
    .from('tws_wallet_transactions')
    .select('amount')
    .eq('user_id', userId);

  return (data ?? []).reduce((sum, transaction) => sum + transaction.amount, 0);
}

export async function getTwsTransactions(userId: string, limit = 30): Promise<TwsWalletTransaction[]> {
  const { data } = await supabase
    .from('tws_wallet_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function getOwnedVirtualAssets(userId: string): Promise<OwnedVirtualAsset[]> {
  const { data } = await supabase
    .from('owned_virtual_assets')
    .select('*')
    .eq('user_id', userId)
    .order('purchased_at', { ascending: false });

  return data ?? [];
}

export async function getClaimedDriveMissionIds(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from('tws_wallet_transactions')
    .select('reference_id')
    .eq('user_id', userId)
    .eq('reference_type', 'drive_mission');

  return (data ?? []).map((transaction) => transaction.reference_id);
}

export async function claimDriveMissionReward(
  missionId: string
): Promise<{ success: true; amount: number } | { success: false; error: string }> {
  const { data, error } = await supabase.rpc('claim_drive_mission_reward', {
    p_mission_id: missionId,
  });

  if (error) {
    return { success: false, error: error.message.replace(/TWS/g, 'Coins') };
  }

  return { success: true, amount: data ?? 0 };
}

export async function claimRewardedAdBonus(
  rewardId: string
): Promise<{ success: true; amount: number } | { success: false; error: string }> {
  const { data, error } = await supabase.rpc('claim_rewarded_ad_bonus', {
    p_reward_id: rewardId,
  });

  if (error) {
    return { success: false, error: error.message.replace(/TWS/g, 'Coins') };
  }

  return { success: true, amount: data ?? 0 };
}

export async function purchaseVirtualAsset(asset: {
  type: 'housing' | 'car';
  id: string;
  name: string;
  priceTws: number;
}): Promise<{ success: true; ownedAssetId: string } | { success: false; error: string }> {
  const { data, error } = await supabase.rpc('purchase_virtual_asset', {
    p_asset_type: asset.type,
    p_asset_id: asset.id,
    p_asset_name: asset.name,
    p_price_tws: asset.priceTws,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, ownedAssetId: data };
}
