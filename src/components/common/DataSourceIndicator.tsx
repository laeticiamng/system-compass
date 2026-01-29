import { useTranslation } from 'react-i18next';
import { Info, Calendar, ExternalLink, Shield } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Source {
  name: string;
  url?: string;
  date?: string;
  type?: 'official' | 'research' | 'community' | 'ai';
}

interface DataSourceIndicatorProps {
  sources?: Source[];
  lastUpdated?: string;
  confidenceLevel?: 'high' | 'medium' | 'low';
  compact?: boolean;
  className?: string;
}

const confidenceConfig = {
  high: { label: 'dataSource.confidence.high', color: 'text-green-500', bgColor: 'bg-green-500/10' },
  medium: { label: 'dataSource.confidence.medium', color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  low: { label: 'dataSource.confidence.low', color: 'text-red-500', bgColor: 'bg-red-500/10' },
};

const typeIcons = {
  official: Shield,
  research: Info,
  community: ExternalLink,
  ai: Info,
};

export function DataSourceIndicator({
  sources = [],
  lastUpdated,
  confidenceLevel = 'medium',
  compact = false,
  className,
}: DataSourceIndicatorProps) {
  const { t } = useTranslation();
  const config = confidenceConfig[confidenceLevel];

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={cn('text-xs gap-1 cursor-help', config.bgColor, config.color, className)}
            >
              <Info className="w-3 h-3" />
              {sources.length > 0 && <span>{sources.length} {t('dataSource.sources', 'sources')}</span>}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-2">
              {lastUpdated && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {t('dataSource.lastUpdated', 'Mis à jour')}: {new Date(lastUpdated).toLocaleDateString()}
                </div>
              )}
              {sources.length > 0 && (
                <ul className="text-xs space-y-1">
                  {sources.slice(0, 5).map((source, idx) => (
                    <li key={idx} className="flex items-center gap-1">
                      {source.url ? (
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {source.name}
                        </a>
                      ) : (
                        <span>{source.name}</span>
                      )}
                      {source.date && <span className="text-muted-foreground">({source.date})</span>}
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex items-center gap-2 text-xs">
                <span className={config.color}>{t(config.label)}</span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn('rounded-lg border p-3 space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {t('dataSource.title', 'Sources & Données')}
        </span>
        <Badge variant="outline" className={cn('text-xs', config.bgColor, config.color)}>
          {t(config.label)}
        </Badge>
      </div>
      
      {lastUpdated && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          {t('dataSource.lastUpdated', 'Dernière mise à jour')}: {new Date(lastUpdated).toLocaleDateString()}
        </div>
      )}

      {sources.length > 0 && (
        <div className="space-y-1">
          {sources.map((source, idx) => {
            const TypeIcon = typeIcons[source.type || 'research'];
            return (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <TypeIcon className="w-3 h-3 text-muted-foreground" />
                {source.url ? (
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    {source.name}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-muted-foreground">{source.name}</span>
                )}
                {source.date && <span className="text-muted-foreground">({source.date})</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
