import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import Index from "./pages/Index";
import Countries from "./pages/Countries";
import CountryDetail from "./pages/CountryDetail";
import ProfileTest from "./pages/ProfileTest";
import LifeTrajectory from "./pages/LifeTrajectory";
import Match from "./pages/Match";
import Compare from "./pages/Compare";
import Resources from "./pages/Resources";
import PyramidTypes from "./pages/PyramidTypes";
import PyramidQuiz from "./pages/PyramidQuiz";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ExitKeys from "./pages/ExitKeys";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/countries" element={<Countries />} />
            <Route path="/country/:id" element={<CountryDetail />} />
            <Route path="/profile-test" element={<ProfileTest />} />
            <Route path="/life-trajectory" element={<LifeTrajectory />} />
            <Route path="/match" element={<Match />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/pyramid-types" element={<PyramidTypes />} />
            <Route path="/pyramid-quiz" element={<PyramidQuiz />} />
            <Route path="/exit-keys" element={<ExitKeys />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
