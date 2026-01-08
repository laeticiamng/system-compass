import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { FamilyEvent, FamilyEventChoice } from '@/lib/family-system';
import { GameResources, ResourceType } from '@/lib/game-data';
import { cn } from '@/lib/utils';
import { Heart, AlertTriangle, HelpCircle, ChevronRight } from 'lucide-react';

interface FamilyEventCardProps {
  event: FamilyEvent;
  onChoice: (choice: FamilyEventChoice | null, effects: Partial<GameResources>) => void;
}

export default function FamilyEventCard({ event, onChoice }: FamilyEventCardProps) {
  const { t } = useTranslation();
  const [selectedChoice, setSelectedChoice] = useState<FamilyEventChoice | null>(null);

  const getEventTypeColor = (type: FamilyEvent['type']) => {
    switch (type) {
      case 'positive': return 'border-emerald-500/50 bg-emerald-500/5';
      case 'negative': return 'border-rose-500/50 bg-rose-500/5';
      case 'neutral': return 'border-amber-500/50 bg-amber-500/5';
    }
  };

  const getEventTypeIcon = (type: FamilyEvent['type']) => {
    switch (type) {
      case 'positive': return <Heart className="w-5 h-5 text-emerald-500" />;
      case 'negative': return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      case 'neutral': return <HelpCircle className="w-5 h-5 text-amber-500" />;
    }
  };

  const formatEffect = (effect: Partial<GameResources>) => {
    return Object.entries(effect)
      .filter(([_, value]) => value !== 0)
      .map(([resource, value]) => {
        const sign = (value as number) > 0 ? '+' : '';
        const resourceLabel = t(`resources.${resource}`, resource);
        return `${sign}${value} ${resourceLabel}`;
      })
      .join(', ');
  };

  const handleContinue = () => {
    if (event.choices && event.choices.length > 0) {
      if (!selectedChoice) return;
      // Combine base effect with choice effect
      const combinedEffect = { ...event.effect };
      Object.entries(selectedChoice.effect).forEach(([key, value]) => {
        const resourceKey = key as ResourceType;
        combinedEffect[resourceKey] = (combinedEffect[resourceKey] || 0) + (value as number);
      });
      onChoice(selectedChoice, combinedEffect);
    } else {
      onChoice(null, event.effect);
    }
  };

  return (
    <div className={cn(
      "glass-card rounded-xl p-6 border-2 animate-scale-in",
      getEventTypeColor(event.type)
    )}>
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="text-4xl">{event.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {getEventTypeIcon(event.type)}
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Événement Familial
            </span>
          </div>
          <h3 className="font-display text-xl font-bold">
            {t(event.label, event.label.split('.').pop())}
          </h3>
        </div>
      </div>

      {/* Description */}
      <p className="text-muted-foreground mb-4">
        {t(event.description, event.description.split('.').pop())}
      </p>

      {/* Base Effect */}
      {Object.keys(event.effect).length > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-muted/50">
          <span className="text-sm font-medium">Impact : </span>
          <span className="text-sm">{formatEffect(event.effect)}</span>
        </div>
      )}

      {/* New Status if applicable */}
      {event.newStatus && (
        <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <span className="text-sm font-medium text-primary">
            Nouveau statut : {t(`familyStatus.${event.newStatus}`, event.newStatus)}
          </span>
        </div>
      )}

      {/* Choices if available */}
      {event.choices && event.choices.length > 0 && (
        <div className="space-y-3 mb-4">
          <p className="text-sm font-medium">Que faites-vous ?</p>
          {event.choices.map((choice) => (
            <button
              key={choice.id}
              onClick={() => setSelectedChoice(choice)}
              className={cn(
                "w-full text-left p-4 rounded-lg border-2 transition-all",
                selectedChoice?.id === choice.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="font-medium mb-1">{choice.label}</div>
              <div className="text-sm text-muted-foreground mb-2">{choice.description}</div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{formatEffect(choice.effect)}</span>
                <span className="text-primary italic">{choice.consequence}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Continue Button */}
      <Button 
        onClick={handleContinue} 
        className="w-full gap-2"
        disabled={event.choices && event.choices.length > 0 && !selectedChoice}
      >
        {event.choices && event.choices.length > 0 ? 'Confirmer mon choix' : 'Continuer'}
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
