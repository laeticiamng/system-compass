-- Add missing columns to music_generation_tasks table
ALTER TABLE public.music_generation_tasks
ADD COLUMN IF NOT EXISTS external_task_id TEXT,
ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0;

-- Create unique constraint for upsert operations
CREATE UNIQUE INDEX IF NOT EXISTS idx_music_tasks_unique 
ON public.music_generation_tasks(country_id, pyramid_type, mood);