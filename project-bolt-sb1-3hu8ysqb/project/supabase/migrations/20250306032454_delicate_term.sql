/*
  # Add profile verification support
  
  1. Changes
    - Add verification_status and verification_photo columns to users table
    - Add verification_requests table for tracking verification submissions
    - Add RLS policies for verification requests
  
  2. Security
    - Enable RLS on verification_requests table
    - Add policies to allow users to submit and view their own requests
    - Add policy for admins to manage verification requests
*/

-- Add verification columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'unverified' 
CHECK (verification_status = ANY (ARRAY['unverified', 'pending', 'verified', 'rejected'])),
ADD COLUMN IF NOT EXISTS verification_photo text;

-- Create verification requests table
CREATE TABLE IF NOT EXISTS verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending' 
  CHECK (status = ANY (ARRAY['pending', 'approved', 'rejected'])),
  admin_notes text,
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
CREATE TRIGGER update_verification_requests_updated_at
  BEFORE UPDATE ON verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
CREATE POLICY "Users can view their own verification requests"
  ON verification_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can submit verification requests"
  ON verification_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to handle verification approval
CREATE OR REPLACE FUNCTION approve_verification_request(request_id uuid)
RETURNS void AS $$
BEGIN
  -- Update the verification request
  UPDATE verification_requests
  SET 
    status = 'approved',
    reviewed_at = now()
  WHERE id = request_id;
  
  -- Update the user's verification status
  UPDATE users
  SET 
    verification_status = 'verified',
    verification_photo = (
      SELECT photo_url 
      FROM verification_requests 
      WHERE id = request_id
    )
  WHERE id = (
    SELECT user_id 
    FROM verification_requests 
    WHERE id = request_id
  );
END;
$$ LANGUAGE plpgsql;