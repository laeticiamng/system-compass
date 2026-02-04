/**
 * RateLimitIndicator - Visual feedback for rate limiting
 * Shows remaining attempts and cooldown timers
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { checkRateLimit } from '@/services/security';
import { cn } from '@/lib/utils';

interface RateLimitIndicatorProps {
  limitKey: string;
  maxAttempts: number;
  windowMs: number;
  onLimitReached?: () => void;
  showAlways?: boolean;
  className?: string;
}

export function RateLimitIndicator({
  limitKey,
  maxAttempts,
  windowMs,
  onLimitReached,
  showAlways = false,
  className,
}: RateLimitIndicatorProps) {
  const { t } = useTranslation();
  const [limitInfo, setLimitInfo] = useState(() => 
    checkRateLimit(limitKey, maxAttempts, windowMs)
  );
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    const info = checkRateLimit(limitKey, maxAttempts, windowMs);
    setLimitInfo(info);

    if (!info.allowed) {
      onLimitReached?.();
      const remaining = Math.max(0, Math.ceil((info.resetTime - Date.now()) / 1000));
      setCountdown(remaining);
    }
  }, [limitKey, maxAttempts, windowMs, onLimitReached]);

  // Countdown timer
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          // Refresh limit info
          setLimitInfo(checkRateLimit(limitKey, maxAttempts, windowMs));
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, limitKey, maxAttempts, windowMs]);

  const usedAttempts = maxAttempts - limitInfo.remainingAttempts;
  const percentUsed = (usedAttempts / maxAttempts) * 100;
  const isWarning = percentUsed >= 70;
  const isBlocked = !limitInfo.allowed;

  // Don't show if no attempts used and not showAlways
  if (!showAlways && usedAttempts === 0) {
    return null;
  }

  if (isBlocked && countdown !== null) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive',
          className
        )}
        role="alert"
      >
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        <div className="flex-1 text-sm">
          <p className="font-medium">
            {t('rateLimit.blocked', 'Limite atteinte')}
          </p>
          <p className="text-xs opacity-80">
            {t('rateLimit.waitTime', 'Réessayez dans {{seconds}}s', { seconds: countdown })}
          </p>
        </div>
        <Clock className="w-4 h-4 animate-pulse" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-2 rounded-lg',
        isWarning ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-muted/30',
        className
      )}
    >
      <div className="flex-1">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className={isWarning ? 'text-amber-600' : 'text-muted-foreground'}>
            {t('rateLimit.remaining', '{{count}} essais restants', {
              count: limitInfo.remainingAttempts,
            })}
          </span>
          <span className="text-muted-foreground">
            {usedAttempts}/{maxAttempts}
          </span>
        </div>
        <Progress
          value={percentUsed}
          className={cn(
            'h-1.5',
            isWarning && '[&>div]:bg-amber-500'
          )}
        />
      </div>
      {isWarning && (
        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
      )}
    </div>
  );
}

/**
 * Hook for rate limit checking with UI feedback
 */
export function useRateLimitCheck(
  key: string,
  maxAttempts: number,
  windowMs: number
) {
  const [canProceed, setCanProceed] = useState(true);
  const [remainingAttempts, setRemainingAttempts] = useState(maxAttempts);
  const [resetTime, setResetTime] = useState<number | null>(null);

  const checkLimit = () => {
    const result = checkRateLimit(key, maxAttempts, windowMs);
    setCanProceed(result.allowed);
    setRemainingAttempts(result.remainingAttempts);
    
    if (!result.allowed) {
      setResetTime(result.resetTime);
    }
    
    return result.allowed;
  };

  const consumeAttempt = () => {
    const result = checkRateLimit(key, maxAttempts, windowMs);
    setCanProceed(result.allowed);
    setRemainingAttempts(Math.max(0, result.remainingAttempts - 1));
    
    if (!result.allowed) {
      setResetTime(result.resetTime);
    }
    
    return result.allowed;
  };

  return {
    canProceed,
    remainingAttempts,
    resetTime,
    checkLimit,
    consumeAttempt,
  };
}
