
-- UGC Country Reviews with criteria ratings
CREATE TABLE public.ugc_country_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  country_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  rating_overall INTEGER NOT NULL CHECK (rating_overall BETWEEN 1 AND 5),
  rating_admin INTEGER CHECK (rating_admin BETWEEN 1 AND 5),
  rating_cost INTEGER CHECK (rating_cost BETWEEN 1 AND 5),
  rating_integration INTEGER CHECK (rating_integration BETWEEN 1 AND 5),
  rating_safety INTEGER CHECK (rating_safety BETWEEN 1 AND 5),
  rating_quality_life INTEGER CHECK (rating_quality_life BETWEEN 1 AND 5),
  pros TEXT[] DEFAULT '{}',
  cons TEXT[] DEFAULT '{}',
  profile_type TEXT NOT NULL DEFAULT 'other',
  from_country TEXT,
  duration_months INTEGER,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  helpful_count INTEGER NOT NULL DEFAULT 0,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Review helpfulness votes
CREATE TABLE public.ugc_review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES public.ugc_country_reviews(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(review_id, user_id)
);

-- Expat Journal entries
CREATE TABLE public.ugc_journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  country_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  month_number INTEGER,
  mood TEXT DEFAULT 'neutral',
  is_public BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ugc_country_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ugc_review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ugc_journal_entries ENABLE ROW LEVEL SECURITY;

-- Reviews RLS: anyone can read approved, owners can CRUD their own
CREATE POLICY "Anyone can read approved reviews"
  ON public.ugc_country_reviews FOR SELECT
  USING (status = 'approved' OR (auth.uid() IS NOT NULL AND user_id = auth.uid()));

CREATE POLICY "Authenticated users can create reviews"
  ON public.ugc_country_reviews FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reviews"
  ON public.ugc_country_reviews FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own reviews"
  ON public.ugc_country_reviews FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Vote RLS
CREATE POLICY "Anyone can read votes"
  ON public.ugc_review_votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote"
  ON public.ugc_review_votes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove own vote"
  ON public.ugc_review_votes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Journal RLS: public entries readable by all, private only by owner
CREATE POLICY "Read public or own journal entries"
  ON public.ugc_journal_entries FOR SELECT
  USING (is_public = true OR (auth.uid() IS NOT NULL AND user_id = auth.uid()));

CREATE POLICY "Authenticated users can create journal entries"
  ON public.ugc_journal_entries FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own journal entries"
  ON public.ugc_journal_entries FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own journal entries"
  ON public.ugc_journal_entries FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Trigger to update helpful_count on votes
CREATE OR REPLACE FUNCTION public.update_ugc_review_helpful_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.ugc_country_reviews 
    SET helpful_count = helpful_count + 1, updated_at = now()
    WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.ugc_country_reviews 
    SET helpful_count = helpful_count - 1, updated_at = now()
    WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER on_ugc_review_vote_change
AFTER INSERT OR DELETE ON public.ugc_review_votes
FOR EACH ROW EXECUTE FUNCTION public.update_ugc_review_helpful_count();

-- Updated_at triggers
CREATE TRIGGER update_ugc_reviews_updated_at
BEFORE UPDATE ON public.ugc_country_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ugc_journal_updated_at
BEFORE UPDATE ON public.ugc_journal_entries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
