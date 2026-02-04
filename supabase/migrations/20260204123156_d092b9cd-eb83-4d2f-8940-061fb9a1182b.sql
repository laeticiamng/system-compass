-- =======================================================
-- SECURITY HARDENING v5.2: Final security fixes
-- =======================================================

-- 1. GAME_STATISTICS: Secure leaderboard view
DROP POLICY IF EXISTS "Leaderboard visible to all authenticated" ON public.game_statistics;

CREATE OR REPLACE VIEW public.game_leaderboard_safe AS
SELECT 
  gs.user_id,
  p.display_name,
  gs.best_score_solo,
  gs.best_score_race,
  gs.total_games_played
FROM public.game_statistics gs
LEFT JOIN public.profiles p ON p.id = gs.user_id
WHERE gs.best_score_solo > 0 OR gs.best_score_race > 0
ORDER BY GREATEST(COALESCE(gs.best_score_solo, 0), COALESCE(gs.best_score_race, 0)) DESC
LIMIT 100;

GRANT SELECT ON public.game_leaderboard_safe TO authenticated;

-- 2. ADMIN_AUDIT_LOG table
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_count INTEGER,
  ip_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view own audit logs"
  ON public.admin_audit_log FOR SELECT
  TO authenticated
  USING (admin_user_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));

-- 3. SUBSCRIPTION_PLANS: Admin-only write
CREATE POLICY "Only admins can insert plans"
  ON public.subscription_plans FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update plans"
  ON public.subscription_plans FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete plans"
  ON public.subscription_plans FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. FINANCIAL_INTEL: Admin-only INSERT
DROP POLICY IF EXISTS "Authenticated users can create snapshots" ON public.financial_intel_country_snapshots;

CREATE POLICY "Only admins can create financial intel snapshots"
  ON public.financial_intel_country_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. EVENT_REGISTRATIONS: Rate limiting
ALTER TABLE public.event_registrations 
ADD COLUMN IF NOT EXISTS registration_ip_hash TEXT;

CREATE OR REPLACE FUNCTION public.check_event_registration_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*) 
    FROM public.event_registrations 
    WHERE (guest_email = NEW.guest_email OR user_id = NEW.user_id)
    AND created_at > NOW() - INTERVAL '24 hours'
  ) >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded: maximum 5 registrations per 24 hours';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS event_registration_rate_limit ON public.event_registrations;
CREATE TRIGGER event_registration_rate_limit
  BEFORE INSERT ON public.event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.check_event_registration_limit();

-- 6. PUSH_SUBSCRIPTIONS: Atomic quota check
CREATE OR REPLACE FUNCTION public.check_push_subscription_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*) 
    FROM public.push_subscriptions 
    WHERE user_id = NEW.user_id
    FOR UPDATE
  ) >= 5 THEN
    RAISE EXCEPTION 'Subscription limit exceeded: maximum 5 push subscriptions';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS push_subscription_limit ON public.push_subscriptions;
CREATE TRIGGER push_subscription_limit
  BEFORE INSERT ON public.push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.check_push_subscription_limit();

-- 7. PMO_GENERATED_PACKS: Expired share policy
DROP POLICY IF EXISTS "Anyone can view shared packs with token" ON public.pmo_generated_packs;

CREATE POLICY "Public can view non-expired shared packs"
  ON public.pmo_generated_packs FOR SELECT
  USING (
    share_token IS NOT NULL 
    AND (share_expires_at IS NULL OR share_expires_at > NOW())
  );

-- 8. GDPR consent tracking
CREATE TABLE IF NOT EXISTS public.gdpr_consent_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id TEXT,
  consent_type TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL,
  ip_hash TEXT,
  user_agent_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.gdpr_consent_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consent"
  ON public.gdpr_consent_log FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own consent"
  ON public.gdpr_consent_log FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anon can insert consent by session"
  ON public.gdpr_consent_log FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Users can update own consent"
  ON public.gdpr_consent_log FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- 9. Performance indexes
CREATE INDEX IF NOT EXISTS idx_game_statistics_scores 
  ON public.game_statistics (best_score_solo DESC, best_score_race DESC) 
  WHERE best_score_solo > 0 OR best_score_race > 0;

CREATE INDEX IF NOT EXISTS idx_event_registrations_rate_limit 
  ON public.event_registrations (guest_email, created_at) 
  WHERE guest_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_count 
  ON public.push_subscriptions (user_id);

CREATE INDEX IF NOT EXISTS idx_gdpr_consent_user 
  ON public.gdpr_consent_log (user_id, consent_type);