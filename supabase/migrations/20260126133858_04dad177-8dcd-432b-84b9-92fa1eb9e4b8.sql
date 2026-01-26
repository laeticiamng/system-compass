-- Clean up overly permissive policies on analytics tables
-- Keep only strict user_id = auth.uid() policies

-- analytics_sessions: remove overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can read sessions" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Insert sessions with valid id" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Update sessions with valid id" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Authenticated users can insert their own analytics sessions" ON public.analytics_sessions;

-- analytics_events: remove overly permissive policies  
DROP POLICY IF EXISTS "Authenticated users can read analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "Insert analytics events with valid session" ON public.analytics_events;
DROP POLICY IF EXISTS "Authenticated users can insert their own analytics events" ON public.analytics_events;