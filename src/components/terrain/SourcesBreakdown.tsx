import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Newspaper, 
  GraduationCap, 
  Globe, 
  Landmark,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { TerrainSource } from '@/hooks/useTerrainRealities';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SourcesBreakdownProps {
  sources: TerrainSource[];
}

export function SourcesBreakdown({ sources }: SourcesBreakdownProps) {
  const { t } = useTranslation();

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'NGO': return Building2;
      case 'international_org': return Globe;
      case 'media': return Newspaper;
      case 'academic': return GraduationCap;
      case 'government': return Landmark;
      default: return Building2;
    }
  };

  const getSourceTypeLabel = (type: string) => {
    switch (type) {
      case 'NGO': return t('terrainRealities.ngoSource');
      case 'international_org': return t('terrainRealities.internationalOrgSource');
      case 'media': return t('terrainRealities.mediaSource');
      case 'academic': return t('terrainRealities.academicSource');
      case 'government': return t('terrainRealities.governmentSource');
      default: return type;
    }
  };

  const getReliabilityIcon = (reliability: 'high' | 'medium' | 'low') => {
    switch (reliability) {
      case 'high': return CheckCircle;
      case 'medium': return AlertCircle;
      case 'low': return HelpCircle;
    }
  };

  const getReliabilityColor = (reliability: 'high' | 'medium' | 'low') => {
    switch (reliability) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-amber-400';
      case 'low': return 'text-red-400';
    }
  };

  // Count by type
  const countByType = sources.reduce((acc, source) => {
    acc[source.type] = (acc[source.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Count by reliability
  const countByReliability = sources.reduce((acc, source) => {
    acc[source.reliability] = (acc[source.reliability] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-3">
      {/* Breakdown by type */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(countByType).map(([type, count]) => {
          const Icon = getSourceIcon(type);
          return (
            <TooltipProvider key={type}>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <Icon className="h-3 w-3" />
                    {count}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  {getSourceTypeLabel(type)}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      {/* Breakdown by reliability */}
      <div className="flex flex-wrap gap-2">
        {(['high', 'medium', 'low'] as const).map(reliability => {
          const count = countByReliability[reliability] || 0;
          if (count === 0) return null;
          const Icon = getReliabilityIcon(reliability);
          return (
            <Badge 
              key={reliability} 
              variant="outline" 
              className={`text-xs flex items-center gap-1 ${getReliabilityColor(reliability)}`}
            >
              <Icon className="h-3 w-3" />
              {count} {t(`terrainRealities.${reliability}Reliability`)}
            </Badge>
          );
        })}
      </div>

      {/* Individual sources */}
      <div className="flex flex-wrap gap-2">
        {sources.map((source, i) => {
          const Icon = getSourceIcon(source.type);
          const ReliabilityIcon = getReliabilityIcon(source.reliability);
          
          const badge = (
            <Badge 
              key={i} 
              variant="outline" 
              className={`text-xs flex items-center gap-1 ${source.url ? 'cursor-pointer hover:bg-primary/10' : ''}`}
            >
              <Icon className="h-3 w-3" />
              {source.name} ({source.year})
              <ReliabilityIcon className={`h-3 w-3 ${getReliabilityColor(source.reliability)}`} />
              {source.url && <ExternalLink className="h-3 w-3" />}
            </Badge>
          );

          return source.url ? (
            <a
              key={i}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {badge}
            </a>
          ) : (
            <span key={i}>{badge}</span>
          );
        })}
      </div>
    </div>
  );
}
