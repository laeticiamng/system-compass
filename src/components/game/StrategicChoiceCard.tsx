import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { GameResources, ResourceType, RESOURCE_INFO } from '@/lib/game-data';
import { PyramidType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dice6, 
  ChevronRight, 
  Shield, 
  Zap, 
  AlertTriangle,
  Star,
  Clock,
  Users
} from 'lucide-react';

export interface StrategicChoice {
  id: string;
  label: string;
  description: string;
  icon: string;
  effect: Partial<GameResources>;
  pyramidEffect?: Partial<Record<PyramidType, number>>;
  riskChance?: number;
  riskEffect?: Partial<GameResources>;
  requiresRoll?: boolean;
  minRoll?: number;
  timeLimit?: number; // In seconds, for timed decisions
  requiresNetwork?: boolean; // Needs other players' agreement
}

interface StrategicChoiceCardProps {
  title: string;
  description: string;
  icon: string;
  eventType: 'global' | 'country' | 'personal' | 'dilemma';
  choices: StrategicChoice[];
  ignoreEffect?: Partial<GameResources>;
  onChoiceSelect: (
    choice: StrategicChoice | null, 
    result: 'success' | 'failure' | 'skip', 
    appliedEffect: Partial<GameResources>,
    pyramidEffect?: Partial<Record<PyramidType, number>>
  ) => void;
  playerResources: GameResources;
  className?: string;
}

export default function StrategicChoiceCard({
  title,
  description,
  icon,
  eventType,
  choices,
  ignoreEffect,
  onChoiceSelect,
  playerResources,
  className,
}: StrategicChoiceCardProps) {
  const { t } = useTranslation();
  const [selectedChoice, setSelectedChoice] = useState<StrategicChoice | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [rollOutcome, setRollOutcome] = useState<'success' | 'failure' | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [_showDetails, setShowDetails] = useState<string | null>(null);

  const eventColors = {
    global: 'border-cyan-500/50 bg-cyan-500/5',
    country: 'border-amber-500/50 bg-amber-500/5',
    personal: 'border-purple-500/50 bg-purple-500/5',
    dilemma: 'border-rose-500/50 bg-rose-500/5',
  };

  const eventIcons = {
    global: <Star className="w-4 h-4 text-cyan-400" />,
    country: <Shield className="w-4 h-4 text-amber-400" />,
    personal: <Zap className="w-4 h-4 text-purple-400" />,
    dilemma: <AlertTriangle className="w-4 h-4 text-rose-400" />,
  };

  const canAffordChoice = (choice: StrategicChoice): boolean => {
    // Check if any resource would go negative
    for (const [resource, change] of Object.entries(choice.effect)) {
      if ((change as number) < 0) {
        const current = playerResources[resource as ResourceType] || 0;
        if (current + (change as number) < 0) return false;
      }
    }
    return true;
  };

  const handleChoiceClick = (choice: StrategicChoice) => {
    if (!canAffordChoice(choice)) return;
    setSelectedChoice(choice);
    setDiceResult(null);
    setRollOutcome(null);
    setShowDetails(choice.id);

    // Start timer if choice has time limit
    if (choice.timeLimit) {
      setTimeRemaining(choice.timeLimit);
    }
  };

  const handleConfirmChoice = () => {
    if (!selectedChoice) return;

    if (selectedChoice.requiresRoll) {
      // Dice roll animation
      setIsRolling(true);
      let rollCount = 0;
      const rollInterval = setInterval(() => {
        setDiceResult(Math.floor(Math.random() * 6) + 1);
        rollCount++;
        if (rollCount >= 15) {
          clearInterval(rollInterval);
          const finalRoll = Math.floor(Math.random() * 6) + 1;
          setDiceResult(finalRoll);
          setIsRolling(false);
          
          const success = finalRoll >= (selectedChoice.minRoll || 4);
          setRollOutcome(success ? 'success' : 'failure');
        }
      }, 80);
    } else if (selectedChoice.riskChance && selectedChoice.riskChance > 0) {
      // Automatic risk check with visual feedback
      const success = Math.random() > selectedChoice.riskChance;
      setRollOutcome(success ? 'success' : 'failure');
      setTimeout(() => {
        if (success) {
          onChoiceSelect(selectedChoice, 'success', selectedChoice.effect, selectedChoice.pyramidEffect);
        } else {
          onChoiceSelect(selectedChoice, 'failure', selectedChoice.riskEffect || {});
        }
      }, 1500);
    } else {
      // No risk, apply directly
      onChoiceSelect(selectedChoice, 'success', selectedChoice.effect, selectedChoice.pyramidEffect);
    }
  };

  const handleFinalizeRoll = () => {
    if (!selectedChoice || diceResult === null) return;
    
    const success = diceResult >= (selectedChoice.minRoll || 4);
    if (success) {
      onChoiceSelect(selectedChoice, 'success', selectedChoice.effect, selectedChoice.pyramidEffect);
    } else {
      onChoiceSelect(selectedChoice, 'failure', selectedChoice.riskEffect || {});
    }
  };

  const handleIgnore = () => {
    onChoiceSelect(null, 'skip', ignoreEffect || {});
  };

  const renderEffect = (effect: Partial<GameResources>) => {
    return (
      <div className="flex flex-wrap gap-1">
        {Object.entries(effect).map(([resource, change]) => (
          <motion.span 
            key={resource}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-medium",
              (change as number) > 0 
                ? "bg-emerald-500/20 text-emerald-400" 
                : "bg-rose-500/20 text-rose-400"
            )}
          >
            {RESOURCE_INFO[resource as ResourceType]?.icon}
            <span>{(change as number) > 0 ? '+' : ''}{change}</span>
          </motion.span>
        ))}
      </div>
    );
  };

  // Result screen after dice roll
  if (rollOutcome !== null && selectedChoice?.requiresRoll) {
    return (
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          "glass-card rounded-xl p-6 border-2",
          rollOutcome === 'success' ? "border-emerald-500/50" : "border-rose-500/50",
          className
        )}
      >
        <div className="text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: rollOutcome === 'success' ? 360 : 0 }}
            transition={{ type: "spring", duration: 0.6 }}
            className={cn(
              "w-24 h-24 rounded-xl flex items-center justify-center mx-auto mb-4 text-5xl",
              rollOutcome === 'success' ? "bg-emerald-500/20" : "bg-rose-500/20"
            )}
          >
            {rollOutcome === 'success' ? '🎉' : '💔'}
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
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
              {t('events.continue', 'Continuer')}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        "glass-card rounded-xl p-6 border-2",
        eventColors[eventType],
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ type: "spring", duration: 0.6 }}
          className={cn(
            "p-3 rounded-xl text-4xl shrink-0",
            eventType === 'global' ? "bg-cyan-500/20" :
            eventType === 'country' ? "bg-amber-500/20" :
            eventType === 'personal' ? "bg-purple-500/20" :
            "bg-rose-500/20"
          )}
        >
          {icon}
        </motion.div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {eventIcons[eventType]}
            <span className={cn(
              "text-xs font-medium uppercase tracking-wide",
              eventType === 'global' ? "text-cyan-400" :
              eventType === 'country' ? "text-amber-400" :
              eventType === 'personal' ? "text-purple-400" :
              "text-rose-400"
            )}>
              {t(`events.${eventType}Event`, eventType)}
            </span>
            {timeRemaining !== null && (
              <span className="text-xs flex items-center gap-1 text-amber-400">
                <Clock className="w-3 h-3" />
                {timeRemaining}s
              </span>
            )}
          </div>
          
          <h3 className="font-display text-lg font-semibold mb-2">
            {title}
          </h3>
          
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      {/* Choices */}
      <div className="space-y-3 mb-4">
        <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Users className="w-4 h-4" />
          {t('events.chooseAction', 'Que décidez-vous ?')}
        </p>
        
        <AnimatePresence>
          {choices.map((choice, index) => {
            const canAfford = canAffordChoice(choice);
            const isSelected = selectedChoice?.id === choice.id;
            
            return (
              <motion.button
                key={choice.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleChoiceClick(choice)}
                disabled={!canAfford}
                className={cn(
                  "w-full p-4 rounded-lg border-2 text-left transition-all",
                  isSelected 
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/20" 
                    : canAfford
                      ? "border-border hover:border-primary/50 hover:bg-primary/5"
                      : "border-border/30 opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{choice.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium">{t(choice.label)}</span>
                      {choice.requiresRoll && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 flex items-center gap-1">
                          <Dice6 className="w-3 h-3" />
                          ≥ {choice.minRoll || 4}
                        </span>
                      )}
                      {choice.riskChance && !choice.requiresRoll && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {Math.round(choice.riskChance * 100)}% risque
                        </span>
                      )}
                      {choice.requiresNetwork && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Collectif
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{t(choice.description)}</p>
                    
                    <div className="flex items-center gap-4 flex-wrap">
                      <div>
                        <span className="text-xs text-muted-foreground mr-1">Si réussi:</span>
                        {renderEffect(choice.effect)}
                      </div>
                      {choice.riskEffect && (
                        <div>
                          <span className="text-xs text-muted-foreground mr-1">Si échec:</span>
                          {renderEffect(choice.riskEffect)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {ignoreEffect && (
          <Button 
            variant="outline" 
            onClick={handleIgnore}
            className="flex-1"
          >
            {t('events.ignore', 'Passer')}
            {Object.keys(ignoreEffect).length > 0 && (
              <span className="ml-2">
                {renderEffect(ignoreEffect)}
              </span>
            )}
          </Button>
        )}
        
        {selectedChoice && (
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="flex-1"
          >
            <Button 
              onClick={handleConfirmChoice}
              className="w-full gap-2"
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
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
