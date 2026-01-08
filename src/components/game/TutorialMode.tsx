import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  ChevronRight, 
  ChevronLeft, 
  Globe, 
  Heart, 
  Coins, 
  Users, 
  Shield, 
  Brain,
  AlertTriangle,
  Sparkles,
  BookOpen,
  Target,
  Skull,
  MapPin,
  Dices,
  Trophy,
  Play
} from 'lucide-react';

interface TutorialStep {
  id: string;
  icon: React.ReactNode;
  titleKey: string;
  contentKey: string;
  realityNote?: string;
  examples?: string[];
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    icon: <BookOpen className="w-8 h-8" />,
    titleKey: 'tutorial.steps.welcome.title',
    contentKey: 'tutorial.steps.welcome.content',
    realityNote: 'tutorial.steps.welcome.reality',
  },
  {
    id: 'life_assignment',
    icon: <Dices className="w-8 h-8" />,
    titleKey: 'tutorial.steps.lifeAssignment.title',
    contentKey: 'tutorial.steps.lifeAssignment.content',
    realityNote: 'tutorial.steps.lifeAssignment.reality',
    examples: [
      'tutorial.steps.lifeAssignment.examples.0',
      'tutorial.steps.lifeAssignment.examples.1',
      'tutorial.steps.lifeAssignment.examples.2',
    ],
  },
  {
    id: 'resources',
    icon: <Heart className="w-8 h-8" />,
    titleKey: 'tutorial.steps.resources.title',
    contentKey: 'tutorial.steps.resources.content',
    realityNote: 'tutorial.steps.resources.reality',
    examples: [
      'tutorial.steps.resources.examples.0',
      'tutorial.steps.resources.examples.1',
      'tutorial.steps.resources.examples.2',
    ],
  },
  {
    id: 'pyramids',
    icon: <Globe className="w-8 h-8" />,
    titleKey: 'tutorial.steps.pyramids.title',
    contentKey: 'tutorial.steps.pyramids.content',
    realityNote: 'tutorial.steps.pyramids.reality',
  },
  {
    id: 'events',
    icon: <AlertTriangle className="w-8 h-8" />,
    titleKey: 'tutorial.steps.events.title',
    contentKey: 'tutorial.steps.events.content',
    realityNote: 'tutorial.steps.events.reality',
    examples: [
      'tutorial.steps.events.examples.0',
      'tutorial.steps.events.examples.1',
    ],
  },
  {
    id: 'actions',
    icon: <Target className="w-8 h-8" />,
    titleKey: 'tutorial.steps.actions.title',
    contentKey: 'tutorial.steps.actions.content',
    realityNote: 'tutorial.steps.actions.reality',
  },
  {
    id: 'shortcuts',
    icon: <Skull className="w-8 h-8" />,
    titleKey: 'tutorial.steps.shortcuts.title',
    contentKey: 'tutorial.steps.shortcuts.content',
    realityNote: 'tutorial.steps.shortcuts.reality',
    examples: [
      'tutorial.steps.shortcuts.examples.0',
      'tutorial.steps.shortcuts.examples.1',
      'tutorial.steps.shortcuts.examples.2',
    ],
  },
  {
    id: 'aspirations',
    icon: <Sparkles className="w-8 h-8" />,
    titleKey: 'tutorial.steps.aspirations.title',
    contentKey: 'tutorial.steps.aspirations.content',
    realityNote: 'tutorial.steps.aspirations.reality',
  },
  {
    id: 'endgame',
    icon: <Trophy className="w-8 h-8" />,
    titleKey: 'tutorial.steps.endgame.title',
    contentKey: 'tutorial.steps.endgame.content',
    realityNote: 'tutorial.steps.endgame.reality',
  },
];

interface TutorialModeProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function TutorialMode({ onComplete, onSkip }: TutorialModeProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  
  const step = TUTORIAL_STEPS[currentStep];
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;
  
  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };
  
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>{t('tutorial.stepOf', { current: currentStep + 1, total: TUTORIAL_STEPS.length })}</span>
            <Button variant="ghost" size="sm" onClick={onSkip}>
              {t('tutorial.skip')}
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="glass-card rounded-2xl p-8 animate-scale-in" key={step.id}>
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-2xl bg-primary/10 text-primary">
              {step.icon}
            </div>
          </div>
          
          {/* Title */}
          <h2 className="font-display text-2xl font-bold text-center mb-4">
            {t(step.titleKey)}
          </h2>
          
          {/* Content */}
          <p className="text-muted-foreground text-center mb-6 leading-relaxed">
            {t(step.contentKey)}
          </p>
          
          {/* Examples */}
          {step.examples && step.examples.length > 0 && (
            <div className="bg-muted/30 rounded-xl p-4 mb-6">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                {t('tutorial.examples')}
              </h4>
              <ul className="space-y-2">
                {step.examples.map((example, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {t(example)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Reality Note */}
          {step.realityNote && (
            <div className="border border-amber-500/30 bg-amber-500/10 rounded-xl p-4">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                {t('tutorial.realityCheck')}
              </h4>
              <p className="text-sm text-muted-foreground">
                {t(step.realityNote)}
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mt-8">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex-1 gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            {t('common.back')}
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1 gap-2"
          >
            {currentStep === TUTORIAL_STEPS.length - 1 ? (
              <>
                <Play className="w-4 h-4" />
                {t('tutorial.startGame')}
              </>
            ) : (
              <>
                {t('common.next')}
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {TUTORIAL_STEPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                idx === currentStep 
                  ? "bg-primary w-6" 
                  : idx < currentStep 
                    ? "bg-primary/50" 
                    : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}