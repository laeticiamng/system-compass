-- =============================================
-- COMPREHENSIVE SECURITY HARDENING v3
-- Fix ALL remaining PUBLIC_USER_DATA errors
-- Block anonymous SELECT on sensitive tables
-- =============================================

-- 1. ANALYTICS_SESSIONS: Restrict to owner only
DROP POLICY IF EXISTS "Allow public read" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Analytics sessions viewable by owner" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Analytics sessions insertable" ON public.analytics_sessions;

CREATE POLICY "Analytics sessions viewable by owner only" 
ON public.analytics_sessions 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Analytics sessions insertable by authenticated" 
ON public.analytics_sessions 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 2. ANALYTICS_EVENTS: Restrict to owner only
DROP POLICY IF EXISTS "Allow public read" ON public.analytics_events;
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.analytics_events;
DROP POLICY IF EXISTS "Analytics events viewable by owner" ON public.analytics_events;

CREATE POLICY "Analytics events viewable by owner only" 
ON public.analytics_events 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Analytics events insertable by authenticated" 
ON public.analytics_events 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 3. GAME_STATISTICS: Restrict to owner + leaderboard view
DROP POLICY IF EXISTS "Allow public read for leaderboard" ON public.game_statistics;
DROP POLICY IF EXISTS "Game stats viewable by owner" ON public.game_statistics;
DROP POLICY IF EXISTS "Users can view own stats" ON public.game_statistics;
DROP POLICY IF EXISTS "Users can view game statistics" ON public.game_statistics;

CREATE POLICY "Game stats viewable by owner only" 
ON public.game_statistics 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- 4. USER_CASES: Restrict to owner only
DROP POLICY IF EXISTS "Users can view own cases" ON public.user_cases;
DROP POLICY IF EXISTS "User cases viewable by owner" ON public.user_cases;
DROP POLICY IF EXISTS "Allow public read" ON public.user_cases;

CREATE POLICY "User cases strictly owner only" 
ON public.user_cases 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "User cases insertable by owner" 
ON public.user_cases 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User cases updatable by owner" 
ON public.user_cases 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User cases deletable by owner" 
ON public.user_cases 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- 5. USER_GOVERNANCE_NOTES: Restrict to owner only
DROP POLICY IF EXISTS "Users can view own notes" ON public.user_governance_notes;
DROP POLICY IF EXISTS "Allow public read" ON public.user_governance_notes;

CREATE POLICY "Governance notes viewable by owner only" 
ON public.user_governance_notes 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Governance notes insertable by owner" 
ON public.user_governance_notes 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Governance notes updatable by owner" 
ON public.user_governance_notes 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Governance notes deletable by owner" 
ON public.user_governance_notes 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- 6. TRACEOS_DECISIONS: Restrict to owner only
DROP POLICY IF EXISTS "Users can view own decisions" ON public.traceos_decisions;
DROP POLICY IF EXISTS "Allow public read" ON public.traceos_decisions;

CREATE POLICY "TraceOS decisions viewable by owner only" 
ON public.traceos_decisions 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "TraceOS decisions insertable by owner" 
ON public.traceos_decisions 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "TraceOS decisions updatable by owner" 
ON public.traceos_decisions 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "TraceOS decisions deletable by owner" 
ON public.traceos_decisions 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- 7. SAVED_GAMES: Restrict to owner only
DROP POLICY IF EXISTS "Users can manage own saved games" ON public.saved_games;
DROP POLICY IF EXISTS "Allow public read" ON public.saved_games;

CREATE POLICY "Saved games viewable by owner only" 
ON public.saved_games 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Saved games insertable by owner" 
ON public.saved_games 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Saved games updatable by owner" 
ON public.saved_games 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Saved games deletable by owner" 
ON public.saved_games 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- 8. DASHBOARD_PROGRESS: Restrict to owner only
DROP POLICY IF EXISTS "Users can manage own progress" ON public.dashboard_progress;
DROP POLICY IF EXISTS "Allow public read" ON public.dashboard_progress;

CREATE POLICY "Dashboard progress viewable by owner only" 
ON public.dashboard_progress 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Dashboard progress insertable by owner" 
ON public.dashboard_progress 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Dashboard progress updatable by owner" 
ON public.dashboard_progress 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Dashboard progress deletable by owner" 
ON public.dashboard_progress 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- 9. GAMIFICATION_PROGRESS: Restrict to owner only
DROP POLICY IF EXISTS "Users can manage own gamification" ON public.gamification_progress;
DROP POLICY IF EXISTS "Allow public read" ON public.gamification_progress;

CREATE POLICY "Gamification progress viewable by owner only" 
ON public.gamification_progress 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Gamification progress insertable by owner" 
ON public.gamification_progress 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Gamification progress updatable by owner" 
ON public.gamification_progress 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 10. CHALLENGE_PROGRESS: Restrict to owner only
DROP POLICY IF EXISTS "Users can manage own challenges" ON public.challenge_progress;
DROP POLICY IF EXISTS "Allow public read" ON public.challenge_progress;

CREATE POLICY "Challenge progress viewable by owner only" 
ON public.challenge_progress 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Challenge progress insertable by owner" 
ON public.challenge_progress 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Challenge progress updatable by owner" 
ON public.challenge_progress 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 11. EXIT_KEYS_HISTORY: Restrict to owner only
DROP POLICY IF EXISTS "Users can manage own exit keys history" ON public.exit_keys_history;
DROP POLICY IF EXISTS "Allow public read" ON public.exit_keys_history;

CREATE POLICY "Exit keys history viewable by owner only" 
ON public.exit_keys_history 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Exit keys history insertable by owner" 
ON public.exit_keys_history 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Exit keys history updatable by owner" 
ON public.exit_keys_history 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Exit keys history deletable by owner" 
ON public.exit_keys_history 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- 12. LATENT_ZONES: Restrict to owner only
DROP POLICY IF EXISTS "Users can manage own latent zones" ON public.latent_zones;
DROP POLICY IF EXISTS "Allow public read" ON public.latent_zones;

CREATE POLICY "Latent zones viewable by owner only" 
ON public.latent_zones 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Latent zones insertable by owner" 
ON public.latent_zones 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Latent zones updatable by owner" 
ON public.latent_zones 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Latent zones deletable by owner" 
ON public.latent_zones 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- 13. IRREVERSA_THRESHOLDS: Restrict to owner only
DROP POLICY IF EXISTS "Users can manage own thresholds" ON public.irreversa_thresholds;
DROP POLICY IF EXISTS "Allow public read" ON public.irreversa_thresholds;

CREATE POLICY "Irreversa thresholds viewable by owner only" 
ON public.irreversa_thresholds 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Irreversa thresholds insertable by owner" 
ON public.irreversa_thresholds 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Irreversa thresholds updatable by owner" 
ON public.irreversa_thresholds 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 14. AI_USAGE_METERING: Restrict to owner only
DROP POLICY IF EXISTS "Users can view own AI usage" ON public.ai_usage_metering;
DROP POLICY IF EXISTS "Allow public read" ON public.ai_usage_metering;

CREATE POLICY "AI usage viewable by owner only" 
ON public.ai_usage_metering 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- 15. B2B_USAGE_METERING: Restrict to owner only
DROP POLICY IF EXISTS "Users can view own B2B usage" ON public.b2b_usage_metering;
DROP POLICY IF EXISTS "Allow public read" ON public.b2b_usage_metering;

CREATE POLICY "B2B usage viewable by owner only" 
ON public.b2b_usage_metering 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- 16. GOV_INTEL_RUNS: Restrict to owner only
DROP POLICY IF EXISTS "Users can manage own gov intel runs" ON public.gov_intel_runs;
DROP POLICY IF EXISTS "Allow public read" ON public.gov_intel_runs;

CREATE POLICY "Gov intel runs viewable by owner only" 
ON public.gov_intel_runs 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Gov intel runs insertable by owner" 
ON public.gov_intel_runs 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Gov intel runs updatable by owner" 
ON public.gov_intel_runs 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 17. EXPERT_REVIEWS: Restrict properly
DROP POLICY IF EXISTS "Reviews publicly readable" ON public.expert_reviews;
DROP POLICY IF EXISTS "Allow public read" ON public.expert_reviews;

-- Expert reviews can be read by anyone authenticated (for marketplace)
-- But must be published (status = 'published')
CREATE POLICY "Published reviews readable by authenticated" 
ON public.expert_reviews 
FOR SELECT 
TO authenticated
USING (status = 'published' OR auth.uid() = user_id);

-- 18. SAVED_COMPARISONS: Restrict to owner only
DROP POLICY IF EXISTS "Users can manage own comparisons" ON public.saved_comparisons;
DROP POLICY IF EXISTS "Allow public read" ON public.saved_comparisons;

CREATE POLICY "Saved comparisons viewable by owner only" 
ON public.saved_comparisons 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Saved comparisons insertable by owner" 
ON public.saved_comparisons 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Saved comparisons updatable by owner" 
ON public.saved_comparisons 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Saved comparisons deletable by owner" 
ON public.saved_comparisons 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);