import { useTranslation } from 'react-i18next';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

interface ConfidenceTooltipProps {
  score: number;
  showIcon?: boolean;
}

export function ConfidenceTooltip({ score, showIcon = true }: ConfidenceTooltipProps) {
  const { t } = useTranslation();
  const percentage = Math.round(score * 100);

  const getConfidenceColor = () => {
    if (percentage >= 70) return 'bg-green-500/20 text-green-300 border-green-500/30';
    if (percentage >= 40) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    return 'bg-red-500/20 text-red-300 border-red-500/30';
  };

  const getConfidenceLabel = () => {
    if (percentage >= 70) return t('terrainRealities.highReliability');
    if (percentage >= 40) return t('terrainRealities.mediumReliability');
    return t('terrainRealities.lowReliability');
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`cursor-help flex items-center gap-1 ${getConfidenceColor()}`}
          >
            {t('terrainRealities.confidence')}: {percentage}%
            {showIcon && <Info className="h-3 w-3" />}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{getConfidenceLabel()}</p>
            <p className="text-xs text-muted-foreground">
              {t('terrainRealities.confidenceTooltip')}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
