/*
  # Create users table and security policies

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `gender` (text[])
      - `looking_for` (text[])
      - `social_style` (text)
      - `interests` (jsonb)
      - `headline` (text)
      - `about_me` (text)
      - `profile_picture` (text)
      - `location` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `users` table
    - Add policies for:
      - Users can read their own data
      - Users can update their own data
      - Users can read other users' public data
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  gender text[] NOT NULL DEFAULT '{}',
  looking_for text[] NOT NULL DEFAULT '{}',
  social_style text NOT NULL CHECK (social_style IN ('introvert', 'ambivert', 'extrovert')),
  interests jsonb NOT NULL DEFAULT '[]',
  headline text,
  about_me text,
  profile_picture text,
  location jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
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

CREATE POLICY "Users can read other users public data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() != id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();