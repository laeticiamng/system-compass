-- Fix 1: Secure analytics_daily_stats view with RLS
-- First check if it's a view and recreate as a table with proper RLS

-- Create a secure version of analytics stats accessible only to admins
CREATE TABLE IF NOT EXISTS public.analytics_daily_stats_secure (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  total_sessions INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  avg_session_duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(date)
);

-- Enable RLS
ALTER TABLE public.analytics_daily_stats_secure ENABLE ROW LEVEL SECURITY;

-- Only admins can read analytics
CREATE POLICY "Only admins can read analytics stats"
ON public.analytics_daily_stats_secure
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert/update
CREATE POLICY "Only admins can insert analytics stats"
ON public.analytics_daily_stats_secure
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update analytics stats"
ON public.analytics_daily_stats_secure
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_analytics_daily_stats_updated_at
BEFORE UPDATE ON public.analytics_daily_stats_secure
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();