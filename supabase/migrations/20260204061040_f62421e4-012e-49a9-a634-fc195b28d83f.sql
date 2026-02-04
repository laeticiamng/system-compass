-- =====================================================
-- FIX REMAINING SECURITY ISSUES
-- =====================================================

-- 1. FINANCIAL_INTEL_COUNTRY_SNAPSHOTS: Restrict to authenticated users only
DROP POLICY IF EXISTS "Anyone can read financial intel" ON public.financial_intel_country_snapshots;
DROP POLICY IF EXISTS "Authenticated can read financial intel" ON public.financial_intel_country_snapshots;

CREATE POLICY "Authenticated can read financial intel"
  ON public.financial_intel_country_snapshots
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 2. PMO_EVIDENCE_VAULT: Already has user_id RLS, add explicit policy name
DROP POLICY IF EXISTS "Users can manage own evidence" ON public.pmo_evidence_vault;
DROP POLICY IF EXISTS "Users can view own evidence" ON public.pmo_evidence_vault;
DROP POLICY IF EXISTS "Users can insert own evidence" ON public.pmo_evidence_vault;
DROP POLICY IF EXISTS "Users can update own evidence" ON public.pmo_evidence_vault;
DROP POLICY IF EXISTS "Users can delete own evidence" ON public.pmo_evidence_vault;

CREATE POLICY "Users can view own evidence"
  ON public.pmo_evidence_vault
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own evidence"
  ON public.pmo_evidence_vault
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own evidence"
  ON public.pmo_evidence_vault
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own evidence"
  ON public.pmo_evidence_vault
  FOR DELETE
  USING (auth.uid() = user_id);

-- 3. USER_CASES: Ensure strict owner-only access (already should be, but verify)
DROP POLICY IF EXISTS "Users can view own cases" ON public.user_cases;
DROP POLICY IF EXISTS "Users can insert own cases" ON public.user_cases;
DROP POLICY IF EXISTS "Users can update own cases" ON public.user_cases;
DROP POLICY IF EXISTS "Users can delete own cases" ON public.user_cases;

CREATE POLICY "Users can view own cases"
  ON public.user_cases
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cases"
  ON public.user_cases
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cases"
  ON public.user_cases
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cases"
  ON public.user_cases
  FOR DELETE
  USING (auth.uid() = user_id);