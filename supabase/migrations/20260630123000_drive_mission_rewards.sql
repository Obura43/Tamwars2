/*
  # Drive Mission Rewards

  Adds one-time TWS rewards for completing approved Nairobi City drive missions.
  Rewards are issued through a database function so the client cannot choose
  arbitrary amounts or mint repeat credits.
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
      'housing_purchase',
      'car_purchase',
      'purchase_refund'
    )
  );

CREATE OR REPLACE FUNCTION claim_drive_mission_reward(p_mission_id text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  reward_amount integer;
BEGIN
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to claim mission rewards.';
  END IF;

  reward_amount := CASE p_mission_id
    WHEN 'cbd-westlands' THEN 25000
    WHEN 'ngara-park' THEN 25000
    WHEN 'upperhill-cbd' THEN 30000
    ELSE NULL
  END;

  IF reward_amount IS NULL THEN
    RAISE EXCEPTION 'Unknown drive mission.';
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
    'drive_mission_reward',
    'drive_mission',
    p_mission_id,
    'Nairobi City drive mission reward'
  )
  ON CONFLICT (user_id, reference_type, reference_id) DO NOTHING;

  IF FOUND THEN
    RETURN reward_amount;
  END IF;

  RETURN 0;
END;
$$;

GRANT EXECUTE ON FUNCTION claim_drive_mission_reward(text) TO authenticated;
