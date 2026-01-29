import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Gamepad2, 
  Heart, 
  Coins, 
  Clock, 
  Users, 
  GraduationCap, 
  Globe,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameTutorialProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const tutorialSteps = [
  {
    icon: Gamepad2,
    titleKey: 'tutorial.welcome.title',
    descriptionKey: 'tutorial.welcome.description',
    color: 'text-primary',
  },
  {
    icon: Heart,
    titleKey: 'tutorial.resources.title',
    descriptionKey: 'tutorial.resources.description',
    color: 'text-rose-500',
    resources: [
      { icon: Clock, label: 'Temps', color: 'text-cyan-400' },
      { icon: Coins, label: 'Argent', color: 'text-amber-400' },
      { icon: Heart, label: 'Santé', color: 'text-rose-400' },
      { icon: Users, label: 'Réseau', color: 'text-purple-400' },
      { icon: GraduationCap, label: 'Compétences', color: 'text-emerald-400' },
    ]
  },
  {
    icon: Globe,
    titleKey: 'tutorial.systems.title',
    descriptionKey: 'tutorial.systems.description',
    color: 'text-blue-500',
  },
  {
    icon: Users,
    titleKey: 'tutorial.choices.title',
    descriptionKey: 'tutorial.choices.description',
    color: 'text-purple-500',
  },
];

export function GameTutorial({ open, onClose, onComplete }: GameTutorialProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  
  const step = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;
  const Icon = step.icon;

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onClose();
    // Store in localStorage that tutorial was skipped
    localStorage.setItem('game_tutorial_completed', 'true');
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-primary" />
              {t('tutorial.title', 'Tutoriel')}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={handleSkip}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <Progress value={progress} className="h-1 mt-2" />
        </DialogHeader>

        <div className="py-6">
          <div className={cn("p-4 rounded-xl bg-muted/50 mb-6 flex justify-center", step.color)}>
            <Icon className="w-16 h-16" />
          </div>

          <h3 className="text-xl font-bold text-center mb-3">
            {t(step.titleKey, step.titleKey)}
          </h3>
          <DialogDescription className="text-center text-base">
            {t(step.descriptionKey, step.descriptionKey)}
          </DialogDescription>

          {/* Resources display for step 2 */}
          {step.resources && (
            <div className="grid grid-cols-5 gap-2 mt-6">
              {step.resources.map((resource, i) => {
                const ResIcon = resource.icon;
                return (
                  <div key={i} className="flex flex-col items-center text-center">
                    <div className={cn("p-2 rounded-lg bg-muted/50 mb-1", resource.color)}>
                      <ResIcon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{resource.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            {t('common.back', 'Retour')}
          </Button>
          
          <span className="text-sm text-muted-foreground">
            {currentStep + 1} / {tutorialSteps.length}
          </span>

          <Button onClick={handleNext} className="gap-1">
            {currentStep === tutorialSteps.length - 1 
              ? t('tutorial.start', 'Commencer')
              : t('common.next', 'Suivant')
            }
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
