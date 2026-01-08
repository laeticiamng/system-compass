import { Check, User, BarChart3, Key } from 'lucide-react';
import { cn } from '@/lib/utils';

export type JourneyPhase = 'profile' | 'options' | 'keys';

interface JourneyProgressBarProps {
  currentPhase: JourneyPhase;
  className?: string;
}

const PHASES = [
  { id: 'profile' as const, label: 'Ton profil', icon: User },
  { id: 'options' as const, label: 'Tes options', icon: BarChart3 },
  { id: 'keys' as const, label: 'Tes clés', icon: Key },
];

export function JourneyProgressBar({ currentPhase, className }: JourneyProgressBarProps) {
  const currentIndex = PHASES.findIndex(p => p.id === currentPhase);
  
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between relative">
        {/* Progress line background */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />
        
        {/* Progress line active */}
        <div 
          className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-500"
          style={{ width: `${(currentIndex / (PHASES.length - 1)) * 100}%` }}
        />
        
        {/* Steps */}
        {PHASES.map((phase, index) => {
          const Icon = phase.icon;
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;
          
          return (
            <div 
              key={phase.id} 
              className="flex flex-col items-center relative z-10"
            >
              {/* Circle */}
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                  isCompleted && "bg-primary text-primary-foreground",
                  isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                  isPending && "bg-muted text-muted-foreground border border-border"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              
              {/* Label */}
              <span 
                className={cn(
                  "text-xs mt-2 font-medium transition-colors whitespace-nowrap",
                  isCurrent && "text-primary",
                  isCompleted && "text-foreground",
                  isPending && "text-muted-foreground"
                )}
              >
                {phase.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper to determine phase from ExitKeys step
export function getJourneyPhase(step: string): JourneyPhase {
  if (step === 'origin' || step === 'current' || step === 'profile') {
    return 'profile';
  }
  if (step === 'goals') {
    return 'options';
  }
  return 'keys';
}
