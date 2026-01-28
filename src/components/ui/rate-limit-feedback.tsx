/**
 * Rate Limit Feedback Component
 * 
 * Shows visual feedback when rate limiting is triggered.
 */

import { useState, useEffect } from 'react';
import { Timer, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface RateLimitFeedbackProps {
  isLimited: boolean;
  retryAfterSeconds?: number;
  onRetry?: () => void;
  message?: string;
  className?: string;
}

export function RateLimitFeedback({
  isLimited,
  retryAfterSeconds = 60,
  onRetry,
  message = "Trop de requêtes. Veuillez patienter.",
  className,
}: RateLimitFeedbackProps) {
  const [countdown, setCountdown] = useState(retryAfterSeconds);

  useEffect(() => {
    if (!isLimited) {
      setCountdown(retryAfterSeconds);
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLimited, retryAfterSeconds]);

  if (!isLimited) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 rounded-lg",
        "bg-warning/10 border border-warning/30",
        className
      )}
      role="alert"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
        {countdown > 0 ? (
          <Timer className="w-5 h-5 text-warning" />
        ) : (
          <AlertCircle className="w-5 h-5 text-warning" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{message}</p>
        {countdown > 0 && (
          <p className="text-xs text-muted-foreground">
            Réessayez dans {countdown} seconde{countdown > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {countdown === 0 && onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry}>
          Réessayer
        </Button>
      )}
    </div>
  );
}

/**
 * Hook for tracking rate limit state
 */
export function useRateLimitState(options?: {
  maxAttempts?: number;
  windowMs?: number;
}) {
  const maxAttempts = options?.maxAttempts ?? 5;
  const windowMs = options?.windowMs ?? 60000;
  
  const [attempts, setAttempts] = useState<number[]>([]);
  const [isLimited, setIsLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);

  const recordAttempt = () => {
    const now = Date.now();
    const recentAttempts = attempts.filter((t) => now - t < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      setIsLimited(true);
      const oldestAttempt = Math.min(...recentAttempts);
      const waitTime = Math.ceil((windowMs - (now - oldestAttempt)) / 1000);
      setRetryAfter(waitTime);
      return false;
    }
    
    setAttempts([...recentAttempts, now]);
    return true;
  };

  const reset = () => {
    setAttempts([]);
    setIsLimited(false);
    setRetryAfter(0);
  };

  useEffect(() => {
    if (!isLimited) return;

    const timer = setTimeout(() => {
      setIsLimited(false);
      setRetryAfter(0);
    }, retryAfter * 1000);

    return () => clearTimeout(timer);
  }, [isLimited, retryAfter]);

  return {
    isLimited,
    retryAfter,
    remainingAttempts: Math.max(0, maxAttempts - attempts.length),
    recordAttempt,
    reset,
  };
}
