import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { FeatureFlagProvider } from "@/shared/components/FeatureFlag";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Index from "./pages/Index";
import Countries from "./pages/Countries";
import CountryDetail from "./pages/CountryDetail";
import ProfileTest from "./pages/ProfileTest";
import LifeTrajectory from "./pages/LifeTrajectory";
import Match from "./pages/Match";
import Compare from "./pages/Compare";
import MultiCompare from "./pages/MultiCompare";
import Resources from "./pages/Resources";
import PyramidTypes from "./pages/PyramidTypes";
import PyramidQuiz from "./pages/PyramidQuiz";
import LifeGame from "./pages/LifeGame";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ExitKeys from "./pages/ExitKeys";
import CompareExitKeys from "./pages/CompareExitKeys";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <FeatureFlagProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/countries" element={<Countries />} />
                  <Route path="/country/:id" element={<CountryDetail />} />
                  <Route path="/profile-test" element={<ProfileTest />} />
                  <Route path="/life-trajectory" element={<LifeTrajectory />} />
                  <Route path="/match" element={<Match />} />
                  <Route path="/compare" element={<Compare />} />
                  <Route path="/multi-compare" element={<MultiCompare />} />
                  <Route path="/resources" element={<Resources />} />
                  <Route path="/pyramid-types" element={<PyramidTypes />} />
                  <Route path="/pyramid-quiz" element={<PyramidQuiz />} />
                  <Route path="/life-game" element={<LifeGame />} />
                  <Route path="/exit-keys" element={<ExitKeys />} />
                  <Route path="/exit-keys/compare" element={<CompareExitKeys />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </FeatureFlagProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
