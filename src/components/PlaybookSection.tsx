import { useTranslation } from 'react-i18next';
import { CountryPlaybook } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check, X, Clock, Calendar, Milestone, Route } from 'lucide-react';

interface PlaybookSectionProps {
  playbook: CountryPlaybook;
  className?: string;
}

export function PlaybookSection({ playbook, className }: PlaybookSectionProps) {
  const { t } = useTranslation();

  return (
    <div className={cn('space-y-6 sm:space-y-8', className)}>
      {/* Do and Dont */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="glass-card rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="p-1.5 sm:p-2 rounded-lg bg-risk-low/20 flex-shrink-0">
              <Check className="w-3 h-3 sm:w-4 sm:h-4 text-risk-low" />
            </div>
            <h4 className="font-display font-semibold text-foreground text-sm sm:text-base">{t('playbook.do')}</h4>
          </div>
          <ul className="space-y-2 sm:space-y-3">
            {playbook.do.map((item, i) => (
              <li key={i} className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-risk-low mt-0.5 flex-shrink-0" />
                <span className="break-words">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="p-1.5 sm:p-2 rounded-lg bg-risk-critical/20 flex-shrink-0">
              <X className="w-3 h-3 sm:w-4 sm:h-4 text-risk-critical" />
            </div>
            <h4 className="font-display font-semibold text-foreground text-sm sm:text-base">{t('playbook.dont')}</h4>
          </div>
          <ul className="space-y-2 sm:space-y-3">
            {playbook.dont.map((item, i) => (
              <li key={i} className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                <X className="w-3 h-3 sm:w-4 sm:h-4 text-risk-critical mt-0.5 flex-shrink-0" />
                <span className="break-words">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-3 sm:space-y-4">
        <h4 className="font-display font-semibold text-foreground flex items-center gap-2 text-sm sm:text-base">
          <Route className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
          {t('playbook.survivalRoadmap')}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <TimelineCard
            icon={<Clock className="w-3 h-3 sm:w-4 sm:h-4" />}
            title={t('playbook.timeline.days30')}
            items={playbook.plan30Days}
            accentClass="bg-pyramid-stability/20 text-pyramid-stability"
          />
          <TimelineCard
            icon={<Calendar className="w-3 h-3 sm:w-4 sm:h-4" />}
            title={t('playbook.timeline.months12')}
            items={playbook.plan12Months}
            accentClass="bg-pyramid-growth/20 text-pyramid-growth"
          />
          <TimelineCard
            icon={<Milestone className="w-3 h-3 sm:w-4 sm:h-4" />}
            title={t('playbook.timeline.years5')}
            items={playbook.plan5Years}
            accentClass="bg-pyramid-competence/20 text-pyramid-competence"
          />
        </div>
      </div>

      {/* Plan B */}
      <div className="glass-card rounded-xl p-4 sm:p-6 border-l-4 border-primary">
        <h4 className="font-display font-semibold text-foreground mb-2 text-sm sm:text-base">{t('playbook.planB')}</h4>
        <p className="text-xs sm:text-sm text-muted-foreground break-words">{playbook.planB}</p>
      </div>
    </div>
  );
}

function TimelineCard({
  icon,
  title,
  items,
  accentClass,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  accentClass: string;
}) {
  return (
    <div className="glass-card rounded-xl p-3 sm:p-5">
      <div className={cn('inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium mb-3 sm:mb-4', accentClass)}>
        {icon}
        <span className="truncate">{title}</span>
      </div>
      <ul className="space-y-1.5 sm:space-y-2">
        {(items || []).map((item, i) => (
          <li key={i} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-1.5 sm:gap-2 min-w-0">
            <span className="text-primary mt-0.5 flex-shrink-0">•</span>
            <span className="break-words">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
