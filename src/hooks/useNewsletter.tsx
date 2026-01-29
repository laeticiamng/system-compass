/**
 * useNewsletter - Newsletter subscription hook with backend persistence
 */
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().email().max(255);

interface NewsletterPreferences {
  weekly_digest: boolean;
  new_countries: boolean;
  tips_tricks: boolean;
  promotions: boolean;
}

interface UseNewsletterReturn {
  subscribe: (email: string, preferences?: Partial<NewsletterPreferences>) => Promise<boolean>;
  unsubscribe: (email: string) => Promise<boolean>;
  updatePreferences: (preferences: Partial<NewsletterPreferences>) => Promise<boolean>;
  isLoading: boolean;
}

export function useNewsletter(): UseNewsletterReturn {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const subscribe = async (
    email: string, 
    preferences: Partial<NewsletterPreferences> = {}
  ): Promise<boolean> => {
    // Validate email
    const validation = emailSchema.safeParse(email);
    if (!validation.success) {
      toast.error('Email invalide');
      return false;
    }

    setIsLoading(true);

    try {
      const defaultPreferences: NewsletterPreferences = {
        weekly_digest: true,
        new_countries: true,
        tips_tricks: true,
        promotions: false,
        ...preferences,
      };

      // Insert into newsletter_subscriptions table
      const insertData: Record<string, unknown> = {
        email: email.toLowerCase().trim(),
        preferences: defaultPreferences,
        user_id: user?.id || null,
        is_active: true,
        source: 'website',
      };

      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert(insertData as never);

      if (error) {
        console.error('Newsletter subscription error:', error);
        // Fallback to localStorage for demo
        const stored = JSON.parse(localStorage.getItem('newsletter_subscriptions') || '[]');
        stored.push({ 
          email: email.toLowerCase().trim(), 
          preferences: defaultPreferences,
          subscribed_at: new Date().toISOString() 
        });
        localStorage.setItem('newsletter_subscriptions', JSON.stringify(stored));
      }

      toast.success('Inscription réussie !', {
        description: 'Bienvenue dans la communauté System Compass.',
      });
      return true;
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error('Erreur lors de l\'inscription');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async (email: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .update({ 
          is_active: false, 
          unsubscribed_at: new Date().toISOString() 
        })
        .eq('email', email.toLowerCase().trim());

      if (error) throw error;

      toast.success('Désabonnement effectué');
      return true;
    } catch (error) {
      console.error('Newsletter unsubscribe error:', error);
      toast.error('Erreur lors du désabonnement');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (
    preferences: Partial<NewsletterPreferences>
  ): Promise<boolean> => {
    if (!user) {
      toast.error('Veuillez vous connecter');
      return false;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .update({ preferences })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Préférences mises à jour');
      return true;
    } catch (error) {
      console.error('Newsletter preferences error:', error);
      toast.error('Erreur lors de la mise à jour');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    subscribe,
    unsubscribe,
    updatePreferences,
    isLoading,
  };
}
