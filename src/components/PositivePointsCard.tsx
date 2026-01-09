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
    <div className={cn("glass-card rounded-xl p-6", className)}>
      <h3 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        {t('positivePoints.title', 'Points Positifs')}
      </h3>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(([category, points]) => {
          const config = CATEGORY_CONFIG[category];
          const Icon = config.icon;
          const categoryKeys = translationKeys?.[category] || [];
          
          return (
            <div key={category} className="space-y-2">
              <div className={cn("flex items-center gap-2 p-2 rounded-lg", config.bgColor)}>
                <Icon className={cn("w-4 h-4", config.color)} />
                <span className={cn("font-medium text-sm", config.color)}>
                  {t(config.label)}
                </span>
              </div>
              <ul className="space-y-1 pl-2">
                {points.map((point, idx) => {
                  // Use translation key if available, otherwise fallback to original text
                  const translationKey = categoryKeys[idx];
                  const displayText = translationKey ? t(translationKey, point) : point;
                  
                  return (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{displayText}</span>
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
