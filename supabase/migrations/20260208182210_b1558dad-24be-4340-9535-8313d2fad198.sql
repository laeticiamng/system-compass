-- Clean up duplicate RLS policies on profiles table
-- Keep only the authenticated-scoped policies (more restrictive)

-- Remove public-scoped duplicates
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

-- Remove old authenticated duplicates (keep the named ones)
DROP POLICY IF EXISTS "Profiles viewable by authenticated owner only" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;

-- Recreate clean, minimal set of policies
CREATE POLICY "profiles_select_owner"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "profiles_insert_owner"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_owner"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_owner"
ON public.profiles FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- Drop the remaining old-named policies that overlap
DROP POLICY IF EXISTS "profiles_insert_owner_only" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_owner_only" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_owner_only" ON public.profiles;