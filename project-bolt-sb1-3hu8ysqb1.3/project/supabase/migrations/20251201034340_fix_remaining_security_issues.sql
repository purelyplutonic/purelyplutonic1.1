/*
  # Fix Remaining Security Issues

  ## Changes Made

  ### 1. Consolidate Multiple Permissive Policies
  - Merge the two SELECT policies on users table into a single policy
  - This eliminates the "Multiple Permissive Policies" warning

  ### 2. Fix Function Search Path
  - Fix the second search_users_by_location function to have immutable search_path
  
  ### 3. Note on Unused Indexes
  - Unused index warnings are expected when the database has no data
  - All indexes are properly covering foreign keys and will be used in production
  - Keeping indexes as they support query optimization for:
    - Foreign key relationships
    - Common query patterns (status, datetime filters)
    - Token lookups for push notifications
*/

-- =====================================================
-- 1. CONSOLIDATE USERS SELECT POLICIES
-- =====================================================

-- Drop the two separate SELECT policies
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can read other users public data" ON public.users;

-- Create a single consolidated SELECT policy
-- Users can read all user data (needed for browsing/matching)
CREATE POLICY "Users can read all user data" 
  ON public.users 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- =====================================================
-- 2. FIX SECOND SEARCH_USERS_BY_LOCATION FUNCTION
-- =====================================================

-- Fix the overloaded version with 4 parameters
DROP FUNCTION IF EXISTS public.search_users_by_location(float8, float8, integer, uuid);

CREATE OR REPLACE FUNCTION public.search_users_by_location(
  p_latitude float8,
  p_longitude float8,
  p_radius integer,
  p_user_id uuid
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