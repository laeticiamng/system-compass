import { useTranslation } from 'react-i18next';
import { CheckCircle, AlertTriangle, Clock, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCountryDataFreshness } from '@/hooks/useDataSources';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

interface DataFreshnessBadgeProps {
  countryId: string;
  className?: string;
}

export function DataFreshnessBadge({ countryId, className = '' }: DataFreshnessBadgeProps) {
  const { t, i18n } = useTranslation();
  const { data: freshness, isLoading } = useCountryDataFreshness(countryId);

  if (isLoading || !freshness) {
    return null;
  }

  const locale = i18n.language === 'fr' ? fr : enUS;

  const renderBadge = () => {
    switch (freshness.status) {
      case 'fresh':
        return (
          <Badge variant="outline" className={`bg-green-500/10 text-green-600 border-green-500/30 ${className}`}>
            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
            {t('country.dataFresh', 'Données vérifiées le')} {freshness.lastChecked && format(freshness.lastChecked, 'dd MMM yyyy', { locale })}
          </Badge>
        );

      case 'stale':
        return (
          <Badge variant="outline" className={`bg-yellow-500/10 text-yellow-600 border-yellow-500/30 ${className}`}>
            <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
            {t('country.dataStale', 'Dernière vérification il y a')} {freshness.daysSinceCheck} {t('common.days', 'jours')}
          </Badge>
        );

      case 'never_checked':
        return (
          <Badge variant="outline" className={`bg-muted text-muted-foreground ${className}`}>
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            {t('country.dataNotChecked', 'Vérification en attente')}
          </Badge>
        );

      case 'no_sources':
        return (
          <Badge variant="outline" className={`bg-muted text-muted-foreground ${className}`}>
            <Info className="h-3.5 w-3.5 mr-1.5" />
            {t('country.dataManual', 'Données manuelles')}
          </Badge>
        );

      default:
        return null;
    }
  };

  const getTooltipContent = () => {
    if (freshness.sources.length === 0) {
      return t('country.noSourcesTooltip', 'Les données de ce pays sont saisies manuellement par notre équipe.');
    }

    const sourcesList = freshness.sources
      .filter(s => s.source_name)
      .map(s => `• ${s.source_name}`)
      .slice(0, 5)
      .join('\n');

    if (freshness.status === 'fresh') {
      return `${t('country.freshTooltip', 'Données automatiquement vérifiées depuis :')}\n${sourcesList}`;
    }

    if (freshness.status === 'stale') {
      return `${t('country.staleTooltip', 'Une mise à jour des sources est prévue prochainement :')}\n${sourcesList}`;
    }

    return t('country.pendingTooltip', 'La première vérification automatique est en cours de planification.');
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {renderBadge()}
        </TooltipTrigger>
        <TooltipContent className="max-w-[300px] whitespace-pre-line">
          <p className="text-sm">{getTooltipContent()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
