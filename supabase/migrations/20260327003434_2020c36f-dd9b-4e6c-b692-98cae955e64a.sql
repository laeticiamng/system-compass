
-- =====================================================
-- SECURITY FIX: 7 findings from security scan
-- =====================================================

-- 1. user_roles: Prevent privilege escalation
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Deny non-admin writes"
ON public.user_roles
AS RESTRICTIVE
FOR ALL
TO public
USING (true)
WITH CHECK (
  has_role(auth.uid(), 'admin'::text)
);

-- 2. event_registrations: Restrict guest insert to authenticated only
DROP POLICY IF EXISTS "registrations_safe_insert" ON public.event_registrations;

CREATE POLICY "registrations_safe_insert"
ON public.event_registrations
FOR INSERT
TO authenticated
WITH CHECK (
  (user_id = auth.uid())
  OR (
    guest_email IS NOT NULL 
    AND guest_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND length(guest_email) <= 255
  )
);

-- 3. pmo_generated_packs: Remove broad shared packs policy
DROP POLICY IF EXISTS "Authenticated can view shared packs with valid token" ON public.pmo_generated_packs;
DROP POLICY IF EXISTS "Users can view their own packs" ON public.pmo_generated_packs;

CREATE POLICY "Admins can view all packs"
ON public.pmo_generated_packs
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::text));

-- 4 & 5. country_generation_batches: Remove overly permissive policies
DROP POLICY IF EXISTS "Users can insert their batches" ON public.country_generation_batches;
DROP POLICY IF EXISTS "Users can view their batches" ON public.country_generation_batches;
DROP POLICY IF EXISTS "Authenticated users can create generation batches" ON public.country_generation_batches;

-- 6. country_generation_jobs: Remove overly permissive UPDATE
DROP POLICY IF EXISTS "Authenticated users can update generation jobs" ON public.country_generation_jobs;

-- 7. generated_translations: Remove all overly permissive INSERT/UPDATE policies
DROP POLICY IF EXISTS "Authenticated can insert translations" ON public.generated_translations;
DROP POLICY IF EXISTS "Authenticated can update translations" ON public.generated_translations;
DROP POLICY IF EXISTS "Authenticated can view translations" ON public.generated_translations;
DROP POLICY IF EXISTS "Authenticated users can create translations" ON public.generated_translations;
DROP POLICY IF EXISTS "Authenticated users can update translations" ON public.generated_translations;
DROP POLICY IF EXISTS "Only admins can insert translations" ON public.generated_translations;
DROP POLICY IF EXISTS "Only admins can update translations" ON public.generated_translations;
DROP POLICY IF EXISTS "Admins can view all translations" ON public.generated_translations;
