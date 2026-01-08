import { useState, useEffect } from 'react';
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
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const ONBOARDING_KEY = 'pyramid-compass-onboarding-complete';

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
    color: 'text-green-500'
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
    color: 'text-orange-500'
  }
];

export function OnboardingDialog() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (!hasCompletedOnboarding) {
      // Delay slightly for better UX
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsOpen(false);
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
        <div className="flex justify-center gap-2 mb-4">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
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

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="ghost" 
            onClick={handleSkip}
            className="sm:mr-auto"
          >
            {t('onboarding.skip', 'Passer')}
          </Button>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                {t('onboarding.previous', 'Précédent')}
              </Button>
            )}
            
            <Button onClick={handleNext} className="gap-2">
              {currentStep === steps.length - 1 ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {t('onboarding.start', 'Commencer')}
                </>
              ) : (
                <>
                  {t('onboarding.next', 'Suivant')}
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

// Hook to reset onboarding (useful for testing)
export function useResetOnboarding() {
  return () => localStorage.removeItem(ONBOARDING_KEY);
}
