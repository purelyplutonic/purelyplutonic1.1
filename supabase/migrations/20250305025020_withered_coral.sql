/*
  # Add INSERT policy for users table

  1. Changes
    - Add policy to allow authenticated users to insert their own data
    - This enables new users to create their profile after signup
*/

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);