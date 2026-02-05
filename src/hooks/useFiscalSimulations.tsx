/**
 * Hook for fiscal simulations history and user-connected features
 * Note: fiscal_simulations table needs to be created via migration
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { TaxProfile } from '@/lib/fiscalEngine';

export interface FiscalSimulation {
  id: string;
  user_id: string;
  name: string;
  profile: TaxProfile;
  countries: string[];
  results: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Get user's Exit Keys profile for pre-filling fiscal calculator
export function useUserFiscalProfile() {
  return useQuery({
    queryKey: ['user-fiscal-profile-from-profiles'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      // Try to get profiles data which has some user preferences
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (!profile) return null;
      
      // Return default fiscal profile - can be enhanced when more user data is available
      const fiscalProfile: Partial<TaxProfile> = {
        status: 'single',
        children: 0,
        incomeType: 'salary',
        grossIncome: 50000,
      };
      
      return fiscalProfile;
    },
  });
}
