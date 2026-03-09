/**
 * useOnboardingTour - Interactive tour for new users
 * Shows key features step by step
 */

import { useState, useCallback } from 'react';
import type { TFunction } from 'i18next';

const TOUR_COMPLETED_KEY = 'compass-tour-completed';
const TOUR_VERSION = 'v1'; // Increment to re-show tour after updates

export interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  action?: 'click' | 'navigate';
  href?: string;
}

export function getTourSteps(t: TFunction): TourStep[] {
  return [
    {
      id: 'welcome',
      title: t('tour.welcome', 'Bienvenue sur Compass ! 🎉'),
      description: t('tour.welcomeDesc', 'Découvrez comment naviguer et utiliser les outils en quelques étapes.'),
    },
    {
      id: 'sidebar',
      title: t('tour.sidebar', 'Navigation Sidebar'),
      description: t('tour.sidebarDesc', 'Utilisez la sidebar à gauche pour accéder rapidement à tous les modules. Raccourci : Ctrl+B'),
      target: '[data-sidebar]',
    },
    {
      id: 'search',
      title: t('tour.search', 'Recherche Globale'),
      description: t('tour.searchDesc', 'Tapez Cmd+K (ou Ctrl+K) pour rechercher n\'importe quelle page ou fonctionnalité.'),
      target: '[data-search-trigger]',
    },
    {
      id: 'tools-hub',
      title: t('tour.toolsHub', 'Hub Outils'),
      description: t('tour.toolsHubDesc', 'Retrouvez tous les 30+ outils organisés par catégorie dans le Hub central.'),
      href: '/tools',
    },
    {
      id: 'quick-test',
      title: t('tour.quickTest', 'Commencez par un Test Rapide'),
      description: t('tour.quickTestDesc', 'En 60 secondes, découvrez les pays qui correspondent à votre profil.'),
      href: '/quick-test',
    },
    {
      id: 'favorites',
      title: t('tour.favorites', 'Personnalisez vos Favoris'),
      description: t('tour.favoritesDesc', 'Cliquez sur ★ à côté d\'une page pour l\'ajouter à vos favoris dans la sidebar.'),
    },
  ];
}

const DEFAULT_STEPS_COUNT = 6;

export function useOnboardingTour(stepsCount: number = DEFAULT_STEPS_COUNT) {
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

  const completeTour = useCallback(() => {
    setIsActive(false);
    setHasCompletedTour(true);
    try {
      localStorage.setItem(TOUR_COMPLETED_KEY, TOUR_VERSION);
    } catch (e) {
      console.warn('Failed to save tour completion:', e);
    }
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < stepsCount - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTour();
    }
  }, [currentStep, stepsCount, completeTour]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const skipTour = useCallback(() => {
    completeTour();
  }, [completeTour]);

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
    totalSteps: stepsCount,
    hasCompletedTour,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    resetTour,
    progress: ((currentStep + 1) / stepsCount) * 100,
  };
}
