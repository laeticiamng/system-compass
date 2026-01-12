-- Create table for translation jobs
CREATE TABLE public.translation_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id TEXT NOT NULL,
  target_lang TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  logs JSONB NOT NULL DEFAULT '[]'::jsonb,
  error_message TEXT,
  retries INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_translation_jobs_status ON public.translation_jobs(status);
CREATE INDEX idx_translation_jobs_target_lang ON public.translation_jobs(target_lang);
CREATE INDEX idx_translation_jobs_country_lang ON public.translation_jobs(country_id, target_lang);

ALTER TABLE public.translation_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view translation jobs"
ON public.translation_jobs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage translation jobs"
ON public.translation_jobs
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_translation_jobs_updated_at
BEFORE UPDATE ON public.translation_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.translation_jobs;
