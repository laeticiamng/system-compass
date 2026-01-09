-- Create storage bucket for TraceOS exports
INSERT INTO storage.buckets (id, name, public)
VALUES ('traceos-exports', 'traceos-exports', false);

-- Allow authenticated users to read their own exports
CREATE POLICY "Users can view their own exports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'traceos-exports' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to upload their exports
CREATE POLICY "Users can upload their exports"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'traceos-exports' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their exports
CREATE POLICY "Users can delete their exports"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'traceos-exports' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Table to track scheduled exports
CREATE TABLE public.traceos_export_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'weekly', -- 'daily', 'weekly', 'monthly'
  last_export_at TIMESTAMP WITH TIME ZONE,
  next_export_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  include_history BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.traceos_export_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their export schedules"
ON public.traceos_export_schedules
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_traceos_export_schedules_updated_at
  BEFORE UPDATE ON public.traceos_export_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();