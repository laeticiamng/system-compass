// Main Application Router
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// App Router - v1.0.3
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { FeatureFlagProvider } from "@/shared/components/FeatureFlag";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OnboardingDialog } from "@/components/OnboardingDialog";
import { DisclaimerConsentDialog } from "@/components/DisclaimerConsentDialog";
import { DialogCoordinatorProvider } from "@/components/DialogCoordinator";
import Index from "./pages/Index";
import Countries from "./pages/Countries";
import CountryDetail from "./pages/CountryDetail";
import ProfileTest from "./pages/ProfileTest";
import LifeTrajectory from "./pages/LifeTrajectory";
import Match from "./pages/Match";
import CompareUnified from "./pages/CompareUnified";
import Resources from "./pages/Resources";
import PyramidTypes from "./pages/PyramidTypes";
import PyramidQuiz from "./pages/PyramidQuiz";
import LifeGame from "./pages/LifeGame";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ExitKeys from "./pages/ExitKeys";
import ExitKeysCatalog from "./pages/ExitKeysCatalog";
import CompareExitKeys from "./pages/CompareExitKeys";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Disclaimer from "./pages/Disclaimer";
import HowToRead from "./pages/HowToRead";
import AdminTranslations from "./pages/AdminTranslations";
import AdminAnalytics from "./pages/AdminAnalytics";
import MultiCompare from "./pages/MultiCompare";
import PreventionFilter from "./pages/PreventionFilter";
import UniversalErrorDetail from "./pages/UniversalErrorDetail";
import { Navigate } from "react-router-dom";
import QuickTest from "./pages/QuickTest";
import ErrorsAndIllusions from "./pages/ErrorsAndIllusions";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import Pricing from "./pages/Pricing";
import ProfileMatcher from "./pages/ProfileMatcher";
import AdminCountryGenerator from "./pages/AdminCountryGenerator";
import AdminGenerateTranslations from "./pages/AdminGenerateTranslations";
import AdminDatabaseTranslations from "./pages/AdminDatabaseTranslations";
import WorldMapExplorer from "./pages/WorldMapExplorer";
import Institutions from "./pages/Institutions";
import OVI from "./pages/OVI";
import B2BSolutions from "./pages/B2BSolutions";
import Partners from "./pages/Partners";
import LatentModule from "./pages/LatentModule";
import IrreversaModule from "./pages/IrreversaModule";
import Usage from "./pages/Usage";
import NotificationSettings from "./pages/NotificationSettings";

const queryClient = new QueryClient();

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
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/countries" element={<Countries />} />
                    <Route path="/world-map" element={<WorldMapExplorer />} />
                    <Route path="/country/:id" element={<CountryDetail />} />
                    <Route path="/profile-test" element={<ProfileTest />} />
                    <Route path="/life-trajectory" element={<LifeTrajectory />} />
                    <Route path="/match" element={<Match />} />
                    <Route path="/compare" element={<CompareUnified />} />
                    <Route path="/multi-compare" element={<MultiCompare />} />
                    <Route path="/resources" element={<Resources />} />
                    <Route path="/pyramid-types" element={<PyramidTypes />} />
                    <Route path="/pyramid-quiz" element={<PyramidQuiz />} />
                    <Route path="/life-game" element={<LifeGame />} />
                    <Route path="/exit-keys" element={<ExitKeys />} />
                    <Route path="/exit-keys/catalog" element={<ExitKeysCatalog />} />
                    <Route path="/exit-keys/compare" element={<CompareExitKeys />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/disclaimer" element={<Disclaimer />} />
                    <Route path="/systemic-mistakes" element={<Navigate to="/errors-illusions" replace />} />
                    <Route path="/how-to-read" element={<HowToRead />} />
                    <Route path="/admin/translations" element={<AdminTranslations />} />
                    <Route path="/admin/analytics" element={<AdminAnalytics />} />
                    <Route path="/prevention-filter" element={<PreventionFilter />} />
                    <Route path="/universal-errors" element={<Navigate to="/errors-illusions" replace />} />
                    <Route path="/systemic-mistakes" element={<Navigate to="/errors-illusions" replace />} />
                    <Route path="/universal-errors/:id" element={<UniversalErrorDetail />} />
                    <Route path="/errors-illusions" element={<ErrorsAndIllusions />} />
                    <Route path="/orientation-hub" element={<Navigate to="/about" replace />} />
                    <Route path="/quick-test" element={<QuickTest />} />
                    <Route path="/subscription-success" element={<SubscriptionSuccess />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/profile-matcher" element={<ProfileMatcher />} />
                    <Route path="/admin/country-generator" element={<AdminCountryGenerator />} />
                    <Route path="/admin/generate-translations" element={<AdminGenerateTranslations />} />
                    <Route path="/admin/database-translations" element={<AdminDatabaseTranslations />} />
                    <Route path="/institutions" element={<Institutions />} />
                    <Route path="/ovi" element={<OVI />} />
                    <Route path="/b2b" element={<B2BSolutions />} />
                    <Route path="/partners" element={<Partners />} />
                    <Route path="/latent" element={<LatentModule />} />
                    <Route path="/irreversa" element={<IrreversaModule />} />
                    <Route path="/usage" element={<Usage />} />
                    <Route path="/settings/notifications" element={<NotificationSettings />} />
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
