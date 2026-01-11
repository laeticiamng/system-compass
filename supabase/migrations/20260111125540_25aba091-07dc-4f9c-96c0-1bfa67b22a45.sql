-- Drop and recreate the view without SECURITY DEFINER
DROP VIEW IF EXISTS public.analytics_daily_stats;

CREATE VIEW public.analytics_daily_stats AS
SELECT 
    date(created_at) AS date,
    event_name,
    event_category,
    count(*) AS event_count,
    count(DISTINCT session_id) AS unique_sessions
FROM analytics_events
GROUP BY date(created_at), event_name, event_category;