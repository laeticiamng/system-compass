/**
 * Interactive Tutorial - Step-by-step guided onboarding for new users
 * Provides contextual tooltips and highlights for key features
 */
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  Globe,
  BarChart3,
  Key,
  Gamepad2,
  Users,
  MapPin,
  CheckCircle2
} from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

const TUTORIAL_STORAGE_KEY = 'pyramid_interactive_tutorial_completed';

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Bienvenue sur Pyramid Compass',
    description: 'Découvrez les clés pour comprendre comment fonctionnent vraiment les pays et trouver votre destination idéale.',
    icon: <Sparkles className="w-8 h-8 text-primary" />,
    position: 'center',
  },
  {
    id: 'countries',
    title: 'Explorer les pays',
    description: 'Accédez à des profils détaillés de 50+ pays avec des analyses systémiques uniques : pyramide du pouvoir, risques réels, et qui gagne/perd dans chaque système.',
    icon: <Globe className="w-8 h-8 text-blue-500" />,
    targetSelector: '[data-tutorial="countries"]',
    position: 'bottom',
    action: { label: 'Voir les pays', href: '/countries' },
  },
  {
    id: 'exit-keys',
    title: 'Stratégies de sortie personnalisées',
    description: 'Générez des stratégies d\'expatriation adaptées à votre profil : parcours recommandés, délais réalistes et étapes concrètes.',
    icon: <Key className="w-8 h-8 text-amber-500" />,
    targetSelector: '[data-tutorial="exit-keys"]',
    position: 'bottom',
    action: { label: 'Générer ma stratégie', href: '/exit-keys' },
  },
  {
    id: 'compare',
    title: 'Comparer les destinations',
    description: 'Mettez côte à côte jusqu\'à 4 pays sur 12 dimensions pour identifier le meilleur match avec vos critères.',
    icon: <BarChart3 className="w-8 h-8 text-emerald-500" />,
    targetSelector: '[data-tutorial="compare"]',
    position: 'bottom',
    action: { label: 'Comparer', href: '/compare' },
  },
  {
    id: 'life-game',
    title: 'Life Game - Simulation',
    description: 'Testez vos choix de vie dans un jeu de simulation immersif. Expérimentez différents parcours et systèmes sans risque réel.',
    icon: <Gamepad2 className="w-8 h-8 text-purple-500" />,
    targetSelector: '[data-tutorial="life-game"]',
    position: 'bottom',
    action: { label: 'Jouer', href: '/life-game' },
  },
  {
    id: 'experts',
    title: 'Marketplace d\'experts',
    description: 'Connectez-vous avec des experts vérifiés : avocats, fiscalistes, spécialistes immigration pour un accompagnement personnalisé.',
    icon: <Users className="w-8 h-8 text-rose-500" />,
    targetSelector: '[data-tutorial="experts"]',
    position: 'bottom',
    action: { label: 'Trouver un expert', href: '/experts' },
  },
  {
    id: 'dashboard',
    title: 'Votre tableau de bord',
    description: 'Suivez votre progression, vos pays favoris et vos stratégies sauvegardées. Tout est centralisé pour faciliter votre projet.',
    icon: <MapPin className="w-8 h-8 text-cyan-500" />,
    targetSelector: '[data-tutorial="dashboard"]',
    position: 'bottom',
    action: { label: 'Mon dashboard', href: '/dashboard' },
  },
  {
    id: 'complete',
    title: 'Vous êtes prêt !',
    description: 'Explorez librement la plateforme. N\'hésitez pas à revenir sur ce tutoriel depuis les paramètres si besoin.',
    icon: <CheckCircle2 className="w-8 h-8 text-emerald-500" />,
    position: 'center',
  },
];

interface InteractiveTutorialProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

export function InteractiveTutorial({ onComplete, forceShow = false }: InteractiveTutorialProps) {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  // Check if tutorial should be shown
  useEffect(() => {
    if (forceShow) {
      setIsVisible(true);
      return;
    }
    
    const completed = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (!completed) {
      // Delay to let page render first
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [forceShow]);

  const currentStep = tutorialSteps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / tutorialSteps.length) * 100;

  // Update highlight position when step changes
  useEffect(() => {
    if (!currentStep.targetSelector) {
      setHighlightRect(null);
      return;
    }

    const element = document.querySelector(currentStep.targetSelector);
    if (element) {
      const rect = element.getBoundingClientRect();
      setHighlightRect(rect);
      
      // Scroll element into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setHighlightRect(null);
    }
  }, [currentStep.targetSelector, currentStepIndex]);

  const handleNext = useCallback(() => {
    if (currentStepIndex < tutorialSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStepIndex]);

  const handlePrev = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const handleComplete = useCallback(() => {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    setIsVisible(false);
    onComplete?.();
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'skipped');
    setIsVisible(false);
    onComplete?.();
  }, [onComplete]);

  if (!isVisible) return null;

  const getTooltipPosition = () => {
    if (!highlightRect || currentStep.position === 'center') {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const padding = 20;
    const tooltipWidth = 400;
    const tooltipHeight = 250;

    switch (currentStep.position) {
      case 'bottom':
        return {
          position: 'fixed' as const,
          top: `${highlightRect.bottom + padding}px`,
          left: `${Math.max(padding, Math.min(highlightRect.left + highlightRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - padding))}px`,
        };
      case 'top':
        return {
          position: 'fixed' as const,
          top: `${highlightRect.top - tooltipHeight - padding}px`,
          left: `${Math.max(padding, Math.min(highlightRect.left + highlightRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - padding))}px`,
        };
      case 'left':
        return {
          position: 'fixed' as const,
          top: `${highlightRect.top + highlightRect.height / 2 - tooltipHeight / 2}px`,
          left: `${highlightRect.left - tooltipWidth - padding}px`,
        };
      case 'right':
        return {
          position: 'fixed' as const,
          top: `${highlightRect.top + highlightRect.height / 2 - tooltipHeight / 2}px`,
          left: `${highlightRect.right + padding}px`,
        };
      default:
        return {
          position: 'fixed' as const,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Highlight spotlight */}
          {highlightRect && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed z-[101] ring-4 ring-primary rounded-lg pointer-events-none"
              style={{
                top: highlightRect.top - 8,
                left: highlightRect.left - 8,
                width: highlightRect.width + 16,
                height: highlightRect.height + 16,
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
              }}
            />
          )}

          {/* Tooltip card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed z-[102] w-[90vw] max-w-[400px] glass-card rounded-2xl p-6 shadow-2xl border-primary/30"
            style={getTooltipPosition()}
          >
            {/* Close button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Progress */}
            <div className="mb-4">
              <Progress value={progress} className="h-1" />
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {currentStepIndex + 1} / {tutorialSteps.length}
              </p>
            </div>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-2xl bg-muted/50">
                {currentStep.icon}
              </div>
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-center mb-2">
              {t(`tutorial.${currentStep.id}.title`, currentStep.title)}
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-6">
              {t(`tutorial.${currentStep.id}.description`, currentStep.description)}
            </p>

            {/* Action button (if present) */}
            {currentStep.action && (
              <div className="flex justify-center mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    if (currentStep.action?.href) {
                      window.location.href = currentStep.action.href;
                    }
                    currentStep.action?.onClick?.();
                  }}
                >
                  {currentStep.action.label}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrev}
                disabled={currentStepIndex === 0}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                {t('common.previous', 'Précédent')}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-muted-foreground"
              >
                {t('common.skip', 'Passer')}
              </Button>

              <Button
                size="sm"
                onClick={handleNext}
                className="gap-1"
              >
                {currentStepIndex === tutorialSteps.length - 1
                  ? t('tutorial.finish', 'Terminer')
                  : t('common.next', 'Suivant')}
                {currentStepIndex < tutorialSteps.length - 1 && (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook to reset tutorial for testing
export function useResetTutorial() {
  return useCallback(() => {
    localStorage.removeItem(TUTORIAL_STORAGE_KEY);
    window.location.reload();
  }, []);
}

export default InteractiveTutorial;
