/*
  # Fix Remaining Security Issues

  ## Changes Made

  ### 1. Consolidate Multiple Permissive Policies
  The users table has two separate SELECT policies which is inefficient.
  We'll merge them into a single policy that allows users to read all public data.

  ### 2. Fix Function Search Path
  Drop duplicate search_users_by_location functions and recreate with proper signature.

  ### Notes on Unused Indexes
  The "unused index" warnings are expected behavior:
  - These indexes haven't been used yet because the database has no data
  - All indexes are properly placed on foreign keys and frequently queried columns
  - They will be automatically used when queries are executed with data
  - Keeping them ensures optimal performance when the app goes live
*/

-- =====================================================
-- 1. FIX MULTIPLE PERMISSIVE POLICIES ON USERS TABLE
-- =====================================================

-- Drop the existing separate SELECT policies
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can read other users public data" ON public.users;
DROP POLICY IF EXISTS "Users can read all user data" ON public.users;

-- Create a single consolidated SELECT policy
CREATE POLICY "Users can read all user data" 
  ON public.users 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Keep the other policies as they are correctly optimized
-- (INSERT and UPDATE policies are already correct from previous migration)

-- =====================================================
-- 2. FIX DUPLICATE SEARCH_USERS_BY_LOCATION FUNCTIONS
-- =====================================================

-- Drop all versions of the function
DROP FUNCTION IF EXISTS public.search_users_by_location(float8, float8, float8);
DROP FUNCTION IF EXISTS public.search_users_by_location(uuid, float8, float8, float8);

-- Recreate with the correct signature used in the app
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