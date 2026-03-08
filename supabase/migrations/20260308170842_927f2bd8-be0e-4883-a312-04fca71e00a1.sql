
-- ============================================
-- P0 FIX 1: ai_usage_metering - Remove user UPDATE/ALL (prevent quota reset)
-- Only SECURITY DEFINER functions should modify usage
-- ============================================
DROP POLICY IF EXISTS "Users can manage their own usage" ON public.ai_usage_metering;
DROP POLICY IF EXISTS "Users can update their own usage" ON public.ai_usage_metering;
DROP POLICY IF EXISTS "Users can update own usage" ON public.ai_usage_metering;

-- Remove duplicate SELECT policies (keep one clean one)
DROP POLICY IF EXISTS "Users can view own AI usage" ON public.ai_usage_metering;
DROP POLICY IF EXISTS "ai_usage_select_owner_only" ON public.ai_usage_metering;
DROP POLICY IF EXISTS "Users can view own usage" ON public.ai_usage_metering;
DROP POLICY IF EXISTS "AI usage viewable by owner only" ON public.ai_usage_metering;

-- Remove duplicate INSERT policies
DROP POLICY IF EXISTS "Users can insert own usage" ON public.ai_usage_metering;
DROP POLICY IF EXISTS "Users can insert their own usage" ON public.ai_usage_metering;

-- Clean SELECT: owner or admin
CREATE POLICY "ai_usage_select_owner_or_admin"
  ON public.ai_usage_metering FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- INSERT: only own rows
CREATE POLICY "ai_usage_insert_own"
  ON public.ai_usage_metering FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: admin only (increment_ai_usage function handles normal updates)
CREATE POLICY "ai_usage_update_admin_only"
  ON public.ai_usage_metering FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- P0 FIX 2: b2b_usage_metering - Remove user UPDATE (prevent quota reset)
-- ============================================
DROP POLICY IF EXISTS "Users can update their own B2B usage" ON public.b2b_usage_metering;

-- Clean SELECT: keep owner only
-- (existing policies are fine)

-- UPDATE: admin only (increment_b2b_usage function handles normal updates)
CREATE POLICY "b2b_usage_update_admin_only"
  ON public.b2b_usage_metering FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- INSERT for b2b if missing
CREATE POLICY "b2b_usage_insert_own"
  ON public.b2b_usage_metering FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- P0 FIX 3: user_subscriptions - Remove user UPDATE (prevent tier self-upgrade)
-- ============================================
DROP POLICY IF EXISTS "Users can update own subscription" ON public.user_subscriptions;

-- Only service_role and admin can update (already have those policies)

-- ============================================
-- P0 FIX 4: pmo_generated_packs - Tighten shared pack exposure
-- ============================================
DROP POLICY IF EXISTS "Public can view non-expired shared packs" ON public.pmo_generated_packs;
DROP POLICY IF EXISTS "Anyone can view shared packs" ON public.pmo_generated_packs;

-- Require share_expires_at to be set (no permanent public exposure)
CREATE POLICY "Shared packs viewable with valid token and expiry"
  ON public.pmo_generated_packs FOR SELECT
  USING (
    share_token IS NOT NULL 
    AND share_expires_at IS NOT NULL 
    AND share_expires_at > now()
  );

-- ============================================
-- P0 FIX 5: user_country_watchlist - Remove anonymous full read
-- ============================================
DROP POLICY IF EXISTS "Anyone can count watchlist entries" ON public.user_country_watchlist;

-- Authenticated users can view their own watchlist only
CREATE POLICY "watchlist_select_own"
  ON public.user_country_watchlist FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
