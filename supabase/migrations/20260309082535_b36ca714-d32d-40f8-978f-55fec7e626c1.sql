-- P1: Fix financial_intel_generation_runs RLS - remove user_id IS NULL branch
DROP POLICY IF EXISTS "Users can view their own generation runs" ON public.financial_intel_generation_runs;
CREATE POLICY "Users can view their own generation runs" ON public.financial_intel_generation_runs
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create generation runs" ON public.financial_intel_generation_runs;
CREATE POLICY "Users can create generation runs" ON public.financial_intel_generation_runs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own generation runs" ON public.financial_intel_generation_runs;
CREATE POLICY "Users can update their own generation runs" ON public.financial_intel_generation_runs
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- P1: Fix ovi_suggestions RLS - remove user_id IS NULL branch
DROP POLICY IF EXISTS "Users can view own ovi suggestions" ON public.ovi_suggestions;
CREATE POLICY "Users can view own ovi suggestions" ON public.ovi_suggestions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);