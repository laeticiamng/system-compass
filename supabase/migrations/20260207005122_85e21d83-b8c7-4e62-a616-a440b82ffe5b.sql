
-- Create user_country_watchlist table for the Follow Country feature
CREATE TABLE public.user_country_watchlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  country_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Unique constraint: one follow per user per country
ALTER TABLE public.user_country_watchlist ADD CONSTRAINT unique_user_country UNIQUE (user_id, country_id);

-- Enable RLS
ALTER TABLE public.user_country_watchlist ENABLE ROW LEVEL SECURITY;

-- Users can view their own watchlist
CREATE POLICY "Users can view their own watchlist"
ON public.user_country_watchlist FOR SELECT
USING (auth.uid() = user_id);

-- Users can add to their own watchlist
CREATE POLICY "Users can add to their own watchlist"
ON public.user_country_watchlist FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can remove from their own watchlist
CREATE POLICY "Users can remove from their own watchlist"
ON public.user_country_watchlist FOR DELETE
USING (auth.uid() = user_id);

-- Public can count watchlist entries (for popularity display)
CREATE POLICY "Anyone can count watchlist entries"
ON public.user_country_watchlist FOR SELECT
USING (true);

-- Index for performance
CREATE INDEX idx_watchlist_user ON public.user_country_watchlist(user_id);
CREATE INDEX idx_watchlist_country ON public.user_country_watchlist(country_id);
