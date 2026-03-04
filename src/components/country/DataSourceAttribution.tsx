/**
 * DataSourceAttribution - Shows source + date on each data section
 * Addresses D2: sourced data with dates on country detail pages
 */

import { ExternalLink, Calendar, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface DataSourceAttributionProps {
  sources?: string[];
  lastUpdated?: string;
  section?: string;
  compact?: boolean;
}

export function DataSourceAttribution({ sources, lastUpdated, section, compact = false }: DataSourceAttributionProps) {
  const { t } = useTranslation();

  if (!sources?.length && !lastUpdated) return null;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground/60 cursor-help">
              <ShieldCheck className="w-3 h-3" />
              <span>{lastUpdated || 'N/A'}</span>
              {sources?.length ? <span>· {sources.length} source{sources.length > 1 ? 's' : ''}</span> : null}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-1">
              {section && <p className="font-medium text-xs">{section}</p>}
              {lastUpdated && (
                <p className="text-xs flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {t('countryDetail.dataUpdated', 'Données mises à jour')}: {lastUpdated}
                </p>
              )}
              {sources?.map((s, i) => (
                <p key={i} className="text-xs flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  {s}
                </p>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border/30">
      {lastUpdated && (
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/70 bg-muted/30 px-2 py-0.5 rounded-full">
          <Calendar className="w-3 h-3" />
          {lastUpdated}
        </span>
      )}
      {sources?.map((source, i) => (
        <span key={i} className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/70 bg-muted/30 px-2 py-0.5 rounded-full">
          <ExternalLink className="w-3 h-3" />
          {source}
        </span>
      ))}
    </div>
  );
}
