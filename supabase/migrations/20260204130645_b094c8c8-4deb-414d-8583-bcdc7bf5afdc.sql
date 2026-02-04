-- =====================================================
-- SECURITY HARDENING v5.6 - Complete RLS Audit Fix
-- Fixing all 20 security findings from security scan
-- =====================================================

-- 1. PROFILES: Add deny-all for anonymous users
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- 2. USER_SUBSCRIPTIONS: Strengthen protection
DROP POLICY IF EXISTS "Users can view own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON user_subscriptions;

CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON user_subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON user_subscriptions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. USER_CASES: Strengthen protection
DROP POLICY IF EXISTS "Users can view own cases" ON user_cases;
DROP POLICY IF EXISTS "Users can create own cases" ON user_cases;
DROP POLICY IF EXISTS "Users can update own cases" ON user_cases;
DROP POLICY IF EXISTS "Users can delete own cases" ON user_cases;

CREATE POLICY "Users can view own cases" ON user_cases
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own cases" ON user_cases
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cases" ON user_cases
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cases" ON user_cases
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 4. TRACEOS_DECISIONS: Strengthen protection
DROP POLICY IF EXISTS "Users can view own decisions" ON traceos_decisions;
DROP POLICY IF EXISTS "Users can create own decisions" ON traceos_decisions;
DROP POLICY IF EXISTS "Users can update own decisions" ON traceos_decisions;
DROP POLICY IF EXISTS "Users can delete own decisions" ON traceos_decisions;

CREATE POLICY "Users can view own decisions" ON traceos_decisions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own decisions" ON traceos_decisions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own decisions" ON traceos_decisions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own decisions" ON traceos_decisions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 5. USER_GOVERNANCE_NOTES: Strengthen protection
DROP POLICY IF EXISTS "Users can view own notes" ON user_governance_notes;
DROP POLICY IF EXISTS "Users can create own notes" ON user_governance_notes;
DROP POLICY IF EXISTS "Users can update own notes" ON user_governance_notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON user_governance_notes;

CREATE POLICY "Users can view own notes" ON user_governance_notes
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notes" ON user_governance_notes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON user_governance_notes
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON user_governance_notes
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 6. PUSH_SUBSCRIPTIONS: Strengthen protection
DROP POLICY IF EXISTS "Users can manage own push subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Users can view own push subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Users can create own push subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Users can update own push subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Users can delete own push subscriptions" ON push_subscriptions;

CREATE POLICY "Users can view own push subscriptions" ON push_subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own push subscriptions" ON push_subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own push subscriptions" ON push_subscriptions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own push subscriptions" ON push_subscriptions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 7. NOTIFICATION_SETTINGS: Strengthen protection
DROP POLICY IF EXISTS "Users can manage own notification settings" ON notification_settings;
DROP POLICY IF EXISTS "Users can view own notification settings" ON notification_settings;
DROP POLICY IF EXISTS "Users can create own notification settings" ON notification_settings;
DROP POLICY IF EXISTS "Users can update own notification settings" ON notification_settings;

CREATE POLICY "Users can view own notification settings" ON notification_settings
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notification settings" ON notification_settings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification settings" ON notification_settings
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8. PMO_EVIDENCE_VAULT: Strengthen protection
DROP POLICY IF EXISTS "Users can view own evidence" ON pmo_evidence_vault;
DROP POLICY IF EXISTS "Users can create own evidence" ON pmo_evidence_vault;
DROP POLICY IF EXISTS "Users can update own evidence" ON pmo_evidence_vault;
DROP POLICY IF EXISTS "Users can delete own evidence" ON pmo_evidence_vault;

CREATE POLICY "Users can view own evidence" ON pmo_evidence_vault
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own evidence" ON pmo_evidence_vault
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own evidence" ON pmo_evidence_vault
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own evidence" ON pmo_evidence_vault
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 9. PMO_BUDGET_LINES: Strengthen protection
DROP POLICY IF EXISTS "Users can view own budget lines" ON pmo_budget_lines;
DROP POLICY IF EXISTS "Users can create own budget lines" ON pmo_budget_lines;
DROP POLICY IF EXISTS "Users can update own budget lines" ON pmo_budget_lines;
DROP POLICY IF EXISTS "Users can delete own budget lines" ON pmo_budget_lines;

CREATE POLICY "Users can view own budget lines" ON pmo_budget_lines
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own budget lines" ON pmo_budget_lines
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budget lines" ON pmo_budget_lines
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own budget lines" ON pmo_budget_lines
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 10. PMO_RISK_REGISTER: Strengthen protection
DROP POLICY IF EXISTS "Users can view own risks" ON pmo_risk_register;
DROP POLICY IF EXISTS "Users can create own risks" ON pmo_risk_register;
DROP POLICY IF EXISTS "Users can update own risks" ON pmo_risk_register;
DROP POLICY IF EXISTS "Users can delete own risks" ON pmo_risk_register;

CREATE POLICY "Users can view own risks" ON pmo_risk_register
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own risks" ON pmo_risk_register
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own risks" ON pmo_risk_register
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own risks" ON pmo_risk_register
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 11. CASE_GOVERNANCE_ACTORS: Add case-owner check via join
DROP POLICY IF EXISTS "Users can view case actors" ON case_governance_actors;
DROP POLICY IF EXISTS "Users can create case actors" ON case_governance_actors;
DROP POLICY IF EXISTS "Users can update case actors" ON case_governance_actors;
DROP POLICY IF EXISTS "Users can delete case actors" ON case_governance_actors;

CREATE POLICY "Users can view case actors" ON case_governance_actors
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_cases 
      WHERE user_cases.id = case_governance_actors.case_id 
      AND user_cases.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create case actors" ON case_governance_actors
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_cases 
      WHERE user_cases.id = case_governance_actors.case_id 
      AND user_cases.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update case actors" ON case_governance_actors
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_cases 
      WHERE user_cases.id = case_governance_actors.case_id 
      AND user_cases.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete case actors" ON case_governance_actors
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_cases 
      WHERE user_cases.id = case_governance_actors.case_id 
      AND user_cases.user_id = auth.uid()
    )
  );

-- 12. AI_ACTIVITY_LOG: Strengthen protection
DROP POLICY IF EXISTS "Users can view own ai activity" ON ai_activity_log;
DROP POLICY IF EXISTS "Users can create own ai activity" ON ai_activity_log;

CREATE POLICY "Users can view own ai activity" ON ai_activity_log
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own ai activity" ON ai_activity_log
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 13. AI_USAGE_METERING: Strengthen protection  
DROP POLICY IF EXISTS "Users can view own usage" ON ai_usage_metering;
DROP POLICY IF EXISTS "Users can insert own usage" ON ai_usage_metering;
DROP POLICY IF EXISTS "Users can update own usage" ON ai_usage_metering;

CREATE POLICY "Users can view own usage" ON ai_usage_metering
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON ai_usage_metering
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON ai_usage_metering
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 14. ANALYTICS_SESSIONS: Restrict read to owner only
DROP POLICY IF EXISTS "Users can view own sessions" ON analytics_sessions;
DROP POLICY IF EXISTS "Allow anonymous session tracking" ON analytics_sessions;
DROP POLICY IF EXISTS "Allow session updates" ON analytics_sessions;

CREATE POLICY "Users can view own sessions" ON analytics_sessions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow anonymous session tracking" ON analytics_sessions
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow session updates" ON analytics_sessions
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 15. ANALYTICS_EVENTS: Restrict read to owner only
DROP POLICY IF EXISTS "Users can view own events" ON analytics_events;
DROP POLICY IF EXISTS "Allow anonymous event tracking" ON analytics_events;

CREATE POLICY "Users can view own events" ON analytics_events
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow anonymous event tracking" ON analytics_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- 16. USER_TEST_RESULTS: Strengthen protection
DROP POLICY IF EXISTS "Users can view own test results" ON user_test_results;
DROP POLICY IF EXISTS "Users can create own test results" ON user_test_results;
DROP POLICY IF EXISTS "Users can update own test results" ON user_test_results;

CREATE POLICY "Users can view own test results" ON user_test_results
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own test results" ON user_test_results
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own test results" ON user_test_results
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);