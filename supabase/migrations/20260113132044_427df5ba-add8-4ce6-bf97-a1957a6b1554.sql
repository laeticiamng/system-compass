-- Create table to persist user quick test and profile test results
CREATE TABLE public.user_test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  test_type TEXT NOT NULL CHECK (test_type IN ('quick_test', 'profile_test')),
  answers JSONB NOT NULL,
  result_pyramid TEXT NOT NULL,
  result_archetype TEXT,
  elapsed_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_test_results ENABLE ROW LEVEL SECURITY;

-- Policies for user access
CREATE POLICY "Users can view their own test results"
ON public.user_test_results
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own test results"
ON public.user_test_results
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test results"
ON public.user_test_results
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own test results"
ON public.user_test_results
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_user_test_results_user_id ON public.user_test_results(user_id);
CREATE INDEX idx_user_test_results_test_type ON public.user_test_results(test_type);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_test_results_updated_at
BEFORE UPDATE ON public.user_test_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();