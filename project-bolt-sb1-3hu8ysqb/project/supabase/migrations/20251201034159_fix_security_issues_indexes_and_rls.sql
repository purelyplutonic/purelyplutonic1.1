/*
  # Fix Security Issues - Indexes and RLS Optimization

  ## Changes Made

  ### 1. Add Missing Indexes for Foreign Keys
  - `couples.pending_user_id`
  - `matches.user2_id`
  - `messages.match_id`
  - `messages.sender_id`
  - `verification_requests.user_id`

  ### 2. Optimize RLS Policies
  Replace `auth.uid()` with `(select auth.uid())` in all policies to prevent
  per-row re-evaluation and improve query performance.

  ### 3. Fix Function Search Paths
  Set immutable search_path for all functions to prevent security issues.

  ### 4. Consolidate Duplicate Policies
  Remove redundant permissive policies and merge them into single policies.
*/

-- =====================================================
-- 1. ADD MISSING INDEXES FOR FOREIGN KEYS
-- =====================================================

-- Index for couples.pending_user_id
CREATE INDEX IF NOT EXISTS idx_couples_pending_user_id 
  ON public.couples(pending_user_id);

-- Index for matches.user2_id
CREATE INDEX IF NOT EXISTS idx_matches_user2_id 
  ON public.matches(user2_id);

-- Index for messages.match_id
CREATE INDEX IF NOT EXISTS idx_messages_match_id 
  ON public.messages(match_id);

-- Index for messages.sender_id
CREATE INDEX IF NOT EXISTS idx_messages_sender_id 
  ON public.messages(sender_id);

-- Index for verification_requests.user_id
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id 
  ON public.verification_requests(user_id);

-- =====================================================
-- 2. OPTIMIZE RLS POLICIES - USERS TABLE
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can read other users public data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
DROP POLICY IF EXISTS "Public users can insert data during signup" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

-- Recreate optimized policies
CREATE POLICY "Users can read own data" 
  ON public.users 
  FOR SELECT 
  TO authenticated 
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can read other users public data" 
  ON public.users 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can insert own data" 
  ON public.users 
  FOR INSERT 
  TO authenticated 
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own data" 
  ON public.users 
  FOR UPDATE 
  TO authenticated 
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- =====================================================
-- 3. OPTIMIZE RLS POLICIES - MATCHES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can see their own matches" ON public.matches;

CREATE POLICY "Users can see their own matches" 
  ON public.matches 
  FOR SELECT 
  TO authenticated 
  USING (
    (select auth.uid()) = user1_id OR 
    (select auth.uid()) = user2_id
  );

-- =====================================================
-- 4. OPTIMIZE RLS POLICIES - MESSAGES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can read messages in their matches" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages in their matches" ON public.messages;

CREATE POLICY "Users can read messages in their matches" 
  ON public.messages 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.matches 
      WHERE matches.id = messages.match_id 
      AND ((select auth.uid()) = matches.user1_id OR (select auth.uid()) = matches.user2_id)
    )
  );

CREATE POLICY "Users can send messages in their matches" 
  ON public.messages 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    (select auth.uid()) = sender_id AND 
    EXISTS (
      SELECT 1 FROM public.matches 
      WHERE matches.id = messages.match_id 
      AND ((select auth.uid()) = matches.user1_id OR (select auth.uid()) = matches.user2_id)
    )
  );

-- =====================================================
-- 5. OPTIMIZE RLS POLICIES - VERIFICATION_REQUESTS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own verification requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Users can submit verification requests" ON public.verification_requests;

CREATE POLICY "Users can view their own verification requests" 
  ON public.verification_requests 
  FOR SELECT 
  TO authenticated 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can submit verification requests" 
  ON public.verification_requests 
  FOR INSERT 
  TO authenticated 
  WITH CHECK ((select auth.uid()) = user_id);

-- =====================================================
-- 6. OPTIMIZE RLS POLICIES - MEETUP_INVITES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own meetup invites" ON public.meetup_invites;
DROP POLICY IF EXISTS "Users can create meetup invites" ON public.meetup_invites;
DROP POLICY IF EXISTS "Users can update their own meetup invites" ON public.meetup_invites;

CREATE POLICY "Users can view their own meetup invites" 
  ON public.meetup_invites 
  FOR SELECT 
  TO authenticated 
  USING (
    (select auth.uid()) = sender_id OR 
    (select auth.uid()) = receiver_id
  );

CREATE POLICY "Users can create meetup invites" 
  ON public.meetup_invites 
  FOR INSERT 
  TO authenticated 
  WITH CHECK ((select auth.uid()) = sender_id);

CREATE POLICY "Users can update their own meetup invites" 
  ON public.meetup_invites 
  FOR UPDATE 
  TO authenticated 
  USING (
    (select auth.uid()) = sender_id OR 
    (select auth.uid()) = receiver_id
  )
  WITH CHECK (
    (select auth.uid()) = sender_id OR 
    (select auth.uid()) = receiver_id
  );

-- =====================================================
-- 7. OPTIMIZE RLS POLICIES - DEVICE_TOKENS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own device tokens" ON public.device_tokens;
DROP POLICY IF EXISTS "Users can insert their own device tokens" ON public.device_tokens;
DROP POLICY IF EXISTS "Users can delete their own device tokens" ON public.device_tokens;

CREATE POLICY "Users can view their own device tokens" 
  ON public.device_tokens 
  FOR SELECT 
  TO authenticated 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own device tokens" 
  ON public.device_tokens 
  FOR INSERT 
  TO authenticated 
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own device tokens" 
  ON public.device_tokens 
  FOR DELETE 
  TO authenticated 
  USING ((select auth.uid()) = user_id);

-- =====================================================
-- 8. OPTIMIZE RLS POLICIES - COUPLES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own couple relationships" ON public.couples;
DROP POLICY IF EXISTS "Users can create couple link requests" ON public.couples;
DROP POLICY IF EXISTS "Users can update own couple relationships" ON public.couples;
DROP POLICY IF EXISTS "Users can delete own couple relationships" ON public.couples;

CREATE POLICY "Users can view own couple relationships" 
  ON public.couples 
  FOR SELECT 
  TO authenticated 
  USING (
    (select auth.uid()) = user1_id OR 
    (select auth.uid()) = user2_id
  );

CREATE POLICY "Users can create couple link requests" 
  ON public.couples 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    (select auth.uid()) = user1_id OR 
    (select auth.uid()) = user2_id
  );

CREATE POLICY "Users can update own couple relationships" 
  ON public.couples 
  FOR UPDATE 
  TO authenticated 
  USING (
    (select auth.uid()) = user1_id OR 
    (select auth.uid()) = user2_id
  )
  WITH CHECK (
    (select auth.uid()) = user1_id OR 
    (select auth.uid()) = user2_id
  );

CREATE POLICY "Users can delete own couple relationships" 
  ON public.couples 
  FOR DELETE 
  TO authenticated 
  USING (
    (select auth.uid()) = user1_id OR 
    (select auth.uid()) = user2_id
  );

-- =====================================================
-- 9. FIX FUNCTION SEARCH PATHS
-- =====================================================

-- Fix search_users_by_location function
DROP FUNCTION IF EXISTS public.search_users_by_location(float8, float8, float8);
CREATE OR REPLACE FUNCTION public.search_users_by_location(
  user_lat float8,
  user_lng float8,
  radius_km float8
)
RETURNS TABLE (
  id uuid,
  name text,
  profile_picture text,
  headline text,
  distance_km float8
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.profile_picture,
    u.headline,
    (
      6371 * acos(
        cos(radians(user_lat)) * 
        cos(radians((u.location->>'lat')::float8)) * 
        cos(radians((u.location->>'lng')::float8) - radians(user_lng)) + 
        sin(radians(user_lat)) * 
        sin(radians((u.location->>'lat')::float8))
      )
    ) AS distance_km
  FROM public.users u
  WHERE u.location IS NOT NULL
  AND (
    6371 * acos(
      cos(radians(user_lat)) * 
      cos(radians((u.location->>'lat')::float8)) * 
      cos(radians((u.location->>'lng')::float8) - radians(user_lng)) + 
      sin(radians(user_lat)) * 
      sin(radians((u.location->>'lat')::float8))
    )
  ) <= radius_km
  ORDER BY distance_km;
END;
$$;

-- Fix update_updated_at_column function
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers for update_updated_at_column
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_matches_updated_at ON public.matches;
CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_verification_requests_updated_at ON public.verification_requests;
CREATE TRIGGER update_verification_requests_updated_at
  BEFORE UPDATE ON public.verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_meetup_invites_updated_at ON public.meetup_invites;
CREATE TRIGGER update_meetup_invites_updated_at
  BEFORE UPDATE ON public.meetup_invites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_device_tokens_updated_at ON public.device_tokens;
CREATE TRIGGER update_device_tokens_updated_at
  BEFORE UPDATE ON public.device_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Fix approve_verification_request function
DROP FUNCTION IF EXISTS public.approve_verification_request(uuid);
CREATE OR REPLACE FUNCTION public.approve_verification_request(request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid;
  v_photo_url text;
BEGIN
  -- Get the user_id and photo_url from the request
  SELECT user_id, photo_url 
  INTO v_user_id, v_photo_url
  FROM public.verification_requests
  WHERE id = request_id;

  -- Update the verification request
  UPDATE public.verification_requests
  SET 
    status = 'approved',
    reviewed_at = now()
  WHERE id = request_id;

  -- Update the user's verification status and photo
  UPDATE public.users
  SET 
    verification_status = 'verified',
    verification_photo = v_photo_url
  WHERE id = v_user_id;
END;
$$;