// Main Application Router - v1.4.1 with Modular Routes + Breadcrumbs + Diagnostics + SEO
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
import { allRoutes } from "@/routes";
import { OrganizationJsonLd, SoftwareApplicationJsonLd, ServiceJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";
import { HreflangTags } from "@/components/seo/HreflangTags";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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
                  <SidebarProvider defaultOpen={false}>
                    <DialogCoordinatorProvider>
                      <DisclaimerConsentDialog />
                      <OnboardingDialog />
                      {/* OnboardingTour removed - integrated into OnboardingDialog */}
                      <div className="min-h-screen flex w-full">
                        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-primary focus:text-primary-foreground">
                          Skip to main content
                        </a>
                        <AppSidebar />
                        <div className="flex-1 flex flex-col min-w-0">
                          <Header />
                          <Breadcrumbs />
                          <main id="main-content" className="flex-1">
                            <Routes>
                              {allRoutes.map((route) => (
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
                          {import.meta.env.DEV && <DevDiagnosticsPanel />}
                        </div>
                      </div>
                    </DialogCoordinatorProvider>
                  </SidebarProvider>
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
