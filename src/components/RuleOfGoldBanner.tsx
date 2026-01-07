import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface RuleOfGoldBannerProps {
  rule: string;
  className?: string;
}

export function RuleOfGoldBanner({ rule, className }: RuleOfGoldBannerProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl p-6',
        'border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent',
        'glow-gold',
        className
      )}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="relative flex items-start gap-4">
        <div className="p-2 rounded-lg bg-primary/20">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-sm font-semibold text-primary uppercase tracking-wider mb-2">
            {t('countryDetail.ruleOfGold', 'Rule of Gold')}
          </h3>
          <p className="text-lg font-medium text-foreground italic">"{rule}"</p>
        </div>
      </div>
    </div>
  );
}
