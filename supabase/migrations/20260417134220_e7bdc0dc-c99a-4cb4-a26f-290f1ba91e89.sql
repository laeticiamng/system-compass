-- Error logs table for in-house observability
CREATE TABLE public.error_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NULL,
  level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'fatal')),
  source TEXT NOT NULL CHECK (source IN ('web', 'edge', 'api')),
  message TEXT NOT NULL,
  stack TEXT NULL,
  context JSONB NULL DEFAULT '{}'::jsonb,
  url TEXT NULL,
  user_agent TEXT NULL,
  release TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for dashboard queries
CREATE INDEX idx_error_logs_created_at ON public.error_logs (created_at DESC);
CREATE INDEX idx_error_logs_level ON public.error_logs (level);
CREATE INDEX idx_error_logs_source ON public.error_logs (source);
CREATE INDEX idx_error_logs_level_created ON public.error_logs (level, created_at DESC);

-- Enable RLS
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Anyone (anon or authenticated) can insert logs
CREATE POLICY "Anyone can insert error logs"
ON public.error_logs
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can read
CREATE POLICY "Admins can view all error logs"
ON public.error_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete (for manual cleanup)
CREATE POLICY "Admins can delete error logs"
ON public.error_logs
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Purge function: removes logs older than 30 days
CREATE OR REPLACE FUNCTION public.purge_old_error_logs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM public.error_logs
  WHERE created_at < NOW() - INTERVAL '30 days';
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;