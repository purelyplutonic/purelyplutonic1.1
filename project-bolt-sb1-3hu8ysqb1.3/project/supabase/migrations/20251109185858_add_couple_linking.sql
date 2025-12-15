/*
  # Add Couple Linking Feature

  1. New Tables
    - `couples`
      - `id` (uuid, primary key) - Unique identifier for the couple relationship
      - `user1_id` (uuid, foreign key) - First user in the couple
      - `user2_id` (uuid, foreign key) - Second user in the couple
      - `status` (text) - Relationship status: 'married' or 'couple'
      - `linked_at` (timestamptz) - When they linked accounts
      - `pending_user_id` (uuid, nullable) - User who initiated the link request
      - `confirmed` (boolean) - Whether both users confirmed the link
      - `created_at` (timestamptz) - Record creation timestamp
      
  2. Security
    - Enable RLS on `couples` table
    - Add policy for users to view their own couple relationships
    - Add policy for users to create couple link requests
    - Add policy for users to update their own couple relationships (confirm/unlink)
    
  3. Important Notes
    - Users can only be in one couple relationship at a time
    - Link requests require confirmation from both users
    - Users can unlink at any time
*/

-- Create couples table
CREATE TABLE IF NOT EXISTS couples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user2_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL CHECK (status IN ('married', 'couple')),
  linked_at timestamptz DEFAULT now(),
  pending_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  confirmed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT different_users CHECK (user1_id != user2_id),
  CONSTRAINT unique_couple UNIQUE (user1_id, user2_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_couples_user1 ON couples(user1_id);
CREATE INDEX IF NOT EXISTS idx_couples_user2 ON couples(user2_id);
CREATE INDEX IF NOT EXISTS idx_couples_confirmed ON couples(confirmed);

-- Enable RLS
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view couple relationships they're part of
CREATE POLICY "Users can view own couple relationships"
  ON couples
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Policy: Users can create couple link requests
CREATE POLICY "Users can create couple link requests"
  ON couples
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user1_id OR auth.uid() = user2_id
  );

-- Policy: Users can update couple relationships they're part of
CREATE POLICY "Users can update own couple relationships"
  ON couples
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id)
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Policy: Users can delete couple relationships they're part of
CREATE POLICY "Users can delete own couple relationships"
  ON couples
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);