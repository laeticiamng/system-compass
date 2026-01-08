import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { 
  GameEvent, 
  GameResources, 
  GameAction, 
  GAME_ACTIONS,
  getRandomGlobalEvent,
  getRandomCountryEvent,
  CharacterCard,
  ResourceType
} from '@/lib/game-data';
import { PyramidType } from '@/lib/types';
import { cn } from '@/lib/utils';
import EventCard from './EventCard';
import ResourceBar from './ResourceBar';
import ActionPanel from './ActionPanel';
import { 
  Play, 
  Calendar, 
  Globe, 
  MapPin,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';

export type TurnPhase = 
  | 'global_event'
  | 'country_event' 
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
  };
  turnNumber: number;
  onResourceChange: (playerId: number, resources: GameResources) => void;
  onPyramidScoreChange: (playerId: number, pyramidChanges: Partial<Record<PyramidType, number>>) => void;
  onPhaseComplete: (phase: TurnPhase, data?: any) => void;
  onTurnEnd: () => void;
  onTrackRisk?: (outcome: 'success' | 'failure' | 'catastrophic', moneyChange: number, healthChange: number) => void;
  onTrackAction?: (success: boolean) => void;
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
}: TurnManagerProps) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<TurnPhase>('global_event');
  const [globalEvent, setGlobalEvent] = useState<GameEvent | null>(null);
  const [countryEvent, setCountryEvent] = useState<GameEvent | null>(null);
  const [eventApplied, setEventApplied] = useState(false);
  const [selectedAction, setSelectedAction] = useState<GameAction | null>(null);
  const [actionResult, setActionResult] = useState<'success' | 'failed' | null>(null);

  // Generate events at start of turn
  useEffect(() => {
    if (phase === 'global_event' && !globalEvent) {
      setGlobalEvent(getRandomGlobalEvent());
    }
  }, [phase, globalEvent]);

  useEffect(() => {
    if (phase === 'country_event' && !countryEvent) {
      setCountryEvent(getRandomCountryEvent(currentPlayer.countryType));
    }
  }, [phase, countryEvent, currentPlayer.countryType]);

  const applyEventEffects = (event: GameEvent) => {
    const newResources = { ...currentPlayer.resources };
    
    // Apply resource changes
    Object.entries(event.effect).forEach(([resource, change]) => {
      const key = resource as ResourceType;
      newResources[key] = Math.max(0, Math.min(10, newResources[key] + change));
    });
    
    onResourceChange(currentPlayer.id, newResources);
    
    // Apply pyramid changes
    if (event.pyramidEffect) {
      onPyramidScoreChange(currentPlayer.id, event.pyramidEffect);
    }
    
    setEventApplied(true);
  };

  const handleGlobalEventContinue = () => {
    if (globalEvent && !eventApplied) {
      applyEventEffects(globalEvent);
    }
    setEventApplied(false);
    setPhase('country_event');
    onPhaseComplete('global_event', globalEvent);
  };

  const handleCountryEventContinue = () => {
    if (countryEvent && !eventApplied) {
      applyEventEffects(countryEvent);
    }
    setEventApplied(false);
    setPhase('action_selection');
    onPhaseComplete('country_event', countryEvent);
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
    setSelectedAction(null);
    setActionResult(null);
    setPhase('global_event');
    onTurnEnd();
  };

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
            {(['global_event', 'country_event', 'action_selection', 'board_move'] as TurnPhase[]).map((p, i) => (
              <div
                key={p}
                className={cn(
                  "w-3 h-3 rounded-full transition-all",
                  phase === p ? "bg-primary scale-125" :
                  i < ['global_event', 'country_event', 'action_selection', 'board_move'].indexOf(phase) 
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
          <EventCard event={globalEvent} />
          <Button onClick={handleGlobalEventContinue} className="w-full mt-4 gap-2">
            {t('turnManager.continue')}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {phase === 'country_event' && (
        <div className="animate-scale-in">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold">{t('turnManager.countryEvent')}</h3>
          </div>
          {countryEvent ? (
            <EventCard event={countryEvent} />
          ) : (
            <div className="glass-card rounded-xl p-6 text-center text-muted-foreground">
              {t('turnManager.noCountryEvent')}
            </div>
          )}
          <Button onClick={handleCountryEventContinue} className="w-full mt-4 gap-2">
            {t('turnManager.continue')}
            <ChevronRight className="w-4 h-4" />
          </Button>
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
    </div>
  );
}
