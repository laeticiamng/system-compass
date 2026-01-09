-- Create analytics events table for KPI tracking
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  event_category TEXT NOT NULL,
  session_id TEXT NOT NULL,
  user_id UUID,
  page_path TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_analytics_events_name ON public.analytics_events(event_name);
CREATE INDEX idx_analytics_events_category ON public.analytics_events(event_category);
CREATE INDEX idx_analytics_events_session ON public.analytics_events(session_id);
CREATE INDEX idx_analytics_events_created ON public.analytics_events(created_at DESC);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert events (anonymous tracking)
CREATE POLICY "Anyone can insert analytics events"
ON public.analytics_events
FOR INSERT
WITH CHECK (true);

-- Policy: Only authenticated users can read (admin dashboard)
CREATE POLICY "Authenticated users can read analytics"
ON public.analytics_events
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Create daily aggregates view for performance
CREATE VIEW public.analytics_daily_stats AS
SELECT 
  DATE(created_at) as date,
  event_name,
  event_category,
  COUNT(*) as event_count,
  COUNT(DISTINCT session_id) as unique_sessions
FROM public.analytics_events
GROUP BY DATE(created_at), event_name, event_category;

-- Create retention tracking table
CREATE TABLE public.analytics_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  first_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  visit_count INTEGER NOT NULL DEFAULT 1,
  user_id UUID
);

CREATE INDEX idx_analytics_sessions_id ON public.analytics_sessions(session_id);
CREATE INDEX idx_analytics_sessions_first_seen ON public.analytics_sessions(first_seen_at);

-- Enable RLS
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can upsert sessions
CREATE POLICY "Anyone can upsert sessions"
ON public.analytics_sessions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update sessions"
ON public.analytics_sessions
FOR UPDATE
USING (true);

-- Policy: Only authenticated users can read
CREATE POLICY "Authenticated users can read sessions"
ON public.analytics_sessions
FOR SELECT
USING (auth.uid() IS NOT NULL);