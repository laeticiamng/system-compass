import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Cloud, CloudOff, Loader2, Check, X, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface QueuedExport {
  id: string;
  type: 'pdf' | 'csv' | 'json' | 'ics';
  name: string;
  data: any;
  createdAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

const STORAGE_KEY = 'offline_export_queue';

export function OfflineExportQueue() {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queue, setQueue] = useState<QueuedExport[]>([]);
  const [processing, setProcessing] = useState(false);

  // Load queue from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setQueue(parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
        })));
      }
    } catch (e) {
      console.warn('Failed to load export queue:', e);
    }
  }, []);

  // Save queue to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  }, [queue]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success(t('offline.backOnline', 'Connexion rétablie'));
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning(t('offline.nowOffline', 'Mode hors-ligne'));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [t]);

  // Process queue when online
  const processQueue = async () => {
    if (!isOnline || processing || queue.length === 0) return;

    setProcessing(true);
    const pendingItems = queue.filter(item => item.status === 'pending');

    for (const item of pendingItems) {
      setQueue(prev => prev.map(q => 
        q.id === item.id ? { ...q, status: 'processing' } : q
      ));

      try {
        // Simulate processing - in real implementation, this would generate and download the file
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setQueue(prev => prev.map(q => 
          q.id === item.id ? { ...q, status: 'completed' } : q
        ));

        toast.success(t('offline.exportCompleted', { name: item.name }));
      } catch (error) {
        setQueue(prev => prev.map(q => 
          q.id === item.id ? { ...q, status: 'failed', error: 'Export failed' } : q
        ));
      }
    }

    setProcessing(false);
  };

  // Expose addToQueue via custom event listener for external usage
  const handleExternalAdd = (type: QueuedExport['type'], name: string, data: any) => {
    const newExport: QueuedExport = {
      id: crypto.randomUUID(),
      type,
      name,
      data,
      createdAt: new Date(),
      status: 'pending',
    };

    setQueue(prev => [...prev, newExport]);
    
    if (isOnline) {
      toast.info(t('offline.exportQueued', 'Export ajouté à la file'));
    } else {
      toast.warning(t('offline.exportQueuedOffline', 'Export sauvegardé pour plus tard'));
    }
  };

  // Listen for external add events
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const { type, name, data } = e.detail;
      handleExternalAdd(type, name, data);
    };
    window.addEventListener('offlineExportAdd', handler as EventListener);
    return () => window.removeEventListener('offlineExportAdd', handler as EventListener);
  }, [isOnline]);

  const removeFromQueue = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  const clearCompleted = () => {
    setQueue(prev => prev.filter(item => item.status !== 'completed'));
  };

  const pendingCount = queue.filter(item => item.status === 'pending').length;
  const completedCount = queue.filter(item => item.status === 'completed').length;

  if (queue.length === 0) {
    return null;
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Download className="w-4 h-4" />
            {t('offline.exportQueue', 'File d\'export')}
          </CardTitle>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Badge variant="outline" className="text-green-500 border-green-500/30 gap-1">
                <Cloud className="w-3 h-3" />
                {t('offline.online', 'En ligne')}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-amber-500 border-amber-500/30 gap-1">
                <CloudOff className="w-3 h-3" />
                {t('offline.offline', 'Hors-ligne')}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Progress */}
        {pendingCount > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{pendingCount} {t('offline.pending', 'en attente')}</span>
              <span>{completedCount} {t('offline.completed', 'terminés')}</span>
            </div>
            <Progress value={(completedCount / queue.length) * 100} className="h-1" />
          </div>
        )}

        {/* Queue items */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {queue.slice(0, 5).map(item => (
            <div 
              key={item.id}
              className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-2">
                {item.status === 'pending' && <Download className="w-4 h-4 text-muted-foreground" />}
                {item.status === 'processing' && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                {item.status === 'completed' && <Check className="w-4 h-4 text-green-500" />}
                {item.status === 'failed' && <X className="w-4 h-4 text-red-500" />}
                <div>
                  <p className="text-xs font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground uppercase">{item.type}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => removeFromQueue(item.id)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {pendingCount > 0 && isOnline && (
            <Button 
              size="sm" 
              onClick={processQueue}
              disabled={processing}
              className="flex-1 gap-2"
            >
              {processing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {t('offline.processQueue', 'Traiter la file')}
            </Button>
          )}
          {completedCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearCompleted}
              className="gap-2"
            >
              {t('offline.clearCompleted', 'Nettoyer')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Hook to add items to queue from anywhere
export function useOfflineExportQueue() {
  const queueExport = (type: QueuedExport['type'], name: string, data: any) => {
    const event = new CustomEvent('offlineExportAdd', { 
      detail: { type, name, data } 
    });
    window.dispatchEvent(event);
  };

  return { queueExport };
}
