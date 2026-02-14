/**
 * SystemHealthIndicator - Real-time system health display
 * Shows sync status, network health, and data freshness
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Cloud, 
  CloudOff, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface HealthMetrics {
  online: boolean;
  dbConnected: boolean;
  lastSync: Date | null;
  latency: number;
  queueSize: number;
  healthScore: number; // 0-100
}

interface SystemHealthIndicatorProps {
  compact?: boolean;
  showDetails?: boolean;
  className?: string;
}

export function SystemHealthIndicator({ 
  compact = false, 
  showDetails = true,
  className 
}: SystemHealthIndicatorProps) {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<HealthMetrics>({
    online: navigator.onLine,
    dbConnected: false,
    lastSync: null,
    latency: 0,
    queueSize: 0,
    healthScore: 0
  });
  const [checking, setChecking] = useState(false);

  const checkHealth = useCallback(async () => {
    setChecking(true);
    const startTime = Date.now();
    
    try {
      // Test database connection
      const { error } = await supabase.from('countries').select('id').limit(1);
      const latency = Date.now() - startTime;
      
      // Check offline queue
      const queueSize = parseInt(localStorage.getItem('offline_queue_size') || '0', 10);
      
      // Calculate health score
      const isDbConnected = !error;
      const isOnline = navigator.onLine;
      let score = 0;
      
      if (isOnline) score += 40;
      if (isDbConnected) score += 40;
      if (latency < 500) score += 10;
      else if (latency < 1000) score += 5;
      if (queueSize === 0) score += 10;
      
      setMetrics({
        online: isOnline,
        dbConnected: isDbConnected,
        lastSync: new Date(),
        latency,
        queueSize,
        healthScore: score
      });
    } catch {
      setMetrics(prev => ({
        ...prev,
        dbConnected: false,
        latency: Date.now() - startTime,
        healthScore: prev.online ? 30 : 0
      }));
    } finally {
      setChecking(false);
    }
  }, []);

  // Initial check and periodic refresh
  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 60000); // Every minute
    
    // Listen for online/offline events
    const handleOnline = () => {
      setMetrics(prev => ({ ...prev, online: true }));
      checkHealth();
    };
    const handleOffline = () => {
      setMetrics(prev => ({ ...prev, online: false, healthScore: 0 }));
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkHealth]);

  const getStatusColor = () => {
    if (!metrics.online) return 'text-destructive';
    if (!metrics.dbConnected) return 'text-amber-500';
    if (metrics.healthScore >= 80) return 'text-green-500';
    if (metrics.healthScore >= 50) return 'text-amber-500';
    return 'text-destructive';
  };

  const getStatusIcon = () => {
    if (!metrics.online) return <WifiOff className="w-4 h-4" />;
    if (!metrics.dbConnected) return <CloudOff className="w-4 h-4" />;
    if (checking) return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (metrics.healthScore >= 80) return <CheckCircle2 className="w-4 h-4" />;
    if (metrics.healthScore >= 50) return <AlertTriangle className="w-4 h-4" />;
    return <CloudOff className="w-4 h-4" />;
  };

  const getStatusLabel = () => {
    if (!metrics.online) return t('health.offline', 'Hors ligne');
    if (!metrics.dbConnected) return t('health.dbDisconnected', 'Base déconnectée');
    if (metrics.healthScore >= 80) return t('health.excellent', 'Excellent');
    if (metrics.healthScore >= 50) return t('health.degraded', 'Dégradé');
    return t('health.poor', 'Problème');
  };

  const formatLastSync = () => {
    if (!metrics.lastSync) return t('health.never', 'Jamais');
    
    const diff = Date.now() - metrics.lastSync.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return t('health.justNow', 'À l\'instant');
    if (minutes < 60) return t('health.minutesAgo', '{{count}} min', { count: minutes });
    
    const hours = Math.floor(minutes / 60);
    return t('health.hoursAgo', '{{count}} h', { count: hours });
  };

  // Compact version - just icon with color
  if (compact) {
    return (
      <div className={cn('flex items-center gap-1', getStatusColor(), className)}>
        {getStatusIcon()}
      </div>
    );
  }

  // Full version with popover
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn('gap-2 h-8 px-2', className)}
        >
          <span className={getStatusColor()}>
            {getStatusIcon()}
          </span>
          {showDetails && (
            <span className="text-xs hidden sm:inline">{getStatusLabel()}</span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">
              {t('health.systemHealth', 'Santé système')}
            </h4>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={checkHealth}
              disabled={checking}
            >
              <RefreshCw className={cn('w-4 h-4', checking && 'animate-spin')} />
            </Button>
          </div>

          {/* Health Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t('health.score', 'Score global')}
              </span>
              <span className={cn('font-medium', getStatusColor())}>
                {metrics.healthScore}%
              </span>
            </div>
            <Progress 
              value={metrics.healthScore} 
              className="h-2"
            />
          </div>

          {/* Status Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
              {metrics.online ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-destructive" />
              )}
              <div>
                <p className="text-xs font-medium">
                  {t('health.network', 'Réseau')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {metrics.online ? t('health.connected', 'Connecté') : t('health.disconnected', 'Déconnecté')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
              {metrics.dbConnected ? (
                <Database className="w-4 h-4 text-green-500" />
              ) : (
                <Database className="w-4 h-4 text-destructive" />
              )}
              <div>
                <p className="text-xs font-medium">
                  {t('health.database', 'Base')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {metrics.dbConnected ? t('health.active', 'Active') : t('health.inactive', 'Inactive')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
              <Zap className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs font-medium">
                  {t('health.latency', 'Latence')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {metrics.latency}ms
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium">
                  {t('health.lastSync', 'Sync')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatLastSync()}
                </p>
              </div>
            </div>
          </div>

          {/* Queue Warning */}
          {metrics.queueSize > 0 && (
            <div className="flex items-center gap-2 p-2 rounded-md bg-amber-500/10 border border-amber-500/20">
              <Cloud className="w-4 h-4 text-amber-500" />
              <p className="text-xs text-amber-600">
                {t('health.pendingSync', '{{count}} actions en attente de sync', { count: metrics.queueSize })}
              </p>
            </div>
          )}

          {/* Offline Warning */}
          {!metrics.online && (
            <div className="p-2 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-xs text-destructive">
                {t('health.offlineWarning', 'Connexion perdue. Les modifications seront synchronisées au retour du réseau.')}
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Export a simple hook for health status
export function useSystemHealth() {
  const [isHealthy, setIsHealthy] = useState(true);
  
  useEffect(() => {
    const checkHealth = async () => {
      try {
        if (!navigator.onLine) {
          setIsHealthy(false);
          return;
        }
        
        const { error } = await supabase.from('countries').select('id').limit(1);
        setIsHealthy(!error);
      } catch {
        setIsHealthy(false);
      }
    };
    
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    
    const handleOnline = () => checkHealth();
    const handleOffline = () => setIsHealthy(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isHealthy;
}
