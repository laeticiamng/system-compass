import { Link } from 'react-router-dom';
import { Info, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface SimulationDisclaimerProps {
  variant?: 'minimal' | 'compact' | 'inline' | 'contextual';
  className?: string;
  context?: 'results' | 'trajectory' | 'comparison' | 'game' | 'default';
}

const CONTEXTUAL_MESSAGES = {
  results: 'simulationDisclaimer.contextual.results',
  trajectory: 'simulationDisclaimer.contextual.trajectory',
  comparison: 'simulationDisclaimer.contextual.comparison',
  game: 'simulationDisclaimer.contextual.game',
  default: 'simulationDisclaimer.contextual.default',
};

export function SimulationDisclaimer({ 
  variant = 'minimal', 
  className,
  context = 'default'
}: SimulationDisclaimerProps) {
  const { t } = useTranslation();

  if (variant === 'contextual') {
    return (
      <div className={cn(
        "flex items-start gap-2 text-xs text-muted-foreground/80 px-4 py-3 rounded-lg bg-muted/20 border border-border/20",
        className
      )}>
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-muted-foreground/60" />
        <div className="space-y-1">
          <p className="font-medium text-muted-foreground/90">
            {t('simulationDisclaimer.notPrediction')}
          </p>
          <p className="text-muted-foreground/70">
            {t(CONTEXTUAL_MESSAGES[context])}{' '}
            <Link to="/how-to-read" className="text-primary/70 hover:text-primary underline">
              {t('simulationDisclaimer.learnMore')}
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <span className={cn("text-xs text-muted-foreground/60", className)}>
        {t('simulationDisclaimer.inline')}{' '}
        <Link to="/disclaimer" className="text-primary/60 hover:text-primary hover:underline">
          {t('simulationDisclaimer.limits')}
        </Link>
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn(
        "flex items-center gap-2 text-xs text-muted-foreground/70 px-3 py-1.5 rounded-lg bg-muted/30 border border-border/30",
        className
      )}>
        <Info className="w-3 h-3 shrink-0" />
        <span>
          {t('simulationDisclaimer.compact')}{' '}
          <Link to="/disclaimer" className="text-primary/70 hover:text-primary hover:underline">
            {t('simulationDisclaimer.learnMore')}
          </Link>
        </span>
      </div>
    );
  }

  // minimal (default)
  return (
    <p className={cn("text-xs text-muted-foreground/50 text-center", className)}>
      📊 {t('simulationDisclaimer.minimal')} • 
      <Link to="/disclaimer" className="text-primary/50 hover:text-primary hover:underline ml-1">
        {t('simulationDisclaimer.viewLimits')}
      </Link>
    </p>
  );
}
