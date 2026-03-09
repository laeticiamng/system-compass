import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

const CONSENT_KEY = 'compass-disclaimer-accepted';
const ONBOARDING_KEY = 'compass-onboarding-complete';
const COOKIE_CONSENT_KEY = 'compass-cookie-consent';

interface DialogCoordinatorContextType {
  isDisclaimerComplete: boolean;
  isOnboardingComplete: boolean;
  isCookieConsentComplete: boolean;
  shouldShowDisclaimer: boolean;
  shouldShowOnboarding: boolean;
  shouldShowCookieConsent: boolean;
  completeDisclaimer: () => void;
  completeOnboarding: () => void;
  completeCookieConsent: () => void;
}

const DialogCoordinatorContext = createContext<DialogCoordinatorContextType | null>(null);

function getStoredValue(key: string, defaultValue: boolean = false): boolean {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const value = localStorage.getItem(key);
    if (key === COOKIE_CONSENT_KEY) {
      return value !== null;
    }
    return value === 'true';
  } catch {
    return defaultValue;
  }
}

/** Check if current path is the homepage (with or without lang prefix) */
function isHomePage(pathname: string): boolean {
  const cleaned = pathname.replace(/\/+$/, '');
  if (cleaned === '' || cleaned === '/') return true;
  // Match /:lang patterns like /fr, /en, /es etc.
  return /^\/[a-z]{2}$/.test(cleaned);
}

export function DialogCoordinatorProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [isDisclaimerComplete, setIsDisclaimerComplete] = useState(() => 
    getStoredValue(CONSENT_KEY)
  );
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(() => 
    getStoredValue(ONBOARDING_KEY)
  );
  const [isCookieConsentComplete, setIsCookieConsentComplete] = useState(() => 
    getStoredValue(COOKIE_CONSENT_KEY)
  );
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Delay initialization: 300ms for disclaimer, 5s for onboarding (let user see hero first)
    const timer = setTimeout(() => setInitialized(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Extra delay for onboarding so the hero is visible first
  const [onboardingReady, setOnboardingReady] = useState(false);
  useEffect(() => {
    if (initialized && isDisclaimerComplete && !isOnboardingComplete) {
      const timer = setTimeout(() => setOnboardingReady(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [initialized, isDisclaimerComplete, isOnboardingComplete]);

  const onHomePage = isHomePage(location.pathname);

  // Disclaimer shows on all pages, onboarding ONLY on homepage, cookies after both
  const shouldShowDisclaimer = initialized && !isDisclaimerComplete;
  const shouldShowOnboarding = initialized && onboardingReady && isDisclaimerComplete && !isOnboardingComplete && onHomePage;
  const shouldShowCookieConsent = initialized && isDisclaimerComplete && (isOnboardingComplete || !onHomePage) && !isCookieConsentComplete;

  const completeDisclaimer = () => {
    try {
      localStorage.setItem(CONSENT_KEY, 'true');
    } catch (e) {
      console.warn('Failed to save disclaimer consent:', e);
    }
    setIsDisclaimerComplete(true);
  };

  const completeOnboarding = () => {
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true');
      localStorage.setItem('compass-tour-completed', 'v1');
    } catch (e) {
      console.warn('Failed to save onboarding completion:', e);
    }
    setIsOnboardingComplete(true);
  };

  const completeCookieConsent = () => {
    setIsCookieConsentComplete(true);
  };

  return (
    <DialogCoordinatorContext.Provider value={{
      isDisclaimerComplete,
      isOnboardingComplete,
      isCookieConsentComplete,
      shouldShowDisclaimer,
      shouldShowOnboarding,
      shouldShowCookieConsent,
      completeDisclaimer,
      completeOnboarding,
      completeCookieConsent,
    }}>
      {children}
    </DialogCoordinatorContext.Provider>
  );
}

export function useDialogCoordinator() {
  const context = useContext(DialogCoordinatorContext);
  if (!context) {
    throw new Error('useDialogCoordinator must be used within DialogCoordinatorProvider');
  }
  return context;
}

// Hook for resetting onboarding from Footer
export function useResetOnboarding() {
  return () => {
    try {
      localStorage.removeItem(ONBOARDING_KEY);
      localStorage.removeItem(CONSENT_KEY);
      localStorage.removeItem(COOKIE_CONSENT_KEY);
      localStorage.removeItem('compass-tour-completed');
    } catch (e) {
      console.warn('Failed to reset onboarding:', e);
    }
    window.location.reload();
  };
}
