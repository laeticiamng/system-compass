-- Drop existing admin policy and recreate
DROP POLICY IF EXISTS "Admins can manage fiscal rules" ON public.fiscal_rules;

CREATE POLICY "Admins can manage fiscal rules"
ON public.fiscal_rules
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));