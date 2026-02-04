-- ============================================
-- SECURITY HARDENING v4 - Complete Audit Fix
-- Addresses 21 security findings from audit
-- ============================================

-- 1. PROFILES - Block anonymous access completely
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "profiles_select_owner_only"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_owner_only"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_owner_only"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. USER_SUBSCRIPTIONS - Strict owner-only access
DROP POLICY IF EXISTS "Users can view own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.user_subscriptions;

CREATE POLICY "subscriptions_select_owner_only"
  ON public.user_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_insert_owner_only"
  ON public.user_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subscriptions_update_owner_only"
  ON public.user_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. AI_ACTIVITY_LOG - Owner-only, no admin access
DROP POLICY IF EXISTS "Users can view own ai activity" ON public.ai_activity_log;
DROP POLICY IF EXISTS "Users can insert own ai activity" ON public.ai_activity_log;

CREATE POLICY "ai_activity_select_owner_only"
  ON public.ai_activity_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "ai_activity_insert_owner_only"
  ON public.ai_activity_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 4. USER_CASES - Strict owner access for business intelligence
DROP POLICY IF EXISTS "Users can view own cases" ON public.user_cases;
DROP POLICY IF EXISTS "Users can insert own cases" ON public.user_cases;
DROP POLICY IF EXISTS "Users can update own cases" ON public.user_cases;
DROP POLICY IF EXISTS "Users can delete own cases" ON public.user_cases;

CREATE POLICY "user_cases_select_owner"
  ON public.user_cases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_cases_insert_owner"
  ON public.user_cases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_cases_update_owner"
  ON public.user_cases FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_cases_delete_owner"
  ON public.user_cases FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. TRACEOS_DECISIONS - Strict owner access
DROP POLICY IF EXISTS "Users can view own decisions" ON public.traceos_decisions;
DROP POLICY IF EXISTS "Users can insert own decisions" ON public.traceos_decisions;
DROP POLICY IF EXISTS "Users can update own decisions" ON public.traceos_decisions;
DROP POLICY IF EXISTS "Users can delete own decisions" ON public.traceos_decisions;

CREATE POLICY "traceos_decisions_select_owner"
  ON public.traceos_decisions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "traceos_decisions_insert_owner"
  ON public.traceos_decisions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "traceos_decisions_update_owner"
  ON public.traceos_decisions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "traceos_decisions_delete_owner"
  ON public.traceos_decisions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 6. PMO_EVIDENCE_VAULT - Strict owner access
DROP POLICY IF EXISTS "Users can manage own evidence" ON public.pmo_evidence_vault;
DROP POLICY IF EXISTS "Users can view own evidence" ON public.pmo_evidence_vault;

CREATE POLICY "pmo_evidence_all_owner"
  ON public.pmo_evidence_vault FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. PMO_BUDGET_LINES - Strict owner access
DROP POLICY IF EXISTS "Users can manage own budget lines" ON public.pmo_budget_lines;
DROP POLICY IF EXISTS "Users can view own budget lines" ON public.pmo_budget_lines;

CREATE POLICY "pmo_budget_all_owner"
  ON public.pmo_budget_lines FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8. CASE_GOVERNANCE_ACTORS - Fixed with proper UUID cast
DROP POLICY IF EXISTS "Users can manage own governance actors" ON public.case_governance_actors;

CREATE POLICY "governance_actors_select_owner"
  ON public.case_governance_actors FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_cases 
    WHERE user_cases.id = case_governance_actors.case_id::uuid 
    AND user_cases.user_id = auth.uid()
  ));

CREATE POLICY "governance_actors_insert_owner"
  ON public.case_governance_actors FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_cases 
    WHERE user_cases.id = case_governance_actors.case_id::uuid 
    AND user_cases.user_id = auth.uid()
  ));

CREATE POLICY "governance_actors_update_owner"
  ON public.case_governance_actors FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_cases 
    WHERE user_cases.id = case_governance_actors.case_id::uuid 
    AND user_cases.user_id = auth.uid()
  ));

CREATE POLICY "governance_actors_delete_owner"
  ON public.case_governance_actors FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_cases 
    WHERE user_cases.id = case_governance_actors.case_id::uuid 
    AND user_cases.user_id = auth.uid()
  ));

-- 9. IRREVERSA_THRESHOLDS - Strict owner access
DROP POLICY IF EXISTS "Users can view own thresholds" ON public.irreversa_thresholds;
DROP POLICY IF EXISTS "Users can insert own thresholds" ON public.irreversa_thresholds;
DROP POLICY IF EXISTS "Users can update own thresholds" ON public.irreversa_thresholds;
DROP POLICY IF EXISTS "Users can delete own thresholds" ON public.irreversa_thresholds;

CREATE POLICY "irreversa_select_owner"
  ON public.irreversa_thresholds FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "irreversa_insert_owner"
  ON public.irreversa_thresholds FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "irreversa_update_owner"
  ON public.irreversa_thresholds FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "irreversa_delete_owner"
  ON public.irreversa_thresholds FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 10. AI_USAGE_METERING - Read-only for users
DROP POLICY IF EXISTS "Users can view own ai usage" ON public.ai_usage_metering;
DROP POLICY IF EXISTS "Users can insert own ai usage" ON public.ai_usage_metering;
DROP POLICY IF EXISTS "Users can update own ai usage" ON public.ai_usage_metering;

CREATE POLICY "ai_usage_select_owner_only"
  ON public.ai_usage_metering FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 11. GAME_STATISTICS - Restrict direct updates
DROP POLICY IF EXISTS "Users can view own game statistics" ON public.game_statistics;
DROP POLICY IF EXISTS "Users can insert own game statistics" ON public.game_statistics;
DROP POLICY IF EXISTS "Users can update own game statistics" ON public.game_statistics;

CREATE POLICY "game_stats_select_owner"
  ON public.game_statistics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "game_stats_insert_owner"
  ON public.game_statistics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create secure function for updating game stats
CREATE OR REPLACE FUNCTION public.update_game_stats(
  p_user_id UUID,
  p_games_played INT DEFAULT 1,
  p_turns_played INT DEFAULT 0,
  p_score_solo INT DEFAULT NULL,
  p_score_race INT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO game_statistics (user_id, total_games_played, total_turns_played, best_score_solo, best_score_race, last_game_at)
  VALUES (p_user_id, p_games_played, p_turns_played, COALESCE(p_score_solo, 0), COALESCE(p_score_race, 0), now())
  ON CONFLICT (user_id) DO UPDATE SET
    total_games_played = game_statistics.total_games_played + EXCLUDED.total_games_played,
    total_turns_played = game_statistics.total_turns_played + EXCLUDED.total_turns_played,
    best_score_solo = GREATEST(game_statistics.best_score_solo, EXCLUDED.best_score_solo),
    best_score_race = GREATEST(game_statistics.best_score_race, EXCLUDED.best_score_race),
    last_game_at = now(),
    updated_at = now();
END;
$$;

-- 12. PUSH_SUBSCRIPTIONS - Limit per user
DROP POLICY IF EXISTS "Users can manage own push subscriptions" ON public.push_subscriptions;

CREATE POLICY "push_subs_select_owner"
  ON public.push_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "push_subs_insert_owner"
  ON public.push_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND 
    (SELECT COUNT(*) FROM public.push_subscriptions WHERE user_id = auth.uid()) < 5
  );

CREATE POLICY "push_subs_delete_owner"
  ON public.push_subscriptions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 13. USER_NOTIFICATIONS - Strict owner access
DROP POLICY IF EXISTS "Users can view own notifications" ON public.user_notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.user_notifications;

CREATE POLICY "notifications_select_owner"
  ON public.user_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_owner"
  ON public.user_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_delete_owner"
  ON public.user_notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 14. ANALYTICS_EVENTS - Allow anonymous insert but restrict select
DROP POLICY IF EXISTS "Users can view own analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Users can insert analytics events" ON public.analytics_events;

CREATE POLICY "analytics_events_select_owner"
  ON public.analytics_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "analytics_events_insert_any"
  ON public.analytics_events FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- 15. ANALYTICS_SESSIONS - Strict access
DROP POLICY IF EXISTS "Users can view own sessions" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Users can manage own sessions" ON public.analytics_sessions;

CREATE POLICY "analytics_sessions_select_owner"
  ON public.analytics_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "analytics_sessions_insert_any"
  ON public.analytics_sessions FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "analytics_sessions_update_owner"
  ON public.analytics_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

-- 16. Ensure all tables have RLS enabled
ALTER TABLE IF EXISTS public.vacation_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.saved_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.dashboard_progress ENABLE ROW LEVEL SECURITY;

-- 17. Add data retention comment (for documentation)
COMMENT ON TABLE public.ai_activity_log IS 'User AI activity log. Retention policy: 90 days recommended.';
COMMENT ON TABLE public.analytics_events IS 'User analytics events. Retention policy: 30 days recommended.';
COMMENT ON TABLE public.analytics_sessions IS 'User sessions tracking. Retention policy: 90 days recommended.';