import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { 
  Globe, 
  MapPin, 
  Zap, 
  Dice6,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Users,
  CheckCircle,
  type LucideIcon
} from 'lucide-react';
import { useState } from 'react';
import { TurnPhase } from './TurnManager';

interface TurnPhaseHelperProps {
  currentPhase: TurnPhase;
}

const PHASE_CONFIG: Record<TurnPhase, { icon: LucideIcon; colorClass: string; stepNumber: number }> = {
  global_event: {
    icon: Globe,
    colorClass: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
    stepNumber: 1,
  },
  country_event: {
    icon: MapPin,
    colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    stepNumber: 2,
  },
  family_event: {
    icon: Users,
    colorClass: 'text-rose-500 bg-rose-500/10 border-rose-500/30',
    stepNumber: 3,
  },
  action_selection: {
    icon: Zap,
    colorClass: 'text-purple-500 bg-purple-500/10 border-purple-500/30',
    stepNumber: 4,
  },
  action_resolution: {
    icon: Zap,
    colorClass: 'text-purple-500 bg-purple-500/10 border-purple-500/30',
    stepNumber: 4,
  },
  board_move: {
    icon: Dice6,
    colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
    stepNumber: 5,
  },
  end_turn: {
    icon: CheckCircle,
    colorClass: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/30',
    stepNumber: 6,
  },
};

const TurnPhaseHelper = ({ currentPhase }: TurnPhaseHelperProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const phases: TurnPhase[] = ['global_event', 'country_event', 'action_selection', 'board_move'];

  const currentConfig = PHASE_CONFIG[currentPhase];
  const CurrentIcon = currentConfig.icon;

  return (
    <div className="glass-card rounded-xl overflow-hidden mb-6 animate-fade-in">
      {/* Current Phase Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg border", currentConfig.colorClass)}>
            <CurrentIcon className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {t('turnPhaseHelper.currentPhase')}
            </p>
            <p className="font-semibold">
              {t(`turnPhaseHelper.phases.${currentPhase}.title`)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-muted-foreground" />
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Current Phase Description */}
      <div className={cn("px-4 pb-4", currentConfig.colorClass.split(' ')[0])}>
        <p className="text-sm text-muted-foreground">
          {t(`turnPhaseHelper.phases.${currentPhase}.description`)}
        </p>
      </div>

      {/* Expanded Phase List */}
      {isExpanded && (
        <div className="border-t border-border p-4 space-y-3 animate-fade-in">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            {t('turnPhaseHelper.allPhases')}
          </p>
          {phases.map((phase, index) => {
            const config = PHASE_CONFIG[phase];
            const Icon = config.icon;
            const isActive = phase === currentPhase || 
              (currentPhase === 'action_resolution' && phase === 'action_selection');
            const isPast = config.stepNumber < PHASE_CONFIG[currentPhase].stepNumber;

            return (
              <div
                key={phase}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border transition-all",
                  isActive && config.colorClass,
                  isPast && "opacity-50",
                  !isActive && !isPast && "border-border bg-muted/30"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold",
                  isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("w-4 h-4", isActive ? config.colorClass.split(' ')[0] : "text-muted-foreground")} />
                    <span className={cn("font-medium", isActive && "text-foreground")}>
                      {t(`turnPhaseHelper.phases.${phase}.title`)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t(`turnPhaseHelper.phases.${phase}.shortDescription`)}
                  </p>
                </div>
                {isPast && (
                  <span className="text-xs text-muted-foreground">✓</span>
                )}
                {isActive && (
                  <span className="text-xs font-medium text-primary animate-pulse">
                    {t('turnPhaseHelper.now')}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TurnPhaseHelper;
