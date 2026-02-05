import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { Loader2 } from "lucide-react";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { autoSeedTranslationsIfEmpty } from "./lib/translations-seeder";

// Auto-seed translations to database if empty (runs once on startup)
autoSeedTranslationsIfEmpty().catch(console.warn);

// Global loading fallback
function GlobalLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto" />
        <p className="text-muted-foreground text-sm">Chargement...</p>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={<GlobalLoadingFallback />}>
      <App />
    </Suspense>
  </StrictMode>
);
