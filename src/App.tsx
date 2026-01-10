// Main Application Router
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// App Router - v1.0.1
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { FeatureFlagProvider } from "@/shared/components/FeatureFlag";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OnboardingDialog } from "@/components/OnboardingDialog";
import { DisclaimerConsentDialog } from "@/components/DisclaimerConsentDialog";
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
import SystemicMistakes from "./pages/SystemicMistakes";
import HowToRead from "./pages/HowToRead";
import AdminTranslations from "./pages/AdminTranslations";
import AdminAnalytics from "./pages/AdminAnalytics";
import MultiCompare from "./pages/MultiCompare";
import PreventionFilter from "./pages/PreventionFilter";
import UniversalErrors from "./pages/UniversalErrors";
import UniversalErrorDetail from "./pages/UniversalErrorDetail";
import QuickTest from "./pages/QuickTest";
import ErrorsAndIllusions from "./pages/ErrorsAndIllusions";
import OrientationHub from "./pages/OrientationHub";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import Pricing from "./pages/Pricing";
import ProfileMatcher from "./pages/ProfileMatcher";
import AdminCountryGenerator from "./pages/AdminCountryGenerator";
import AdminGenerateTranslations from "./pages/AdminGenerateTranslations";
import WorldMapExplorer from "./pages/WorldMapExplorer";
import Institutions from "./pages/Institutions";
import OVI from "./pages/OVI";
import B2BSolutions from "./pages/B2BSolutions";
import Partners from "./pages/Partners";

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
                    <Route path="/systemic-mistakes" element={<SystemicMistakes />} />
                    <Route path="/how-to-read" element={<HowToRead />} />
                    <Route path="/admin/translations" element={<AdminTranslations />} />
                    <Route path="/admin/analytics" element={<AdminAnalytics />} />
                    <Route path="/prevention-filter" element={<PreventionFilter />} />
                    <Route path="/universal-errors" element={<UniversalErrors />} />
                    <Route path="/universal-errors/:id" element={<UniversalErrorDetail />} />
                    <Route path="/errors-illusions" element={<ErrorsAndIllusions />} />
                    <Route path="/orientation-hub" element={<OrientationHub />} />
                    <Route path="/quick-test" element={<QuickTest />} />
                    <Route path="/subscription-success" element={<SubscriptionSuccess />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/profile-matcher" element={<ProfileMatcher />} />
                    <Route path="/admin/country-generator" element={<AdminCountryGenerator />} />
                    <Route path="/admin/generate-translations" element={<AdminGenerateTranslations />} />
                    <Route path="/institutions" element={<Institutions />} />
                    <Route path="/ovi" element={<OVI />} />
                    <Route path="/b2b" element={<B2BSolutions />} />
                    <Route path="/partners" element={<Partners />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </FeatureFlagProvider>
      </SubscriptionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
