import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { differenceInDays, parseISO, addDays, format } from 'date-fns';

interface DataExpirationBadgeProps {
  lastUpdated: string;
  cacheDays?: number;
}

export function DataExpirationBadge({ lastUpdated, cacheDays = 30 }: DataExpirationBadgeProps) {
  const { t, i18n } = useTranslation();

  // Parse date - handle both "YYYY-MM" and full ISO formats
  let parsedDate: Date;
  try {
    if (lastUpdated.length === 7) {
      // Format "YYYY-MM"
      parsedDate = parseISO(`${lastUpdated}-01`);
    } else {
      parsedDate = parseISO(lastUpdated);
    }
  } catch {
    parsedDate = new Date();
  }

  const expirationDate = addDays(parsedDate, cacheDays);
  const now = new Date();
  const daysUntilExpiration = differenceInDays(expirationDate, now);
  const isExpired = daysUntilExpiration < 0;
  const isExpiringSoon = daysUntilExpiration >= 0 && daysUntilExpiration <= 7;

  const getStatusColor = () => {
    if (isExpired) return 'bg-red-500/20 text-red-300 border-red-500/30';
    if (isExpiringSoon) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    return 'bg-green-500/20 text-green-300 border-green-500/30';
  };

  const getStatusIcon = () => {
    if (isExpired) return AlertTriangle;
    if (isExpiringSoon) return Clock;
    return CheckCircle;
  };

  const StatusIcon = getStatusIcon();

  const formatExpirationText = () => {
    if (isExpired) {
      return t('terrainRealities.refreshRequired');
    }
    if (isExpiringSoon) {
      return `${daysUntilExpiration} ${daysUntilExpiration === 1 ? 'jour' : 'jours'}`;
    }
    return t('terrainRealities.dataValidity');
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`cursor-help flex items-center gap-1 ${getStatusColor()}`}
          >
            <StatusIcon className="h-3 w-3" />
            {formatExpirationText()}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1 text-xs">
            <p>{t('terrainRealities.lastRefresh')}: {format(parsedDate, 'dd/MM/yyyy')}</p>
            {!isExpired && (
              <p>{t('terrainRealities.dataValidity')}</p>
            )}
            {isExpired && (
              <p className="text-red-300">{t('terrainRealities.refreshRequired')}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
