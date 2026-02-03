-- Create expert_reviews table for marketplace reviews
CREATE TABLE IF NOT EXISTS public.expert_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expert_id UUID NOT NULL,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  content TEXT NOT NULL CHECK (length(content) >= 20),
  verified BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  expert_response TEXT,
  expert_response_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create helpful votes tracking table
CREATE TABLE IF NOT EXISTS public.expert_review_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.expert_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(review_id, user_id)
);

-- Enable RLS
ALTER TABLE public.expert_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_review_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for expert_reviews
CREATE POLICY "Anyone can view approved reviews"
  ON public.expert_reviews FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can view their own reviews"
  ON public.expert_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create reviews"
  ON public.expert_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending reviews"
  ON public.expert_reviews FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Users can delete their own pending reviews"
  ON public.expert_reviews FOR DELETE
  USING (auth.uid() = user_id AND status = 'pending');

-- RLS Policies for expert_review_votes
CREATE POLICY "Authenticated users can view votes"
  ON public.expert_review_votes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can vote"
  ON public.expert_review_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own votes"
  ON public.expert_review_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_expert_reviews_expert_id ON public.expert_reviews(expert_id);
CREATE INDEX idx_expert_reviews_status ON public.expert_reviews(status);
CREATE INDEX idx_expert_reviews_rating ON public.expert_reviews(rating);

-- Trigger to update helpful_count
CREATE OR REPLACE FUNCTION public.update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.expert_reviews 
    SET helpful_count = helpful_count + 1, updated_at = now()
    WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.expert_reviews 
    SET helpful_count = helpful_count - 1, updated_at = now()
    WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_helpful_count_trigger
AFTER INSERT OR DELETE ON public.expert_review_votes
FOR EACH ROW
EXECUTE FUNCTION public.update_review_helpful_count();

-- Trigger to update updated_at
CREATE TRIGGER update_expert_reviews_updated_at
BEFORE UPDATE ON public.expert_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();