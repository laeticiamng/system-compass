/**
 * Route Configuration - Centralized route definitions
 * v20.0 - i18n routing with /:lang/* prefix support
 * Routes use relative paths for nesting under LanguageRouter
 */

import { Navigate } from "react-router-dom";
import { RequireAdmin } from "@/components/RequireAdmin";

// Eagerly loaded pages
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Disclaimer from "@/pages/Disclaimer";
import CGV from "@/pages/CGV";
import MentionsLegales from "@/pages/MentionsLegales";
import Privacy from "@/pages/Privacy";
import QuickTest from "@/pages/QuickTest";
import SubscriptionSuccess from "@/pages/SubscriptionSuccess";
import Pricing from "@/pages/Pricing";
import Partners from "@/pages/Partners";

// Lazy loaded pages
import {
  LazyCountries, LazyCountryDetail, LazyWorldMapExplorer,
  LazyCompareUnified, LazyLifeGame, LazyPyramidQuiz,
  LazyExitKeys, LazyExitKeysCatalog, LazyCompareExitKeys,
  LazyProfileMatcher, LazyProfileTest, LazyLifeTrajectory,
  LazyDashboard, LazyUsage, LazyNotificationSettings,
  LazyInstitutions, LazyB2BSolutions, LazyCaseDetail,
  LazyLatentModule, LazyIrreversaModule,
  LazyTerrainRealities, LazyTerrainRealitiesSelector,
  LazyFinancialSafetyIntel,
  LazyAdminTranslations, LazyAdminAnalytics, LazyAdminCountryGenerator,
  LazyAdminGenerateTranslations, LazyAdminDatabaseTranslations,
  LazyAdminPartners, LazyAdminTranslationsSync, LazySeedTranslations,
  LazyAdminDataSources, LazyPyramidTypes, LazyResources,
  LazyOVI, LazyErrorsAndIllusions, LazyPreventionFilter,
  LazyUniversalErrorDetail, LazyHowToRead, LazyDiagnostics,
  LazyFiscalCalculator, LazyFiscalCalculatorAdvanced, LazySpecialRegimes,
  LazyPersonaJourneys, LazyGamificationHub,
  LazyExpertMarketplace, LazyExpertProfile, LazyBecomeExpert,
  LazyConsultationSuccess, LazyAdminExperts,
  LazyInstall, LazyToolsHub, LazyAcademicHub,
  LazyPartnerIntegrations, LazyCommunity,
  LazyBlog, LazyBlogArticle, LazyThematicPaths,
  LazyFiscalSimulator, LazyCountryMatcher, LazyTraceJournal,
  LazyExpatriationTimeline, LazyCountryChecklist, LazyFiscalBeforeAfter, LazyChangelog,
  LazyRegulatoryAlerts, LazyFamilyWorkspace, LazyExpatReviews, LazyApiDocs,
  LazyWebhooksDocs, LazyLifeSimulator,
} from "@/routes/LazyRoutes";

// ============================================================
// LOCALIZED ROUTES (relative paths, nested under /:lang/*)
// ============================================================

export const coreRoutes = [
  { path: "", element: <Index /> },
  { path: "auth", element: <Auth /> },
  { path: "about", element: <About /> },
  { path: "disclaimer", element: <Disclaimer /> },
  { path: "cgv", element: <CGV /> },
  { path: "mentions-legales", element: <MentionsLegales /> },
  { path: "privacy", element: <Privacy /> },
  { path: "quick-test", element: <QuickTest /> },
  { path: "subscription-success", element: <SubscriptionSuccess /> },
  { path: "pricing", element: <Pricing /> },
  { path: "partners", element: <Partners /> },
  { path: "contact", element: <Contact /> },
];

export const countryRoutes = [
  { path: "countries", element: <LazyCountries /> },
  { path: "world-map", element: <LazyWorldMapExplorer /> },
  { path: "country/:id", element: <LazyCountryDetail /> },
  { path: "country/:countryId/terrain-realities", element: <LazyTerrainRealities /> },
  { path: "compare", element: <LazyCompareUnified /> },
];

export const analysisRoutes = [
  { path: "profile-test", element: <LazyProfileTest /> },
  { path: "life-trajectory", element: <LazyLifeTrajectory /> },
  { path: "profile-matcher", element: <LazyProfileMatcher /> },
  { path: "fiscal-calculator", element: <LazyFiscalCalculator /> },
  { path: "fiscal-before-after", element: <LazyFiscalBeforeAfter /> },
];

export const planningRoutes = [
  { path: "exit-keys", element: <LazyExitKeys /> },
  { path: "exit-keys/catalog", element: <LazyExitKeysCatalog /> },
  { path: "exit-keys/compare", element: <LazyCompareExitKeys /> },
  { path: "compare-exit-keys", element: <LazyCompareExitKeys /> },
  { path: "prevention-filter", element: <LazyPreventionFilter /> },
  { path: "errors-illusions", element: <LazyErrorsAndIllusions /> },
  { path: "universal-errors/:id", element: <LazyUniversalErrorDetail /> },
  { path: "expatriation-timeline", element: <LazyExpatriationTimeline /> },
  { path: "checklist", element: <LazyCountryChecklist /> },
];

export const learningRoutes = [
  { path: "pyramid-quiz", element: <LazyPyramidQuiz /> },
  { path: "life-game", element: <LazyLifeGame /> },
  { path: "personas", element: <LazyPersonaJourneys /> },
  { path: "gamification", element: <LazyGamificationHub /> },
];

export const userRoutes = [
  { path: "dashboard", element: <LazyDashboard /> },
  { path: "usage", element: <LazyUsage /> },
  { path: "settings/notifications", element: <LazyNotificationSettings /> },
  { path: "family-workspace", element: <LazyFamilyWorkspace /> },
];

export const proRoutes = [
  { path: "institutions", element: <LazyInstitutions /> },
  { path: "b2b", element: <LazyB2BSolutions /> },
  { path: "cases/:id", element: <LazyCaseDetail /> },
  { path: "latent", element: <LazyLatentModule /> },
  { path: "irreversa", element: <LazyIrreversaModule /> },
  { path: "ovi", element: <LazyOVI /> },
];

export const communityRoutes = [
  { path: "partner-services", element: <LazyPartnerIntegrations /> },
  { path: "community", element: <LazyCommunity /> },
  { path: "expat-reviews", element: <LazyExpatReviews /> },
];

export const terrainRoutes = [
  { path: "terrain", element: <LazyTerrainRealitiesSelector /> },
  { path: "terrain/:countryId", element: <LazyTerrainRealities /> },
  { path: "financial-safety-intel", element: <LazyFinancialSafetyIntel /> },
];

export const contentRoutes = [
  { path: "pyramid-types", element: <LazyPyramidTypes /> },
  { path: "resources", element: <LazyResources /> },
  { path: "how-to-read", element: <LazyHowToRead /> },
  { path: "tools", element: <LazyToolsHub /> },
  { path: "tools/fiscal-calculator", element: <LazyFiscalCalculatorAdvanced /> },
  { path: "tools/fiscal-simulator", element: <LazyFiscalSimulator /> },
  { path: "tools/matcher", element: <LazyCountryMatcher /> },
  { path: "trace", element: <LazyTraceJournal /> },
  { path: "fiscal/special-regimes", element: <LazySpecialRegimes /> },
  { path: "install", element: <LazyInstall /> },
  { path: "experts", element: <LazyExpertMarketplace /> },
  { path: "experts/:id", element: <LazyExpertProfile /> },
  { path: "become-expert", element: <LazyBecomeExpert /> },
  { path: "consultation/:id/success", element: <LazyConsultationSuccess /> },
  { path: "academic", element: <LazyAcademicHub /> },
  { path: "blog", element: <LazyBlog /> },
  { path: "blog/:slug", element: <LazyBlogArticle /> },
  { path: "thematic-paths", element: <LazyThematicPaths /> },
  { path: "changelog", element: <LazyChangelog /> },
  { path: "regulatory-alerts", element: <LazyRegulatoryAlerts /> },
  { path: "api", element: <LazyApiDocs /> },
  { path: "webhooks", element: <LazyWebhooksDocs /> },
  { path: "life-simulator", element: <LazyLifeSimulator /> },
];

export const adminRoutes = [
  { path: "admin/translations", element: <RequireAdmin><LazyAdminTranslations /></RequireAdmin> },
  { path: "admin/analytics", element: <RequireAdmin><LazyAdminAnalytics /></RequireAdmin> },
  { path: "admin/country-generator", element: <RequireAdmin><LazyAdminCountryGenerator /></RequireAdmin> },
  { path: "admin/experts", element: <RequireAdmin><LazyAdminExperts /></RequireAdmin> },
  { path: "admin/generate-translations", element: <RequireAdmin><LazyAdminGenerateTranslations /></RequireAdmin> },
  { path: "admin/database-translations", element: <RequireAdmin><LazyAdminDatabaseTranslations /></RequireAdmin> },
  { path: "admin/partners", element: <RequireAdmin><LazyAdminPartners /></RequireAdmin> },
  { path: "admin/data-sources", element: <RequireAdmin><LazyAdminDataSources /></RequireAdmin> },
  { path: "admin/translations-sync", element: <RequireAdmin><LazyAdminTranslationsSync /></RequireAdmin> },
  { path: "seed-translations", element: <RequireAdmin><LazySeedTranslations /></RequireAdmin> },
  { path: "diagnostics", element: <RequireAdmin><LazyDiagnostics /></RequireAdmin> },
];

export const redirectRoutes = [
  { path: "match", element: <Navigate to="../profile-matcher" replace /> },
  { path: "multi-compare", element: <Navigate to="../compare?mode=multi" replace /> },
  { path: "systemic-mistakes", element: <Navigate to="../prevention-filter" replace /> },
  { path: "universal-errors", element: <Navigate to="../prevention-filter" replace /> },
  { path: "orientation-hub", element: <Navigate to="../about" replace /> },
  { path: "test", element: <Navigate to="../quick-test" replace /> },
  { path: "login", element: <Navigate to="../auth" replace /> },
  { path: "map", element: <Navigate to="../world-map" replace /> },
  { path: "strategies", element: <Navigate to="../exit-keys" replace /> },
  { path: "profile", element: <Navigate to="../dashboard" replace /> },
  { path: "game", element: <Navigate to="../life-game" replace /> },
  { path: "matcher", element: <Navigate to="../profile-matcher" replace /> },
  { path: "legal", element: <Navigate to="../mentions-legales" replace /> },
];

export const fallbackRoute = { path: "*", element: <NotFound /> };

/** All localized routes (relative paths for /:lang/* nesting) */
export const allLocalizedRoutes = [
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

/**
 * Legacy route paths (without leading /) for catching old URLs
 * These are all unique first segments that need to redirect to /:lang/path
 */
export const LEGACY_ROUTE_SEGMENTS = [
  'auth', 'about', 'disclaimer', 'cgv', 'mentions-legales', 'privacy',
  'quick-test', 'subscription-success', 'pricing', 'partners',
  'countries', 'world-map', 'country', 'compare',
  'profile-test', 'life-trajectory', 'profile-matcher', 'fiscal-calculator',
  'exit-keys', 'compare-exit-keys', 'prevention-filter', 'errors-illusions', 'universal-errors',
  'pyramid-quiz', 'life-game', 'personas', 'gamification',
  'dashboard', 'usage', 'settings',
  'institutions', 'b2b', 'cases', 'latent', 'irreversa', 'ovi',
  'partner-services', 'community',
  'terrain', 'financial-safety-intel',
  'pyramid-types', 'resources', 'how-to-read', 'tools', 'trace',
  'fiscal', 'install', 'experts', 'become-expert', 'consultation',
  'academic', 'blog', 'thematic-paths',
  'admin', 'seed-translations', 'diagnostics',
  'match', 'multi-compare', 'systemic-mistakes', 'orientation-hub',
  'test', 'login', 'map', 'strategies', 'profile', 'game', 'matcher', 'legal',
  'life-simulator',
];
