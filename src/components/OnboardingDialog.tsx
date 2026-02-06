import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Compass, 
  Target, 
  TrendingUp, 
  Calculator, 
  Gamepad2, 
  ArrowRight, 
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { useDialogCoordinator } from './DialogCoordinator';

interface OnboardingStep {
  icon: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
  color: string;
}

const steps: OnboardingStep[] = [
  {
    icon: <Compass className="w-12 h-12" />,
    titleKey: 'onboarding.step1.title',
    descriptionKey: 'onboarding.step1.description',
    color: 'text-primary'
  },
  {
    icon: <Target className="w-12 h-12" />,
    titleKey: 'onboarding.step2.title',
    descriptionKey: 'onboarding.step2.description',
    color: 'text-emerald-500'
  },
  {
    icon: <Calculator className="w-12 h-12" />,
    titleKey: 'onboarding.step3.title',
    descriptionKey: 'onboarding.step3.description',
    color: 'text-blue-500'
  },
  {
    icon: <TrendingUp className="w-12 h-12" />,
    titleKey: 'onboarding.step4.title',
    descriptionKey: 'onboarding.step4.description',
    color: 'text-purple-500'
  },
  {
    icon: <Gamepad2 className="w-12 h-12" />,
    titleKey: 'onboarding.step5.title',
    descriptionKey: 'onboarding.step5.description',
    color: 'text-amber-500'
  }
];

export function OnboardingDialog() {
  const { t } = useTranslation();
  const { shouldShowOnboarding, completeOnboarding } = useDialogCoordinator();
  const [currentStep, setCurrentStep] = useState(0);

  const handleComplete = () => {
    completeOnboarding();
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const step = steps[currentStep];

  return (
    <Dialog open={shouldShowOnboarding} onOpenChange={handleSkip}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`p-4 rounded-full bg-muted ${step.color}`}>
              {step.icon}
            </div>
          </div>
          <DialogTitle className="text-xl">
            {t(step.titleKey, step.titleKey)}
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            {t(step.descriptionKey, step.descriptionKey)}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Progress value={progress} className="h-2" />
          <p className="text-center text-sm text-muted-foreground mt-2">
            {currentStep + 1} / {steps.length}
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 pb-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              aria-label={t('onboarding.goToStep', { step: index + 1, defaultValue: `Aller à l'étape ${index + 1}` })}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentStep 
                  ? 'bg-primary scale-125' 
                  : index < currentStep 
                    ? 'bg-primary/50' 
                    : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground"
          >
            {t('common.skip', 'Skip')}
          </Button>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                size="icon"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <Button onClick={handleNext} className="gap-2">
              {currentStep === steps.length - 1 ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  {t('common.start', 'Start')}
                </>
              ) : (
                <>
                  {t('common.next', 'Next')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
