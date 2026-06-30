/*
  # Battle Shouts

  Adds preset-only side chat for TamWar. Users can read the latest shouts,
  while posting goes through a database function that enforces sign-in,
  profile side, approved preset IDs, and cooldown.
*/

CREATE TABLE IF NOT EXISTS battle_shouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username text NOT NULL,
  side text NOT NULL CHECK (side IN ('WANTAM', 'TUTAM')),
  message_id text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS battle_shouts_created_idx
  ON battle_shouts (created_at DESC);

CREATE INDEX IF NOT EXISTS battle_shouts_user_created_idx
  ON battle_shouts (user_id, created_at DESC);

ALTER TABLE battle_shouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read battle shouts"
  ON battle_shouts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE OR REPLACE FUNCTION post_battle_shout(p_message_id text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  profile_record profiles%ROWTYPE;
  inserted_id uuid;
  allowed_message_ids text[] := ARRAY[
    'tap-harder',
    'catching-up',
    'defend-lead',
    'one-more-round',
    'leaderboard-push',
    'coins-grind',
    'who-online',
    'respect-side',
    'wantam-assemble',
    'wantam-moving',
    'tutam-assemble',
    'tutam-moving'
  ];
BEGIN
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Sign in to post Battle Shouts.';
  END IF;

  IF p_message_id IS NULL OR NOT p_message_id = ANY(allowed_message_ids) THEN
    RAISE EXCEPTION 'Unsupported Battle Shout.';
  END IF;

  SELECT *
    INTO profile_record
  FROM profiles
  WHERE id = current_user_id;

  IF profile_record.id IS NULL THEN
    RAISE EXCEPTION 'Create your profile before posting Battle Shouts.';
  END IF;

  IF p_message_id LIKE 'wantam-%' AND profile_record.preferred_side <> 'WANTAM' THEN
    RAISE EXCEPTION 'This shout belongs to Wantam.';
  END IF;

  IF p_message_id LIKE 'tutam-%' AND profile_record.preferred_side <> 'TUTAM' THEN
    RAISE EXCEPTION 'This shout belongs to Tutam.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM battle_shouts
    WHERE user_id = current_user_id
      AND created_at > now() - interval '10 seconds'
  ) THEN
    RAISE EXCEPTION 'Slow down. You can shout again in a few seconds.';
  END IF;

  INSERT INTO battle_shouts (
    user_id,
    username,
    side,
    message_id
  )
  VALUES (
    current_user_id,
    profile_record.username,
    profile_record.preferred_side,
    p_message_id
  )
  RETURNING id INTO inserted_id;

  RETURN inserted_id;
END;
$$;

GRANT EXECUTE ON FUNCTION post_battle_shout(text) TO authenticated;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE battle_shouts;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END;
$$;
