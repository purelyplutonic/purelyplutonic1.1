/*
  # Add proposed_datetime field to meetup_invites table
  
  1. Changes
    - Add proposed_datetime column to meetup_invites table
    - Update status check constraint to include 'proposed_change'
    - Add index for better performance on status queries
  
  2. Security
    - No changes to RLS policies needed
*/

-- Add proposed_datetime column
ALTER TABLE meetup_invites 
ADD COLUMN IF NOT EXISTS proposed_datetime timestamptz;

-- Update status constraint to include 'proposed_change'
ALTER TABLE meetup_invites 
DROP CONSTRAINT IF EXISTS meetup_invites_status_check;

ALTER TABLE meetup_invites 
ADD CONSTRAINT meetup_invites_status_check 
CHECK (status = ANY (ARRAY['pending', 'accepted', 'declined', 'cancelled', 'proposed_change']));

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_meetup_invites_status_datetime ON meetup_invites(status, datetime);