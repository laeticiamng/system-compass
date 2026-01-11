-- Fix RLS policies on analytics_events table - restrict to admins only
DROP POLICY IF EXISTS "Users can insert their own events" ON public.analytics_events;
DROP POLICY IF EXISTS "Users can view their own events" ON public.analytics_events;
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Admins can view all events" ON public.analytics_events;

-- Allow anonymous inserts for tracking (necessary for analytics)
CREATE POLICY "Anyone can insert analytics events" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view analytics data
CREATE POLICY "Admins can view all events" 
ON public.analytics_events 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Fix RLS policies on analytics_sessions table
DROP POLICY IF EXISTS "Users can manage their own sessions" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Anyone can manage sessions" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Anyone can insert sessions" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Anyone can update sessions" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.analytics_sessions;

-- Allow anonymous inserts/updates for session tracking
CREATE POLICY "Anyone can insert sessions" 
ON public.analytics_sessions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update sessions" 
ON public.analytics_sessions 
FOR UPDATE 
USING (true);

-- Only admins can view session data
CREATE POLICY "Admins can view all sessions" 
ON public.analytics_sessions 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));