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
    <div className={cn('space-y-8', className)}>
      {/* Do and Dont */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-risk-low/20">
              <Check className="w-4 h-4 text-risk-low" />
            </div>
            <h4 className="font-display font-semibold text-foreground">{t('playbook.do')}</h4>
          </div>
          <ul className="space-y-3">
            {playbook.do.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-risk-low mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-risk-critical/20">
              <X className="w-4 h-4 text-risk-critical" />
            </div>
            <h4 className="font-display font-semibold text-foreground">{t('playbook.dont')}</h4>
          </div>
          <ul className="space-y-3">
            {playbook.dont.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <X className="w-4 h-4 text-risk-critical mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        <h4 className="font-display font-semibold text-foreground flex items-center gap-2">
          <Route className="w-5 h-5 text-primary" />
          {t('playbook.survivalRoadmap')}
        </h4>

        <div className="grid md:grid-cols-3 gap-4">
          <TimelineCard
            icon={<Clock className="w-4 h-4" />}
            title={t('playbook.timeline.days30')}
            items={playbook.plan30Days}
            accentClass="bg-pyramid-stability/20 text-pyramid-stability"
          />
          <TimelineCard
            icon={<Calendar className="w-4 h-4" />}
            title={t('playbook.timeline.months12')}
            items={playbook.plan12Months}
            accentClass="bg-pyramid-growth/20 text-pyramid-growth"
          />
          <TimelineCard
            icon={<Milestone className="w-4 h-4" />}
            title={t('playbook.timeline.years5')}
            items={playbook.plan5Years}
            accentClass="bg-pyramid-competence/20 text-pyramid-competence"
          />
        </div>
      </div>

      {/* Plan B */}
      <div className="glass-card rounded-xl p-6 border-l-4 border-primary">
        <h4 className="font-display font-semibold text-foreground mb-2">{t('playbook.planB')}</h4>
        <p className="text-sm text-muted-foreground">{playbook.planB}</p>
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
    <div className="glass-card rounded-xl p-5">
      <div className={cn('inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4', accentClass)}>
        {icon}
        {title}
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
