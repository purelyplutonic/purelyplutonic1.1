/*
  # Create meetup invites table

  1. New Tables
    - `meetup_invites`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, references users)
      - `receiver_id` (uuid, references users)
      - `match_id` (uuid, references matches)
      - `place` (jsonb with name, address, type)
      - `datetime` (timestamptz)
      - `message` (text, optional)
      - `status` (text: pending, accepted, declined, cancelled)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on meetup_invites table
    - Add policies for users to manage their own invites
*/

-- Create meetup_invites table
CREATE TABLE IF NOT EXISTS meetup_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES users(id) ON DELETE CASCADE,
  match_id uuid REFERENCES matches(id) ON DELETE CASCADE,
  place jsonb NOT NULL,
  datetime timestamptz NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending' 
  CHECK (status = ANY (ARRAY['pending', 'accepted', 'declined', 'cancelled'])),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE meetup_invites ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
CREATE TRIGGER update_meetup_invites_updated_at
  BEFORE UPDATE ON meetup_invites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
CREATE POLICY "Users can view their own meetup invites"
  ON meetup_invites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create meetup invites"
  ON meetup_invites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own meetup invites"
  ON meetup_invites
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meetup_invites_sender_id ON meetup_invites(sender_id);
CREATE INDEX IF NOT EXISTS idx_meetup_invites_receiver_id ON meetup_invites(receiver_id);
CREATE INDEX IF NOT EXISTS idx_meetup_invites_match_id ON meetup_invites(match_id);
CREATE INDEX IF NOT EXISTS idx_meetup_invites_status ON meetup_invites(status);