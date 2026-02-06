import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

const CONSENT_KEY = 'pyramid-compass-disclaimer-accepted';
const ONBOARDING_KEY = 'pyramid-compass-onboarding-complete';
const COOKIE_CONSENT_KEY = 'pyramid-compass-cookie-consent';

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
    // For cookie consent, check if the key exists (JSON object)
    if (key === COOKIE_CONSENT_KEY) {
      return value !== null;
    }
    return value === 'true';
  } catch {
    return defaultValue;
  }
}

export function DialogCoordinatorProvider({ children }: { children: ReactNode }) {
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
    // Small delay for better UX - avoids flash
    const timer = setTimeout(() => setInitialized(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Sequential flow: Disclaimer → Onboarding → Cookies
  // Each step only shows when the previous is complete
  const shouldShowDisclaimer = initialized && !isDisclaimerComplete;
  const shouldShowOnboarding = initialized && isDisclaimerComplete && !isOnboardingComplete;
  const shouldShowCookieConsent = initialized && isDisclaimerComplete && isOnboardingComplete && !isCookieConsentComplete;

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
      // Also mark the tour as complete to avoid conflicts
      localStorage.setItem('pyramid-compass-tour-completed', 'v1');
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
      localStorage.removeItem('pyramid-compass-tour-completed');
    } catch (e) {
      console.warn('Failed to reset onboarding:', e);
    }
    window.location.reload();
  };
}
