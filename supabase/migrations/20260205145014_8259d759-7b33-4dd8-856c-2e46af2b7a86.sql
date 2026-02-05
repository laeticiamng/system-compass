-- Function to notify watchlist users when country updates are approved
CREATE OR REPLACE FUNCTION public.notify_watchlist_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when validation_status changes to 'approved'
  IF NEW.validation_status = 'approved' AND (OLD.validation_status IS DISTINCT FROM 'approved') THEN
    -- Insert notifications for all users watching this country with notify_on_changes enabled
    INSERT INTO public.user_notifications (user_id, type, title, message, action_url, priority, metadata)
    SELECT 
      w.user_id,
      'info',
      'Mise à jour pays',
      'Les données du pays que vous suivez ont été mises à jour: ' || NEW.change_type::text,
      '/country/' || NEW.country_id,
      'medium',
      jsonb_build_object('country_id', NEW.country_id, 'change_type', NEW.change_type::text, 'update_id', NEW.id)
    FROM public.user_country_watchlist w
    WHERE w.country_id = NEW.country_id
      AND w.notify_on_changes = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for country data updates (idempotent)
DROP TRIGGER IF EXISTS notify_on_country_update_approval ON public.country_data_updates;
CREATE TRIGGER notify_on_country_update_approval
  AFTER UPDATE ON public.country_data_updates
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_watchlist_on_approval();