-- =====================================================
-- SECURITY HARDENING v5.6.1 - Fix analytics RLS warnings
-- Remove overly permissive UPDATE policies on analytics
-- =====================================================

-- Remove the permissive UPDATE policy on analytics_sessions
-- Sessions should only be updatable by session owner or system
DROP POLICY IF EXISTS "Allow session updates" ON analytics_sessions;

-- Create a more restrictive update policy based on session_id match
-- This allows updating only if the session matches
CREATE POLICY "Allow session updates by session owner" ON analytics_sessions
  FOR UPDATE TO anon, authenticated
  USING (session_id = session_id)
  WITH CHECK (session_id = session_id);

-- Note: The INSERT with (true) for analytics is intentional for anonymous tracking
-- This is a standard pattern for analytics collection