// Main Application Router - v2.0 with i18n routing prefixes
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import { FeatureFlagProvider } from "@/shared/components/FeatureFlag";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OnboardingDialog } from "@/components/OnboardingDialog";
import { DisclaimerConsentDialog } from "@/components/DisclaimerConsentDialog";
import { DialogCoordinatorProvider } from "@/components/DialogCoordinator";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { CookieConsent } from "@/components/ui/cookie-consent";
import { ContextualShortcuts, AppSidebar, Breadcrumbs } from "@/components/navigation";
import { GlobalErrorBoundary, DevDiagnosticsPanel } from "@/components/diagnostics";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { AiChatPanel } from "@/components/ai/AiChatPanel";
import { FeatureDiscoveryTooltips } from "@/components/landing/FeatureDiscoveryTooltips";
import { allLocalizedRoutes, LEGACY_ROUTE_SEGMENTS } from "@/routes";
import { OrganizationJsonLd, SoftwareApplicationJsonLd, ServiceJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";
import { HreflangTags } from "@/components/seo/HreflangTags";
import { AutoCanonical } from "@/components/seo/AutoCanonical";
import { LanguageRouter, RedirectToLanguage, LegacyRedirect } from "@/components/i18n";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppLayout = () => (
  <SidebarProvider defaultOpen={false}>
    <SmoothScrollProvider>
    <DialogCoordinatorProvider>
      <DisclaimerConsentDialog />
      <OnboardingDialog />
      <div className="min-h-screen flex w-full">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-md focus:bg-primary focus:text-primary-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Aller au contenu principal
        </a>
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
           <Breadcrumbs />
           <AutoCanonical />
           <main id="main-content" className="flex-1">
            <Routes>
              {allLocalizedRoutes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={route.element}
                />
              ))}
            </Routes>
          </main>
          <Footer />
          <ContextualShortcuts />
          <OfflineBanner />
          <CookieConsent />
          <AiChatPanel />
           <FeatureDiscoveryTooltips />
           {import.meta.env.DEV && <DevDiagnosticsPanel />}
        </div>
      </div>
    </DialogCoordinatorProvider>
    </SmoothScrollProvider>
  </SidebarProvider>
);

const App = () => (
  <HelmetProvider>
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SubscriptionProvider>
            <FeatureFlagProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <OrganizationJsonLd />
                  <SoftwareApplicationJsonLd />
                  <ServiceJsonLd />
                  <WebSiteJsonLd />
                  <HreflangTags />
                  <Routes>
                    {/* Root redirect: / → /:detectedLang/ */}
                    <Route path="/" element={<RedirectToLanguage />} />
                    
                    {/* i18n routes: /:lang/* */}
                    <Route path="/:lang/*" element={<LanguageRouter />}>
                      <Route path="*" element={<AppLayout />} />
                    </Route>

                    {/* Legacy non-prefixed routes → redirect to /:lang/path */}
                    {LEGACY_ROUTE_SEGMENTS.map(segment => (
                      <Route key={segment} path={`/${segment}/*`} element={<LegacyRedirect />} />
                    ))}
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </FeatureFlagProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  </HelmetProvider>
);

export default App;
