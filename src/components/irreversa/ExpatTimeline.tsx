import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  Check,
  Lock,
  Clock,
  ChevronDown,
  ChevronUp,
  Shield,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  EXPAT_PHASES as expatPhases,
  REVERSIBILITY_CHECKLISTS as reversibilityChecklists,
  type ExpatMilestone,
} from '@/lib/expatriation-timeline-data';

const STORAGE_KEY = 'expat-timeline-progress';

type CheckedState = Record<string, boolean>;

const PHASE_COLORS: Record<ExpatMilestone['phase'], { bg: string; border: string; text: string; dot: string }> = {
  preparation: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-600 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  transition: {
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    text: 'text-violet-600 dark:text-violet-400',
    dot: 'bg-violet-500',
  },
  installation: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  integration: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  establishment: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    text: 'text-rose-600 dark:text-rose-400',
    dot: 'bg-rose-500',
  },
};

const CRITICAL_LEVEL_CONFIG: Record<
  ExpatMilestone['criticalLevel'],
  { color: string; bg: string; label: string }
> = {
  low: { color: 'text-green-700 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-950', label: 'Faible' },
  medium: { color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-950', label: 'Moyen' },
  high: { color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-950', label: 'Elevé' },
  critical: { color: 'text-red-700 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-950', label: 'Critique' },
};

const COST_LABELS: Record<string, { label: string; color: string }> = {
  none: { label: 'Aucun', color: 'text-green-600 dark:text-green-400' },
  low: { label: 'Faible', color: 'text-green-600 dark:text-green-400' },
  medium: { label: 'Modéré', color: 'text-amber-600 dark:text-amber-400' },
  high: { label: 'Elevé', color: 'text-orange-600 dark:text-orange-400' },
  impossible: { label: 'Impossible', color: 'text-red-600 dark:text-red-400' },
};

const PHASE_LABELS: Record<ExpatMilestone['phase'], string> = {
  preparation: 'Préparation',
  transition: 'Transition',
  installation: 'Installation',
  integration: 'Intégration',
  establishment: 'Etablissement',
};

function loadCheckedState(): CheckedState {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveCheckedState(state: CheckedState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function ExpatTimeline() {
  const { } = useTranslation();
  const [checkedItems, setCheckedItems] = useState<CheckedState>(loadCheckedState);
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);
  const [showReversibility, setShowReversibility] = useState<string | null>(null);

  // Persist checked state to localStorage
  useEffect(() => {
    saveCheckedState(checkedItems);
  }, [checkedItems]);

  const handleCheckToggle = (itemId: string, checked: boolean) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemId]: checked,
    }));
  };

  // Compute overall progress
  const allChecklistItems = expatPhases.flatMap((phase) =>
    phase.milestones.flatMap((milestone) => milestone.checklist)
  );
  const totalItems = allChecklistItems.length;
  const completedItems = allChecklistItems.filter((item) => checkedItems[item.id]).length;
  const overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Compute per-milestone progress
  const getMilestoneProgress = (milestone: ExpatMilestone) => {
    const total = milestone.checklist.length;
    if (total === 0) return 100;
    const done = milestone.checklist.filter((item) => checkedItems[item.id]).length;
    return Math.round((done / total) * 100);
  };

  // Find reversibility checklist for a milestone
  const getReversibilityChecklist = (milestoneId: string) => {
    return reversibilityChecklists.find((rc) => rc.milestoneId === milestoneId);
  };

  const togglePhase = (phaseId: string) => {
    setExpandedPhase((prev) => (prev === phaseId ? null : phaseId));
    setExpandedMilestone(null);
    setShowReversibility(null);
  };

  const toggleMilestone = (milestoneId: string) => {
    setExpandedMilestone((prev) => (prev === milestoneId ? null : milestoneId));
    setShowReversibility(null);
  };

  const toggleReversibility = (milestoneId: string) => {
    setShowReversibility((prev) => (prev === milestoneId ? null : milestoneId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-primary" />
            Chronologie d'expatriation
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Suivez les étapes clés de votre parcours d'expatriation et évaluez la réversibilité de chaque décision.
          </p>
        </CardHeader>
        <CardContent>
          {/* Overall progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-muted-foreground">Progression globale</span>
              <span className="font-semibold">{completedItems}/{totalItems} étapes ({overallProgress}%)</span>
            </div>
            <Progress value={overallProgress} className="h-2.5" />
          </div>
        </CardContent>
      </Card>

      {/* Horizontal timeline overview */}
      <Card className="glass-card overflow-hidden">
        <CardContent className="pt-6 pb-4">
          <div className="flex items-center justify-between relative">
            {/* Connecting line */}
            <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-muted" />
            <div
              className="absolute top-5 left-[10%] h-0.5 bg-primary transition-all duration-500"
              style={{
                width: `${overallProgress * 0.8}%`,
              }}
            />

            {expatPhases.map((phase, index) => {
              const phaseColor = PHASE_COLORS[phase.milestones[0]?.phase || 'preparation'];
              const phaseProgress = phase.milestones.length > 0
                ? Math.round(
                    phase.milestones.reduce((sum, m) => sum + getMilestoneProgress(m), 0) /
                      phase.milestones.length
                  )
                : 0;
              const isActive = expandedPhase === phase.id;

              return (
                <button
                  key={phase.id}
                  onClick={() => togglePhase(phase.id)}
                  className={cn(
                    'relative z-10 flex flex-col items-center gap-2 px-2 group transition-all duration-200',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg',
                    isActive && 'scale-110'
                  )}
                  aria-expanded={isActive}
                  aria-label={`Phase: ${PHASE_LABELS[phase.milestones[0]?.phase || 'preparation']}`}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                      'group-hover:shadow-lg group-hover:scale-110',
                      phaseProgress === 100
                        ? 'bg-primary border-primary text-primary-foreground'
                        : isActive
                          ? `${phaseColor.bg} ${phaseColor.border} border-2`
                          : 'bg-background border-muted-foreground/30'
                    )}
                  >
                    {phaseProgress === 100 ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className={cn('text-xs font-bold', isActive ? phaseColor.text : 'text-muted-foreground')}>
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <div className="text-center">
                    <span
                      className={cn(
                        'text-xs font-medium block whitespace-nowrap',
                        isActive ? phaseColor.text : 'text-muted-foreground'
                      )}
                    >
                      {phase.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{phase.duration}</span>
                  </div>
                  {isActive && (
                    <ChevronDown className="w-3 h-3 text-muted-foreground animate-bounce" />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Expanded phase detail */}
      {expandedPhase && (
        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
          {expatPhases
            .filter((phase) => phase.id === expandedPhase)
            .map((phase) => {
              const phaseKey = phase.milestones[0]?.phase || 'preparation';
              const phaseColor = PHASE_COLORS[phaseKey];

              return (
                <Card key={phase.id} className={cn('glass-card border', phaseColor.border)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className={cn('text-base flex items-center gap-2', phaseColor.text)}>
                          <div className={cn('w-3 h-3 rounded-full', phaseColor.dot)} />
                          {phase.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{phase.description}</p>
                      </div>
                      <Badge variant="outline" className="gap-1">
                        <Clock className="w-3 h-3" />
                        {phase.duration}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {phase.milestones
                      .sort((a, b) => a.order - b.order)
                      .map((milestone) => {
                        const criticalConfig = CRITICAL_LEVEL_CONFIG[milestone.criticalLevel];
                        const milestoneProgress = getMilestoneProgress(milestone);
                        const isExpanded = expandedMilestone === milestone.id;
                        const isReversibilityOpen = showReversibility === milestone.id;
                        const reversibilityData = getReversibilityChecklist(milestone.id);

                        return (
                          <div
                            key={milestone.id}
                            className={cn(
                              'rounded-lg border transition-all duration-200',
                              isExpanded ? 'shadow-md' : 'hover:shadow-sm',
                              milestone.criticalLevel === 'critical' && 'border-red-500/30',
                              milestone.criticalLevel === 'high' && 'border-orange-500/30'
                            )}
                          >
                            {/* Milestone header */}
                            <button
                              onClick={() => toggleMilestone(milestone.id)}
                              className="w-full text-left p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
                              aria-expanded={isExpanded}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <h4 className="font-semibold text-sm">{milestone.title}</h4>
                                    {/* Reversibility indicator */}
                                    {milestone.isReversible ? (
                                      <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                        <Check className="w-3.5 h-3.5" />
                                        Réversible
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                                        <Lock className="w-3.5 h-3.5" />
                                        Irréversible
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {milestone.description}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {/* Critical level badge */}
                                  <Badge
                                    variant="outline"
                                    className={cn('text-[10px] px-1.5 py-0', criticalConfig.bg, criticalConfig.color, 'border-0')}
                                  >
                                    {criticalConfig.label}
                                  </Badge>
                                  {/* Timeframe */}
                                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                    {milestone.typicalTimeframe}
                                  </span>
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                  )}
                                </div>
                              </div>

                              {/* Progress bar for milestone */}
                              {milestone.checklist.length > 0 && (
                                <div className="mt-2">
                                  <Progress value={milestoneProgress} className="h-1.5" />
                                  <span className="text-[10px] text-muted-foreground mt-0.5 block">
                                    {milestone.checklist.filter((item) => checkedItems[item.id]).length}/
                                    {milestone.checklist.length} complété
                                  </span>
                                </div>
                              )}
                            </button>

                            {/* Expanded content */}
                            {isExpanded && (
                              <div className="px-4 pb-4 space-y-4 animate-in slide-in-from-top-1 duration-200">
                                {/* Reversibility note */}
                                {milestone.reversibilityNote && (
                                  <div
                                    className={cn(
                                      'p-3 rounded-lg text-xs',
                                      milestone.isReversible
                                        ? 'bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-900'
                                        : 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900'
                                    )}
                                  >
                                    <div className="flex items-start gap-2">
                                      {milestone.isReversible ? (
                                        <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                                      ) : (
                                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                      )}
                                      <span>{milestone.reversibilityNote}</span>
                                    </div>
                                  </div>
                                )}

                                {/* Warnings */}
                                {milestone.warnings.length > 0 && (
                                  <div className="space-y-2">
                                    {milestone.warnings.map((warning, wIdx) => (
                                      <div
                                        key={wIdx}
                                        className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300"
                                      >
                                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                                        <span>{warning}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Checklist */}
                                {milestone.checklist.length > 0 && (
                                  <div className="space-y-2">
                                    <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                      Liste de contrôle
                                    </h5>
                                    <div className="space-y-1.5">
                                      {milestone.checklist.map((item) => (
                                        <label
                                          key={item.id}
                                          className={cn(
                                            'flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors',
                                            'hover:bg-muted/50',
                                            checkedItems[item.id] && 'bg-muted/30'
                                          )}
                                        >
                                          <Checkbox
                                            checked={!!checkedItems[item.id]}
                                            onCheckedChange={(checked) =>
                                              handleCheckToggle(item.id, checked === true)
                                            }
                                          />
                                          <span
                                            className={cn(
                                              'text-sm flex-1',
                                              checkedItems[item.id] && 'line-through text-muted-foreground'
                                            )}
                                          >
                                            {item.label}
                                          </span>
                                          {item.critical && (
                                            <Badge
                                              variant="outline"
                                              className="text-[10px] px-1.5 py-0 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border-0"
                                            >
                                              Critique
                                            </Badge>
                                          )}
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Related exit keys */}
                                {milestone.relatedExitKeys.length > 0 && (
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs text-muted-foreground font-medium">Clés de sortie :</span>
                                    {milestone.relatedExitKeys.map((key) => (
                                      <Badge key={key} variant="secondary" className="text-[10px]">
                                        {key}
                                      </Badge>
                                    ))}
                                  </div>
                                )}

                                {/* Reversibility panel toggle */}
                                {reversibilityData && (
                                  <div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full gap-2"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleReversibility(milestone.id);
                                      }}
                                    >
                                      <Shield className="w-4 h-4" />
                                      {isReversibilityOpen
                                        ? 'Masquer le panneau de réversibilité'
                                        : 'Afficher le panneau de réversibilité'}
                                      {isReversibilityOpen ? (
                                        <ChevronUp className="w-3 h-3 ml-auto" />
                                      ) : (
                                        <ChevronDown className="w-3 h-3 ml-auto" />
                                      )}
                                    </Button>

                                    {isReversibilityOpen && (
                                      <div className="mt-3 space-y-2 animate-in slide-in-from-top-1 duration-200">
                                        <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                          <Shield className="w-3.5 h-3.5" />
                                          Analyse de réversibilité
                                        </h5>
                                        <div className="rounded-lg border overflow-hidden">
                                          <table className="w-full text-xs">
                                            <thead>
                                              <tr className="bg-muted/50">
                                                <th className="text-left p-2 font-medium">Action</th>
                                                <th className="text-center p-2 font-medium">Réversible</th>
                                                <th className="text-center p-2 font-medium">
                                                  <span className="flex items-center justify-center gap-1">
                                                    <DollarSign className="w-3 h-3" />
                                                    Coût
                                                  </span>
                                                </th>
                                                <th className="text-center p-2 font-medium">
                                                  <span className="flex items-center justify-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    Délai
                                                  </span>
                                                </th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {reversibilityData.items.map((rItem) => {
                                                const costConfig = COST_LABELS[rItem.costToReverse] || COST_LABELS.medium;
                                                return (
                                                  <tr
                                                    key={rItem.id}
                                                    className="border-t border-muted/50 hover:bg-muted/20 transition-colors"
                                                  >
                                                    <td className="p-2">{rItem.label}</td>
                                                    <td className="p-2 text-center">
                                                      {rItem.reversible ? (
                                                        <Check className="w-4 h-4 text-green-600 dark:text-green-400 inline" />
                                                      ) : (
                                                        <Lock className="w-4 h-4 text-red-600 dark:text-red-400 inline" />
                                                      )}
                                                    </td>
                                                    <td className={cn('p-2 text-center font-medium', costConfig.color)}>
                                                      {costConfig.label}
                                                    </td>
                                                    <td className="p-2 text-center text-muted-foreground">
                                                      {rItem.timeToReverse}
                                                    </td>
                                                  </tr>
                                                );
                                              })}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}

      {/* Legend */}
      <Card className="glass-card">
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="font-medium">Légende :</span>
            <span className="flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-green-600" />
              Réversible
            </span>
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-red-600" />
              Irréversible
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              Faible
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              Moyen
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
              Elevé
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
              Critique
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
