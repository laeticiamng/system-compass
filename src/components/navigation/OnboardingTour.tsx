/**
 * OnboardingTour - Interactive walkthrough for new users
 * Shows step-by-step guide to platform features
 */

import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useOnboardingTour } from '@/hooks/useOnboardingTour';
import { cn } from '@/lib/utils';

export function OnboardingTour() {
  const navigate = useNavigate();
  const {
    isActive,
    currentStep,
    totalSteps,
    step,
    nextStep,
    prevStep,
    skipTour,
    progress,
  } = useOnboardingTour();

  const handleNext = () => {
    if (step?.href) {
      navigate(step.href);
    }
    nextStep();
  };

  if (!isActive || !step) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] pointer-events-none"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm pointer-events-auto" />

        {/* Tour Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className={cn(
            "absolute pointer-events-auto",
            "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            "w-[90vw] max-w-md"
          )}
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Étape {currentStep + 1} / {totalSteps}
                    </p>
                    <Progress value={progress} className="w-24 h-1 mt-1" />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipTour}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-border/50 flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={skipTour}
                className="text-muted-foreground"
              >
                Passer le tour
              </Button>
              
              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevStep}
                    className="gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Précédent
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleNext}
                  className="gap-1 bg-primary hover:bg-primary/90"
                >
                  {currentStep === totalSteps - 1 ? 'Terminer' : 'Suivant'}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/** Button to restart the tour - can be placed in settings/help */
export function RestartTourButton() {
  const { resetTour, startTour, hasCompletedTour } = useOnboardingTour();

  const handleRestart = () => {
    resetTour();
    setTimeout(() => startTour(), 100);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRestart}
      className="gap-2"
    >
      <RotateCcw className="w-4 h-4" />
      {hasCompletedTour ? 'Revoir le tour' : 'Commencer le tour'}
    </Button>
  );
}
