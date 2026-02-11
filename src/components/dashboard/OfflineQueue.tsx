import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WifiOff, RefreshCw, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface QueuedAction {
  id: string;
  type: string;
  payload: unknown;
  timestamp: number;
  status: 'pending' | 'syncing' | 'success' | 'error';
}

export function OfflineQueue() {
  const { t } = useTranslation();
  const [queue, setQueue] = useState<QueuedAction[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load queued actions from localStorage
    const saved = localStorage.getItem('offline_queue');
    if (saved) {
      try {
        setQueue(JSON.parse(saved));
      } catch {
        console.error('Failed to parse offline queue');
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncQueue = async () => {
    if (!isOnline || queue.length === 0) return;

    setIsSyncing(true);
    const updatedQueue = [...queue];

    for (let i = 0; i < updatedQueue.length; i++) {
      if (updatedQueue[i].status === 'pending') {
        updatedQueue[i].status = 'syncing';
        setQueue([...updatedQueue]);

        // Simulate sync - in production, this would call the actual API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mark as success (in production, handle errors properly)
        updatedQueue[i].status = 'success';
        setQueue([...updatedQueue]);
      }
    }

    // Remove successful items after a delay
    setTimeout(() => {
      const remaining = updatedQueue.filter(a => a.status !== 'success');
      setQueue(remaining);
      localStorage.setItem('offline_queue', JSON.stringify(remaining));
    }, 2000);

    setIsSyncing(false);
  };

  const clearQueue = () => {
    setQueue([]);
    localStorage.removeItem('offline_queue');
  };

  const pendingCount = queue.filter(a => a.status === 'pending').length;

  if (queue.length === 0) return null;

  return (
    <Card className="glass-card border-amber-500/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4 text-amber-500" />
            {t('offline.pendingActions', 'Actions en attente')}
          </div>
          <Badge variant="secondary">{pendingCount} {t('offline.pending', 'en attente')}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="max-h-40 overflow-y-auto space-y-2">
          {queue.slice(0, 5).map((action) => (
            <div 
              key={action.id} 
              className="flex items-center justify-between text-sm p-2 rounded bg-muted/50"
            >
              <div className="flex items-center gap-2">
                {action.status === 'pending' && <Clock className="h-3 w-3 text-muted-foreground" />}
                {action.status === 'syncing' && <RefreshCw className="h-3 w-3 animate-spin text-primary" />}
                {action.status === 'success' && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                {action.status === 'error' && <XCircle className="h-3 w-3 text-red-500" />}
                <span className="truncate max-w-[150px]">{action.type}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(action.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <Button 
            size="sm" 
            onClick={syncQueue}
            disabled={!isOnline || isSyncing || pendingCount === 0}
            className="flex-1"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                {t('offline.syncing', 'Synchronisation...')}
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-1" />
                {t('offline.sync', 'Synchroniser')}
              </>
            )}
          </Button>
          <Button size="sm" variant="outline" onClick={clearQueue}>
            {t('common.clear', 'Effacer')}
          </Button>
        </div>

        {!isOnline && (
          <p className="text-xs text-amber-500 flex items-center gap-1">
            <WifiOff className="h-3 w-3" />
            {t('offline.offlineMessage', 'Hors ligne - les actions seront synchronisées au retour de la connexion')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
