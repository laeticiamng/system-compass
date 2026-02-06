import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  RiskEvent, 
  resolveRiskEvent, 
  RESOURCE_INFO, 
  ResourceType,
  GameResources 
} from '@/lib/game-data';
import { cn } from '@/lib/utils';
import { 
  AlertTriangle, 
  Skull, 
  CheckCircle, 
  XCircle, 
  Dices,
  ArrowRight,
  Shield
} from 'lucide-react';

interface RiskEventCardProps {
  event: RiskEvent;
  onResolve: (outcome: 'success' | 'failure' | 'catastrophic', effects: Partial<GameResources>) => void;
  onDecline: () => void;
  canAfford?: boolean;
}

const RISK_TYPE_ICONS: Record<RiskEvent['riskType'], string> = {
  trafficking: '🚨',
  scam: '🎭',
  exploitation: '⛓️',
  illegal_crossing: '🚢',
  document_fraud: '📄',
  natural_disaster: '🌊',
  climate: '🌡️',
  political: '⚠️',
};

const RISK_TYPE_LABELS: Record<RiskEvent['riskType'], string> = {
  trafficking: 'Traite humaine',
  scam: 'Arnaque',
  exploitation: 'Exploitation',
  illegal_crossing: 'Passage clandestin',
  document_fraud: 'Fraude documentaire',
  natural_disaster: 'Catastrophe naturelle',
  climate: 'Risque climatique',
  political: 'Risque politique',
};

export default function RiskEventCard({ 
  event, 
  onResolve, 
  onDecline,
  canAfford = true 
}: RiskEventCardProps) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<'choice' | 'rolling' | 'result'>('choice');
  const [result, setResult] = useState<{
    outcome: 'success' | 'failure' | 'catastrophic';
    effect: Partial<GameResources>;
    description: string;
  } | null>(null);

  const handleTakeRisk = () => {
    setPhase('rolling');
    
    // Dramatic roll animation
    setTimeout(() => {
      const outcome = resolveRiskEvent(event);
      setResult(outcome);
      setPhase('result');
    }, 2000);
  };

  const handleContinue = () => {
    if (result) {
      onResolve(result.outcome, result.effect);
    }
  };

  const { potentialOutcomes } = event;
  const successChance = Math.round(potentialOutcomes.success.probability * 100);
  const failureChance = Math.round(potentialOutcomes.failure.probability * 100);
  const catastrophicChance = potentialOutcomes.catastrophic 
    ? Math.round(potentialOutcomes.catastrophic.probability * 100)
    : 0;

  return (
    <div className={cn(
      "glass-card rounded-xl overflow-hidden border-2 animate-scale-in",
      "border-red-500/50 bg-gradient-to-br from-red-950/20 to-orange-950/20"
    )}>
      {/* Header */}
      <div className="bg-red-500/20 p-4 border-b border-red-500/30">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-red-500/30 text-3xl">
            {RISK_TYPE_ICONS[event.riskType]}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-xs font-medium uppercase tracking-wide text-red-400">
                {t('events.riskEvent')}
              </span>
            </div>
            <h3 className="font-display text-lg font-bold">
              {t(event.label)}
            </h3>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {phase === 'choice' && (
          <div className="space-y-6 animate-fade-in">
            <p className="text-muted-foreground">
              {t(event.description)}
            </p>

            {/* Risk Type Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30">
              <span className="text-sm font-medium text-red-400">
                {RISK_TYPE_LABELS[event.riskType]}
              </span>
            </div>

            {/* Probability Breakdown */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Dices className="w-4 h-4" />
                {t('game.risk.probabilities', 'Probabilités des issues')}
              </h4>

              {/* Success */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>{t('game.risk.success', 'Succès')}</span>
                  </div>
                  <span className="font-bold text-emerald-400">{successChance}%</span>
                </div>
                <Progress value={successChance} className="h-2 bg-muted" />
                <p className="text-xs text-muted-foreground pl-6">
                  {t(potentialOutcomes.success.description)}
                </p>
                <div className="flex flex-wrap gap-1.5 pl-6">
                  {Object.entries(potentialOutcomes.success.effect).map(([res, val]) => (
                    <span 
                      key={res}
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        (val as number) > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                      )}
                    >
                      {RESOURCE_INFO[res as ResourceType].icon} {(val as number) > 0 ? '+' : ''}{val}
                    </span>
                  ))}
                </div>
              </div>

              {/* Failure */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-amber-400" />
                    <span>Échec</span>
                  </div>
                  <span className="font-bold text-amber-400">{failureChance}%</span>
                </div>
                <Progress value={failureChance} className="h-2 bg-muted" />
                <p className="text-xs text-muted-foreground pl-6">
                  {t(potentialOutcomes.failure.description)}
                </p>
                <div className="flex flex-wrap gap-1.5 pl-6">
                  {Object.entries(potentialOutcomes.failure.effect).map(([res, val]) => (
                    <span 
                      key={res}
                      className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400"
                    >
                      {RESOURCE_INFO[res as ResourceType].icon} {val}
                    </span>
                  ))}
                </div>
              </div>

              {/* Catastrophic */}
              {potentialOutcomes.catastrophic && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Skull className="w-4 h-4 text-red-400" />
                      <span>Catastrophe</span>
                    </div>
                    <span className="font-bold text-red-400">{catastrophicChance}%</span>
                  </div>
                  <Progress value={catastrophicChance} className="h-2 bg-muted" />
                  <p className="text-xs text-muted-foreground pl-6">
                    {t(potentialOutcomes.catastrophic.description)}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pl-6">
                    {Object.entries(potentialOutcomes.catastrophic.effect).map(([res, val]) => (
                      <span 
                        key={res}
                        className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400"
                      >
                        {RESOURCE_INFO[res as ResourceType].icon} {val}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Warning */}
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-400 mb-1">
                    Avertissement
                  </p>
                  <p className="text-muted-foreground">
                    Les raccourcis comportent des risques réels. Ces situations sont basées 
                    sur des témoignages et statistiques de personnes ayant tenté ces voies.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={onDecline} 
                className="flex-1 gap-2"
              >
                <Shield className="w-4 h-4" />
                Refuser le risque
              </Button>
              <Button 
                onClick={handleTakeRisk}
                disabled={!canAfford}
                className="flex-1 gap-2 bg-red-600 hover:bg-red-700"
              >
                <Dices className="w-4 h-4" />
                Tenter ma chance
              </Button>
            </div>
          </div>
        )}

        {phase === 'rolling' && (
          <div className="text-center py-12 animate-pulse">
            <div className="text-6xl mb-6 animate-bounce">🎲</div>
            <h3 className="font-display text-xl font-bold mb-2">
              Le destin décide...
            </h3>
            <p className="text-muted-foreground">
              Votre avenir est entre les mains du hasard
            </p>
          </div>
        )}

        {phase === 'result' && result && (
          <div className="space-y-6 animate-scale-in">
            <div className={cn(
              "text-center p-8 rounded-xl",
              result.outcome === 'success' && "bg-emerald-500/10 border border-emerald-500/30",
              result.outcome === 'failure' && "bg-amber-500/10 border border-amber-500/30",
              result.outcome === 'catastrophic' && "bg-red-500/10 border border-red-500/30"
            )}>
              <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4",
                result.outcome === 'success' && "bg-emerald-500/20",
                result.outcome === 'failure' && "bg-amber-500/20",
                result.outcome === 'catastrophic' && "bg-red-500/20"
              )}>
                {result.outcome === 'success' && <CheckCircle className="w-10 h-10 text-emerald-400" />}
                {result.outcome === 'failure' && <XCircle className="w-10 h-10 text-amber-400" />}
                {result.outcome === 'catastrophic' && <Skull className="w-10 h-10 text-red-400" />}
              </div>
              
              <h3 className={cn(
                "font-display text-2xl font-bold mb-2",
                result.outcome === 'success' && "text-emerald-400",
                result.outcome === 'failure' && "text-amber-400",
                result.outcome === 'catastrophic' && "text-red-400"
              )}>
                {result.outcome === 'success' && 'Réussite !'}
                {result.outcome === 'failure' && 'Échec'}
                {result.outcome === 'catastrophic' && 'Catastrophe...'}
              </h3>
              
              <p className="text-muted-foreground mb-4">
                {t(result.description)}
              </p>

              <div className="flex flex-wrap justify-center gap-2">
                {Object.entries(result.effect).map(([res, val]) => (
                  <span 
                    key={res}
                    className={cn(
                      "text-sm px-3 py-1 rounded-full",
                      (val as number) > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                    )}
                  >
                    {RESOURCE_INFO[res as ResourceType].icon} {(val as number) > 0 ? '+' : ''}{val}
                  </span>
                ))}
              </div>
            </div>

            <Button onClick={handleContinue} className="w-full gap-2">
              Continuer
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}