/**
 * Session Timeout Warning Component
 * Warns users before their session expires and allows extension
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, RefreshCw } from 'lucide-react';
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
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const SESSION_WARNING_TIME = 5 * 60 * 1000; // 5 minutes before expiry
const SESSION_CHECK_INTERVAL = 60 * 1000; // Check every minute
const SESSION_DURATION = 60 * 60 * 1000; // 1 hour default session

export function SessionTimeoutWarning() {
  const { t } = useTranslation();
  const { user, session } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(SESSION_DURATION);
  const [isExtending, setIsExtending] = useState(false);

  const checkSessionExpiry = useCallback(() => {
    if (!session?.expires_at) return;

    const expiresAt = new Date(session.expires_at).getTime();
    const now = Date.now();
    const remaining = expiresAt - now;

    setTimeRemaining(Math.max(0, remaining));

    if (remaining <= SESSION_WARNING_TIME && remaining > 0) {
      setShowWarning(true);
    } else if (remaining <= 0) {
      // Session expired - will be handled by auth provider
      setShowWarning(false);
    }
  }, [session]);

  useEffect(() => {
    if (!user) return;

    // Initial check
    checkSessionExpiry();

    // Periodic check
    const interval = setInterval(checkSessionExpiry, SESSION_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [user, checkSessionExpiry]);

  const handleExtendSession = async () => {
    setIsExtending(true);
    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) throw error;
      setShowWarning(false);
    } catch (error) {
      console.error('Failed to extend session:', error);
    } finally {
      setIsExtending(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowWarning(false);
  };

  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressValue = Math.max(0, (timeRemaining / SESSION_WARNING_TIME) * 100);

  if (!user) return null;

  return (
    <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            {t('session.timeout.title', 'Session expiring soon')}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              {t(
                'session.timeout.description',
                'Your session will expire in {time}. Would you like to extend it?',
                { time: formatTimeRemaining() }
              )}
            </p>
            <div className="space-y-2">
              <Progress value={progressValue} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                {formatTimeRemaining()} {t('session.timeout.remaining', 'remaining')}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleLogout}>
            {t('session.timeout.logout', 'Sign out')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleExtendSession}
            disabled={isExtending}
          >
            {isExtending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            {t('session.timeout.extend', 'Extend session')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
