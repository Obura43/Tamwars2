/*
  # Comments System Schema

  1. New Tables
    - `comments`
      - `id` (uuid, primary key)
      - `content` (text)
      - `user_id` (uuid, references auth.users)
      - `poem_id` (text)
      - `created_at` (timestamp)
    - `likes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `comment_id` (uuid, references comments)
      - `created_at` (timestamp)
    - `replies`
      - `id` (uuid, primary key)
      - `content` (text)
      - `user_id` (uuid, references auth.users)
      - `comment_id` (uuid, references comments)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  poem_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  comment_id uuid REFERENCES comments NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, comment_id)
);

-- Create replies table
CREATE TABLE IF NOT EXISTS replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  comment_id uuid REFERENCES comments NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;

-- Policies for comments
CREATE POLICY "Anyone can read comments"
  ON comments FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policies for likes
CREATE POLICY "Anyone can read likes"
  ON likes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create/delete likes"
  ON likes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for replies
CREATE POLICY "Anyone can read replies"
  ON replies FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create replies"
  ON replies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);