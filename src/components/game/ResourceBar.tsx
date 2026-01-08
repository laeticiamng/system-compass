import { GameResources, RESOURCE_INFO, ResourceType } from '@/lib/game-data';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ResourceBarProps {
  resources: GameResources;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ResourceBar({ 
  resources, 
  showLabels = false, 
  size = 'md',
  className 
}: ResourceBarProps) {
  const { t } = useTranslation();

  const sizeClasses = {
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
  };

  const barSizes = {
    sm: 'h-1.5 w-12',
    md: 'h-2 w-16',
    lg: 'h-2.5 w-20',
  };

  const iconSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <TooltipProvider>
      <div className={cn("flex flex-wrap", sizeClasses[size], className)}>
        {(Object.keys(resources) as ResourceType[]).map((resource) => {
          const info = RESOURCE_INFO[resource];
          const value = resources[resource];
          const percentage = (value / 10) * 100;
          
          return (
            <Tooltip key={resource}>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 cursor-help">
                  <span className={iconSizes[size]}>{info.icon}</span>
                  <div className={cn("bg-muted rounded-full overflow-hidden", barSizes[size])}>
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        value <= 2 ? "bg-rose-500" : value <= 5 ? "bg-amber-500" : "bg-emerald-500"
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className={cn("font-mono text-xs", info.color)}>{value}</span>
                  {showLabels && (
                    <span className="text-xs text-muted-foreground hidden md:inline">
                      {t(info.label)}
                    </span>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-semibold">{t(info.label)}: {value}/10</p>
                <p className="text-xs text-muted-foreground">{t(info.description)}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
