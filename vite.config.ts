import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
// Configuration Supabase PUBLIQUE de secours (URL + clé anon, protégées par les RLS).
// Les builds Lovable n'ont plus de .env depuis son retrait du dépôt : sans ces valeurs,
// le site affichait la page de maintenance / une page blanche. Un .env ou l'environnement
// restent prioritaires. Ajouté le 07.10.2026 avec l'accord de la CEO.
const SUPABASE_URL_FALLBACK = "https://abysiagseykztutnbjtu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY_FALLBACK = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFieXNpYWdzZXlrenR1dG5ianR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MTY2OTYsImV4cCI6MjA4MzM5MjY5Nn0.QE6ruBuuGWJRY2Fls5kXfEFxCMXZZUrmfWM2d_l-qDs";
const SUPABASE_PROJECT_ID_FALLBACK = "abysiagseykztutnbjtu";

function supabaseDefine(mode: string): Record<string, string> {
  const env = { ...loadEnv(mode, process.cwd(), "VITE_"), ...process.env };
  return {
    ...(!env.VITE_SUPABASE_URL && { "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(SUPABASE_URL_FALLBACK) }),
    ...(!env.VITE_SUPABASE_PUBLISHABLE_KEY && {
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(SUPABASE_PUBLISHABLE_KEY_FALLBACK),
    }),
    ...(!env.VITE_SUPABASE_PROJECT_ID && {
      "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(SUPABASE_PROJECT_ID_FALLBACK),
    }),
  };
}

export default defineConfig(({ mode }) => ({
  define: supabaseDefine(mode),
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "icons/*.png"],
      manifest: false, // Use external manifest.json
      workbox: {
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,json}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api/, /^\/functions/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/countries.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "supabase-countries-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-api-cache",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 5 },
              networkTimeoutSeconds: 10,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-ui': ['framer-motion', 'sonner', 'cmdk', 'vaul'],
          'vendor-i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-query': ['@tanstack/react-query'],
          'radix-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-accordion',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-toast',
          ],
          'charts': ['recharts'],
          'maps': ['mapbox-gl'],
          'pdf': ['jspdf', 'html2canvas'],
          'markdown': ['react-markdown'],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
