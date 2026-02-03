/**
 * DataFreshnessIndicator - Visual indicator for data freshness
 * Shows when data was last synced and current freshness status
 */

import { motion } from 'framer-motion';
import { RefreshCw, WifiOff, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export function DataFreshnessIndicator() {
  const { isOnline, isSyncing, dataFreshness, lastSyncedAt, pendingActions, forceSync } = useOfflineSync();

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        label: 'Hors-ligne',
        description: 'Les modifications seront synchronisées au retour de la connexion',
      };
    }
    if (isSyncing) {
      return {
        icon: RefreshCw,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        label: 'Synchronisation...',
        description: 'Envoi des données en cours',
      };
    }
    if (dataFreshness === 'stale') {
      return {
        icon: Clock,
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
        label: 'Données anciennes',
        description: 'Cliquez pour rafraîchir',
      };
    }
    return {
      icon: Check,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      label: 'À jour',
      description: lastSyncedAt 
        ? `Mis à jour ${formatDistanceToNow(lastSyncedAt, { addSuffix: true, locale: fr })}`
        : 'Données synchronisées',
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={forceSync}
          disabled={!isOnline || isSyncing}
          className={`gap-2 h-8 px-2 ${config.bgColor}`}
        >
          <motion.div
            animate={isSyncing ? { rotate: 360 } : {}}
            transition={isSyncing ? { repeat: Infinity, duration: 1, ease: 'linear' } : {}}
          >
            <Icon className={`w-4 h-4 ${config.color}`} />
          </motion.div>
          {pendingActions > 0 && (
            <span className="text-xs font-medium text-muted-foreground">
              {pendingActions}
            </span>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        <div className="space-y-1">
          <p className="font-medium">{config.label}</p>
          <p className="text-xs text-muted-foreground">{config.description}</p>
          {pendingActions > 0 && (
            <p className="text-xs text-amber-500">
              {pendingActions} action(s) en attente
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
