import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { autoSeedTranslationsIfEmpty } from "./lib/translations-seeder";

// Auto-seed translations to database if empty (runs once on startup)
autoSeedTranslationsIfEmpty().catch(console.warn);

createRoot(document.getElementById("root")!).render(<App />);
