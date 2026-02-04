import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Clock, RefreshCw } from 'lucide-react';

const SESSION_WARNING_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry
const SESSION_CHECK_INTERVAL = 60 * 1000; // Check every minute

export function SessionTimeoutWarning() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const refreshSession = useCallback(async () => {
    const { error } = await supabase.auth.refreshSession();
    if (error) throw error;
  }, []);

  const checkSession = useCallback(() => {
    if (!user) {
      setShowWarning(false);
      return;
    }

    // Get session expiry from localStorage or estimate
    const sessionData = localStorage.getItem('supabase.auth.token');
    if (!sessionData) return;

    try {
      const parsed = JSON.parse(sessionData);
      const expiresAt = parsed?.currentSession?.expires_at;
      
      if (expiresAt) {
        const expiryTime = expiresAt * 1000; // Convert to milliseconds
        const now = Date.now();
        const remaining = expiryTime - now;

        if (remaining <= SESSION_WARNING_THRESHOLD && remaining > 0) {
          setTimeRemaining(Math.floor(remaining / 1000));
          setShowWarning(true);
        } else {
          setShowWarning(false);
        }
      }
    } catch {
      // Ignore parsing errors
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Initial check
    checkSession();

    // Set up interval
    const interval = setInterval(checkSession, SESSION_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [user, checkSession]);

  // Update countdown
  useEffect(() => {
    if (!showWarning || timeRemaining === null) return;

    const countdown = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [showWarning, timeRemaining]);

  const handleExtendSession = async () => {
    try {
      await refreshSession();
      setShowWarning(false);
      setTimeRemaining(null);
    } catch (error) {
      console.error('Failed to refresh session:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user) return null;

  return (
    <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            {t('session.expiringTitle', 'Session expiring soon')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('session.expiringDescription', 'Your session will expire in {{time}}. Would you like to extend it?', {
              time: timeRemaining ? formatTime(timeRemaining) : '0:00',
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            {t('session.logout', 'Log out')}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleExtendSession} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            {t('session.extend', 'Extend session')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
