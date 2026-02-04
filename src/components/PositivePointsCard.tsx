import { useTranslation } from 'react-i18next';
import { CountryPositivePoints } from '@/lib/types';
import { POSITIVE_POINTS_KEYS } from '@/lib/positive-points-translations';
import { 
  Sun, 
  Briefcase, 
  Palette, 
  Building2, 
  Sparkles,
  Mountain
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PositivePointsCardProps {
  positivePoints: CountryPositivePoints;
  countryId: string;
  className?: string;
}

const CATEGORY_CONFIG = {
  lifestyle: {
    icon: Sun,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    label: 'positivePoints.lifestyle',
  },
  economy: {
    icon: Briefcase,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    label: 'positivePoints.economy',
  },
  culture: {
    icon: Palette,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    label: 'positivePoints.culture',
  },
  infrastructure: {
    icon: Building2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    label: 'positivePoints.infrastructure',
  },
  opportunities: {
    icon: Sparkles,
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    label: 'positivePoints.opportunities',
  },
  nature: {
    icon: Mountain,
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
    label: 'positivePoints.nature',
  },
};

export function PositivePointsCard({ positivePoints, countryId, className }: PositivePointsCardProps) {
  const { t } = useTranslation();

  const categories = Object.entries(positivePoints).filter(
    ([_, points]) => points && points.length > 0
  ) as [keyof CountryPositivePoints, string[]][];

  if (categories.length === 0) return null;

  // Get translation keys for this country
  const translationKeys = POSITIVE_POINTS_KEYS[countryId];

  return (
    <div className={cn("glass-card rounded-xl p-4 sm:p-6", className)}>
      <h3 className="font-display text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
        {t('positivePoints.title', 'Points Positifs')}
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {categories.map(([category, points]) => {
          const config = CATEGORY_CONFIG[category];
          const Icon = config.icon;
          const categoryKeys = translationKeys?.[category] || [];
          
          return (
            <div key={category} className="space-y-2 min-w-0">
              <div className={cn("flex items-center gap-2 p-2 rounded-lg", config.bgColor)}>
                <Icon className={cn("w-4 h-4 flex-shrink-0", config.color)} />
                <span className={cn("font-medium text-xs sm:text-sm truncate", config.color)}>
                  {t(config.label)}
                </span>
              </div>
              <ul className="space-y-1.5 pl-1">
                {points.map((point, idx) => {
                  const translationKey = categoryKeys[idx];
                  const displayText = translationKey ? t(translationKey, point) : point;
                  
                  return (
                    <li key={idx} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-1.5 min-w-0">
                      <span className="text-primary mt-0.5 flex-shrink-0">•</span>
                      <span className="break-words">{displayText}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
