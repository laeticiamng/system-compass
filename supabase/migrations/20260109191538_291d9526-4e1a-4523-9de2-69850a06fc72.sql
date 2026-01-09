-- Create table for TraceOS decisions
CREATE TABLE public.traceos_decisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.traceos_decisions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  context TEXT NOT NULL,
  main_hypothesis TEXT NOT NULL,
  alternative_hypotheses JSONB NOT NULL DEFAULT '[]'::jsonb,
  constraints JSONB NOT NULL DEFAULT '[]'::jsonb,
  decision TEXT NOT NULL,
  author TEXT NOT NULL,
  scope TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'abandoned')),
  abandoned_branches JSONB NOT NULL DEFAULT '[]'::jsonb,
  decision_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.traceos_decisions ENABLE ROW LEVEL SECURITY;

-- RLS Policies - users can only access their own decisions
CREATE POLICY "Users can view their own decisions"
ON public.traceos_decisions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own decisions"
ON public.traceos_decisions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decisions"
ON public.traceos_decisions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decisions"
ON public.traceos_decisions
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_traceos_decisions_updated_at
BEFORE UPDATE ON public.traceos_decisions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_traceos_decisions_user_id ON public.traceos_decisions(user_id);
CREATE INDEX idx_traceos_decisions_parent_id ON public.traceos_decisions(parent_id);