import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

import { cn } from '@/lib/utils';

interface NextStep {
  label: string;
  description: string;
  href: string;
  icon?: React.ReactNode;
  primary?: boolean;
}

interface NextStepSuggestionProps {
  title?: string;
  steps: NextStep[];
  className?: string;
}

export function NextStepSuggestion({ title, steps, className }: NextStepSuggestionProps) {
  const { t } = useTranslation();
  
  if (steps.length === 0) return null;

  return (
    <div className={cn("glass-card rounded-xl p-6 border-primary/20", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-primary">
          {title || t('common.nextSteps', 'Prochaines étapes suggérées')}
        </h3>
      </div>
      
      <div className="space-y-3">
        {steps.map((step, index) => (
          <Link
            key={index}
            to={step.href}
            className={cn(
              "flex items-center justify-between p-4 rounded-lg transition-all group",
              step.primary 
                ? "bg-primary/10 border border-primary/20 hover:bg-primary/20" 
                : "bg-muted/50 hover:bg-muted"
            )}
          >
            <div className="flex items-center gap-3">
              {step.icon && (
                <div className={cn(
                  "p-2 rounded-lg",
                  step.primary ? "bg-primary/20" : "bg-background"
                )}>
                  {step.icon}
                </div>
              )}
              <div>
                <p className={cn(
                  "font-medium text-sm",
                  step.primary && "text-primary"
                )}>
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
            <ArrowRight className={cn(
              "w-4 h-4 transition-transform group-hover:translate-x-1",
              step.primary ? "text-primary" : "text-muted-foreground"
            )} />
          </Link>
        ))}
      </div>
    </div>
  );
}
