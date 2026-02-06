/**
 * useEventRegistration - Event registration hook with backend persistence
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface EventRegistration {
  id: string;
  event_id: string;
  event_title: string;
  event_date: string;
  event_type: 'webinar' | 'meetup' | 'workshop' | 'ama';
  status: 'registered' | 'attended' | 'cancelled' | 'no_show';
  created_at: string;
}

interface RegisterEventParams {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventType: 'webinar' | 'meetup' | 'workshop' | 'ama';
  guestName?: string;
  guestEmail?: string;
  notes?: string;
}

interface UseEventRegistrationReturn {
  registrations: EventRegistration[];
  isLoading: boolean;
  register: (params: RegisterEventParams) => Promise<boolean>;
  cancel: (registrationId: string) => Promise<boolean>;
  isRegistered: (eventId: string) => boolean;
  refreshRegistrations: () => Promise<void>;
}

export function useEventRegistration(): UseEventRegistrationReturn {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRegistrations = useCallback(async () => {
    if (!user) {
      setRegistrations([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('user_id', user.id)
        .neq('status', 'cancelled')
        .order('event_date', { ascending: true });

      if (error) throw error;
      
      setRegistrations((data || []) as EventRegistration[]);
    } catch (error) {
      console.error('Error fetching event registrations:', error);
      // Fallback to localStorage
      const stored = JSON.parse(localStorage.getItem('event_registrations') || '[]');
      setRegistrations(stored);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const register = async (params: RegisterEventParams): Promise<boolean> => {
    setIsLoading(true);

    try {
      const registrationData: Record<string, unknown> = {
        event_id: params.eventId,
        event_title: params.eventTitle,
        event_date: params.eventDate,
        event_type: params.eventType,
        user_id: user?.id || null,
        guest_name: !user ? params.guestName : null,
        guest_email: !user ? params.guestEmail : null,
        notes: params.notes || null,
        status: 'registered',
      };

      const { error } = await supabase
        .from('event_registrations')
        .insert(registrationData as never);

      if (error) {
        console.error('Event registration error:', error);
        // Fallback to localStorage
        const stored = JSON.parse(localStorage.getItem('event_registrations') || '[]');
        stored.push({
          ...registrationData,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
        });
        localStorage.setItem('event_registrations', JSON.stringify(stored));
      }

      toast.success('Inscription confirmée !', {
        description: `Vous êtes inscrit à "${params.eventTitle}"`,
      });

      await fetchRegistrations();
      return true;
    } catch (error) {
      console.error('Event registration error:', error);
      toast.error('Erreur lors de l\'inscription');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const cancel = async (registrationId: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('event_registrations')
        .update({ status: 'cancelled' })
        .eq('id', registrationId);

      if (error) throw error;

      toast.success('Inscription annulée');
      await fetchRegistrations();
      return true;
    } catch (error) {
      console.error('Event cancellation error:', error);
      toast.error('Erreur lors de l\'annulation');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const isRegistered = (eventId: string): boolean => {
    return registrations.some(r => r.event_id === eventId && r.status === 'registered');
  };

  return {
    registrations,
    isLoading,
    register,
    cancel,
    isRegistered,
    refreshRegistrations: fetchRegistrations,
  };
}
