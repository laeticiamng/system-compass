import { useTranslation } from 'react-i18next';
import { CountryHealthcare } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  Heart, 
  Stethoscope, 
  Ambulance, 
  Shield,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface HealthcareCardProps {
  healthcare: CountryHealthcare;
  className?: string;
}

const getQualityColor = (level: string): string => {
  switch (level) {
    case 'excellent':
      return 'text-emerald-400 bg-emerald-500/20';
    case 'good':
      return 'text-blue-400 bg-blue-500/20';
    case 'adequate':
      return 'text-amber-400 bg-amber-500/20';
    case 'limited':
      return 'text-orange-400 bg-orange-500/20';
    case 'poor':
      return 'text-red-400 bg-red-500/20';
    default:
      return 'text-muted-foreground bg-muted';
  }
};

const getCostColor = (cost: string): string => {
  switch (cost) {
    case 'free':
      return 'text-emerald-400';
    case 'low':
      return 'text-blue-400';
    case 'moderate':
      return 'text-amber-400';
    case 'high':
      return 'text-orange-400';
    case 'very_high':
      return 'text-red-400';
    default:
      return 'text-muted-foreground';
  }
};

const getSystemIcon = (type: string) => {
  switch (type) {
    case 'universal':
      return <Shield className="w-5 h-5 text-emerald-400" />;
    case 'mixed':
      return <Stethoscope className="w-5 h-5 text-blue-400" />;
    case 'private':
      return <DollarSign className="w-5 h-5 text-amber-400" />;
    case 'limited':
      return <AlertCircle className="w-5 h-5 text-red-400" />;
    default:
      return <Heart className="w-5 h-5" />;
  }
};

export function HealthcareCard({ healthcare, className }: HealthcareCardProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("glass-card rounded-xl p-6", className)}>
      <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
        <Heart className="w-5 h-5 text-red-400" />
        {t('healthcare.title')}
      </h3>

      {/* System Type */}
      <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-muted/30">
        {getSystemIcon(healthcare.systemType)}
        <div>
          <div className="font-medium">
            {t(`healthcare.systemTypes.${healthcare.systemType}`)}
          </div>
          <div className="text-xs text-muted-foreground">
            {t('healthcare.systemType')}
          </div>
        </div>
      </div>

      {/* Quality Scores */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">{t('healthcare.qualityScore')}</div>
          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${healthcare.qualityScore}%` }}
              />
            </div>
            <span className="text-sm font-mono font-bold">{healthcare.qualityScore}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">{t('healthcare.accessScore')}</div>
          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${healthcare.accessScore}%` }}
              />
            </div>
            <span className="text-sm font-mono font-bold">{healthcare.accessScore}</span>
          </div>
        </div>
      </div>

      {/* Service Quality Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className={cn(
          "p-3 rounded-lg text-center",
          getQualityColor(healthcare.emergencyResponse)
        )}>
          <Ambulance className="w-5 h-5 mx-auto mb-1" />
          <div className="text-xs font-medium mb-1">
            {t('healthcare.emergencyResponse')}
          </div>
          <div className="text-xs opacity-80">
            {t(`healthcare.qualityLevels.${healthcare.emergencyResponse}`)}
          </div>
        </div>
        <div className={cn(
          "p-3 rounded-lg text-center",
          getQualityColor(healthcare.specialistAccess)
        )}>
          <Stethoscope className="w-5 h-5 mx-auto mb-1" />
          <div className="text-xs font-medium mb-1">
            {t('healthcare.specialistAccess')}
          </div>
          <div className="text-xs opacity-80">
            {t(`healthcare.qualityLevels.${healthcare.specialistAccess}`)}
          </div>
        </div>
        <div className={cn(
          "p-3 rounded-lg text-center",
          getQualityColor(healthcare.chronicCareQuality)
        )}>
          <Clock className="w-5 h-5 mx-auto mb-1" />
          <div className="text-xs font-medium mb-1">
            {t('healthcare.chronicCare')}
          </div>
          <div className="text-xs opacity-80">
            {t(`healthcare.qualityLevels.${healthcare.chronicCareQuality}`)}
          </div>
        </div>
        <div className="p-3 rounded-lg text-center bg-muted/30">
          <DollarSign className={cn("w-5 h-5 mx-auto mb-1", getCostColor(healthcare.costForExpats))} />
          <div className="text-xs font-medium mb-1">
            {t('healthcare.costForExpats')}
          </div>
          <div className={cn("text-xs", getCostColor(healthcare.costForExpats))}>
            {t(`healthcare.costLevels.${healthcare.costForExpats}`)}
          </div>
        </div>
      </div>

      {/* Insurance Required */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
        {healthcare.insuranceRequired ? (
          <XCircle className="w-4 h-4 text-amber-400" />
        ) : (
          <CheckCircle className="w-4 h-4 text-emerald-400" />
        )}
        <span className="text-sm">
          {t('healthcare.insuranceRequired')}: {healthcare.insuranceRequired ? t('common.yes') : t('common.no')}
        </span>
      </div>

      {healthcare.notes && (
        <div className="mt-4 p-3 rounded-lg bg-muted/30">
          <p className="text-xs text-muted-foreground">{healthcare.notes}</p>
        </div>
      )}
    </div>
  );
}