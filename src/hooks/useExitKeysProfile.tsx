import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { LifeMotorProfile, LifePriority } from '@/lib/types';
import { toast } from 'sonner';

import { EducationLevel } from '@/lib/profession-data';

export type ProjectIntention = 'installation' | 'vacation' | 'internship' | 'retirement' | 'digital_nomad';

export interface ExitKeysProfile {
  birthCountryId: string;
  nationalityIds: string[];
  currentCountryId: string;
  motorProfile: LifeMotorProfile;
  desiredLife: LifePriority;
  riskTolerance: 'low' | 'medium' | 'high';
  timeHorizon: 'short' | 'medium' | 'long';
  hasCapital: boolean;
  hasCredentials: boolean;
  hasNetwork: boolean;
  isLGBTQ: boolean;
  hasFamily: boolean;
  // Education and profession for better matching
  educationLevel?: EducationLevel;
  professionId?: string;
  // NEW: Age and intention for personalization
  age?: number;
  projectIntention?: ProjectIntention;
  selectedDestinationId?: string; // The country user wants to go to
}

const STORAGE_KEY = 'exit_keys_profile';

export function useExitKeysProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ExitKeysProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load profile from localStorage or Supabase
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      
      // First check localStorage
      const localProfile = localStorage.getItem(STORAGE_KEY);
      if (localProfile) {
        try {
          setProfile(JSON.parse(localProfile));
        } catch (e) {
          console.error('Error parsing local profile:', e);
        }
      }

      // If user is logged in, check Supabase profiles table
      if (user) {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (data && data.desired_life) {
            // Parse desired_life field which stores our exit keys profile as JSON
            try {
              const savedProfile = JSON.parse(data.desired_life) as ExitKeysProfile;
              setProfile(savedProfile);
              // Also update localStorage
              localStorage.setItem(STORAGE_KEY, JSON.stringify(savedProfile));
            } catch (e) {
              // desired_life might not be JSON, that's okay
            }
          }
        } catch (error) {
          console.error('Error loading profile from Supabase:', error);
        }
      }
      
      setLoading(false);
    };

    loadProfile();
  }, [user]);

  // Save profile
  const saveProfile = useCallback(async (newProfile: ExitKeysProfile) => {
    setProfile(newProfile);
    
    // Always save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));

    // If user is logged in, also save to Supabase
    if (user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            desired_life: JSON.stringify(newProfile),
            birth_country: newProfile.birthCountryId,
            current_country: newProfile.currentCountryId,
          })
          .eq('id', user.id);

        if (error) {
          console.error('Error saving profile to Supabase:', error);
          toast.error('Profil sauvegardé localement uniquement');
        } else {
          toast.success('Profil sauvegardé');
        }
      } catch (error) {
        console.error('Error saving profile:', error);
      }
    } else {
      toast.success('Profil sauvegardé localement');
    }
  }, [user]);

  // Clear profile
  const clearProfile = useCallback(() => {
    setProfile(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    profile,
    loading,
    saveProfile,
    clearProfile,
    isLoggedIn: !!user,
  };
}
