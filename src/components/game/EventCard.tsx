import { useTranslation } from 'react-i18next';
import { GameEvent, RESOURCE_INFO, ResourceType } from '@/lib/game-data';
import { cn } from '@/lib/utils';
import { Globe, MapPin } from 'lucide-react';

interface EventCardProps {
  event: GameEvent;
  onDismiss?: () => void;
  className?: string;
}

export default function EventCard({ event, onDismiss, className }: EventCardProps) {
  const { t } = useTranslation();

  const isGlobal = event.type === 'global';
  
  return (
    <div 
      className={cn(
        "glass-card rounded-xl p-6 border-2 animate-scale-in",
        isGlobal ? "border-cyan-500/50 bg-cyan-500/5" : "border-amber-500/50 bg-amber-500/5",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          "p-3 rounded-xl text-3xl",
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
          
          <p className="text-sm text-muted-foreground mb-4">
            {t(event.description)}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {Object.entries(event.effect).map(([resource, change]) => (
              <span 
                key={resource}
                className={cn(
                  "text-sm px-3 py-1 rounded-full flex items-center gap-1.5",
                  change > 0 
                    ? "bg-emerald-500/20 text-emerald-400" 
                    : "bg-rose-500/20 text-rose-400"
                )}
              >
                {RESOURCE_INFO[resource as ResourceType].icon}
                <span className="font-medium">
                  {change > 0 ? '+' : ''}{change}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="mt-4 w-full py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium"
        >
          {t('events.continue')}
        </button>
      )}
    </div>
  );
}
