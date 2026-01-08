import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { GameResources, GameAction, GAME_ACTIONS, ResourceType, RESOURCE_INFO, RiskEvent, getRandomRiskEvent } from '@/lib/game-data';
import { PyramidType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { AlertTriangle, Check, X, Zap, Skull } from 'lucide-react';
import RiskEventCard from './RiskEventCard';

interface ActionPanelProps {
  resources: GameResources;
  countryType: PyramidType;
  onSelectAction: (action: GameAction, success: boolean) => void;
  onRiskEvent?: (event: RiskEvent, outcome: 'success' | 'failure' | 'catastrophic', effects: Partial<GameResources>) => void;
  usedMajorAction: boolean;
  usedMinorActions: number;
  maxMinorActions?: number;
}

export default function ActionPanel({
  resources,
  countryType,
  onSelectAction,
  onRiskEvent,
  usedMajorAction,
  usedMinorActions,
  maxMinorActions = 2,
}: ActionPanelProps) {
  const { t } = useTranslation();
  const [selectedAction, setSelectedAction] = useState<GameAction | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [riskEvent, setRiskEvent] = useState<RiskEvent | null>(null);
  const [showRiskEvent, setShowRiskEvent] = useState(false);

  const canAfford = (action: GameAction): boolean => {
    if (action.requirements) {
      for (const [resource, required] of Object.entries(action.requirements)) {
        if (resources[resource as ResourceType] < required) return false;
      }
    }
    for (const [resource, cost] of Object.entries(action.costs)) {
      if (resources[resource as ResourceType] < cost) return false;
    }
    return true;
  };

  const canUseAction = (action: GameAction): boolean => {
    if (action.type === 'major' && usedMajorAction) return false;
    if (action.type === 'minor' && usedMinorActions >= maxMinorActions) return false;
    return canAfford(action);
  };

  const handleConfirm = () => {
    if (!selectedAction) return;
    
    // Check if this is a shortcut action
    if (selectedAction.isShortcut) {
      // Generate a risk event
      const event = getRandomRiskEvent(countryType);
      if (event) {
        setRiskEvent(event);
        setConfirmOpen(false);
        setShowRiskEvent(true);
        return;
      }
    }
    
    // Calculate success based on risk
    let success = true;
    if (selectedAction.riskChance && selectedAction.riskChance > 0) {
      success = Math.random() > selectedAction.riskChance;
    }
    
    onSelectAction(selectedAction, success);
    setConfirmOpen(false);
    setSelectedAction(null);
  };

  const handleRiskResolve = (
    outcome: 'success' | 'failure' | 'catastrophic', 
    effects: Partial<GameResources>
  ) => {
    if (riskEvent && onRiskEvent) {
      onRiskEvent(riskEvent, outcome, effects);
    }
    setShowRiskEvent(false);
    setRiskEvent(null);
    setSelectedAction(null);
  };

  const handleRiskDecline = () => {
    // Player declined the risk, treat as a normal failed action with minor penalty
    if (selectedAction) {
      onSelectAction(selectedAction, false);
    }
    setShowRiskEvent(false);
    setRiskEvent(null);
    setSelectedAction(null);
  };

  const majorActions = GAME_ACTIONS.filter(a => a.type === 'major' && !a.isShortcut);
  const shortcutActions = GAME_ACTIONS.filter(a => a.isShortcut);
  const minorActions = GAME_ACTIONS.filter(a => a.type === 'minor');

  const renderResourceChange = (costs: Partial<GameResources>, gains: Partial<GameResources>) => {
    const changes: { resource: ResourceType; change: number }[] = [];
    
    Object.entries(costs).forEach(([resource, value]) => {
      changes.push({ resource: resource as ResourceType, change: -(value || 0) });
    });
    
    Object.entries(gains).forEach(([resource, value]) => {
      const existing = changes.find(c => c.resource === resource);
      if (existing) {
        existing.change += (value || 0);
      } else {
        changes.push({ resource: resource as ResourceType, change: value || 0 });
      }
    });

    return (
      <div className="flex flex-wrap gap-2">
        {changes.filter(c => c.change !== 0).map(({ resource, change }) => (
          <span 
            key={resource}
            className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              change > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
            )}
          >
            {RESOURCE_INFO[resource].icon} {change > 0 ? '+' : ''}{change}
          </span>
        ))}
      </div>
    );
  };

  // Show risk event card if triggered
  if (showRiskEvent && riskEvent) {
    return (
      <RiskEventCard
        event={riskEvent}
        onResolve={handleRiskResolve}
        onDecline={handleRiskDecline}
        canAfford={true}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Major Actions */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <span className="text-lg">🎯</span>
          {t('actions.majorTitle')}
          {usedMajorAction && (
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
              {t('actions.used')}
            </span>
          )}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {majorActions.map(action => {
            const canUse = canUseAction(action);
            return (
              <button
                key={action.id}
                onClick={() => {
                  setSelectedAction(action);
                  setConfirmOpen(true);
                }}
                disabled={!canUse}
                className={cn(
                  "p-3 rounded-lg border text-left transition-all",
                  canUse 
                    ? "border-border hover:border-primary/50 hover:bg-primary/5" 
                    : "border-border/50 opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{action.icon}</span>
                  <span className="font-medium text-sm">{t(action.label)}</span>
                  {action.riskChance && action.riskChance > 0 && (
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                  )}
                </div>
                {renderResourceChange(action.costs, action.gains)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Shortcut Actions (Dangerous) */}
      {shortcutActions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Skull className="w-4 h-4 text-red-400" />
            <span className="text-red-400">{t('actions.shortcutTitle')}</span>
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
              {t('actions.dangerous')}
            </span>
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {shortcutActions.map(action => {
              const canUse = canUseAction(action);
              return (
                <button
                  key={action.id}
                  onClick={() => {
                    setSelectedAction(action);
                    setConfirmOpen(true);
                  }}
                  disabled={!canUse}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all",
                    canUse 
                      ? "border-red-500/30 hover:border-red-500/50 hover:bg-red-500/5 bg-red-500/10" 
                      : "border-border/50 opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{action.icon}</span>
                    <span className="font-medium text-sm text-red-400">{t(action.label)}</span>
                    <Zap className="w-3 h-3 text-red-400" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {t(action.description)}
                  </p>
                  {renderResourceChange(action.costs, action.gains)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Minor Actions */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <span className="text-lg">⚡</span>
          {t('actions.minorTitle')}
          <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
            {usedMinorActions}/{maxMinorActions}
          </span>
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {minorActions.map(action => {
            const canUse = canUseAction(action);
            return (
              <button
                key={action.id}
                onClick={() => {
                  setSelectedAction(action);
                  setConfirmOpen(true);
                }}
                disabled={!canUse}
                className={cn(
                  "p-3 rounded-lg border text-left transition-all",
                  canUse 
                    ? "border-border hover:border-primary/50 hover:bg-primary/5" 
                    : "border-border/50 opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{action.icon}</span>
                  <span className="font-medium text-sm">{t(action.label)}</span>
                </div>
                {renderResourceChange(action.costs, action.gains)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedAction?.icon}</span>
              {selectedAction && t(selectedAction.label)}
            </DialogTitle>
          </DialogHeader>
          
          {selectedAction && (
            <div className="space-y-4 mt-4">
              <p className="text-muted-foreground text-sm">
                {t(selectedAction.description)}
              </p>
              
              <div className="glass-card rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <X className="w-4 h-4 text-rose-400" />
                  <span className="text-sm font-medium">{t('actions.costs')}:</span>
                  <div className="flex gap-2">
                    {Object.entries(selectedAction.costs).map(([resource, value]) => (
                      <span key={resource} className="text-sm">
                        {RESOURCE_INFO[resource as ResourceType].icon} -{value}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium">{t('actions.gains')}:</span>
                  <div className="flex gap-2">
                    {Object.entries(selectedAction.gains).map(([resource, value]) => (
                      <span key={resource} className="text-sm">
                        {RESOURCE_INFO[resource as ResourceType].icon} +{value}
                      </span>
                    ))}
                  </div>
                </div>
                
                {selectedAction.isShortcut && (
                  <div className="flex items-start gap-2 text-red-400 bg-red-500/10 p-3 rounded-lg">
                    <Skull className="w-4 h-4 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium mb-1">{t('actions.shortcutWarning')}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('actions.shortcutExplain')}
                      </p>
                    </div>
                  </div>
                )}
                
                {selectedAction.riskChance && selectedAction.riskChance > 0 && !selectedAction.isShortcut && (
                  <div className="flex items-center gap-2 text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">
                      {t('actions.riskWarning', { chance: Math.round(selectedAction.riskChance * 100) })}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setConfirmOpen(false)} className="flex-1">
                  {t('common.back')}
                </Button>
                <Button 
                  onClick={handleConfirm} 
                  className={cn(
                    "flex-1",
                    selectedAction.isShortcut && "bg-red-600 hover:bg-red-700"
                  )}
                >
                  {selectedAction.isShortcut ? t('actions.takeRisk') : t('actions.confirm')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
