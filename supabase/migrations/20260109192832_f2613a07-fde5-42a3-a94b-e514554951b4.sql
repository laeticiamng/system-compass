-- Create table for decision tags
CREATE TABLE public.traceos_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Create junction table for decision-tag relationships
CREATE TABLE public.traceos_decision_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  decision_id UUID NOT NULL REFERENCES public.traceos_decisions(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.traceos_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(decision_id, tag_id)
);

-- Enable Row Level Security
ALTER TABLE public.traceos_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traceos_decision_tags ENABLE ROW LEVEL SECURITY;

-- RLS policies for tags
CREATE POLICY "Users can view their own tags"
ON public.traceos_tags FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tags"
ON public.traceos_tags FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags"
ON public.traceos_tags FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags"
ON public.traceos_tags FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for decision-tag relationships
CREATE POLICY "Users can view tags on their decisions"
ON public.traceos_decision_tags FOR SELECT
USING (
  decision_id IN (SELECT id FROM public.traceos_decisions WHERE user_id = auth.uid())
);

CREATE POLICY "Users can add tags to their decisions"
ON public.traceos_decision_tags FOR INSERT
WITH CHECK (
  decision_id IN (SELECT id FROM public.traceos_decisions WHERE user_id = auth.uid()) AND
  tag_id IN (SELECT id FROM public.traceos_tags WHERE user_id = auth.uid())
);

CREATE POLICY "Users can remove tags from their decisions"
ON public.traceos_decision_tags FOR DELETE
USING (
  decision_id IN (SELECT id FROM public.traceos_decisions WHERE user_id = auth.uid())
);

-- Create indexes for performance
CREATE INDEX idx_traceos_tags_user_id ON public.traceos_tags(user_id);
CREATE INDEX idx_traceos_decision_tags_decision_id ON public.traceos_decision_tags(decision_id);
CREATE INDEX idx_traceos_decision_tags_tag_id ON public.traceos_decision_tags(tag_id);