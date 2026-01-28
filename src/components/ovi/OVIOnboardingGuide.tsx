import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Eye,
  Target,
  Layers,
  CheckCircle2,
  ArrowRight,
  X,
  Lightbulb,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OVIOnboardingGuideProps {
  onDismiss?: () => void;
  onComplete?: () => void;
  className?: string;
}

const ONBOARDING_STEPS = [
  {
    id: 'intro',
    icon: Eye,
    title: 'ovi.onboarding.intro.title',
    description: 'ovi.onboarding.intro.description',
    tips: [
      'ovi.onboarding.intro.tip1',
      'ovi.onboarding.intro.tip2',
    ],
  },
  {
    id: 'frameworks',
    icon: Layers,
    title: 'ovi.onboarding.frameworks.title',
    description: 'ovi.onboarding.frameworks.description',
    tips: [
      'ovi.onboarding.frameworks.tip1',
      'ovi.onboarding.frameworks.tip2',
    ],
  },
  {
    id: 'grids',
    icon: BarChart3,
    title: 'ovi.onboarding.grids.title',
    description: 'ovi.onboarding.grids.description',
    tips: [
      'ovi.onboarding.grids.tip1',
      'ovi.onboarding.grids.tip2',
    ],
  },
  {
    id: 'usage',
    icon: Target,
    title: 'ovi.onboarding.usage.title',
    description: 'ovi.onboarding.usage.description',
    tips: [
      'ovi.onboarding.usage.tip1',
      'ovi.onboarding.usage.tip2',
    ],
  },
];

export function OVIOnboardingGuide({ onDismiss, onComplete, className }: OVIOnboardingGuideProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);

  const step = ONBOARDING_STEPS[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete?.();
      setIsExpanded(false);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (!isExpanded) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsExpanded(true)}
        className={cn("gap-2", className)}
      >
        <Lightbulb className="w-4 h-4" />
        {t('ovi.onboarding.showGuide', 'Afficher le guide')}
      </Button>
    );
  }

  return (
    <Card className={cn("border-primary/30 bg-primary/5", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {t(step.title, step.title)}
              </CardTitle>
              <CardDescription>
                {t('ovi.onboarding.step', 'Étape')} {currentStep + 1}/{ONBOARDING_STEPS.length}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              onDismiss?.();
              setIsExpanded(false);
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {t(step.description, step.description)}
        </p>

        {/* Tips */}
        <div className="space-y-2">
          {step.tips.map((tip, index) => (
            <div key={index} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>{t(tip, tip)}</span>
            </div>
          ))}
        </div>

        {/* Progress indicators */}
        <div className="flex gap-1.5 pt-2">
          {ONBOARDING_STEPS.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                index <= currentStep ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            {t('common.previous', 'Précédent')}
          </Button>
          <Button
            size="sm"
            onClick={handleNext}
            className="gap-2"
          >
            {isLastStep ? t('ovi.onboarding.start', 'Commencer') : t('common.next', 'Suivant')}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
