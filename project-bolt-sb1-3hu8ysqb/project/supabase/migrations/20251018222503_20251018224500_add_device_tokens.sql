/*
  # Add device tokens table for push notifications

  1. New Tables
    - `device_tokens`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `token` (text, unique) - The FCM/APNs device token
      - `platform` (text) - 'android', 'ios', or 'web'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on device_tokens table
    - Add policies for users to manage their own tokens
*/

-- Create device_tokens table
CREATE TABLE IF NOT EXISTS device_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  token text NOT NULL,
  platform text NOT NULL CHECK (platform = ANY (ARRAY['android', 'ios', 'web'])),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, token)
);

-- Enable RLS
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
CREATE TRIGGER update_device_tokens_updated_at
  BEFORE UPDATE ON device_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
CREATE POLICY "Users can view their own device tokens"
  ON device_tokens
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own device tokens"
  ON device_tokens
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own device tokens"
  ON device_tokens
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id ON device_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_device_tokens_token ON device_tokens(token);