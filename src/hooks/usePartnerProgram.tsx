import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export type PartnerType = 'ambassador' | 'b2b_partner';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface PartnerApplication {
  id: string;
  user_id: string;
  partner_type: PartnerType;
  status: ApplicationStatus;
  company_name: string | null;
  professional_profile: string | null;
  motivation: string;
  platform_experience: string | null;
  ethics_charter_accepted: boolean;
  ethics_charter_accepted_at: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PartnerContribution {
  id: string;
  user_id: string;
  contribution_type: string;
  description: string;
  impact_metric: string | null;
  verified: boolean;
  verified_at: string | null;
  credits_awarded: number;
  created_at: string;
}

export interface PartnerBenefit {
  id: string;
  user_id: string;
  benefit_type: string;
  description: string;
  awarded_at: string;
  expires_at: string | null;
  active: boolean;
}

// Helper function to notify admins of new partner applications
async function notifyAdminsOfNewApplication(userId: string, partnerType: PartnerType): Promise<void> {
  // Get admin users from user_roles table
  const { data: adminRoles } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'admin');

  if (!adminRoles || adminRoles.length === 0) {
    console.log('No admins found to notify');
    return;
  }

  // Create notification for each admin
  const notifications = adminRoles.map(admin => ({
    user_id: admin.user_id,
    notification_type: 'partner_application',
    message: `Nouvelle candidature partenaire (${partnerType === 'ambassador' ? 'Ambassadeur' : 'B2B'}) à examiner`,
    read: false
  }));

  // Insert into generation_notifications (reusing existing table)
  await supabase
    .from('generation_notifications')
    .insert(notifications);
}

export function usePartnerProgram() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [contributions, setContributions] = useState<PartnerContribution[]>([]);
  const [benefits, setBenefits] = useState<PartnerBenefit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPartnerData();
    } else {
      setApplications([]);
      setContributions([]);
      setBenefits([]);
      setLoading(false);
    }
  }, [user]);

  const fetchPartnerData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [appsRes, contribsRes, benefitsRes] = await Promise.all([
        supabase
          .from('partner_applications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('partner_contributions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('partner_benefits')
          .select('*')
          .eq('user_id', user.id)
          .eq('active', true)
          .order('awarded_at', { ascending: false })
      ]);

      if (appsRes.data) setApplications(appsRes.data as PartnerApplication[]);
      if (contribsRes.data) setContributions(contribsRes.data as PartnerContribution[]);
      if (benefitsRes.data) setBenefits(benefitsRes.data as PartnerBenefit[]);
    } catch (error) {
      console.error('Error fetching partner data:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitApplication = async (
    partnerType: PartnerType,
    data: {
      motivation: string;
      platform_experience?: string;
      company_name?: string;
      professional_profile?: string;
    }
  ) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour postuler.",
        variant: "destructive"
      });
      return { success: false };
    }

    try {
      const { error } = await supabase
        .from('partner_applications')
        .insert({
          user_id: user.id,
          partner_type: partnerType,
          motivation: data.motivation,
          platform_experience: data.platform_experience || null,
          company_name: data.company_name || null,
          professional_profile: data.professional_profile || null,
          ethics_charter_accepted: true,
          ethics_charter_accepted_at: new Date().toISOString()
        });

      if (error) throw error;

      // Notify admins about new application
      try {
        await notifyAdminsOfNewApplication(user.id, partnerType);
      } catch (notifyError) {
        console.warn('Failed to notify admins:', notifyError);
        // Don't fail the application submission if notification fails
      }

      toast({
        title: "Candidature envoyée",
        description: "Votre candidature a été soumise avec succès. Nous l'examinerons sous peu."
      });

      await fetchPartnerData();
      return { success: true };
    } catch (error: any) {
      if (error.code === '23505') {
        toast({
          title: "Candidature existante",
          description: "Vous avez déjà une candidature pour ce poste.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible d'envoyer votre candidature.",
          variant: "destructive"
        });
      }
      return { success: false };
    }
  };

  const submitContribution = async (data: {
    contribution_type: string;
    description: string;
    impact_metric?: string;
  }) => {
    if (!user) return { success: false };

    try {
      const { error } = await supabase
        .from('partner_contributions')
        .insert({
          user_id: user.id,
          contribution_type: data.contribution_type,
          description: data.description,
          impact_metric: data.impact_metric || null
        });

      if (error) throw error;

      toast({
        title: "Contribution enregistrée",
        description: "Votre contribution a été soumise pour vérification."
      });

      await fetchPartnerData();
      return { success: true };
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre contribution.",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  const getActiveApplication = (type: PartnerType) => {
    return applications.find(
      app => app.partner_type === type && app.status !== 'rejected'
    );
  };

  const isApprovedPartner = (type: PartnerType) => {
    return applications.some(
      app => app.partner_type === type && app.status === 'approved'
    );
  };

  const getTotalCredits = () => {
    return contributions
      .filter(c => c.verified)
      .reduce((sum, c) => sum + (c.credits_awarded || 0), 0);
  };

  return {
    applications,
    contributions,
    benefits,
    loading,
    submitApplication,
    submitContribution,
    getActiveApplication,
    isApprovedPartner,
    getTotalCredits,
    refetch: fetchPartnerData
  };
}
