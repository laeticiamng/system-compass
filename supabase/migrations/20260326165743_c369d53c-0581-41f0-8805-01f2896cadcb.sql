-- 1. FIX: user_roles privilege escalation - restrict INSERT to admins only
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Admins can manage roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can read own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 2. FIX: newsletter_subscriptions - require auth, add owner policies
DROP POLICY IF EXISTS "newsletter_safe_insert" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "newsletter_strict_select" ON public.newsletter_subscriptions;

CREATE POLICY "newsletter_admin_all"
  ON public.newsletter_subscriptions
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "newsletter_auth_insert"
  ON public.newsletter_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "newsletter_owner_select"
  ON public.newsletter_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "newsletter_owner_update"
  ON public.newsletter_subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "newsletter_owner_delete"
  ON public.newsletter_subscriptions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. FIX: country_generation_batches - restrict update to admins
DROP POLICY IF EXISTS "Users can update their batches" ON public.country_generation_batches;

CREATE POLICY "Admins can update batches"
  ON public.country_generation_batches
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. FIX: pmo_generated_packs - restrict shared access to authenticated users
DROP POLICY IF EXISTS "Shared packs viewable with valid token and expiry" ON public.pmo_generated_packs;
DROP POLICY IF EXISTS "Public can view non-expired shared packs" ON public.pmo_generated_packs;

CREATE POLICY "Authenticated can view shared packs with valid token"
  ON public.pmo_generated_packs
  FOR SELECT
  TO authenticated
  USING (
    share_token IS NOT NULL 
    AND (share_expires_at IS NULL OR share_expires_at > NOW())
  );