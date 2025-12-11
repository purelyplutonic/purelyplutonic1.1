/*
  # Initial Schema Setup for Purely Plutonic

  1. New Tables
    - `users`
      - Core user profile information
      - Location data
      - Preferences and settings
    - `matches`
      - Connection between users
      - Match status tracking
      - Super like functionality
    - `messages`
      - Chat functionality
      - Read status tracking

  2. Security
    - Enable RLS on all tables
    - Set up authentication policies
    - Protect user data privacy

  3. Changes
    - Initial schema creation
    - Add necessary indexes
    - Set up foreign key relationships
*/

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_matches_updated_at ON matches;

-- Create or replace updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing tables if they exist
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  gender text[] NOT NULL DEFAULT '{}',
  looking_for text[] NOT NULL DEFAULT '{}',
  social_style text NOT NULL CHECK (social_style = ANY (ARRAY['introvert', 'ambivert', 'extrovert'])),
  interests jsonb NOT NULL DEFAULT '[]',
  headline text,
  about_me text,
  profile_picture text,
  location jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create users table trigger for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public users can insert data during signup" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can read other users public data" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Users policies
CREATE POLICY "Public users can insert data during signup"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read other users public data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() <> id);

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Matches table
CREATE TABLE matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid REFERENCES users(id) ON DELETE CASCADE,
  user2_id uuid REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status = ANY (ARRAY['pending', 'accepted', 'declined'])),
  is_super_like boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- Enable RLS
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Create matches table trigger for updated_at
CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can see their own matches" ON matches;

-- Matches policies
CREATE POLICY "Users can see their own matches"
  ON matches
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = user1_id OR 
    auth.uid() = user2_id
  );

-- Messages table
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES matches(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read messages in their matches" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their matches" ON messages;

-- Messages policies
CREATE POLICY "Users can read messages in their matches"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = messages.match_id 
      AND (
        auth.uid() = matches.user1_id OR 
        auth.uid() = matches.user2_id
      )
    )
  );

CREATE POLICY "Users can send messages in their matches"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = messages.match_id 
      AND (
        auth.uid() = matches.user1_id OR 
        auth.uid() = matches.user2_id
      )
    ) AND auth.uid() = sender_id
  );

-- Drop existing function if exists
DROP FUNCTION IF EXISTS search_users_by_location;

-- Create function for location-based search
CREATE FUNCTION search_users_by_location(
  p_latitude double precision,
  p_longitude double precision,
  p_radius integer,
  p_user_id uuid
)
RETURNS TABLE (
  id uuid,
  name text,
  profile_picture text,
  headline text,
  about_me text,
  interests jsonb,
  social_style text,
  distance double precision
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.profile_picture,
    u.headline,
    u.about_me,
    u.interests,
    u.social_style,
    -- Calculate distance in kilometers using the Haversine formula
    (
      6371 * acos(
        cos(radians(p_latitude)) * 
        cos(radians((u.location->>'lat')::float)) * 
        cos(radians((u.location->>'lng')::float) - radians(p_longitude)) + 
        sin(radians(p_latitude)) * 
        sin(radians((u.location->>'lat')::float))
      )
    ) as distance
  FROM users u
  WHERE 
    u.id != p_user_id AND
    u.location IS NOT NULL AND
    -- Filter by radius
    (
      6371 * acos(
        cos(radians(p_latitude)) * 
        cos(radians((u.location->>'lat')::float)) * 
        cos(radians((u.location->>'lng')::float) - radians(p_longitude)) + 
        sin(radians(p_latitude)) * 
        sin(radians((u.location->>'lat')::float))
      )
    ) <= p_radius
  ORDER BY distance;
END;
$$ LANGUAGE plpgsql;