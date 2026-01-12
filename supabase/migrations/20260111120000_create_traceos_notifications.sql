-- Create notifications for TraceOS decisions
CREATE TABLE IF NOT EXISTS public.traceos_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  decision_id UUID NOT NULL REFERENCES public.traceos_decisions(id) ON DELETE CASCADE,
  decision_title TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('pending_reminder', 'old_pending')),
  days_since INTEGER NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.traceos_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their TraceOS notifications"
ON public.traceos_notifications
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their TraceOS notifications"
ON public.traceos_notifications
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their TraceOS notifications"
ON public.traceos_notifications
FOR DELETE
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their TraceOS notifications"
ON public.traceos_notifications
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE UNIQUE INDEX IF NOT EXISTS idx_traceos_notifications_decision_type
ON public.traceos_notifications(decision_id, notification_type);

CREATE INDEX IF NOT EXISTS idx_traceos_notifications_user_id
ON public.traceos_notifications(user_id);

-- Generate notifications when decisions change
CREATE OR REPLACE FUNCTION public.generate_traceos_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  days_since INTEGER;
  target_type TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.traceos_notifications WHERE decision_id = OLD.id;
    RETURN OLD;
  END IF;

  IF NEW.status <> 'pending' THEN
    DELETE FROM public.traceos_notifications WHERE decision_id = NEW.id;
    RETURN NEW;
  END IF;

  days_since := CURRENT_DATE - NEW.decision_date;

  IF days_since > 30 THEN
    target_type := 'old_pending';
  ELSIF days_since >= 7 THEN
    target_type := 'pending_reminder';
  ELSE
    DELETE FROM public.traceos_notifications WHERE decision_id = NEW.id;
    RETURN NEW;
  END IF;

  DELETE FROM public.traceos_notifications
  WHERE decision_id = NEW.id
    AND notification_type <> target_type;

  INSERT INTO public.traceos_notifications (
    user_id,
    decision_id,
    decision_title,
    notification_type,
    days_since
  )
  VALUES (
    NEW.user_id,
    NEW.id,
    NEW.title,
    target_type,
    days_since
  )
  ON CONFLICT (decision_id, notification_type)
  DO UPDATE SET
    decision_title = EXCLUDED.decision_title,
    days_since = EXCLUDED.days_since,
    user_id = EXCLUDED.user_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_traceos_notifications ON public.traceos_decisions;
CREATE TRIGGER trigger_traceos_notifications
AFTER INSERT OR UPDATE OF status, decision_date, title OR DELETE
ON public.traceos_decisions
FOR EACH ROW
EXECUTE FUNCTION public.generate_traceos_notifications();
