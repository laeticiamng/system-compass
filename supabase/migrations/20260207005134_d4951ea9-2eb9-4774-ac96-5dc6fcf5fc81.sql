
-- Remove the restrictive SELECT policy since the public one covers it
DROP POLICY IF EXISTS "Users can view their own watchlist" ON public.user_country_watchlist;
