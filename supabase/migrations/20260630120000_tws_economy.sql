/*
  # TWS Economy

  Adds a server-backed transaction ledger for spendable TamWar Shillings.
  Credits are created by database triggers so clients cannot mint balances directly.
*/

CREATE TABLE IF NOT EXISTS tws_wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL CHECK (amount <> 0),
  transaction_type text NOT NULL CHECK (
    transaction_type IN (
      'starter_bonus',
      'tap_earning',
      'housing_purchase',
      'car_purchase',
      'purchase_refund'
    )
  ),
  reference_type text NOT NULL,
  reference_id text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id, reference_type, reference_id)
);

CREATE INDEX IF NOT EXISTS tws_wallet_transactions_user_created_idx
  ON tws_wallet_transactions (user_id, created_at DESC);

ALTER TABLE tws_wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own TWS transactions"
  ON tws_wallet_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS owned_virtual_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  asset_type text NOT NULL CHECK (asset_type IN ('housing', 'car')),
  asset_id text NOT NULL,
  asset_name text NOT NULL,
  price_tws integer NOT NULL CHECK (price_tws > 0),
  purchased_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id, asset_type, asset_id)
);

CREATE INDEX IF NOT EXISTS owned_virtual_assets_user_purchased_idx
  ON owned_virtual_assets (user_id, purchased_at DESC);

ALTER TABLE owned_virtual_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own virtual assets"
  ON owned_virtual_assets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION purchase_virtual_asset(
  p_asset_type text,
  p_asset_id text,
  p_asset_name text,
  p_price_tws integer
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  current_balance integer;
  owned_asset_id uuid;
  purchase_transaction_type text;
BEGIN
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to buy assets.';
  END IF;

  IF p_asset_type NOT IN ('housing', 'car') THEN
    RAISE EXCEPTION 'Unsupported asset type.';
  END IF;

  IF p_price_tws <= 0 THEN
    RAISE EXCEPTION 'Asset price must be positive.';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(current_user_id::text));

  SELECT COALESCE(SUM(amount), 0)
    INTO current_balance
  FROM tws_wallet_transactions
  WHERE user_id = current_user_id;

  IF current_balance < p_price_tws THEN
    RAISE EXCEPTION 'Insufficient TWS balance.';
  END IF;

  INSERT INTO owned_virtual_assets (
    user_id,
    asset_type,
    asset_id,
    asset_name,
    price_tws
  )
  VALUES (
    current_user_id,
    p_asset_type,
    p_asset_id,
    p_asset_name,
    p_price_tws
  )
  RETURNING id INTO owned_asset_id;

  purchase_transaction_type := CASE
    WHEN p_asset_type = 'housing' THEN 'housing_purchase'
    ELSE 'car_purchase'
  END;

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
    -p_price_tws,
    purchase_transaction_type,
    'owned_virtual_asset',
    owned_asset_id::text,
    'Purchased ' || p_asset_name
  );

  RETURN owned_asset_id;
END;
$$;

GRANT EXECUTE ON FUNCTION purchase_virtual_asset(text, text, text, integer) TO authenticated;

CREATE OR REPLACE FUNCTION grant_tws_starter_bonus()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO tws_wallet_transactions (
    user_id,
    amount,
    transaction_type,
    reference_type,
    reference_id,
    description
  )
  VALUES (
    NEW.id,
    300000,
    'starter_bonus',
    'signup',
    NEW.id::text,
    'Starter bonus for joining TamWar'
  )
  ON CONFLICT (user_id, reference_type, reference_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS grant_tws_starter_bonus_on_profile ON profiles;
DROP TRIGGER IF EXISTS grant_tws_starter_bonus_on_signup ON auth.users;

CREATE TRIGGER grant_tws_starter_bonus_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION grant_tws_starter_bonus();

CREATE OR REPLACE FUNCTION grant_tws_for_validated_taps()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.validated IS TRUE
    AND NEW.tap_count > 0
    AND TG_OP = 'INSERT'
  THEN
    INSERT INTO tws_wallet_transactions (
      user_id,
      amount,
      transaction_type,
      reference_type,
      reference_id,
      description
    )
    VALUES (
      NEW.user_id,
      NEW.tap_count,
      'tap_earning',
      'tap_session',
      NEW.id::text,
      'Validated tap earnings'
    )
    ON CONFLICT (user_id, reference_type, reference_id) DO NOTHING;
  ELSIF NEW.validated IS TRUE
    AND NEW.tap_count > 0
    AND OLD.validated IS DISTINCT FROM NEW.validated
  THEN
    INSERT INTO tws_wallet_transactions (
      user_id,
      amount,
      transaction_type,
      reference_type,
      reference_id,
      description
    )
    VALUES (
      NEW.user_id,
      NEW.tap_count,
      'tap_earning',
      'tap_session',
      NEW.id::text,
      'Validated tap earnings'
    )
    ON CONFLICT (user_id, reference_type, reference_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS grant_tws_for_validated_taps_on_session ON tap_sessions;

CREATE TRIGGER grant_tws_for_validated_taps_on_session
  AFTER INSERT OR UPDATE OF validated, tap_count ON tap_sessions
  FOR EACH ROW
  EXECUTE FUNCTION grant_tws_for_validated_taps();

INSERT INTO tws_wallet_transactions (
  user_id,
  amount,
  transaction_type,
  reference_type,
  reference_id,
  description
)
SELECT
  id,
  300000,
  'starter_bonus',
  'signup',
  id::text,
  'Starter bonus for joining TamWar'
FROM auth.users
ON CONFLICT (user_id, reference_type, reference_id) DO NOTHING;

INSERT INTO tws_wallet_transactions (
  user_id,
  amount,
  transaction_type,
  reference_type,
  reference_id,
  description
)
SELECT
  user_id,
  tap_count,
  'tap_earning',
  'tap_session',
  id::text,
  'Validated tap earnings'
FROM tap_sessions
WHERE validated IS TRUE
  AND tap_count > 0
ON CONFLICT (user_id, reference_type, reference_id) DO NOTHING;
