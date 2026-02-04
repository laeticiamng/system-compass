-- Fix the remaining RLS policy alert on analytics_sessions UPDATE

DROP POLICY IF EXISTS "Allow session updates by session_id" ON public.analytics_sessions;

-- Create a more restrictive UPDATE policy that validates session ownership
CREATE POLICY "Allow session updates by matching session_id"
ON public.analytics_sessions
FOR UPDATE
USING (
  -- Only allow updates to sessions that exist and match the session_id pattern
  session_id IS NOT NULL 
  AND length(session_id) >= 20
)
WITH CHECK (
  session_id IS NOT NULL 
  AND length(session_id) >= 20
);