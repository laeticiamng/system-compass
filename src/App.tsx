// Main Application Router - v1.4.0 with Modular Routes + Breadcrumbs
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import { ContextualShortcuts, AppSidebar, Breadcrumbs, OnboardingTour } from "@/components/navigation";
import { allRoutes } from "@/routes";

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
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SubscriptionProvider>
        <FeatureFlagProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <SidebarProvider defaultOpen={false}>
                <DialogCoordinatorProvider>
                  <DisclaimerConsentDialog />
                  <OnboardingDialog />
                  <OnboardingTour />
                  <div className="min-h-screen flex w-full">
                    <AppSidebar />
                    <div className="flex-1 flex flex-col min-w-0">
                      <Header />
                      <Breadcrumbs />
                      <main className="flex-1">
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
);

export default App;
