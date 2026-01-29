import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  title: string;
  description: string;
  icon?: React.ReactNode;
  tip?: string;
}

interface ModuleOnboardingProps {
  moduleId: string;
  title: string;
  steps: OnboardingStep[];
  onComplete?: () => void;
}

const ONBOARDING_STORAGE_KEY = 'pyramid_onboarding_completed';

function getCompletedModules(): string[] {
  try {
    const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function markModuleCompleted(moduleId: string) {
  const completed = getCompletedModules();
  if (!completed.includes(moduleId)) {
    completed.push(moduleId);
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(completed));
  }
}

export function ModuleOnboarding({ moduleId, title, steps, onComplete }: ModuleOnboardingProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [dismissed, setDismissed] = useState(() => getCompletedModules().includes(moduleId));

  if (dismissed || steps.length === 0) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;

  const handleNext = () => {
    if (isLast) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    markModuleCompleted(moduleId);
    setDismissed(true);
    onComplete?.();
  };

  const handleDismiss = () => {
    markModuleCompleted(moduleId);
    setDismissed(true);
  };

  return (
    <div className="glass-card rounded-xl p-6 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent mb-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/20">
            <CheckCircle2 className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-primary">
            {t('onboarding.welcome', 'Bienvenue dans')} {title}
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 mb-4">
        {steps.map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-1 rounded-full transition-all",
              index === currentStep ? "w-8 bg-primary" : "w-2 bg-muted"
            )}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="mb-6">
        <div className="flex items-start gap-4">
          {step.icon && (
            <div className="p-3 rounded-xl bg-muted/50 flex-shrink-0">
              {step.icon}
            </div>
          )}
          <div>
            <h4 className="font-semibold mb-1">{step.title}</h4>
            <p className="text-sm text-muted-foreground">{step.description}</p>
            {step.tip && (
              <p className="text-xs text-primary mt-2 italic">💡 {step.tip}</p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrev}
          disabled={isFirst}
          className="gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('common.previous', 'Précédent')}
        </Button>

        <span className="text-xs text-muted-foreground">
          {currentStep + 1} / {steps.length}
        </span>

        <Button
          size="sm"
          onClick={handleNext}
          className="gap-1"
        >
          {isLast ? t('onboarding.start', 'Commencer') : t('common.next', 'Suivant')}
          {!isLast && <ChevronRight className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
