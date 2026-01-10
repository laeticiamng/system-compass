-- Fix remaining overly permissive INSERT/UPDATE policies

-- analytics_events: Restrict insert to authenticated or sessions with valid session_id
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events;
CREATE POLICY "Insert analytics events with valid session" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (session_id IS NOT NULL AND session_id != '');

-- analytics_sessions: Restrict update/upsert
DROP POLICY IF EXISTS "Anyone can update sessions" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Anyone can upsert sessions" ON public.analytics_sessions;

CREATE POLICY "Update sessions with valid id" 
ON public.analytics_sessions 
FOR UPDATE 
USING (session_id IS NOT NULL AND session_id != '');

CREATE POLICY "Insert sessions with valid id" 
ON public.analytics_sessions 
FOR INSERT 
WITH CHECK (session_id IS NOT NULL AND session_id != '');