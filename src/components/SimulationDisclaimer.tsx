import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimulationDisclaimerProps {
  variant?: 'minimal' | 'compact' | 'inline';
  className?: string;
}

export function SimulationDisclaimer({ 
  variant = 'minimal', 
  className 
}: SimulationDisclaimerProps) {
  if (variant === 'inline') {
    return (
      <span className={cn("text-xs text-muted-foreground/60", className)}>
        Simulation à but informatif uniquement.{' '}
        <Link to="/disclaimer" className="text-primary/60 hover:text-primary hover:underline">
          Limites
        </Link>
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn(
        "flex items-center gap-2 text-xs text-muted-foreground/70 px-3 py-1.5 rounded-lg bg-muted/30 border border-border/30",
        className
      )}>
        <Info className="w-3 h-3 shrink-0" />
        <span>
          Outil d'analyse — pas de conseil.{' '}
          <Link to="/disclaimer" className="text-primary/70 hover:text-primary hover:underline">
            En savoir plus
          </Link>
        </span>
      </div>
    );
  }

  // minimal (default)
  return (
    <p className={cn("text-xs text-muted-foreground/50 text-center", className)}>
      📊 Simulation uniquement • 
      <Link to="/disclaimer" className="text-primary/50 hover:text-primary hover:underline ml-1">
        Voir les limites
      </Link>
    </p>
  );
}
