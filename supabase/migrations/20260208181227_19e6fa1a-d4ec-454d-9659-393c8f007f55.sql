-- Fix: Remove duplicate countries SELECT policy
DROP POLICY IF EXISTS "Countries data is publicly readable for app functionality" ON public.countries;

-- Fix: Add explicit RESTRICTIVE policy to deny non-admin writes on countries
-- The existing "Admins can manage countries" is PERMISSIVE, so we add restrictive write denial
CREATE POLICY "Only admins can insert countries"
ON public.countries
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::text));

CREATE POLICY "Only admins can update countries"
ON public.countries
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::text))
WITH CHECK (public.has_role(auth.uid(), 'admin'::text));

CREATE POLICY "Only admins can delete countries"
ON public.countries
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::text));

-- Drop the old ALL policy and replace with explicit ones above
DROP POLICY IF EXISTS "Admins can manage countries" ON public.countries;