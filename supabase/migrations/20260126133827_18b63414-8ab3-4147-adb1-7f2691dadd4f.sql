-- Fix analytics_events RLS - restrict to authenticated users viewing their own data
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own events" ON public.analytics_events;
DROP POLICY IF EXISTS "Users can insert own events" ON public.analytics_events;

-- Select: users can only view their own events
CREATE POLICY "Users can view own events"
ON public.analytics_events FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Insert: users can only insert their own events
CREATE POLICY "Users can insert own events"
ON public.analytics_events FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Anonymous users can insert events without user_id
CREATE POLICY "Anonymous can insert events"
ON public.analytics_events FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);