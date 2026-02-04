-- ========================================================
-- SECURITY HARDENING v5.3 - Fix notification_settings view
-- ========================================================

-- 14. Add webhook URL masking view for notification_settings (corrected columns)
CREATE OR REPLACE VIEW public.notification_settings_safe AS
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
FROM public.notification_settings
WHERE auth.uid() = user_id;

-- Grant access to safe view
GRANT SELECT ON public.notification_settings_safe TO authenticated;

-- 15. Add retention policy trigger for gdpr_consent_log (remove IP hash after 90 days)
CREATE OR REPLACE FUNCTION public.anonymize_old_consent_logs()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.gdpr_consent_log 
  SET ip_hash = NULL, user_agent_hash = NULL
  WHERE created_at < NOW() - INTERVAL '90 days'
  AND (ip_hash IS NOT NULL OR user_agent_hash IS NOT NULL);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Run cleanup on insert
DROP TRIGGER IF EXISTS consent_log_cleanup ON public.gdpr_consent_log;
CREATE TRIGGER consent_log_cleanup
  AFTER INSERT ON public.gdpr_consent_log
  FOR EACH STATEMENT EXECUTE FUNCTION public.anonymize_old_consent_logs();

-- 16. Add additional protection for admin_audit_log (drop if exists first)
DROP POLICY IF EXISTS "admin_audit_admin_only" ON public.admin_audit_log;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_log;
DROP POLICY IF EXISTS "audit_log_admin_read_only" ON public.admin_audit_log;

CREATE POLICY "audit_log_admin_read_only"
  ON public.admin_audit_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Ensure RLS is enabled on all tables
ALTER TABLE IF EXISTS public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gdpr_consent_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_audit_log ENABLE ROW LEVEL SECURITY;