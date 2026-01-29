import { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    // Attempt to fetch a small resource to verify connectivity
    try {
      await fetch('/favicon.ico', { cache: 'no-store' });
      setIsOffline(false);
    } catch {
      setIsOffline(true);
    } finally {
      setIsRetrying(false);
    }
  };

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground px-4 py-2 flex items-center justify-center gap-3">
      <WifiOff className="h-4 w-4" />
      <span className="text-sm font-medium">Vous êtes hors ligne. Certaines fonctionnalités peuvent être indisponibles.</span>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleRetry}
        disabled={isRetrying}
        className="h-7"
      >
        <RefreshCw className={`h-3 w-3 mr-1 ${isRetrying ? 'animate-spin' : ''}`} />
        Réessayer
      </Button>
    </div>
  );
}
