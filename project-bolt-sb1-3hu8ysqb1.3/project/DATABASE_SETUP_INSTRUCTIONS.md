# Purely Plutonic - Database Setup Instructions

## Overview

This guide provides complete instructions for setting up the Supabase database for the Purely Plutonic friendship matching application.

## Prerequisites

- A Supabase account ([sign up here](https://supabase.com))
- Basic understanding of SQL and PostgreSQL

## Quick Setup

### Step 1: Create a Supabase Project

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Enter project details:
   - **Name**: Purely Plutonic (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
4. Click "Create new project" and wait for provisioning

### Step 2: Enable Email Authentication

1. In your project dashboard, navigate to **Authentication** → **Providers**
2. Click on **Email**
3. **Enable "Confirm email"** to require email verification
4. Configure email templates (optional):
   - Customize confirmation email
   - Set up password reset email
5. Click **Save**

### Step 3: Run Database Migrations

Navigate to **SQL Editor** in your Supabase dashboard and execute the following SQL scripts in order:

---

## Migration Scripts

### 1. Core Tables Setup

```sql
/*
  # Create users, matches, and messages tables

  This migration creates the core tables for user profiles, matches, and messaging.
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Users table
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
  verification_status text DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  verification_photo text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read all user data"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create updated_at trigger
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Matches table
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

-- Enable RLS
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Matches policies
CREATE POLICY "Users can see their own matches"
  ON matches
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (user1_id, user2_id));

-- Create updated_at trigger
CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES matches(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_matches_user1_id ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2_id ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_messages_match_id ON messages(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
```

---

### 2. Meetup Invites

```sql
/*
  # Create meetup invites table

  This migration adds the ability for users to propose in-person meetups.
*/

CREATE TABLE IF NOT EXISTS meetup_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES users(id) ON DELETE CASCADE,
  match_id uuid REFERENCES matches(id) ON DELETE CASCADE,
  place jsonb NOT NULL,
  datetime timestamptz NOT NULL,
  proposed_datetime timestamptz,
  message text,
  status text NOT NULL DEFAULT 'pending'
  CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled', 'proposed_change')),
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_meetup_invites_sender_id ON meetup_invites(sender_id);
CREATE INDEX IF NOT EXISTS idx_meetup_invites_receiver_id ON meetup_invites(receiver_id);
CREATE INDEX IF NOT EXISTS idx_meetup_invites_match_id ON meetup_invites(match_id);
CREATE INDEX IF NOT EXISTS idx_meetup_invites_status ON meetup_invites(status);
CREATE INDEX IF NOT EXISTS idx_meetup_invites_status_datetime ON meetup_invites(status, datetime);
```

---

### 3. Verification System

```sql
/*
  # Add profile verification support

  This migration adds verification request tracking.
*/

CREATE TABLE IF NOT EXISTS verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
  CHECK (status IN ('pending', 'approved', 'rejected')),
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
  UPDATE verification_requests
  SET
    status = 'approved',
    reviewed_at = now()
  WHERE id = request_id;

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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);
```

---

### 4. Device Tokens (Push Notifications)

```sql
/*
  # Add device tokens table for push notifications

  This migration adds support for mobile push notifications.
*/

CREATE TABLE IF NOT EXISTS device_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  token text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('android', 'ios', 'web')),
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id ON device_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_device_tokens_token ON device_tokens(token);
```

---

### 5. Couple Linking

```sql
/*
  # Add Couple Linking Feature

  This migration adds support for couples/married users to link accounts.
*/

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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_couples_user1 ON couples(user1_id);
CREATE INDEX IF NOT EXISTS idx_couples_user2 ON couples(user2_id);
CREATE INDEX IF NOT EXISTS idx_couples_confirmed ON couples(confirmed);

-- Enable RLS
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own couple relationships"
  ON couples
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create couple link requests"
  ON couples
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update own couple relationships"
  ON couples
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id)
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can delete own couple relationships"
  ON couples
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);
```

---

### 6. Location-Based Search Function

```sql
/*
  # Add location-based search function

  This migration adds a function for finding nearby users.
*/

CREATE OR REPLACE FUNCTION public.search_users_by_location(
  p_user_id uuid,
  p_latitude float8,
  p_longitude float8,
  p_radius float8
)
RETURNS TABLE (
  id uuid,
  name text,
  profile_picture text,
  headline text,
  about_me text,
  interests jsonb,
  social_style text,
  distance float8
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO public, pg_temp
AS $$
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
        cos(radians((u.location->>'lat')::float8)) *
        cos(radians((u.location->>'lng')::float8) - radians(p_longitude)) +
        sin(radians(p_latitude)) *
        sin(radians((u.location->>'lat')::float8))
      )
    ) as distance
  FROM public.users u
  WHERE
    u.id != p_user_id AND
    u.location IS NOT NULL AND
    -- Filter by radius
    (
      6371 * acos(
        cos(radians(p_latitude)) *
        cos(radians((u.location->>'lat')::float8)) *
        cos(radians((u.location->>'lng')::float8) - radians(p_longitude)) +
        sin(radians(p_latitude)) *
        sin(radians((u.location->>'lat')::float8))
      )
    ) <= p_radius
  ORDER BY distance;
END;
$$;
```

---

## Step 4: Configure Environment Variables

Update your `.env` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

To find these values:
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

---

## Step 5: Verify Setup

Run this query in the SQL Editor to verify all tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see:
- `users`
- `matches`
- `messages`
- `meetup_invites`
- `verification_requests`
- `device_tokens`
- `couples`

---

## Database Schema Summary

### Core Tables

1. **users** - User profiles and preferences
2. **matches** - Connection tracking between users
3. **messages** - Chat messages between matched users
4. **meetup_invites** - In-person meetup proposals
5. **verification_requests** - Profile verification submissions
6. **device_tokens** - Push notification device registration
7. **couples** - Couple account linking

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data and data they're authorized to see
- Authentication required for all operations
- Foreign key constraints maintain data integrity

### Key Features

- Location-based user search with Haversine formula
- Real-time messaging with read status
- Profile verification system
- Push notification support
- Couple/married user account linking
- Super likes functionality

---

## Optional: Push Notifications Setup

If you want to enable push notifications, you'll need to deploy the Edge Function:

1. Navigate to **Edge Functions** in Supabase dashboard
2. Create a new function named `send-push-notification`
3. Copy the contents from `supabase/functions/send-push-notification/index.ts`
4. Deploy the function

The function is already configured and will work automatically once deployed.

---

## Testing the Setup

After completing the setup:

1. Run your application: `npm run dev`
2. Sign up for a new account
3. Check your email for verification link
4. Complete your profile
5. Test the matching functionality

---

## Troubleshooting

### Email Verification Not Working
- Ensure "Confirm email" is enabled in Authentication settings
- Check your spam folder
- Verify SMTP settings in Supabase

### Database Connection Issues
- Verify environment variables are correct
- Check project is not paused (free tier auto-pauses after inactivity)
- Ensure your IP is not blocked

### RLS Policy Errors
- Confirm you're authenticated when testing
- Check the user ID matches the policy requirements
- Review policies in **Database** → **Policies**

---

## Support

For issues specific to:
- **Supabase**: [Supabase Documentation](https://supabase.com/docs)
- **This Application**: Check the project README or create an issue

---

## License

This database schema is part of the Purely Plutonic application.
