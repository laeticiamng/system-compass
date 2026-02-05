import { lazy, Suspense, ComponentType } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Page loading fallback
function PageLoadingFallback() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
      <Skeleton className="h-32 rounded-xl" />
    </div>
  );
}

// Higher-order component for lazy routes with Suspense
function withSuspense<P extends object>(
  LazyComponent: ComponentType<P>,
  fallback: React.ReactNode = <PageLoadingFallback />
) {
  return function SuspenseWrapper(props: P) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Heavy pages - lazy loaded for better initial bundle size
// These are data-heavy or feature-rich pages that benefit from code splitting

// Country-related (data-heavy)
export const LazyCountries = withSuspense(lazy(() => import('@/pages/Countries')));
export const LazyCountryDetail = withSuspense(lazy(() => import('@/pages/CountryDetail')));
export const LazyWorldMapExplorer = withSuspense(lazy(() => import('@/pages/WorldMapExplorer')));
export const LazyCompareUnified = withSuspense(lazy(() => import('@/pages/CompareUnified')));

// Game module (feature-rich)
export const LazyLifeGame = withSuspense(lazy(() => import('@/pages/LifeGame')));
export const LazyPyramidQuiz = withSuspense(lazy(() => import('@/pages/PyramidQuiz')));

// Analysis tools
export const LazyExitKeys = withSuspense(lazy(() => import('@/pages/ExitKeys')));
export const LazyExitKeysCatalog = withSuspense(lazy(() => import('@/pages/ExitKeysCatalog')));
export const LazyCompareExitKeys = withSuspense(lazy(() => import('@/pages/CompareExitKeys')));
export const LazyProfileMatcher = withSuspense(lazy(() => import('@/pages/ProfileMatcher')));
export const LazyProfileTest = withSuspense(lazy(() => import('@/pages/ProfileTest')));
export const LazyLifeTrajectory = withSuspense(lazy(() => import('@/pages/LifeTrajectory')));

// Dashboard & authenticated areas
export const LazyDashboard = withSuspense(lazy(() => import('@/pages/Dashboard')));
export const LazyUsage = withSuspense(lazy(() => import('@/pages/Usage')));
export const LazyNotificationSettings = withSuspense(lazy(() => import('@/pages/NotificationSettings')));

// B2B & Institutional
export const LazyInstitutions = withSuspense(lazy(() => import('@/pages/Institutions')));
export const LazyB2BSolutions = withSuspense(lazy(() => import('@/pages/B2BSolutions')));
export const LazyCaseDetail = withSuspense(lazy(() => import('@/pages/CaseDetail')));
export const LazyLatentModule = withSuspense(lazy(() => import('@/pages/LatentModule')));
export const LazyIrreversaModule = withSuspense(lazy(() => import('@/pages/IrreversaModule')));

// Terrain & Financial Intel
export const LazyTerrainRealities = withSuspense(lazy(() => import('@/pages/TerrainRealities')));
export const LazyTerrainRealitiesSelector = withSuspense(lazy(() => import('@/pages/TerrainRealitiesSelector')));
export const LazyFinancialSafetyIntel = withSuspense(lazy(() => import('@/pages/FinancialSafetyIntel')));

// Admin pages
export const LazyAdminTranslations = withSuspense(lazy(() => import('@/pages/AdminTranslations')));
export const LazyAdminAnalytics = withSuspense(lazy(() => import('@/pages/AdminAnalytics')));
export const LazyAdminCountryGenerator = withSuspense(lazy(() => import('@/pages/AdminCountryGenerator')));
export const LazyAdminGenerateTranslations = withSuspense(lazy(() => import('@/pages/AdminGenerateTranslations')));
export const LazyAdminDatabaseTranslations = withSuspense(lazy(() => import('@/pages/AdminDatabaseTranslations')));
export const LazyAdminPartners = withSuspense(lazy(() => import('@/pages/AdminPartners')));
export const LazyAdminTranslationsSync = withSuspense(lazy(() => import('@/pages/AdminTranslationsSync')));
export const LazySeedTranslations = withSuspense(lazy(() => import('@/pages/SeedTranslations')));
export const LazyAdminDataSources = withSuspense(lazy(() => import('@/pages/admin/AdminDataSources')));

// Content pages (can be lazy loaded too)
export const LazyPyramidTypes = withSuspense(lazy(() => import('@/pages/PyramidTypes')));
export const LazyResources = withSuspense(lazy(() => import('@/pages/Resources')));
export const LazyOVI = withSuspense(lazy(() => import('@/pages/OVI')));
export const LazyErrorsAndIllusions = withSuspense(lazy(() => import('@/pages/ErrorsAndIllusions')));
export const LazyPreventionFilter = withSuspense(lazy(() => import('@/pages/PreventionFilter')));
export const LazyUniversalErrorDetail = withSuspense(lazy(() => import('@/pages/UniversalErrorDetail')));
export const LazyHowToRead = withSuspense(lazy(() => import('@/pages/HowToRead')));
// Note: Auth, About, Disclaimer, QuickTest, SubscriptionSuccess, Pricing, Partners
// are eagerly loaded in src/routes/index.tsx - do not duplicate lazy imports here

// New modules
export const LazyFiscalCalculator = withSuspense(lazy(() => import('@/pages/FiscalCalculator')));
export const LazyPersonaJourneys = withSuspense(lazy(() => import('@/pages/PersonaJourneys')));
export const LazyGamificationHub = withSuspense(lazy(() => import('@/pages/GamificationHub')));
export const LazyExpertMarketplace = withSuspense(lazy(() => import('@/pages/ExpertMarketplace')));
export const LazyPartnerIntegrations = withSuspense(lazy(() => import('@/pages/PartnerIntegrations')));
export const LazyCommunity = withSuspense(lazy(() => import('@/pages/Community')));
export const LazyInstall = withSuspense(lazy(() => import('@/pages/Install')));
export const LazyToolsHub = withSuspense(lazy(() => import('@/pages/ToolsHub')));

// Dev/Admin pages
export const LazyDiagnostics = withSuspense(lazy(() => import('@/pages/Diagnostics')));

// Academic Hub - HEC/Polytechnique level tools  
export const LazyAcademicHub = withSuspense(lazy(() => import('@/pages/AcademicHub')));
