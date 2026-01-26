-- Fix analytics_sessions RLS - restrict to authenticated users viewing their own data
DROP POLICY IF EXISTS "Users can view own sessions" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Users can manage own sessions" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON public.analytics_sessions;

-- Select: users can only view their own sessions
CREATE POLICY "Users can view own sessions"
ON public.analytics_sessions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Insert: users can only insert their own sessions
CREATE POLICY "Users can insert own sessions"
ON public.analytics_sessions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Update: users can only update their own sessions
CREATE POLICY "Users can update own sessions"
ON public.analytics_sessions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);