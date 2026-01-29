import { useTranslation } from 'react-i18next';
import { LGBTQRights } from '@/lib/types';
import { Shield, ShieldAlert, ShieldX, Heart, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LGBTQRightsIndicatorProps {
  rights: LGBTQRights;
  className?: string;
}

const SAFETY_CONFIG = {
  safe: {
    color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    icon: Shield,
    badgeClass: 'bg-emerald-500',
  },
  caution: {
    color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    icon: ShieldAlert,
    badgeClass: 'bg-amber-500',
  },
  dangerous: {
    color: 'bg-red-500/15 text-red-400 border-red-500/30',
    icon: ShieldX,
    badgeClass: 'bg-red-500',
  },
};

export function LGBTQRightsIndicator({ rights, className }: LGBTQRightsIndicatorProps) {
  const { t } = useTranslation();
  
  // Defensive: fallback to 'caution' if safetyRating is invalid or missing
  const safetyRating = rights?.safetyRating && SAFETY_CONFIG[rights.safetyRating] 
    ? rights.safetyRating 
    : 'caution';
  const config = SAFETY_CONFIG[safetyRating];
  const SafetyIcon = config.icon;

  // Fallback labels for safety ratings
  const safetyLabels: Record<string, string> = {
    safe: t('lgbtqRights.safety.safe', 'Safe'),
    caution: t('lgbtqRights.safety.caution', 'Caution Advised'),
    dangerous: t('lgbtqRights.safety.dangerous', 'Dangerous'),
  };

  return (
    <div className={cn('glass-card rounded-xl p-6', className)}>
      <div className="flex items-center gap-3 mb-6">
        <Heart className="w-5 h-5 text-pink-400" />
        <h3 className="font-display font-semibold text-lg">{t('lgbtqRights.title', 'LGBTQ+ Rights')}</h3>
      </div>

      {/* Safety Badge - Main Indicator */}
      <div className={cn('flex items-center gap-3 p-4 rounded-lg border mb-6', config.color)}>
        <SafetyIcon className="w-8 h-8" />
        <div>
          <div className="font-semibold text-lg">
            {safetyLabels[rights.safetyRating]}
          </div>
          <div className="text-sm opacity-80">
            {t('lgbtqRights.index', 'Index')}: {rights.index}/100
          </div>
        </div>
        <div className={cn('ml-auto px-3 py-1 rounded-full text-white text-sm font-medium', config.badgeClass)}>
          {rights.index}/100
        </div>
      </div>

      {/* Rights Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <RightItem 
          label={t('lgbtqRights.marriage', 'Marriage')} 
          value={rights.sameSecMarriage} 
        />
        <RightItem 
          label={t('lgbtqRights.civilUnion', 'Civil Union')} 
          value={rights.civilUnion} 
        />
        <RightItem 
          label={t('lgbtqRights.employmentProtection', 'Employment Protection')} 
          value={rights.employmentProtection} 
          className="col-span-2"
        />
      </div>

      {/* Notes */}
      {rights.notes && (
        <p className="text-sm text-muted-foreground italic border-t border-border pt-4 mt-4">
          {rights.notes}
        </p>
      )}
    </div>
  );
}

function RightItem({ 
  label, 
  value, 
  className 
}: { 
  label: string; 
  value: boolean; 
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2 p-2 rounded-lg bg-secondary/50', className)}>
      {value ? (
        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
      )}
      <span className="text-sm">{label}</span>
    </div>
  );
}
