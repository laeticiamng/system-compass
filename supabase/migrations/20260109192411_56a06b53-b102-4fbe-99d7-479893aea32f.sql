-- Create table for decision comments
CREATE TABLE public.traceos_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  decision_id UUID NOT NULL REFERENCES public.traceos_decisions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.traceos_comments ENABLE ROW LEVEL SECURITY;

-- Users can view comments on their decisions
CREATE POLICY "Users can view comments on their decisions"
ON public.traceos_comments
FOR SELECT
USING (
  decision_id IN (
    SELECT id FROM public.traceos_decisions WHERE user_id = auth.uid()
  )
);

-- Users can create comments on their decisions
CREATE POLICY "Users can create comments on their decisions"
ON public.traceos_comments
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  decision_id IN (
    SELECT id FROM public.traceos_decisions WHERE user_id = auth.uid()
  )
);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
ON public.traceos_comments
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
ON public.traceos_comments
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_traceos_comments_decision_id ON public.traceos_comments(decision_id);
CREATE INDEX idx_traceos_comments_user_id ON public.traceos_comments(user_id);