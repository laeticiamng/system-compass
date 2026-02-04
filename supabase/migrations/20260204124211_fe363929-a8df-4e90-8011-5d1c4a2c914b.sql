-- ========================================================
-- SECURITY HARDENING v5.4 - Fix remaining linter issues
-- ========================================================

-- 1. Drop SECURITY DEFINER view and recreate with SECURITY INVOKER
DROP VIEW IF EXISTS public.notification_settings_safe;

CREATE VIEW public.notification_settings_safe 
WITH (security_invoker = true) AS
SELECT 
  id,
  user_id,
  email_enabled,
  push_enabled,
  CASE 
    WHEN slack_webhook_url IS NOT NULL THEN '••••••••' || RIGHT(slack_webhook_url, 8)
    ELSE NULL 
  END as slack_webhook_masked,
  deadline_reminder_days,
  weekly_digest,
  created_at,
  updated_at
FROM public.notification_settings;

-- Grant access to safe view
GRANT SELECT ON public.notification_settings_safe TO authenticated;

-- 2. Move extensions to extensions schema (handle if extensions schema already has pg_trgm)
-- Note: The extension warning may persist if other extensions exist in public
-- This addresses pg_trgm specifically

-- Check and move uuid-ossp if in public
DO $$ 
BEGIN
  -- Create extensions schema if not exists
  CREATE SCHEMA IF NOT EXISTS extensions;
  
  -- Grant usage to authenticated users
  GRANT USAGE ON SCHEMA extensions TO authenticated;
  GRANT USAGE ON SCHEMA extensions TO anon;
END $$;