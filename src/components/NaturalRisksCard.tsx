import { useTranslation } from 'react-i18next';
import { CountryNaturalRisks } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  Waves, 
  Cloud, 
  Droplets, 
  Sun, 
  Snowflake, 
  Wind,
  Mountain,
  AlertTriangle
} from 'lucide-react';

interface NaturalRisksCardProps {
  risks: CountryNaturalRisks;
  className?: string;
}

const RISK_ICONS = {
  seismicRisk: <AlertTriangle className="w-4 h-4" />,
  tsunamiRisk: <Waves className="w-4 h-4" />,
  floodRisk: <Droplets className="w-4 h-4" />,
  droughtRisk: <Sun className="w-4 h-4" />,
  cycloneRisk: <Wind className="w-4 h-4" />,
  volcanoRisk: <Mountain className="w-4 h-4" />,
  extremeHeat: <Sun className="w-4 h-4" />,
  extremeCold: <Snowflake className="w-4 h-4" />,
};

const getRiskColor = (level: string): string => {
  switch (level) {
    case 'none':
    case 'rare':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'low':
    case 'occasional':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'moderate':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'high':
    case 'frequent':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'very_high':
    case 'severe':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getRiskWidth = (level: string): string => {
  switch (level) {
    case 'none':
    case 'rare':
      return 'w-1/5';
    case 'low':
    case 'occasional':
      return 'w-2/5';
    case 'moderate':
      return 'w-3/5';
    case 'high':
    case 'frequent':
      return 'w-4/5';
    case 'very_high':
    case 'severe':
      return 'w-full';
    default:
      return 'w-0';
  }
};

export function NaturalRisksCard({ risks, className }: NaturalRisksCardProps) {
  const { t } = useTranslation();

  const riskItems = [
    { key: 'seismicRisk', value: risks.seismicRisk, label: t('naturalRisks.seismic') },
    { key: 'tsunamiRisk', value: risks.tsunamiRisk, label: t('naturalRisks.tsunami') },
    { key: 'floodRisk', value: risks.floodRisk, label: t('naturalRisks.flood') },
    { key: 'droughtRisk', value: risks.droughtRisk, label: t('naturalRisks.drought') },
    { key: 'cycloneRisk', value: risks.cycloneRisk, label: t('naturalRisks.cyclone') },
    { key: 'volcanoRisk', value: risks.volcanoRisk, label: t('naturalRisks.volcano') },
    { key: 'extremeHeat', value: risks.extremeHeat, label: t('naturalRisks.extremeHeat') },
    { key: 'extremeCold', value: risks.extremeCold, label: t('naturalRisks.extremeCold') },
  ].filter(item => item.value && item.value !== 'none');

  // Determine overall risk level
  const highRisks = riskItems.filter(r => 
    r.value === 'high' || r.value === 'very_high' || r.value === 'severe' || r.value === 'frequent'
  );
  const overallColor = highRisks.length >= 3 ? 'border-red-500/50' 
    : highRisks.length >= 1 ? 'border-amber-500/50' 
    : 'border-border';

  return (
    <div className={cn("glass-card rounded-xl p-6 border", overallColor, className)}>
      <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-500" />
        {t('naturalRisks.title')}
      </h3>

      {riskItems.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t('naturalRisks.levels.none')}
        </p>
      ) : (
        <div className="space-y-3">
          {riskItems.map(item => (
            <div key={item.key} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  {RISK_ICONS[item.key as keyof typeof RISK_ICONS]}
                  {item.label}
                </span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-xs border",
                  getRiskColor(item.value)
                )}>
                  {t(`naturalRisks.levels.${item.value}`)}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    getRiskWidth(item.value),
                    item.value === 'none' || item.value === 'rare' ? 'bg-emerald-500' :
                    item.value === 'low' || item.value === 'occasional' ? 'bg-blue-500' :
                    item.value === 'moderate' ? 'bg-amber-500' :
                    item.value === 'high' || item.value === 'frequent' ? 'bg-orange-500' :
                    'bg-red-500'
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {risks.climateNotes && (
        <div className="mt-4 p-3 rounded-lg bg-muted/30">
          <p className="text-xs text-muted-foreground">{risks.climateNotes}</p>
        </div>
      )}
    </div>
  );
}