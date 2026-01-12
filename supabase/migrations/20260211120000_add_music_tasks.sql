-- Task tracking for Suno music generation
CREATE TABLE public.music_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id TEXT NOT NULL,
  pyramid_type TEXT NOT NULL,
  mood TEXT NOT NULL DEFAULT 'narrative',
  task_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  suno_status TEXT,
  audio_url TEXT,
  stream_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.music_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read music tasks"
ON public.music_tasks
FOR SELECT
USING (true);

CREATE UNIQUE INDEX idx_music_tasks_task_id ON public.music_tasks(task_id);
CREATE INDEX idx_music_tasks_lookup ON public.music_tasks(country_id, pyramid_type, mood, created_at DESC);
CREATE INDEX idx_music_tasks_status ON public.music_tasks(status);

COMMENT ON TABLE public.music_tasks IS 'Tracks Suno task status updates for country music generation';
