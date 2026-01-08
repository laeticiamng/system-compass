-- Create a table for storing dashboard progress
CREATE TABLE public.dashboard_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exit_key_id TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  steps_progress JSONB NOT NULL DEFAULT '[]'::jsonb,
  phase_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, exit_key_id)
);

-- Enable Row Level Security
ALTER TABLE public.dashboard_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own dashboard progress" 
ON public.dashboard_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dashboard progress" 
ON public.dashboard_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboard progress" 
ON public.dashboard_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dashboard progress" 
ON public.dashboard_progress 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_dashboard_progress_updated_at
BEFORE UPDATE ON public.dashboard_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();