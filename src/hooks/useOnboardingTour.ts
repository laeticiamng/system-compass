/**
 * useOnboardingTour - Interactive tour for new users
 * Shows key features step by step
 */

import { useState, useCallback } from 'react';

const TOUR_COMPLETED_KEY = 'pyramid-compass-tour-completed';
const TOUR_VERSION = 'v1'; // Increment to re-show tour after updates

export interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for highlight
  action?: 'click' | 'navigate';
  href?: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Bienvenue sur Pyramid Compass ! 🎉',
    description: 'Découvrez comment naviguer et utiliser les outils en quelques étapes.',
  },
  {
    id: 'sidebar',
    title: 'Navigation Sidebar',
    description: 'Utilisez la sidebar à gauche pour accéder rapidement à tous les modules. Raccourci : Ctrl+B',
    target: '[data-sidebar]',
  },
  {
    id: 'search',
    title: 'Recherche Globale',
    description: 'Tapez Cmd+K (ou Ctrl+K) pour rechercher n\'importe quelle page ou fonctionnalité.',
    target: '[data-search-trigger]',
  },
  {
    id: 'tools-hub',
    title: 'Hub Outils',
    description: 'Retrouvez tous les 30+ outils organisés par catégorie dans le Hub central.',
    href: '/tools',
  },
  {
    id: 'quick-test',
    title: 'Commencez par un Test Rapide',
    description: 'En 60 secondes, découvrez les pays qui correspondent à votre profil.',
    href: '/quick-test',
  },
  {
    id: 'favorites',
    title: 'Personnalisez vos Favoris',
    description: 'Cliquez sur ★ à côté d\'une page pour l\'ajouter à vos favoris dans la sidebar.',
  },
];

export function useOnboardingTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedTour, setHasCompletedTour] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      return localStorage.getItem(TOUR_COMPLETED_KEY) === TOUR_VERSION;
    } catch {
      return false;
    }
  });

  // Auto-start is now disabled - managed by DialogCoordinator
  // Users can manually trigger via RestartTourButton or Footer
  // This hook is now only for the optional guided tour, not initial onboarding

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTour();
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const skipTour = useCallback(() => {
    completeTour();
  }, []);

  const completeTour = useCallback(() => {
    setIsActive(false);
    setHasCompletedTour(true);
    try {
      localStorage.setItem(TOUR_COMPLETED_KEY, TOUR_VERSION);
    } catch (e) {
      console.warn('Failed to save tour completion:', e);
    }
  }, []);

  const resetTour = useCallback(() => {
    setHasCompletedTour(false);
    try {
      localStorage.removeItem(TOUR_COMPLETED_KEY);
    } catch (e) {
      console.warn('Failed to reset tour:', e);
    }
  }, []);

  return {
    isActive,
    currentStep,
    totalSteps: TOUR_STEPS.length,
    step: TOUR_STEPS[currentStep],
    hasCompletedTour,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    resetTour,
    progress: ((currentStep + 1) / TOUR_STEPS.length) * 100,
  };
}
