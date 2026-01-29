import { useTranslation } from 'react-i18next';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export type ValidationLevel = 'success' | 'warning' | 'error' | 'info';

export interface ValidationResult {
  id: string;
  level: ValidationLevel;
  message: string;
  field?: string;
  suggestion?: string;
}

interface ValidationFeedbackProps {
  results: ValidationResult[];
  onDismiss?: (id: string) => void;
  showProgress?: boolean;
  className?: string;
}

const levelConfig = {
  success: {
    icon: CheckCircle,
    color: 'text-risk-low',
    bgColor: 'bg-risk-low/10',
    borderColor: 'border-risk-low/30',
    label: 'validation.success',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    label: 'validation.warning',
  },
  error: {
    icon: AlertCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/30',
    label: 'validation.error',
  },
  info: {
    icon: Info,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
    label: 'validation.info',
  },
};

export function ValidationFeedback({
  results,
  onDismiss,
  showProgress = false,
  className,
}: ValidationFeedbackProps) {
  const { t } = useTranslation();

  if (results.length === 0) {
    return null;
  }

  const successCount = results.filter(r => r.level === 'success').length;
  const warningCount = results.filter(r => r.level === 'warning').length;
  const errorCount = results.filter(r => r.level === 'error').length;
  const progressValue = results.length > 0 
    ? (successCount / results.length) * 100 
    : 0;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Summary */}
      {showProgress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {t('validation.progress', 'Progression de la validation')}
            </span>
            <div className="flex gap-2">
              {errorCount > 0 && (
                <Badge variant="outline" className="text-destructive border-destructive/30 text-xs">
                  {errorCount} {t('validation.errors', 'erreurs')}
                </Badge>
              )}
              {warningCount > 0 && (
                <Badge variant="outline" className="text-amber-500 border-amber-500/30 text-xs">
                  {warningCount} {t('validation.warnings', 'avertissements')}
                </Badge>
              )}
              {successCount > 0 && (
                <Badge variant="outline" className="text-risk-low border-risk-low/30 text-xs">
                  {successCount} {t('validation.valid', 'valides')}
                </Badge>
              )}
            </div>
          </div>
          <Progress value={progressValue} className="h-1" />
        </div>
      )}

      {/* Individual results */}
      <div className="space-y-2">
        {results.map((result) => {
          const config = levelConfig[result.level];
          const Icon = config.icon;

          return (
            <div
              key={result.id}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border',
                config.bgColor,
                config.borderColor,
              )}
            >
              <Icon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', config.color)} />
              <div className="flex-1 min-w-0">
                {result.field && (
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {result.field}
                  </span>
                )}
                <p className="text-sm">{result.message}</p>
                {result.suggestion && (
                  <p className="text-xs text-muted-foreground mt-1">
                    💡 {result.suggestion}
                  </p>
                )}
              </div>
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={() => onDismiss(result.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper to create validation results
export function createValidationResult(
  level: ValidationLevel,
  message: string,
  options?: { field?: string; suggestion?: string }
): ValidationResult {
  return {
    id: crypto.randomUUID(),
    level,
    message,
    field: options?.field,
    suggestion: options?.suggestion,
  };
}
