
-- Fix music_generation_tasks: admin-only SELECT (no user_id column, system table)
CREATE POLICY "Admins can view all music tasks"
ON public.music_generation_tasks
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::text));
