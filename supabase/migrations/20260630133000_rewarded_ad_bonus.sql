/*
  # Rewarded Ad Bonus

  Adds a fixed 100,000 Coin reward for completed rewarded ads.
  The client calls this function only after the rewarded ad completion callback.
*/

ALTER TABLE tws_wallet_transactions
  DROP CONSTRAINT IF EXISTS tws_wallet_transactions_transaction_type_check;

ALTER TABLE tws_wallet_transactions
  ADD CONSTRAINT tws_wallet_transactions_transaction_type_check
  CHECK (
    transaction_type IN (
      'starter_bonus',
      'tap_earning',
      'drive_mission_reward',
      'rewarded_ad_bonus',
      'housing_purchase',
      'car_purchase',
      'purchase_refund'
    )
  );

CREATE OR REPLACE FUNCTION claim_rewarded_ad_bonus(p_reward_id text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  reward_amount integer := 100000;
BEGIN
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to claim ad rewards.';
  END IF;

  IF p_reward_id IS NULL OR length(trim(p_reward_id)) < 8 THEN
    RAISE EXCEPTION 'Invalid reward reference.';
  END IF;

  INSERT INTO tws_wallet_transactions (
    user_id,
    amount,
    transaction_type,
    reference_type,
    reference_id,
    description
  )
  VALUES (
    current_user_id,
    reward_amount,
    'rewarded_ad_bonus',
    'rewarded_ad',
    p_reward_id,
    'Rewarded ad bonus'
  )
  ON CONFLICT (user_id, reference_type, reference_id) DO NOTHING;

  IF FOUND THEN
    RETURN reward_amount;
  END IF;

  RETURN 0;
END;
$$;

GRANT EXECUTE ON FUNCTION claim_rewarded_ad_bonus(text) TO authenticated;
