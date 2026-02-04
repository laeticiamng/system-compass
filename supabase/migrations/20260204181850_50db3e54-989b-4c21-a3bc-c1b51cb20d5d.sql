
-- =============================================================================
-- AUDIT v6.5: RLS Policy Consolidation & Security Hardening
-- Fix: user_subscriptions and push_subscriptions policy duplicates
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. CLEAN UP DUPLICATE POLICIES on user_subscriptions
-- -----------------------------------------------------------------------------

-- Drop duplicate SELECT policies (keep one strict policy)
DROP POLICY IF EXISTS "Users can view own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can view own subscription only" ON public.user_subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_owner_only" ON public.user_subscriptions;
-- Keep: "Subscriptions viewable by owner only"

-- Drop duplicate INSERT policies (all are missing WITH CHECK)
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert_owner_only" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.user_subscriptions;

-- Drop duplicate UPDATE policies
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "subscriptions_update_owner_only" ON public.user_subscriptions;
-- Keep: "Users can update own subscription"

-- Drop DELETE policy (users shouldn't delete subscriptions - only system)
DROP POLICY IF EXISTS "Users can delete their own subscriptions" ON public.user_subscriptions;

-- Create strict INSERT policy with WITH CHECK
CREATE POLICY "user_subscriptions_insert_owner_strict"
ON public.user_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 2. CLEAN UP DUPLICATE POLICIES on push_subscriptions
-- -----------------------------------------------------------------------------

-- Drop all duplicate policies, keep only the strict ones
DROP POLICY IF EXISTS "Users can create own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can create their own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can delete own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can delete their own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can manage own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can update own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can update their own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can view own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can view their own push subscriptions" ON public.push_subscriptions;

-- Keep only the strict owner-only policies:
-- - "Push subs viewable by owner only"
-- - "Push subs insertable by owner only" (with rate limit)
-- - "Push subs updatable by owner only"
-- - "Push subs deletable by owner only"

-- Verify rate-limited insert policy exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'push_subscriptions' 
    AND policyname = 'push_subs_insert_owner'
  ) THEN
    EXECUTE 'CREATE POLICY "push_subs_insert_owner"
    ON public.push_subscriptions
    FOR INSERT
    TO authenticated
    WITH CHECK (
      auth.uid() = user_id AND
      (SELECT COUNT(*) FROM push_subscriptions WHERE user_id = auth.uid()) < 5
    )';
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 3. ADD COMMENT DOCUMENTATION
-- -----------------------------------------------------------------------------

COMMENT ON TABLE public.user_subscriptions IS 
'User subscription data (Stripe integration). Protected by owner-only RLS. 
Service role and admin can manage all subscriptions.
Audit v6.5: Consolidated duplicate policies.';

COMMENT ON TABLE public.push_subscriptions IS 
'Push notification endpoints. Protected by owner-only RLS with rate limiting (max 5 per user).
Audit v6.5: Consolidated duplicate policies.';
