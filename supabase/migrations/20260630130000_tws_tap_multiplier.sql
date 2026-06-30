/*
  # TWS Tap Multiplier

  Updates validated tap earnings from 1 TWS per tap to 3 TWS per tap.
  Existing tap-session wallet entries are backfilled to match the new rate.
*/

CREATE OR REPLACE FUNCTION grant_tws_for_validated_taps()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tap_reward integer;
BEGIN
  tap_reward := NEW.tap_count * 3;

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
      tap_reward,
      'tap_earning',
      'tap_session',
      NEW.id::text,
      'Validated tap earnings at 3 TWS per tap'
    )
    ON CONFLICT (user_id, reference_type, reference_id) DO UPDATE
      SET amount = EXCLUDED.amount,
          description = EXCLUDED.description;
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
      tap_reward,
      'tap_earning',
      'tap_session',
      NEW.id::text,
      'Validated tap earnings at 3 TWS per tap'
    )
    ON CONFLICT (user_id, reference_type, reference_id) DO UPDATE
      SET amount = EXCLUDED.amount,
          description = EXCLUDED.description;
  END IF;

  RETURN NEW;
END;
$$;

UPDATE tws_wallet_transactions AS transaction
SET amount = session.tap_count * 3,
    description = 'Validated tap earnings at 3 TWS per tap'
FROM tap_sessions AS session
WHERE transaction.transaction_type = 'tap_earning'
  AND transaction.reference_type = 'tap_session'
  AND transaction.reference_id = session.id::text
  AND session.validated IS TRUE
  AND session.tap_count > 0;
