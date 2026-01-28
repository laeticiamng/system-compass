/**
 * Offline Banner Component
 * 
 * Displays a banner when the user is offline or has a slow connection.
 */

import { WifiOff, AlertTriangle } from 'lucide-react';
import { useNetworkQuality } from '@/lib/network-utils';
import { cn } from '@/lib/utils';

interface OfflineBannerProps {
  className?: string;
}

export function OfflineBanner({ className }: OfflineBannerProps) {
  const quality = useNetworkQuality();

  if (quality === 'good') {
    return null;
  }

  const isOffline = quality === 'offline';

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-50",
        "px-4 py-2 rounded-full shadow-lg",
        "flex items-center gap-2 text-sm font-medium",
        "animate-in slide-in-from-bottom-4 duration-300",
        isOffline 
          ? "bg-destructive text-destructive-foreground" 
          : "bg-warning text-warning-foreground",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      {isOffline ? (
        <>
          <WifiOff className="w-4 h-4" />
          <span>Vous êtes hors ligne</span>
        </>
      ) : (
        <>
          <AlertTriangle className="w-4 h-4" />
          <span>Connexion lente</span>
        </>
      )}
    </div>
  );
}

/**
 * Online indicator for subtle connection status
 */
export function OnlineIndicator({ className }: { className?: string }) {
  const quality = useNetworkQuality();

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs",
        className
      )}
      title={
        quality === 'offline' 
          ? 'Hors ligne' 
          : quality === 'slow' 
            ? 'Connexion lente' 
            : 'En ligne'
      }
    >
      <div
        className={cn(
          "w-2 h-2 rounded-full",
          quality === 'offline' && "bg-destructive",
          quality === 'slow' && "bg-warning",
          quality === 'good' && "bg-primary"
        )}
      />
      <span className="text-muted-foreground">
        {quality === 'offline' && 'Hors ligne'}
        {quality === 'slow' && 'Lent'}
        {quality === 'good' && 'En ligne'}
      </span>
    </div>
  );
}
