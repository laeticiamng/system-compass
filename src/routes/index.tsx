/**
 * Route Configuration - Centralized route definitions
 * Organized by feature domain for maintainability
 */

import { Navigate } from "react-router-dom";
import { RequireAdmin } from "@/components/RequireAdmin";

// Eagerly loaded pages (small, frequently accessed)
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import About from "@/pages/About";
import Disclaimer from "@/pages/Disclaimer";
import QuickTest from "@/pages/QuickTest";
import SubscriptionSuccess from "@/pages/SubscriptionSuccess";
import Pricing from "@/pages/Pricing";
import Partners from "@/pages/Partners";

// Lazy loaded pages
import {
  LazyCountries,
  LazyCountryDetail,
  LazyWorldMapExplorer,
  LazyCompareUnified,
  LazyLifeGame,
  LazyPyramidQuiz,
  LazyExitKeys,
  LazyExitKeysCatalog,
  LazyCompareExitKeys,
  LazyProfileMatcher,
  LazyProfileTest,
  LazyLifeTrajectory,
  LazyDashboard,
  LazyUsage,
  LazyNotificationSettings,
  LazyInstitutions,
  LazyB2BSolutions,
  LazyCaseDetail,
  LazyLatentModule,
  LazyIrreversaModule,
  LazyTerrainRealities,
  LazyTerrainRealitiesSelector,
  LazyFinancialSafetyIntel,
  LazyAdminTranslations,
  LazyAdminAnalytics,
  LazyAdminCountryGenerator,
  LazyAdminGenerateTranslations,
  LazyAdminDatabaseTranslations,
  LazyAdminPartners,
  LazyAdminTranslationsSync,
  LazySeedTranslations,
  LazyPyramidTypes,
  LazyResources,
  LazyOVI,
  LazyErrorsAndIllusions,
  LazyPreventionFilter,
  LazyUniversalErrorDetail,
  LazyHowToRead,
  LazyDiagnostics,
  LazyFiscalCalculator,
  LazyPersonaJourneys,
  LazyGamificationHub,
  LazyExpertMarketplace,
  LazyPartnerIntegrations,
  LazyCommunity,
  LazyInstall,
  LazyToolsHub,
  LazyAcademicHub,
} from "@/routes/LazyRoutes";

// ============================================================
// ROUTE DEFINITIONS BY DOMAIN
// ============================================================

/** Core pages - frequently accessed, eagerly loaded */
export const coreRoutes = [
  { path: "/", element: <Index /> },
  { path: "/auth", element: <Auth /> },
  { path: "/about", element: <About /> },
  { path: "/disclaimer", element: <Disclaimer /> },
  { path: "/quick-test", element: <QuickTest /> },
  { path: "/subscription-success", element: <SubscriptionSuccess /> },
  { path: "/pricing", element: <Pricing /> },
  { path: "/partners", element: <Partners /> },
];

/** Country exploration routes */
export const countryRoutes = [
  { path: "/countries", element: <LazyCountries /> },
  { path: "/world-map", element: <LazyWorldMapExplorer /> },
  { path: "/country/:id", element: <LazyCountryDetail /> },
  { path: "/country/:countryId/terrain-realities", element: <LazyTerrainRealities /> },
  { path: "/compare", element: <LazyCompareUnified /> },
];

/** Analysis and testing tools */
export const analysisRoutes = [
  { path: "/profile-test", element: <LazyProfileTest /> },
  { path: "/life-trajectory", element: <LazyLifeTrajectory /> },
  { path: "/profile-matcher", element: <LazyProfileMatcher /> },
  { path: "/fiscal-calculator", element: <LazyFiscalCalculator /> },
];

/** Exit keys and planning */
export const planningRoutes = [
  { path: "/exit-keys", element: <LazyExitKeys /> },
  { path: "/exit-keys/catalog", element: <LazyExitKeysCatalog /> },
  { path: "/exit-keys/compare", element: <LazyCompareExitKeys /> },
  { path: "/compare-exit-keys", element: <LazyCompareExitKeys /> },
  { path: "/prevention-filter", element: <LazyPreventionFilter /> },
  { path: "/errors-illusions", element: <LazyErrorsAndIllusions /> },
  { path: "/universal-errors/:id", element: <LazyUniversalErrorDetail /> },
];

/** Game and learning routes */
export const learningRoutes = [
  { path: "/pyramid-quiz", element: <LazyPyramidQuiz /> },
  { path: "/life-game", element: <LazyLifeGame /> },
  { path: "/personas", element: <LazyPersonaJourneys /> },
  { path: "/gamification", element: <LazyGamificationHub /> },
];

/** User dashboard and settings */
export const userRoutes = [
  { path: "/dashboard", element: <LazyDashboard /> },
  { path: "/usage", element: <LazyUsage /> },
  { path: "/settings/notifications", element: <LazyNotificationSettings /> },
];

/** B2B and institutional routes */
export const proRoutes = [
  { path: "/institutions", element: <LazyInstitutions /> },
  { path: "/b2b", element: <LazyB2BSolutions /> },
  { path: "/cases/:id", element: <LazyCaseDetail /> },
  { path: "/latent", element: <LazyLatentModule /> },
  { path: "/irreversa", element: <LazyIrreversaModule /> },
  { path: "/ovi", element: <LazyOVI /> },
];

/** Community and marketplace */
export const communityRoutes = [
  { path: "/experts", element: <LazyExpertMarketplace /> },
  { path: "/partner-services", element: <LazyPartnerIntegrations /> },
  { path: "/community", element: <LazyCommunity /> },
];

/** Terrain and intel routes */
export const terrainRoutes = [
  { path: "/terrain", element: <LazyTerrainRealitiesSelector /> },
  { path: "/terrain/:countryId", element: <LazyTerrainRealities /> },
  { path: "/financial-safety-intel", element: <LazyFinancialSafetyIntel /> },
];

/** Content and resources */
export const contentRoutes = [
  { path: "/pyramid-types", element: <LazyPyramidTypes /> },
  { path: "/resources", element: <LazyResources /> },
  { path: "/how-to-read", element: <LazyHowToRead /> },
  { path: "/tools", element: <LazyToolsHub /> },
  { path: "/install", element: <LazyInstall /> },
  { path: "/academic", element: <LazyAcademicHub /> },
];

/** Admin routes - protected */
export const adminRoutes = [
  { path: "/admin/translations", element: <RequireAdmin><LazyAdminTranslations /></RequireAdmin> },
  { path: "/admin/analytics", element: <RequireAdmin><LazyAdminAnalytics /></RequireAdmin> },
  { path: "/admin/country-generator", element: <RequireAdmin><LazyAdminCountryGenerator /></RequireAdmin> },
  { path: "/admin/generate-translations", element: <RequireAdmin><LazyAdminGenerateTranslations /></RequireAdmin> },
  { path: "/admin/database-translations", element: <RequireAdmin><LazyAdminDatabaseTranslations /></RequireAdmin> },
  { path: "/admin/partners", element: <RequireAdmin><LazyAdminPartners /></RequireAdmin> },
  { path: "/admin/translations-sync", element: <RequireAdmin><LazyAdminTranslationsSync /></RequireAdmin> },
  { path: "/seed-translations", element: <LazySeedTranslations /> },
  { path: "/diagnostics", element: <LazyDiagnostics /> },
];

/** Redirects for legacy URLs */
export const redirectRoutes = [
  { path: "/match", element: <Navigate to="/profile-matcher" replace /> },
  { path: "/multi-compare", element: <Navigate to="/compare?mode=multi" replace /> },
  { path: "/systemic-mistakes", element: <Navigate to="/errors-illusions" replace /> },
  { path: "/universal-errors", element: <Navigate to="/errors-illusions" replace /> },
  { path: "/orientation-hub", element: <Navigate to="/about" replace /> },
];

/** 404 fallback */
export const fallbackRoute = { path: "*", element: <NotFound /> };

/** All routes combined */
export const allRoutes = [
  ...coreRoutes,
  ...countryRoutes,
  ...analysisRoutes,
  ...planningRoutes,
  ...learningRoutes,
  ...userRoutes,
  ...proRoutes,
  ...communityRoutes,
  ...terrainRoutes,
  ...contentRoutes,
  ...adminRoutes,
  ...redirectRoutes,
  fallbackRoute,
];
