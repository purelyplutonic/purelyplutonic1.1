/*
  # Create matches and messages tables

  1. New Tables
    - `matches`
      - `id` (uuid, primary key)
      - `user1_id` (uuid, references users)
      - `user2_id` (uuid, references users)
      - `status` (text: pending, accepted, declined)
      - `is_super_like` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `messages`
      - `id` (uuid, primary key)
      - `match_id` (uuid, references matches)
      - `sender_id` (uuid, references users)
      - `content` (text)
      - `is_read` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for:
      - Users can only see their own matches
      - Users can only send messages in their matches
      - Users can only read messages in their matches
*/

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid REFERENCES users(id) ON DELETE CASCADE,
  user2_id uuid REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')),
  is_super_like boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES matches(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Matches policies
CREATE POLICY "Users can see their own matches"
  ON matches
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (user1_id, user2_id));

-- Messages policies
CREATE POLICY "Users can read messages in their matches"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = match_id
      AND auth.uid() IN (user1_id, user2_id)
    )
  );

CREATE POLICY "Users can send messages in their matches"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = match_id
      AND auth.uid() IN (user1_id, user2_id)
    )
    AND auth.uid() = sender_id
  );

-- Create updated_at trigger for matches
CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();