-- Fix overly permissive RLS policies

-- 1. Drop and recreate financial_intel_country_snapshots INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create snapshots" ON public.financial_intel_country_snapshots;
CREATE POLICY "Authenticated users can create snapshots"
ON public.financial_intel_country_snapshots
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 2. Drop and recreate financial_intel_generation_runs INSERT policy  
DROP POLICY IF EXISTS "Users can create generation runs" ON public.financial_intel_generation_runs;
CREATE POLICY "Users can create generation runs"
ON public.financial_intel_generation_runs
FOR INSERT
WITH CHECK (auth.uid() = user_id);