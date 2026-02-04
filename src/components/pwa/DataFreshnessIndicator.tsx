/**
 * Data Freshness Indicator - Shows sync status and data age
 * Provides visual feedback on offline/online status
 */
import { useTranslation } from 'react-i18next';
import { Cloud, CloudOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

interface DataFreshnessIndicatorProps {
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
}

export function DataFreshnessIndicator({ 
  className, 
  showLabel = true,
  compact = false 
}: DataFreshnessIndicatorProps) {
  const { t, i18n } = useTranslation();
  const { isOnline, isSyncing, pendingActions, lastSyncAt, forceSync } = useOfflineSync();

  const locale = i18n.language === 'fr' ? fr : enUS;

  const getStatusIcon = () => {
    if (isSyncing) {
      return <RefreshCw className="h-4 w-4 animate-spin text-primary" />;
    }
    if (!isOnline) {
      return <CloudOff className="h-4 w-4 text-amber-500" />;
    }
    if (pendingActions > 0) {
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    }
    return <Cloud className="h-4 w-4 text-emerald-500" />;
  };

  const getStatusText = () => {
    if (isSyncing) {
      return t('pwa.syncing', 'Synchronisation...');
    }
    if (!isOnline) {
      return t('pwa.offline', 'Hors-ligne');
    }
    if (pendingActions > 0) {
      return t('pwa.pending', '{{count}} en attente', { count: pendingActions });
    }
    return t('pwa.synced', 'Synchronisé');
  };

  const getLastSyncText = () => {
    if (!lastSyncAt) return null;
    return formatDistanceToNow(lastSyncAt, { addSuffix: true, locale });
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center gap-1", className)}>
              {getStatusIcon()}
              {pendingActions > 0 && (
                <span className="text-xs font-medium text-amber-500">
                  {pendingActions}
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <p className="font-medium">{getStatusText()}</p>
              {lastSyncAt && (
                <p className="text-xs text-muted-foreground">
                  {t('pwa.lastSync', 'Dernière sync')}: {getLastSyncText()}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm",
      isOnline ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-amber-500/10 text-amber-700 dark:text-amber-400",
      className
    )}>
      {getStatusIcon()}
      
      {showLabel && (
        <span className="font-medium">{getStatusText()}</span>
      )}
      
      {pendingActions > 0 && isOnline && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 px-2"
          onClick={forceSync}
          disabled={isSyncing}
        >
          <RefreshCw className={cn("h-3 w-3", isSyncing && "animate-spin")} />
        </Button>
      )}
    </div>
  );
}

export default DataFreshnessIndicator;
