// Main Application Router - v1.1.0 with Lazy Loading
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { FeatureFlagProvider } from "@/shared/components/FeatureFlag";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OnboardingDialog } from "@/components/OnboardingDialog";
import { DisclaimerConsentDialog } from "@/components/DisclaimerConsentDialog";
import { DialogCoordinatorProvider } from "@/components/DialogCoordinator";
import { RequireAdmin } from "@/components/RequireAdmin";

// Eagerly loaded pages (small, frequently accessed)
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Disclaimer from "./pages/Disclaimer";
import QuickTest from "./pages/QuickTest";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import Pricing from "./pages/Pricing";
import Partners from "./pages/Partners";

// Lazy loaded pages (heavy, feature-rich)
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
} from "@/routes/LazyRoutes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SubscriptionProvider>
        <FeatureFlagProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <DialogCoordinatorProvider>
                <DisclaimerConsentDialog />
                <OnboardingDialog />
                <div className="min-h-screen flex flex-col">
                  <Header />
                  <main className="flex-1">
                    <Routes>
                      {/* Eager routes - frequently accessed, small */}
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/disclaimer" element={<Disclaimer />} />
                      <Route path="/quick-test" element={<QuickTest />} />
                      <Route path="/subscription-success" element={<SubscriptionSuccess />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="/partners" element={<Partners />} />

                      {/* Lazy routes - Country related */}
                      <Route path="/countries" element={<LazyCountries />} />
                      <Route path="/world-map" element={<LazyWorldMapExplorer />} />
                      <Route path="/country/:id" element={<LazyCountryDetail />} />
                      <Route path="/country/:countryId/terrain-realities" element={<LazyTerrainRealities />} />
                      <Route path="/compare" element={<LazyCompareUnified />} />

                      {/* Lazy routes - Analysis tools */}
                      <Route path="/profile-test" element={<LazyProfileTest />} />
                      <Route path="/life-trajectory" element={<LazyLifeTrajectory />} />
                      <Route path="/profile-matcher" element={<LazyProfileMatcher />} />
                      <Route path="/exit-keys" element={<LazyExitKeys />} />
                      <Route path="/exit-keys/catalog" element={<LazyExitKeysCatalog />} />
                      <Route path="/exit-keys/compare" element={<LazyCompareExitKeys />} />
                      <Route path="/compare-exit-keys" element={<LazyCompareExitKeys />} />

                      {/* Lazy routes - Game */}
                      <Route path="/pyramid-quiz" element={<LazyPyramidQuiz />} />
                      <Route path="/life-game" element={<LazyLifeGame />} />

                      {/* Lazy routes - Dashboard & User */}
                      <Route path="/dashboard" element={<LazyDashboard />} />
                      <Route path="/usage" element={<LazyUsage />} />
                      <Route path="/settings/notifications" element={<LazyNotificationSettings />} />

                      {/* Lazy routes - B2B & Institutional */}
                      <Route path="/institutions" element={<LazyInstitutions />} />
                      <Route path="/b2b" element={<LazyB2BSolutions />} />
                      <Route path="/cases/:id" element={<LazyCaseDetail />} />
                      <Route path="/latent" element={<LazyLatentModule />} />
                      <Route path="/irreversa" element={<LazyIrreversaModule />} />

                      {/* Lazy routes - Terrain & Intel */}
                      <Route path="/terrain" element={<LazyTerrainRealitiesSelector />} />
                      <Route path="/terrain/:countryId" element={<LazyTerrainRealities />} />
                      <Route path="/financial-safety-intel" element={<LazyFinancialSafetyIntel />} />

                      {/* Lazy routes - Content */}
                      <Route path="/pyramid-types" element={<LazyPyramidTypes />} />
                      <Route path="/resources" element={<LazyResources />} />
                      <Route path="/ovi" element={<LazyOVI />} />
                      <Route path="/errors-illusions" element={<LazyErrorsAndIllusions />} />
                      <Route path="/prevention-filter" element={<LazyPreventionFilter />} />
                      <Route path="/universal-errors/:id" element={<LazyUniversalErrorDetail />} />
                      <Route path="/how-to-read" element={<LazyHowToRead />} />

                      {/* Lazy routes - Admin */}
                      <Route path="/admin/translations" element={<RequireAdmin><LazyAdminTranslations /></RequireAdmin>} />
                      <Route path="/admin/analytics" element={<RequireAdmin><LazyAdminAnalytics /></RequireAdmin>} />
                      <Route path="/admin/country-generator" element={<RequireAdmin><LazyAdminCountryGenerator /></RequireAdmin>} />
                      <Route path="/admin/generate-translations" element={<RequireAdmin><LazyAdminGenerateTranslations /></RequireAdmin>} />
                      <Route path="/admin/database-translations" element={<RequireAdmin><LazyAdminDatabaseTranslations /></RequireAdmin>} />
                      <Route path="/admin/partners" element={<RequireAdmin><LazyAdminPartners /></RequireAdmin>} />
                      <Route path="/admin/translations-sync" element={<RequireAdmin><LazyAdminTranslationsSync /></RequireAdmin>} />
                      <Route path="/seed-translations" element={<LazySeedTranslations />} />
                      <Route path="/diagnostics" element={<LazyDiagnostics />} />

                      {/* Redirects */}
                      <Route path="/match" element={<Navigate to="/profile-matcher" replace />} />
                      <Route path="/multi-compare" element={<Navigate to="/compare?mode=multi" replace />} />
                      <Route path="/systemic-mistakes" element={<Navigate to="/errors-illusions" replace />} />
                      <Route path="/universal-errors" element={<Navigate to="/errors-illusions" replace />} />
                      <Route path="/orientation-hub" element={<Navigate to="/about" replace />} />

                      {/* 404 */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              </DialogCoordinatorProvider>
            </BrowserRouter>
          </TooltipProvider>
        </FeatureFlagProvider>
      </SubscriptionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;