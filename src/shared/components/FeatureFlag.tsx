import { createContext, useContext, type ReactNode } from 'react';

type FeatureFlags = {
  game: boolean;
  advancedFilters: boolean;
  pdfExport: boolean;
  aiRecommendations: boolean;
  multiNationality: boolean;
  destinationInsights: boolean;
};

const defaultFlags: FeatureFlags = {
  game: true,
  advancedFilters: true,
  pdfExport: true,
  aiRecommendations: true,
  multiNationality: true,
  destinationInsights: true,
};

const FeatureFlagContext = createContext<FeatureFlags>(defaultFlags);

export function FeatureFlagProvider({
  children,
  overrides = {},
}: {
  children: ReactNode;
  overrides?: Partial<FeatureFlags>;
}) {
  const flags = { ...defaultFlags, ...overrides };
  return (
    <FeatureFlagContext.Provider value={flags}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
  const flags = useContext(FeatureFlagContext);
  return flags[flag];
}

export function useFeatureFlags(): FeatureFlags {
  return useContext(FeatureFlagContext);
}

export function FeatureGate({
  flag,
  children,
  fallback = null,
}: {
  flag: keyof FeatureFlags;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const isEnabled = useFeatureFlag(flag);
  return isEnabled ? <>{children}</> : <>{fallback}</>;
}

// Badge "Labs" pour les features expérimentales
export function LabsBadge() {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 ml-2">
      Labs
    </span>
  );
}

// Export types
export type { FeatureFlags };
