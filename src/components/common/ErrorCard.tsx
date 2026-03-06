import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';

interface ErrorCardProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  variant?: 'error' | 'warning' | 'info';
  className?: string;
}

/**
 * Unified error card component for consistent error display
 * Use for API failures, load errors, or any error state
 */
export function ErrorCard({
  title = 'Une erreur est survenue',
  message = 'Impossible de charger les données. Veuillez réessayer.',
  onRetry,
  showHomeButton = false,
  showBackButton = false,
  variant = 'error',
  className,
}: ErrorCardProps) {
  const navigate = useNavigate();

  const variantStyles = {
    error: 'border-destructive/30 bg-destructive/5',
    warning: 'border-amber-500/30 bg-secondary/50',
    info: 'border-primary/30 bg-primary/5',
  };

  const iconColors = {
    error: 'text-destructive',
    warning: 'text-amber-500',
    info: 'text-primary',
  };

  return (
    <Card className={cn('glass-card', variantStyles[variant], className)}>
      <CardContent className="p-6 text-center">
        <div className={cn('w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center', 
          variant === 'error' ? 'bg-destructive/10' : 
          variant === 'warning' ? 'bg-secondary' : 'bg-primary/10'
        )}>
          <AlertTriangle className={cn('w-6 h-6', iconColors[variant])} />
        </div>
        
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          {message}
        </p>
        
        <div className="flex flex-wrap gap-3 justify-center">
          {onRetry && (
            <Button onClick={onRetry} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </Button>
          )}
          {showBackButton && (
            <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
          )}
          {showHomeButton && (
            <Button variant="outline" onClick={() => navigate('/')} className="gap-2">
              <Home className="w-4 h-4" />
              Accueil
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ErrorCard;
