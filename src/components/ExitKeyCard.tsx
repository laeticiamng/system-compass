import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  ChevronDown, ChevronUp, Clock, Target, AlertTriangle, 
  Zap, CheckCircle, Shield, Unlock, Crosshair, AlertOctagon, 
  MessageSquareQuote, Bookmark, Eye, PlayCircle, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ExitKeyResult } from '@/lib/exit-keys-engine';
import { cn } from '@/lib/utils';
import { usePyramidTranslations } from '@/hooks/usePyramidTranslations';
import { useExitKeysHistory } from '@/hooks/useExitKeysHistory';
import { toast } from 'sonner';

interface ExitKeyCardProps {
  result: ExitKeyResult;
  rank: number;
  countryId?: string;
}

const difficultyConfig = {
  accessible: { 
    label: 'Accessible', 
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    icon: '○'
  },
  exigeant: { 
    label: 'Exigeant', 
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    icon: '◐'
  },
  expert: { 
    label: 'Expert', 
    color: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    icon: '●'
  },
};

export default function ExitKeyCard({ result, rank, countryId }: ExitKeyCardProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(rank === 1);
  const { key, compatibility, personalizedSteps, warnings, accelerators, planB } = result;
  const difficulty = difficultyConfig[key.difficulty];
  const { getPyramidLabel } = usePyramidTranslations();
  const { trackExitKey, updateStatus, isLoggedIn } = useExitKeysHistory();

  const handleTrack = useCallback(async () => {
    if (!isLoggedIn) {
      toast.info(t('exitKeys.loginToSave', 'Connectez-vous pour sauvegarder'));
      return;
    }
    await trackExitKey(key.id, countryId, compatibility);
    toast.success(t('exitKeys.keyTracked', 'Clé explorée enregistrée'));
  }, [isLoggedIn, trackExitKey, key.id, countryId, compatibility, t]);

  const handleSave = useCallback(async () => {
    if (!isLoggedIn) {
      toast.info(t('exitKeys.loginToSave', 'Connectez-vous pour sauvegarder'));
      return;
    }
    const entry = await trackExitKey(key.id, countryId, compatibility);
    if (entry) {
      await updateStatus(entry.id, 'saved');
      toast.success(t('exitKeys.keySaved', 'Clé sauvegardée !'));
    }
  }, [isLoggedIn, trackExitKey, updateStatus, key.id, countryId, compatibility, t]);

  const handleStartProgress = useCallback(async () => {
    if (!isLoggedIn) {
      toast.info(t('exitKeys.loginToSave', 'Connectez-vous pour sauvegarder'));
      return;
    }
    const entry = await trackExitKey(key.id, countryId, compatibility);
    if (entry) {
      await updateStatus(entry.id, 'in_progress');
      toast.success(t('exitKeys.keyStarted', 'Clé démarrée ! Suivez votre progression.'));
    }
  }, [isLoggedIn, trackExitKey, updateStatus, key.id, countryId, compatibility, t]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn(
        "rounded-xl border transition-all duration-300 bg-card",
        rank === 1 ? "border-primary/50 ring-1 ring-primary/20" : "border-border/50",
        isOpen && "shadow-lg"
      )}>
        {/* Header - Premium Format */}
        <CollapsibleTrigger asChild>
          <button className="w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-xl">
            <div className="space-y-4">
              {/* Title Row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-display text-lg font-bold">{key.name}</h3>
                    {rank === 1 && (
                      <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                        Recommandé
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {key.timeframe}
                    </span>
                    <Badge variant="outline" className={cn("text-xs", difficulty.color)}>
                      {difficulty.icon} {difficulty.label}
                    </Badge>
                    <span className="text-xs">
                      {compatibility}% compatible
                    </span>
                  </div>
                </div>
                <div className="shrink-0 mt-1">
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Premium Format: 4 Key Points */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Ce que ça débloque */}
                <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  <Unlock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-emerald-500 mb-0.5">Ce que ça débloque</p>
                    <p className="text-sm text-foreground/90">{key.unlocks}</p>
                  </div>
                </div>

                {/* Condition de réussite */}
                <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <Crosshair className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-primary mb-0.5">Condition de réussite</p>
                    <p className="text-sm text-foreground/90">{key.successCondition}</p>
                  </div>
                </div>

                {/* Risque principal */}
                <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-500/5 border border-rose-500/10">
                  <AlertOctagon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-rose-500 mb-0.5">Risque principal</p>
                    <p className="text-sm text-foreground/90">{key.mainRisk}</p>
                  </div>
                </div>

                {/* Vérité brute */}
                <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
                  <MessageSquareQuote className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-0.5">Vérité brute</p>
                    <p className="text-sm text-foreground/90 italic">"{key.rawTruth}"</p>
                  </div>
                </div>
              </div>

              {/* Linked Pyramids */}
              <div className="flex flex-wrap gap-1.5">
                {key.linkedPyramids.map(p => (
                  <span key={p} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {getPyramidLabel(p)}
                  </span>
                ))}
                <span className="text-xs text-muted-foreground">→</span>
                {key.targetPyramids.map(p => (
                  <span key={p} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {getPyramidLabel(p)}
                  </span>
                ))}
              </div>
            </div>
          </button>
        </CollapsibleTrigger>

        {/* Expanded Content */}
        <CollapsibleContent>
          <div className="px-6 pb-6 space-y-5 border-t border-border/50 pt-5">
            {/* Accelerators */}
            {accelerators.length > 0 && (
              <div className="bg-emerald-500/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  <h4 className="font-semibold text-emerald-400 text-sm">Vos Accélérateurs</h4>
                </div>
                <ul className="space-y-1">
                  {accelerators.map((acc, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-emerald-500">+</span>
                      {acc}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="bg-amber-500/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h4 className="font-semibold text-amber-400 text-sm">Points d'Attention</h4>
                </div>
                <ul className="space-y-1">
                  {warnings.map((warn, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-amber-500">⚠</span>
                      {warn}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Phases */}
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2 text-sm">
                <Target className="w-4 h-4 text-primary" />
                Plan en {personalizedSteps.length} Phases
              </h4>
              
              <div className="space-y-3">
                {personalizedSteps.map((step, index) => (
                  <div 
                    key={index}
                    className="relative pl-8 pb-3 border-l-2 border-border last:border-l-transparent"
                  >
                    <div className="absolute left-0 top-0 -translate-x-1/2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-foreground">{step.phase}</span>
                    </div>

                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-sm">{step.name}</h5>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {step.duration}
                        </Badge>
                      </div>

                      <ul className="space-y-1 mb-2">
                        {step.actions.map((action, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                            {action}
                          </li>
                        ))}
                      </ul>

                      <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-md">
                        <Target className="w-3 h-3 text-primary" />
                        <span className="text-xs font-medium text-primary">{step.milestone}</span>
                      </div>

                      {step.criticalRule && (
                        <div className="mt-2 flex items-center gap-2 p-2 bg-rose-500/10 rounded-md">
                          <Shield className="w-3 h-3 text-rose-500" />
                          <span className="text-xs font-medium text-rose-500">{step.criticalRule}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div>
              <h4 className="font-semibold mb-2 text-sm">Prérequis</h4>
              <div className="flex flex-wrap gap-2">
                {key.requirements.map((req, i) => (
                  <Badge key={i} variant="secondary" className="text-xs font-normal">
                    {req}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Plan B */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-primary" />
                <h4 className="font-semibold text-sm">{t('exitKeys.planB', 'Plan B')}</h4>
              </div>
              <p className="text-sm text-muted-foreground">{planB}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/50">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleTrack}
                className="gap-1"
              >
                <Eye className="w-3 h-3" />
                {t('exitKeys.markExplored', 'Explorée')}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSave}
                className="gap-1"
              >
                <Bookmark className="w-3 h-3" />
                {t('exitKeys.save', 'Sauvegarder')}
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleStartProgress}
                className="gap-1"
              >
                <PlayCircle className="w-3 h-3" />
                {t('exitKeys.startTracking', 'Démarrer')}
              </Button>
              <Link to={`/compare-exit-keys?key=${key.id}`} className="ml-auto">
                <Button variant="ghost" size="sm" className="gap-1">
                  <ExternalLink className="w-3 h-3" />
                  {t('exitKeys.addToCompare', 'Comparer')}
                </Button>
              </Link>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
