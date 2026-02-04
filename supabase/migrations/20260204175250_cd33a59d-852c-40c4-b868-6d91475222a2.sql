-- =====================================================
-- AUDIT v6.3 - COMPLETE RLS HARDENING MIGRATION (PART 2)
-- Fix remaining policies with proper DROP IF EXISTS
-- =====================================================

-- Drop the conflicting policy first
DROP POLICY IF EXISTS "Users can update own sessions" ON public.analytics_sessions;

-- 4. event_registrations - Owner + admin only
DROP POLICY IF EXISTS "Users can view own registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Users can create registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Anyone can register for events" ON public.event_registrations;
DROP POLICY IF EXISTS "Users can view own event registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Users can create event registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Users can update own registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Users can delete own registrations" ON public.event_registrations;
CREATE POLICY "Users can view own event registrations" ON public.event_registrations
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create event registrations" ON public.event_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can update own registrations" ON public.event_registrations
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own registrations" ON public.event_registrations
  FOR DELETE USING (auth.uid() = user_id);

-- 5. gdpr_consent_log - Owner only
DROP POLICY IF EXISTS "Users can view own consent" ON public.gdpr_consent_log;
DROP POLICY IF EXISTS "Users can insert consent" ON public.gdpr_consent_log;
DROP POLICY IF EXISTS "Anyone can insert consent" ON public.gdpr_consent_log;
DROP POLICY IF EXISTS "Users can view own consent records" ON public.gdpr_consent_log;
DROP POLICY IF EXISTS "Anyone can insert consent record" ON public.gdpr_consent_log;
CREATE POLICY "Users can view own consent records" ON public.gdpr_consent_log
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can insert consent record" ON public.gdpr_consent_log
  FOR INSERT WITH CHECK (true);

-- 6. profiles - Owner only 
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by owner" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 7. game_statistics - Owner only
DROP POLICY IF EXISTS "Users can view own game stats" ON public.game_statistics;
DROP POLICY IF EXISTS "Anyone can view game statistics" ON public.game_statistics;
DROP POLICY IF EXISTS "Users can view own game statistics" ON public.game_statistics;
DROP POLICY IF EXISTS "Users can insert own game statistics" ON public.game_statistics;
DROP POLICY IF EXISTS "Users can update own game statistics" ON public.game_statistics;
CREATE POLICY "Users can view own game statistics" ON public.game_statistics
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own game statistics" ON public.game_statistics
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own game statistics" ON public.game_statistics
  FOR UPDATE USING (auth.uid() = user_id);

-- 8. user_subscriptions - Owner only
DROP POLICY IF EXISTS "Users can view own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Anyone can view subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can view own subscription" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscription" ON public.user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON public.user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- 9. ai_usage_metering - Owner only
DROP POLICY IF EXISTS "Users can view own AI usage" ON public.ai_usage_metering;
DROP POLICY IF EXISTS "Anyone can view AI usage" ON public.ai_usage_metering;
CREATE POLICY "Users can view own AI usage" ON public.ai_usage_metering
  FOR SELECT USING (auth.uid() = user_id);

-- 10. ai_activity_log - Owner only
DROP POLICY IF EXISTS "Users can view own AI activity" ON public.ai_activity_log;
DROP POLICY IF EXISTS "Anyone can view AI activity" ON public.ai_activity_log;
DROP POLICY IF EXISTS "Users can insert own AI activity" ON public.ai_activity_log;
CREATE POLICY "Users can view own AI activity" ON public.ai_activity_log
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own AI activity" ON public.ai_activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 11. user_cases - Owner only
DROP POLICY IF EXISTS "Users can view own cases" ON public.user_cases;
DROP POLICY IF EXISTS "Anyone can view user cases" ON public.user_cases;
DROP POLICY IF EXISTS "Users can create own cases" ON public.user_cases;
DROP POLICY IF EXISTS "Users can update own cases" ON public.user_cases;
DROP POLICY IF EXISTS "Users can delete own cases" ON public.user_cases;
CREATE POLICY "Users can view own cases" ON public.user_cases
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own cases" ON public.user_cases
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cases" ON public.user_cases
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cases" ON public.user_cases
  FOR DELETE USING (auth.uid() = user_id);

-- 12. user_governance_notes - Owner only
DROP POLICY IF EXISTS "Users can view own governance notes" ON public.user_governance_notes;
DROP POLICY IF EXISTS "Anyone can view governance notes" ON public.user_governance_notes;
DROP POLICY IF EXISTS "Users can manage own governance notes" ON public.user_governance_notes;
CREATE POLICY "Users can manage own governance notes" ON public.user_governance_notes
  FOR ALL USING (auth.uid() = user_id);

-- 13. traceos_decisions - Owner only
DROP POLICY IF EXISTS "Users can view own decisions" ON public.traceos_decisions;
DROP POLICY IF EXISTS "Anyone can view decisions" ON public.traceos_decisions;
DROP POLICY IF EXISTS "Users can manage own TraceOS decisions" ON public.traceos_decisions;
CREATE POLICY "Users can manage own TraceOS decisions" ON public.traceos_decisions
  FOR ALL USING (auth.uid() = user_id);

-- 14. pmo_risk_register - Owner via case
DROP POLICY IF EXISTS "Users can view own risks" ON public.pmo_risk_register;
DROP POLICY IF EXISTS "Anyone can view risks" ON public.pmo_risk_register;
DROP POLICY IF EXISTS "Users can manage own risk register" ON public.pmo_risk_register;
CREATE POLICY "Users can manage own risk register" ON public.pmo_risk_register
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_cases WHERE id = pmo_risk_register.case_id AND user_id = auth.uid())
  );

-- 15. pmo_budget_lines - Owner via case
DROP POLICY IF EXISTS "Users can view own budget" ON public.pmo_budget_lines;
DROP POLICY IF EXISTS "Anyone can view budget" ON public.pmo_budget_lines;
DROP POLICY IF EXISTS "Users can manage own budget lines" ON public.pmo_budget_lines;
CREATE POLICY "Users can manage own budget lines" ON public.pmo_budget_lines
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_cases WHERE id = pmo_budget_lines.case_id AND user_id = auth.uid())
  );

-- 16. pmo_evidence_vault - Owner via case
DROP POLICY IF EXISTS "Users can view own evidence" ON public.pmo_evidence_vault;
DROP POLICY IF EXISTS "Anyone can view evidence" ON public.pmo_evidence_vault;
DROP POLICY IF EXISTS "Users can manage own evidence vault" ON public.pmo_evidence_vault;
CREATE POLICY "Users can manage own evidence vault" ON public.pmo_evidence_vault
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_cases WHERE id = pmo_evidence_vault.case_id AND user_id = auth.uid())
  );

-- 17. case_governance_actors - Owner via case
DROP POLICY IF EXISTS "Users can view actors for own cases" ON public.case_governance_actors;
DROP POLICY IF EXISTS "Anyone can view governance actors" ON public.case_governance_actors;
DROP POLICY IF EXISTS "Users can manage actors for own cases" ON public.case_governance_actors;
CREATE POLICY "Users can manage actors for own cases" ON public.case_governance_actors
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_cases WHERE id = case_governance_actors.case_id AND user_id = auth.uid())
  );

-- 18. case_governance_partners - Owner via case
DROP POLICY IF EXISTS "Users can view partners for own cases" ON public.case_governance_partners;
DROP POLICY IF EXISTS "Anyone can view governance partners" ON public.case_governance_partners;
DROP POLICY IF EXISTS "Users can manage partners for own cases" ON public.case_governance_partners;
CREATE POLICY "Users can manage partners for own cases" ON public.case_governance_partners
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_cases WHERE id = case_governance_partners.case_id AND user_id = auth.uid())
  );

-- 19. irreversa_thresholds - Owner only
DROP POLICY IF EXISTS "Users can view own thresholds" ON public.irreversa_thresholds;
DROP POLICY IF EXISTS "Anyone can view thresholds" ON public.irreversa_thresholds;
DROP POLICY IF EXISTS "Users can manage own Irreversa thresholds" ON public.irreversa_thresholds;
CREATE POLICY "Users can manage own Irreversa thresholds" ON public.irreversa_thresholds
  FOR ALL USING (auth.uid() = user_id);

-- 20. latent_zones - Owner only
DROP POLICY IF EXISTS "Users can view own zones" ON public.latent_zones;
DROP POLICY IF EXISTS "Anyone can view latent zones" ON public.latent_zones;
DROP POLICY IF EXISTS "Users can manage own latent zones" ON public.latent_zones;
CREATE POLICY "Users can manage own latent zones" ON public.latent_zones
  FOR ALL USING (auth.uid() = user_id);

-- 21. push_subscriptions - Owner only
DROP POLICY IF EXISTS "Users can manage own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Anyone can view push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can manage own push subscriptions" ON public.push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- 22. user_notifications - Owner only
DROP POLICY IF EXISTS "Users can view own notifications" ON public.user_notifications;
DROP POLICY IF EXISTS "Anyone can view notifications" ON public.user_notifications;
DROP POLICY IF EXISTS "Users can manage own notifications" ON public.user_notifications;
CREATE POLICY "Users can manage own notifications" ON public.user_notifications
  FOR ALL USING (auth.uid() = user_id);

-- 23. saved_comparisons - Owner only
DROP POLICY IF EXISTS "Users can view own comparisons" ON public.saved_comparisons;
DROP POLICY IF EXISTS "Anyone can view comparisons" ON public.saved_comparisons;
DROP POLICY IF EXISTS "Users can manage own saved comparisons" ON public.saved_comparisons;
CREATE POLICY "Users can manage own saved comparisons" ON public.saved_comparisons
  FOR ALL USING (auth.uid() = user_id);

-- 24. saved_analyses - Owner only
DROP POLICY IF EXISTS "Users can view own analyses" ON public.saved_analyses;
DROP POLICY IF EXISTS "Anyone can view analyses" ON public.saved_analyses;
DROP POLICY IF EXISTS "Users can manage own saved analyses" ON public.saved_analyses;
CREATE POLICY "Users can manage own saved analyses" ON public.saved_analyses
  FOR ALL USING (auth.uid() = user_id);

-- 25. dashboard_progress - Owner only
DROP POLICY IF EXISTS "Users can view own progress" ON public.dashboard_progress;
DROP POLICY IF EXISTS "Anyone can view progress" ON public.dashboard_progress;
DROP POLICY IF EXISTS "Users can manage own dashboard progress" ON public.dashboard_progress;
CREATE POLICY "Users can manage own dashboard progress" ON public.dashboard_progress
  FOR ALL USING (auth.uid() = user_id);

-- 26. exit_keys_history - Owner only
DROP POLICY IF EXISTS "Users can view own exit key history" ON public.exit_keys_history;
DROP POLICY IF EXISTS "Anyone can view exit key history" ON public.exit_keys_history;
DROP POLICY IF EXISTS "Users can manage own exit keys history" ON public.exit_keys_history;
CREATE POLICY "Users can manage own exit keys history" ON public.exit_keys_history
  FOR ALL USING (auth.uid() = user_id);

-- 27. user_test_results - Owner only
DROP POLICY IF EXISTS "Users can view own test results" ON public.user_test_results;
DROP POLICY IF EXISTS "Anyone can view test results" ON public.user_test_results;
DROP POLICY IF EXISTS "Users can manage own test results" ON public.user_test_results;
CREATE POLICY "Users can manage own test results" ON public.user_test_results
  FOR ALL USING (auth.uid() = user_id);

-- 28. gamification_progress - Owner only
DROP POLICY IF EXISTS "Users can view own gamification progress" ON public.gamification_progress;
DROP POLICY IF EXISTS "Anyone can view gamification progress" ON public.gamification_progress;
DROP POLICY IF EXISTS "Users can manage own gamification progress" ON public.gamification_progress;
CREATE POLICY "Users can manage own gamification progress" ON public.gamification_progress
  FOR ALL USING (auth.uid() = user_id);

-- 29. challenge_progress - Owner only
DROP POLICY IF EXISTS "Users can view own challenge progress" ON public.challenge_progress;
DROP POLICY IF EXISTS "Anyone can view challenge progress" ON public.challenge_progress;
DROP POLICY IF EXISTS "Users can manage own challenge progress" ON public.challenge_progress;
CREATE POLICY "Users can manage own challenge progress" ON public.challenge_progress
  FOR ALL USING (auth.uid() = user_id);

-- 30. saved_games - Owner only
DROP POLICY IF EXISTS "Users can view own saved games" ON public.saved_games;
DROP POLICY IF EXISTS "Anyone can view saved games" ON public.saved_games;
DROP POLICY IF EXISTS "Users can manage own saved games" ON public.saved_games;
CREATE POLICY "Users can manage own saved games" ON public.saved_games
  FOR ALL USING (auth.uid() = user_id);

-- Create secure leaderboard view for game statistics (public, no PII)
DROP VIEW IF EXISTS public.game_leaderboard;
CREATE VIEW public.game_leaderboard AS
SELECT 
  display_name,
  best_score_solo,
  best_score_race,
  total_games_played
FROM public.game_statistics
WHERE display_name IS NOT NULL
ORDER BY best_score_solo DESC NULLS LAST
LIMIT 100;

-- Grant access to the view
GRANT SELECT ON public.game_leaderboard TO anon, authenticated;