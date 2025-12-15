/*
  # Add public INSERT policy for users table

  1. Changes
    - Add policy to allow public (unauthenticated) users to insert data during signup
    - This enables new users to create their initial profile during the signup process
*/

CREATE POLICY "Public users can insert data during signup"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (true);