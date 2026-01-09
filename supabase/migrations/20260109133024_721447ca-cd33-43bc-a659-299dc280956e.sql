-- Enable realtime for generation jobs table
ALTER PUBLICATION supabase_realtime ADD TABLE public.country_generation_jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.country_generation_batches;