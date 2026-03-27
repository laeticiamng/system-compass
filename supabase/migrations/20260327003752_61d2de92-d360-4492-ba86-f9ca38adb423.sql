
-- Fix user_roles: Make RESTRICTIVE policy more explicit
-- Drop the broad USING=true restrictive policy
DROP POLICY IF EXISTS "Deny non-admin writes" ON public.user_roles;

-- Create separate restrictive policies for write operations only
CREATE POLICY "Restrict writes to admins only"
ON public.user_roles
AS RESTRICTIVE
FOR INSERT
TO public
WITH CHECK (has_role(auth.uid(), 'admin'::text));

CREATE POLICY "Restrict updates to admins only"
ON public.user_roles
AS RESTRICTIVE
FOR UPDATE
TO public
USING (has_role(auth.uid(), 'admin'::text))
WITH CHECK (has_role(auth.uid(), 'admin'::text));

CREATE POLICY "Restrict deletes to admins only"
ON public.user_roles
AS RESTRICTIVE
FOR DELETE
TO public
USING (has_role(auth.uid(), 'admin'::text));
