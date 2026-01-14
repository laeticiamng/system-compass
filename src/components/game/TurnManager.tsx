import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { 
  GameResources, 
  GameAction, 
  GAME_ACTIONS,
  CharacterCard,
  ResourceType
} from '@/lib/game-data';
import { 
  getRandomGlobalEventWithChoices,
  getRandomCountryEventWithChoices,
  GameEventWithChoices,
  EventChoice,
} from '@/lib/game-events-with-choices';
import { 
  FamilyStatus, 
  FamilyEvent, 
  FamilyEventChoice,
  getRandomFamilyEvent,
  calculateFamilyMonthlyCosts,
  FAMILY_STATUS_LABELS
} from '@/lib/family-system';
import { PyramidType } from '@/lib/types';
import { cn } from '@/lib/utils';
import EventCardWithChoices from './EventCardWithChoices';
import FamilyEventCard from './FamilyEventCard';
import ResourceBar from './ResourceBar';
import ActionPanel from './ActionPanel';
import StrategicChoiceCard, { StrategicChoice } from './StrategicChoiceCard';
import GameVisualFeedback, { OutcomeAnimation, FloatingNotification } from './GameVisualFeedback';
import { 
  Play, 
  Calendar, 
  Globe, 
  MapPin,
  ChevronRight,
  AlertTriangle,
  Home
} from 'lucide-react';

export type TurnPhase = 
  | 'global_event'
  | 'country_event' 
  | 'family_event'
  | 'action_selection'
  | 'action_resolution'
  | 'board_move'
  | 'end_turn';

interface TurnManagerProps {
  currentPlayer: {
    id: number;
    name: string;
    character: CharacterCard;
    resources: GameResources;
    countryType: PyramidType;
    familyStatus?: FamilyStatus;
  };
  turnNumber: number;
  onResourceChange: (playerId: number, resources: GameResources) => void;
  onPyramidScoreChange: (playerId: number, pyramidChanges: Partial<Record<PyramidType, number>>) => void;
  onPhaseComplete: (phase: TurnPhase, data?: any) => void;
  onTurnEnd: () => void;
  onTrackRisk?: (outcome: 'success' | 'failure' | 'catastrophic', moneyChange: number, healthChange: number) => void;
  onTrackAction?: (success: boolean) => void;
  onFamilyStatusChange?: (playerId: number, newStatus: FamilyStatus) => void;
}

export default function TurnManager({
  currentPlayer,
  turnNumber,
  onResourceChange,
  onPyramidScoreChange,
  onPhaseComplete,
  onTurnEnd,
  onTrackRisk,
  onTrackAction,
  onFamilyStatusChange,
}: TurnManagerProps) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<TurnPhase>('global_event');
  const [globalEvent, setGlobalEvent] = useState<GameEventWithChoices | null>(null);
  const [countryEvent, setCountryEvent] = useState<GameEventWithChoices | null>(null);
  const [familyEvent, setFamilyEvent] = useState<FamilyEvent | null>(null);
  const [selectedAction, setSelectedAction] = useState<GameAction | null>(null);
  const [actionResult, setActionResult] = useState<'success' | 'failed' | null>(null);
  
  // Visual feedback state
  const [resourceChanges, setResourceChanges] = useState<{ resource: ResourceType; change: number; id: string }[]>([]);
  const [showOutcome, setShowOutcome] = useState<'success' | 'failure' | 'critical_success' | 'critical_failure' | null>(null);
  const [notification, setNotification] = useState<{ icon: string; text: string; variant: 'info' | 'success' | 'warning' | 'danger' } | null>(null);

  // Generate events at start of turn
  useEffect(() => {
    if (phase === 'global_event' && !globalEvent) {
      setGlobalEvent(getRandomGlobalEventWithChoices());
    }
  }, [phase, globalEvent]);

  useEffect(() => {
    if (phase === 'country_event' && !countryEvent) {
      setCountryEvent(getRandomCountryEventWithChoices(currentPlayer.countryType));
    }
  }, [phase, countryEvent, currentPlayer.countryType]);

  // Generate family event
  useEffect(() => {
    if (phase === 'family_event' && !familyEvent && currentPlayer.familyStatus) {
      const event = getRandomFamilyEvent(currentPlayer.familyStatus);
      setFamilyEvent(event);
    }
  }, [phase, familyEvent, currentPlayer.familyStatus]);

  // Visual feedback helper
  const showResourceFeedback = useCallback((effects: Partial<GameResources>) => {
    const changes = Object.entries(effects)
      .filter(([, change]) => typeof change === 'number' && change !== 0)
      .map(([resource, change]) => ({
        resource: resource as ResourceType,
        change: change as number,
        id: `${resource}-${Date.now()}-${Math.random()}`,
      }));
    if (changes.length > 0) {
      setResourceChanges(changes);
    }
  }, []);

  const showOutcomeAnimation = useCallback((success: boolean, isCritical?: boolean) => {
    if (success) {
      setShowOutcome(isCritical ? 'critical_success' : 'success');
    } else {
      setShowOutcome(isCritical ? 'critical_failure' : 'failure');
    }
  }, []);

  const showNotification = useCallback((icon: string, text: string, variant: 'info' | 'success' | 'warning' | 'danger') => {
    setNotification({ icon, text, variant });
  }, []);

  const applyEffects = (effects: Partial<GameResources>) => {
    const newResources = { ...currentPlayer.resources };
    
    Object.entries(effects).forEach(([resource, change]) => {
      const key = resource as ResourceType;
      if (typeof change === 'number') {
        newResources[key] = Math.max(0, Math.min(10, newResources[key] + change));
      }
    });
    
    // Show visual feedback
    showResourceFeedback(effects);
    
    onResourceChange(currentPlayer.id, newResources);
  };

  const handleGlobalEventChoice = (
    choice: EventChoice | null, 
    result: 'success' | 'failure' | 'skip', 
    appliedEffect: Partial<GameResources>
  ) => {
    applyEffects(appliedEffect);
    
    // Show visual feedback
    if (result !== 'skip') {
      showOutcomeAnimation(result === 'success');
      showNotification(
        result === 'success' ? '🌍' : '⚠️',
        result === 'success' ? t('events.globalEventSuccess', 'Événement mondial résolu !') : t('events.globalEventFailed', 'Impact négatif...'),
        result === 'success' ? 'success' : 'warning'
      );
    }
    
    // Apply pyramid effects if success and event has them
    if (result === 'success' && globalEvent?.pyramidEffect) {
      onPyramidScoreChange(currentPlayer.id, globalEvent.pyramidEffect);
    }
    
    setPhase('country_event');
    onPhaseComplete('global_event', { event: globalEvent, choice, result });
  };

  const handleCountryEventChoice = (
    choice: EventChoice | null, 
    result: 'success' | 'failure' | 'skip', 
    appliedEffect: Partial<GameResources>
  ) => {
    applyEffects(appliedEffect);
    
    // Show visual feedback
    if (result !== 'skip') {
      showOutcomeAnimation(result === 'success');
      showNotification(
        result === 'success' ? '🏛️' : '💥',
        result === 'success' ? t('events.countryEventSuccess', 'Situation maîtrisée !') : t('events.countryEventFailed', 'Conséquences locales...'),
        result === 'success' ? 'success' : 'danger'
      );
    }
    
    if (result === 'success' && countryEvent?.pyramidEffect) {
      onPyramidScoreChange(currentPlayer.id, countryEvent.pyramidEffect);
    }
    
    // If player has family status, go to family event phase
    if (currentPlayer.familyStatus) {
      setPhase('family_event');
    } else {
      setPhase('action_selection');
    }
    onPhaseComplete('country_event', { event: countryEvent, choice, result });
  };

  const handleFamilyEventChoice = (choice: FamilyEventChoice | null, effects: Partial<GameResources>) => {
    const newResources = { ...currentPlayer.resources };
    
    // Apply family event effects
    Object.entries(effects).forEach(([resource, change]) => {
      const key = resource as ResourceType;
      if (newResources[key] !== undefined) {
        newResources[key] = Math.max(0, Math.min(10, newResources[key] + (change as number)));
      }
    });
    
    onResourceChange(currentPlayer.id, newResources);
    
    // Update family status if event changes it
    if (familyEvent?.newStatus && onFamilyStatusChange) {
      onFamilyStatusChange(currentPlayer.id, familyEvent.newStatus);
    }
    
    setPhase('action_selection');
    onPhaseComplete('family_event', { event: familyEvent, choice });
    setFamilyEvent(null);
  };

  const handleSkipFamilyEvent = () => {
    // Apply recurring family costs
    if (currentPlayer.familyStatus) {
      const costs = calculateFamilyMonthlyCosts(currentPlayer.familyStatus);
      const newResources = { ...currentPlayer.resources };
      
      Object.entries(costs).forEach(([resource, cost]) => {
        const key = resource as ResourceType;
        if (newResources[key] !== undefined) {
          newResources[key] = Math.max(0, newResources[key] - (cost as number));
        }
      });
      
      onResourceChange(currentPlayer.id, newResources);
    }
    
    setPhase('action_selection');
    onPhaseComplete('family_event', null);
    setFamilyEvent(null);
  };

  const handleActionSelect = (action: GameAction) => {
    setSelectedAction(action);
  };

  const canAffordAction = (action: GameAction): boolean => {
    if (action.requirements) {
      for (const [resource, required] of Object.entries(action.requirements)) {
        if (currentPlayer.resources[resource as ResourceType] < required) {
          return false;
        }
      }
    }
    for (const [resource, cost] of Object.entries(action.costs)) {
      if (currentPlayer.resources[resource as ResourceType] < cost) {
        return false;
      }
    }
    return true;
  };

  const executeAction = (action: GameAction) => {
    const newResources = { ...currentPlayer.resources };
    
    // Apply costs
    Object.entries(action.costs).forEach(([resource, cost]) => {
      const key = resource as ResourceType;
      newResources[key] = Math.max(0, newResources[key] - cost);
    });
    
    // Check for risk
    let success = true;
    if (action.riskChance && Math.random() < action.riskChance) {
      success = false;
      // Apply risk penalty
      if (action.riskPenalty) {
        Object.entries(action.riskPenalty).forEach(([resource, penalty]) => {
          const key = resource as ResourceType;
          newResources[key] = Math.max(0, newResources[key] - penalty);
        });
      }
    } else {
      // Apply gains
      Object.entries(action.gains).forEach(([resource, gain]) => {
        const key = resource as ResourceType;
        newResources[key] = Math.min(10, newResources[key] + gain);
      });
      
      // Apply pyramid effects
      if (action.pyramidEffect) {
        onPyramidScoreChange(currentPlayer.id, action.pyramidEffect);
      }
    }
    
    onResourceChange(currentPlayer.id, newResources);
    setActionResult(success ? 'success' : 'failed');
    setPhase('action_resolution');
    onPhaseComplete('action_selection', { action, success });
  };

  const handleActionConfirm = () => {
    if (!selectedAction || !canAffordAction(selectedAction)) return;
    executeAction(selectedAction);
  };

  const handleContinueToBoard = () => {
    setPhase('board_move');
    onPhaseComplete('action_resolution');
  };

  const handleEndTurn = () => {
    // Reset state for next turn
    setGlobalEvent(null);
    setCountryEvent(null);
    setFamilyEvent(null);
    setSelectedAction(null);
    setActionResult(null);
    setPhase('global_event');
    onTurnEnd();
  };

  // Define phases for progress indicator
  const allPhases: TurnPhase[] = currentPlayer.familyStatus 
    ? ['global_event', 'country_event', 'family_event', 'action_selection', 'board_move']
    : ['global_event', 'country_event', 'action_selection', 'board_move'];

  return (
    <div className="space-y-6">
      {/* Turn Header */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="font-semibold">
                {t('turnManager.year', { year: turnNumber })}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {t(`turnManager.phases.${phase}`)}
            </div>
          </div>
          
          {/* Phase progress */}
          <div className="flex gap-1">
            {allPhases.map((p, i) => (
              <div
                key={p}
                className={cn(
                  "w-3 h-3 rounded-full transition-all",
                  phase === p ? "bg-primary scale-125" :
                  i < allPhases.indexOf(phase) 
                    ? "bg-primary/50" : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Current Player Resources */}
      <ResourceBar 
        resources={currentPlayer.resources}
        showLabels
      />

      {/* Phase Content */}
      {phase === 'global_event' && globalEvent && (
        <div className="animate-scale-in">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-cyan-500" />
            <h3 className="font-semibold">{t('turnManager.globalEvent')}</h3>
          </div>
          <EventCardWithChoices 
            event={globalEvent} 
            onChoiceSelect={handleGlobalEventChoice}
          />
        </div>
      )}

      {phase === 'country_event' && (
        <div className="animate-scale-in">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold">{t('turnManager.countryEvent')}</h3>
          </div>
          {countryEvent ? (
            <EventCardWithChoices 
              event={countryEvent} 
              onChoiceSelect={handleCountryEventChoice}
            />
          ) : (
            <div className="glass-card rounded-xl p-6 text-center text-muted-foreground">
              <p className="mb-4">{t('turnManager.noCountryEvent')}</p>
              <Button onClick={() => {
                if (currentPlayer.familyStatus) {
                  setPhase('family_event');
                } else {
                  setPhase('action_selection');
                }
                onPhaseComplete('country_event', null);
              }} className="gap-2">
                {t('turnManager.continue')}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Family Event Phase */}
      {phase === 'family_event' && (
        <div className="animate-scale-in">
          <div className="flex items-center gap-2 mb-4">
            <Home className="w-5 h-5 text-rose-500" />
            <h3 className="font-semibold">{t('turnManager.familyEvent', 'Événement Familial')}</h3>
            {currentPlayer.familyStatus && (
              <span className="text-xs px-2 py-1 rounded-full bg-rose-500/20 text-rose-400">
                {FAMILY_STATUS_LABELS[currentPlayer.familyStatus]?.icon} {t(FAMILY_STATUS_LABELS[currentPlayer.familyStatus]?.label, currentPlayer.familyStatus)}
              </span>
            )}
          </div>
          {familyEvent ? (
            <FamilyEventCard 
              event={familyEvent} 
              onChoice={handleFamilyEventChoice}
            />
          ) : (
            <div className="glass-card rounded-xl p-6 text-center">
              <p className="text-muted-foreground mb-4">
                {t('turnManager.noFamilyEvent', 'Pas d\'événement familial ce tour-ci.')}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {t('turnManager.familyCostsContinue', 'Les responsabilités familiales récurrentes sont appliquées.')}
              </p>
              <Button onClick={handleSkipFamilyEvent} className="gap-2">
                {t('turnManager.continue')}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {phase === 'action_selection' && (
        <div className="animate-scale-in">
          <ActionPanel
            resources={currentPlayer.resources}
            countryType={currentPlayer.countryType}
            onSelectAction={(action, success) => {
              setSelectedAction(action);
              setActionResult(success ? 'success' : 'failed');
              
              // Track the action
              onTrackAction?.(success);
              
              // Apply action effects
              const newResources = { ...currentPlayer.resources };
              let moneyChange = 0;
              let healthChange = 0;
              
              Object.entries(action.costs).forEach(([resource, cost]) => {
                newResources[resource as ResourceType] = Math.max(0, newResources[resource as ResourceType] - cost);
                if (resource === 'money') moneyChange -= cost;
                if (resource === 'health') healthChange -= cost;
              });
              
              if (success) {
                Object.entries(action.gains).forEach(([resource, gain]) => {
                  newResources[resource as ResourceType] = Math.min(10, newResources[resource as ResourceType] + gain);
                  if (resource === 'money') moneyChange += gain;
                  if (resource === 'health') healthChange += gain;
                });
                if (action.pyramidEffect) {
                  onPyramidScoreChange(currentPlayer.id, action.pyramidEffect);
                }
              } else if (action.riskPenalty) {
                Object.entries(action.riskPenalty).forEach(([resource, penalty]) => {
                  newResources[resource as ResourceType] = Math.max(0, newResources[resource as ResourceType] - penalty);
                  if (resource === 'money') moneyChange -= penalty;
                  if (resource === 'health') healthChange -= penalty;
                });
              }
              
              onResourceChange(currentPlayer.id, newResources);
              setPhase('action_resolution');
              onPhaseComplete('action_selection', { action, success });
            }}
            onRiskEvent={(event, outcome, effects) => {
              // Calculate money and health changes for tracking
              let moneyChange = 0;
              let healthChange = 0;
              
              // Apply risk event effects
              const newResources = { ...currentPlayer.resources };
              Object.entries(effects).forEach(([resource, change]) => {
                newResources[resource as ResourceType] = Math.max(0, Math.min(10, 
                  newResources[resource as ResourceType] + (change as number)
                ));
                if (resource === 'money') moneyChange = change as number;
                if (resource === 'health') healthChange = change as number;
              });
              
              // Track the risk outcome
              onTrackRisk?.(outcome, moneyChange, healthChange);
              
              onResourceChange(currentPlayer.id, newResources);
              setActionResult(outcome === 'success' ? 'success' : 'failed');
              setPhase('action_resolution');
              onPhaseComplete('action_selection', { event, outcome });
            }}
            usedMajorAction={selectedAction?.type === 'major'}
            usedMinorActions={0}
          />
        </div>
      )}

      {phase === 'action_resolution' && selectedAction && (
        <div className="animate-scale-in">
          <div className={cn(
            "glass-card rounded-xl p-6 text-center",
            actionResult === 'success' ? "border-emerald-500/50" : "border-rose-500/50"
          )}>
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
              actionResult === 'success' ? "bg-emerald-500/20" : "bg-rose-500/20"
            )}>
              <span className="text-3xl">
                {actionResult === 'success' ? selectedAction.icon : '❌'}
              </span>
            </div>
            <h3 className="font-semibold text-xl mb-2">
              {actionResult === 'success' 
                ? t('turnManager.actionSuccess')
                : t('turnManager.actionFailed')
              }
            </h3>
            <p className="text-muted-foreground">
              {t(selectedAction.description)}
            </p>
            {actionResult === 'failed' && selectedAction.riskPenalty && (
              <div className="mt-4 flex items-center justify-center gap-2 text-rose-500">
                <AlertTriangle className="w-4 h-4" />
                <span>{t('turnManager.riskPenalty')}</span>
              </div>
            )}
          </div>
          <Button onClick={handleContinueToBoard} className="w-full mt-4 gap-2">
            {t('turnManager.continueToBoard')}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {phase === 'board_move' && (
        <div className="animate-scale-in text-center">
          <p className="text-muted-foreground mb-4">
            {t('turnManager.rollDicePrompt')}
          </p>
        </div>
      )}

      {/* Visual Feedback Components */}
      {resourceChanges.length > 0 && (
        <GameVisualFeedback
          resourceChanges={resourceChanges}
          onComplete={() => setResourceChanges([])}
          position="top-right"
        />
      )}
      
      {showOutcome && (
        <OutcomeAnimation
          outcome={showOutcome}
          onComplete={() => setShowOutcome(null)}
        />
      )}
      
      {notification && (
        <FloatingNotification
          icon={notification.icon}
          text={notification.text}
          variant={notification.variant}
          onComplete={() => setNotification(null)}
        />
      )}
    </div>
  );
}
