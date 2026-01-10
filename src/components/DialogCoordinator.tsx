import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

const CONSENT_KEY = 'pyramid-compass-disclaimer-accepted';
const ONBOARDING_KEY = 'pyramid-compass-onboarding-complete';

interface DialogCoordinatorContextType {
  isDisclaimerComplete: boolean;
  isOnboardingComplete: boolean;
  shouldShowDisclaimer: boolean;
  shouldShowOnboarding: boolean;
  completeDisclaimer: () => void;
  completeOnboarding: () => void;
}

const DialogCoordinatorContext = createContext<DialogCoordinatorContextType | null>(null);

export function DialogCoordinatorProvider({ children }: { children: ReactNode }) {
  const [isDisclaimerComplete, setIsDisclaimerComplete] = useState(() => 
    localStorage.getItem(CONSENT_KEY) === 'true'
  );
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(() => 
    localStorage.getItem(ONBOARDING_KEY) === 'true'
  );
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Small delay for better UX
    const timer = setTimeout(() => setInitialized(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const shouldShowDisclaimer = initialized && !isDisclaimerComplete;
  // Only show onboarding after disclaimer is done
  const shouldShowOnboarding = initialized && isDisclaimerComplete && !isOnboardingComplete;

  const completeDisclaimer = () => {
    localStorage.setItem(CONSENT_KEY, 'true');
    setIsDisclaimerComplete(true);
  };

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsOnboardingComplete(true);
  };

  return (
    <DialogCoordinatorContext.Provider value={{
      isDisclaimerComplete,
      isOnboardingComplete,
      shouldShowDisclaimer,
      shouldShowOnboarding,
      completeDisclaimer,
      completeOnboarding,
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
    localStorage.removeItem('pyramid-compass-onboarding-complete');
    localStorage.removeItem('pyramid-compass-disclaimer-accepted');
    window.location.reload();
  };
}
