import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { RESOURCE_INFO, ResourceType, GameResources } from '@/lib/game-data';
import { GameEventWithChoices, EventChoice } from '@/lib/game-events-with-choices';
import { cn } from '@/lib/utils';
import { Globe, MapPin, AlertTriangle, Dice6, ChevronRight } from 'lucide-react';

interface EventCardWithChoicesProps {
  event: GameEventWithChoices;
  onChoiceSelect: (choice: EventChoice | null, result: 'success' | 'failure' | 'skip', appliedEffect: Partial<GameResources>) => void;
  className?: string;
}

export default function EventCardWithChoices({ event, onChoiceSelect, className }: EventCardWithChoicesProps) {
  const { t } = useTranslation();
  const [selectedChoice, setSelectedChoice] = useState<EventChoice | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [rollOutcome, setRollOutcome] = useState<'success' | 'failure' | null>(null);

  const isGlobal = event.type === 'global';
  const hasChoices = event.choices && event.choices.length > 0;

  const handleChoiceClick = (choice: EventChoice) => {
    setSelectedChoice(choice);
    setDiceResult(null);
    setRollOutcome(null);
  };

  const handleConfirmChoice = () => {
    if (!selectedChoice) return;

    if (selectedChoice.requiresRoll) {
      // Start dice roll animation
      setIsRolling(true);
      let rollCount = 0;
      const rollInterval = setInterval(() => {
        setDiceResult(Math.floor(Math.random() * 6) + 1);
        rollCount++;
        if (rollCount >= 12) {
          clearInterval(rollInterval);
          const finalRoll = Math.floor(Math.random() * 6) + 1;
          setDiceResult(finalRoll);
          setIsRolling(false);
          
          const success = finalRoll >= (selectedChoice.minRoll || 4);
          setRollOutcome(success ? 'success' : 'failure');
        }
      }, 100);
    } else if (selectedChoice.riskChance && selectedChoice.riskChance > 0) {
      // Automatic risk check
      const success = Math.random() > selectedChoice.riskChance;
      setRollOutcome(success ? 'success' : 'failure');
      if (success) {
        onChoiceSelect(selectedChoice, 'success', selectedChoice.effect);
      } else {
        onChoiceSelect(selectedChoice, 'failure', selectedChoice.riskEffect || {});
      }
    } else {
      // No risk, apply directly
      onChoiceSelect(selectedChoice, 'success', selectedChoice.effect);
    }
  };

  const handleFinalizeRoll = () => {
    if (!selectedChoice || diceResult === null) return;
    
    const success = diceResult >= (selectedChoice.minRoll || 4);
    if (success) {
      onChoiceSelect(selectedChoice, 'success', selectedChoice.effect);
    } else {
      onChoiceSelect(selectedChoice, 'failure', selectedChoice.riskEffect || {});
    }
  };

  const handleIgnore = () => {
    // Player chooses to do nothing - apply penalty if any
    onChoiceSelect(null, 'skip', event.noChoiceEffect || {});
  };

  const renderEffect = (effect: Partial<GameResources>, isNegative?: boolean) => {
    return (
      <div className="flex flex-wrap gap-1">
        {Object.entries(effect).map(([resource, change]) => (
          <span 
            key={resource}
            className={cn(
              "text-xs px-2 py-0.5 rounded-full flex items-center gap-1",
              (change as number) > 0 
                ? "bg-emerald-500/20 text-emerald-400" 
                : "bg-rose-500/20 text-rose-400"
            )}
          >
            {RESOURCE_INFO[resource as ResourceType].icon}
            <span className="font-medium">
              {(change as number) > 0 ? '+' : ''}{change}
            </span>
          </span>
        ))}
      </div>
    );
  };

  // If dice roll happened, show result
  if (rollOutcome !== null && selectedChoice?.requiresRoll) {
    return (
      <div className={cn(
        "glass-card rounded-xl p-6 border-2 animate-scale-in",
        rollOutcome === 'success' ? "border-emerald-500/50" : "border-rose-500/50",
        className
      )}>
        <div className="text-center">
          <div className={cn(
            "w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-4 text-4xl",
            rollOutcome === 'success' ? "bg-emerald-500/20" : "bg-rose-500/20"
          )}>
            {rollOutcome === 'success' ? '🎉' : '💔'}
          </div>
          
          <h3 className="font-display text-xl font-semibold mb-2">
            {rollOutcome === 'success' 
              ? t('events.rollSuccess', { roll: diceResult })
              : t('events.rollFailure', { roll: diceResult, needed: selectedChoice.minRoll })
            }
          </h3>
          
          <p className="text-sm text-muted-foreground mb-4">
            {t(selectedChoice.label)}
          </p>
          
          <div className="mb-4">
            {renderEffect(rollOutcome === 'success' ? selectedChoice.effect : (selectedChoice.riskEffect || {}))}
          </div>
          
          <Button onClick={handleFinalizeRoll} className="gap-2">
            {t('events.continue')}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "glass-card rounded-xl p-6 border-2 animate-scale-in",
        isGlobal ? "border-cyan-500/50 bg-cyan-500/5" : "border-amber-500/50 bg-amber-500/5",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className={cn(
          "p-3 rounded-xl text-3xl shrink-0",
          isGlobal ? "bg-cyan-500/20" : "bg-amber-500/20"
        )}>
          {event.icon}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {isGlobal ? (
              <Globe className="w-4 h-4 text-cyan-400" />
            ) : (
              <MapPin className="w-4 h-4 text-amber-400" />
            )}
            <span className={cn(
              "text-xs font-medium uppercase tracking-wide",
              isGlobal ? "text-cyan-400" : "text-amber-400"
            )}>
              {isGlobal ? t('events.globalEvent') : t('events.countryEvent')}
            </span>
          </div>
          
          <h3 className="font-display text-lg font-semibold mb-2">
            {t(event.label)}
          </h3>
          
          <p className="text-sm text-muted-foreground">
            {t(event.description)}
          </p>
        </div>
      </div>

      {/* Choices */}
      {hasChoices && (
        <div className="space-y-3 mb-4">
          <p className="text-sm font-medium text-muted-foreground">
            {t('events.chooseAction', 'Que faites-vous ?')}
          </p>
          
          {event.choices!.map((choice) => (
            <button
              key={choice.id}
              onClick={() => handleChoiceClick(choice)}
              className={cn(
                "w-full p-4 rounded-lg border-2 text-left transition-all",
                selectedChoice?.id === choice.id 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{choice.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{t(choice.label)}</span>
                    {choice.requiresRoll && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 flex items-center gap-1">
                        <Dice6 className="w-3 h-3" />
                        {t('events.needsRoll', { min: choice.minRoll || 4 })}
                      </span>
                    )}
                    {choice.riskChance && !choice.requiresRoll && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {Math.round(choice.riskChance * 100)}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{t(choice.description)}</p>
                  
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground mr-1">{t('events.ifSuccess')}:</span>
                      {renderEffect(choice.effect)}
                    </div>
                    {choice.riskEffect && (
                      <div>
                        <span className="text-xs text-muted-foreground mr-1">{t('events.ifFail')}:</span>
                        {renderEffect(choice.riskEffect)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Passive effect (no choices) */}
      {!hasChoices && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">{t('events.effectApplied')}:</p>
          {renderEffect(event.effect)}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {hasChoices && event.noChoiceEffect && (
          <Button 
            variant="outline" 
            onClick={handleIgnore}
            className="flex-1"
          >
            {t('events.ignore', 'Ignorer')}
            {Object.keys(event.noChoiceEffect).length > 0 && (
              <span className="ml-2 text-rose-400">
                ({Object.entries(event.noChoiceEffect).map(([r, c]) => 
                  `${RESOURCE_INFO[r as ResourceType].icon}${c}`
                ).join(' ')})
              </span>
            )}
          </Button>
        )}
        
        {hasChoices && selectedChoice && (
          <Button 
            onClick={handleConfirmChoice}
            className="flex-1 gap-2"
            disabled={isRolling}
          >
            {isRolling ? (
              <>
                <Dice6 className="w-4 h-4 animate-spin" />
                {diceResult}
              </>
            ) : selectedChoice.requiresRoll ? (
              <>
                <Dice6 className="w-4 h-4" />
                {t('events.rollDice', 'Lancer le dé')}
              </>
            ) : (
              <>
                {t('events.confirm', 'Confirmer')}
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        )}

        {!hasChoices && (
          <Button 
            onClick={() => onChoiceSelect(null, 'success', event.effect)}
            className="w-full gap-2"
          >
            {t('events.continue')}
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
