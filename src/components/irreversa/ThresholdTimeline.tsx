import { useTranslation } from 'react-i18next';
import { 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  Lock,
  Clock,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThresholdStatus } from '@/hooks/useIrreversa';

interface ThresholdTimelineProps {
  currentStatus: ThresholdStatus;
  detectionDate: string;
  validationDate?: string | null;
  sealedAt?: string | null;
  compact?: boolean;
}

const STATUSES: { status: ThresholdStatus; icon: typeof Eye; color: string; bgColor: string }[] = [
  { status: 'detected', icon: Eye, color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-950' },
  { status: 'marked', icon: AlertTriangle, color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-950' },
  { status: 'validated', icon: CheckCircle2, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-950' },
  { status: 'sealed', icon: Lock, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-950' },
];

const STATUS_ORDER: Record<ThresholdStatus, number> = {
  detected: 0,
  marked: 1,
  validated: 2,
  sealed: 3,
};

export function ThresholdTimeline({
  currentStatus,
  detectionDate,
  validationDate,
  sealedAt,
  compact = false
}: ThresholdTimelineProps) {
  const { t } = useTranslation();
  const currentIndex = STATUS_ORDER[currentStatus];

  const getStatusDate = (status: ThresholdStatus): string | null => {
    switch (status) {
      case 'detected':
        return detectionDate;
      case 'validated':
        return validationDate || null;
      case 'sealed':
        return sealedAt || null;
      default:
        return null;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {STATUSES.map((s, index) => {
          const Icon = s.icon;
          const isPast = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={s.status} className="flex items-center">
              <div
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center transition-all',
                  isPast ? s.bgColor : 'bg-muted',
                  isCurrent && 'ring-2 ring-offset-2 ring-primary'
                )}
              >
                <Icon className={cn('w-3 h-3', isPast ? s.color : 'text-muted-foreground')} />
              </div>
              {index < STATUSES.length - 1 && (
                <div
                  className={cn(
                    'w-4 h-0.5 mx-0.5',
                    index < currentIndex ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
        <Clock className="w-4 h-4" />
        {t('irreversa.timeline.title', 'Cycle de vie')}
      </h4>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-muted" />
        <div 
          className="absolute left-4 top-6 w-0.5 bg-primary transition-all"
          style={{ height: `${(currentIndex / (STATUSES.length - 1)) * 100}%`, maxHeight: 'calc(100% - 24px)' }}
        />

        {/* Timeline items */}
        <div className="space-y-4">
          {STATUSES.map((s, index) => {
            const Icon = s.icon;
            const isPast = index <= currentIndex;
            const isCurrent = index === currentIndex;
            const date = getStatusDate(s.status);

            return (
              <div key={s.status} className="relative flex items-start gap-3 pl-0">
                <div
                  className={cn(
                    'relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all',
                    isPast ? s.bgColor : 'bg-muted border-2 border-dashed border-muted-foreground/30',
                    isCurrent && 'ring-2 ring-offset-2 ring-primary shadow-lg'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isPast ? s.color : 'text-muted-foreground/50')} />
                </div>

                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'font-medium text-sm',
                        isPast ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {t(`irreversa.status.${s.status}`)}
                    </span>
                    {isCurrent && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        {t('irreversa.timeline.current', 'Actuel')}
                      </span>
                    )}
                    {!isPast && (
                      <span className="text-xs text-muted-foreground">
                        {t('irreversa.timeline.pending', 'En attente')}
                      </span>
                    )}
                  </div>

                  {date && isPast && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(date).toLocaleDateString()} à {new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}

                  {!isPast && index === currentIndex + 1 && (
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <ArrowRight className="w-3 h-3" />
                      {t('irreversa.timeline.nextStep', 'Prochaine étape')}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
