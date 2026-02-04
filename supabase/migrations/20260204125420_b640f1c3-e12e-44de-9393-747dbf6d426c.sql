-- =====================================================
-- SECURITY HARDENING v5.5.2 - Correct columns
-- =====================================================

-- Drop existing view first
DROP VIEW IF EXISTS public.notification_settings_safe CASCADE;

-- Recreate with actual column names
CREATE VIEW public.notification_settings_safe 
WITH (security_invoker = true)
AS
SELECT 
  id,
  user_id,
  email_enabled,
  push_enabled,
  deadline_reminder_days,
  weekly_digest,
  CASE 
    WHEN slack_webhook_url IS NOT NULL THEN '***CONFIGURED***'
    ELSE NULL
  END as slack_status,
  created_at,
  updated_at
FROM notification_settings
WHERE auth.uid() = user_id;

-- Grant access
GRANT SELECT ON public.notification_settings_safe TO authenticated;