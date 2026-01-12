-- Fix overly permissive RLS policy on music_generation_tasks
DROP POLICY IF EXISTS "Service role can manage tasks" ON public.music_generation_tasks;

-- Create proper policies that only allow service role to write
-- Note: Service role bypasses RLS by default, so we just need to prevent anon key writes
CREATE POLICY "Only authenticated can insert music tasks" 
ON public.music_generation_tasks 
FOR INSERT 
WITH CHECK (false);

CREATE POLICY "Only authenticated can update music tasks" 
ON public.music_generation_tasks 
FOR UPDATE 
USING (false);

CREATE POLICY "Only authenticated can delete music tasks" 
ON public.music_generation_tasks 
FOR DELETE 
USING (false);