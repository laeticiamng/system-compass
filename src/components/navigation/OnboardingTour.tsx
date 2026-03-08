/**
 * OnboardingTour - Interactive walkthrough for new users
 * Shows step-by-step guide to platform features
 */

import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useOnboardingTour, getTourSteps } from '@/hooks/useOnboardingTour';
import { cn } from '@/lib/utils';

export function OnboardingTour() {
  const navigate = useLocalizedNavigate();
  const { t } = useTranslation();
  const steps = getTourSteps(t);
  const {
    isActive,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    skipTour,
    progress,
  } = useOnboardingTour(steps.length);

  const step = steps[currentStep];

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

        {/* Tour Card - Mobile optimized positioning */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className={cn(
            "absolute pointer-events-auto",
            // Mobile: centered with safe margins, Desktop: centered
            "left-4 right-4 top-1/2 -translate-y-1/2",
            "sm:left-1/2 sm:right-auto sm:-translate-x-1/2",
            "sm:w-[90vw] sm:max-w-md"
          )}
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-3 sm:p-4 border-b border-border/50">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-primary/20 flex-shrink-0">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">
                      {t('tour.step', 'Step {{current}} / {{total}}', { current: currentStep + 1, total: totalSteps })}
                    </p>
                    <Progress value={progress} className="w-full max-w-24 h-1 mt-1" />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipTour}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Actions - Stack on mobile */}
            <div className="p-3 sm:p-4 border-t border-border/50 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={skipTour}
                className="text-muted-foreground order-2 sm:order-1"
              >
                {t('tour.skip', 'Skip tour')}
              </Button>
              
              <div className="flex items-center gap-2 order-1 sm:order-2 sm:ml-auto">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevStep}
                    className="gap-1 flex-1 sm:flex-none"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('tour.previous', 'Previous')}</span>
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleNext}
                  className="gap-1 bg-primary hover:bg-primary/90 flex-1 sm:flex-none"
                >
                  {currentStep === totalSteps - 1 ? t('tour.finish', 'Finish') : t('tour.next', 'Next')}
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
  const { t } = useTranslation();
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
      {hasCompletedTour ? t('tour.restart', 'Revoir le tour') : t('tour.start', 'Commencer le tour')}
    </Button>
  );
}
