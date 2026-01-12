CREATE TABLE public.music_generation_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id TEXT NOT NULL,
  pyramid_type TEXT NOT NULL,
  mood TEXT NOT NULL DEFAULT 'narrative',
  status TEXT NOT NULL DEFAULT 'queued',
  attempts INTEGER NOT NULL DEFAULT 0,
  external_task_id TEXT,
  audio_url TEXT,
  stream_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(country_id, pyramid_type, mood)
);

ALTER TABLE public.music_generation_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read music generation tasks"
ON public.music_generation_tasks
FOR SELECT
USING (true);

CREATE INDEX idx_music_generation_tasks_status ON public.music_generation_tasks(status);
CREATE INDEX idx_music_generation_tasks_updated_at ON public.music_generation_tasks(updated_at);

COMMENT ON TABLE public.music_generation_tasks IS 'Tracks music generation tasks and their status for polling.';
