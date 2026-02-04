-- Add missing DELETE policies for GDPR compliance and admin moderation

-- profiles: Allow users to delete their own profile (GDPR right to erasure)
CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = id);

-- user_subscriptions: Allow users to delete their subscription records
CREATE POLICY "Users can delete their own subscriptions" 
ON public.user_subscriptions 
FOR DELETE 
USING (auth.uid() = user_id);

-- gdpr_consent_log: Allow users to withdraw consent records
CREATE POLICY "Users can withdraw their own consent" 
ON public.gdpr_consent_log 
FOR DELETE 
USING (auth.uid() = user_id);

-- partner_applications: Allow admins to review applications
CREATE POLICY "Admins can view all partner applications" 
ON public.partner_applications 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- expert_reviews: Allow admins to moderate reviews
CREATE POLICY "Admins can update review status" 
ON public.expert_reviews 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete inappropriate reviews" 
ON public.expert_reviews 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));