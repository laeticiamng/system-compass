-- Fix: Restrict expert update on consultations to exclude payment_status manipulation
-- Drop the overly permissive expert update policy
DROP POLICY IF EXISTS "Experts can update consultation status" ON public.consultations;

-- Recreate with restricted columns - experts can only update status and meeting_url, NOT payment_status
CREATE POLICY "Experts can update consultation status"
ON public.consultations
FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1 FROM experts
    WHERE experts.id = consultations.expert_id
    AND experts.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM experts
    WHERE experts.id = consultations.expert_id
    AND experts.user_id = auth.uid()
  )
);