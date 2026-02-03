# 🏗️ Architecture Technique

> Dernière mise à jour : 2026-02-03

## Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │  Pages  │  │  Hooks  │  │  Store  │  │  Utils  │            │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘            │
│       │            │            │            │                  │
│       └────────────┴────────────┴────────────┘                  │
│                           │                                      │
│                   ┌───────┴───────┐                             │
│                   │  Supabase SDK │                             │
│                   └───────┬───────┘                             │
└───────────────────────────┼─────────────────────────────────────┘
                            │ HTTPS
┌───────────────────────────┼─────────────────────────────────────┐
│                    LOVABLE CLOUD                                │
├───────────────────────────┼─────────────────────────────────────┤
│                   ┌───────┴───────┐                             │
│                   │   API Gateway │                             │
│                   └───────┬───────┘                             │
│       ┌───────────────────┼───────────────────┐                 │
│       │                   │                   │                 │
│  ┌────┴────┐        ┌─────┴─────┐       ┌─────┴─────┐          │
│  │   Auth  │        │  Database │       │   Edge    │          │
│  │ Service │        │  (Postgres)│      │ Functions │          │
│  └─────────┘        └───────────┘       └───────────┘          │
│                                               │                 │
│                           ┌───────────────────┼────────────┐    │
│                           │                   │            │    │
│                     ┌─────┴─────┐      ┌──────┴─────┐ ┌────┴───┐│
│                     │  OpenAI   │      │   Stripe   │ │  Suno  ││
│                     └───────────┘      └────────────┘ └────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Stack Technique

| Couche | Technologie | Version |
|--------|-------------|---------|
| Frontend | React + TypeScript | 18.3.1 |
| Bundler | Vite | 5.x |
| Styling | Tailwind CSS | 3.x |
| UI Components | shadcn/ui | Latest |
| State Management | TanStack Query | 5.x |
| Routing | React Router | 7.x |
| i18n | i18next | 25.x |
| Backend | Lovable Cloud (Supabase) | - |
| Database | PostgreSQL | 15 |
| Auth | Supabase Auth | JWT |
| Functions | Deno Edge Functions | - |

## Structure des Dossiers

```
pyramid-compass/
├── docs/                    # Documentation
│   ├── audit/              # Rapports d'audit
│   ├── screenshots/        # Captures d'écran
│   └── API.md              # Documentation API
├── public/                  # Assets statiques
├── scripts/                 # Scripts de maintenance
│   ├── audit/              # Scripts de vérification
│   └── hooks/              # Git hooks
├── src/
│   ├── assets/             # Images, fonts, etc.
│   ├── components/         # Composants React
│   │   ├── common/         # Composants partagés
│   │   ├── diagnostics/    # Monitoring et debug
│   │   ├── navigation/     # Navigation (sidebar, breadcrumbs)
│   │   ├── pwa/            # Composants PWA
│   │   └── ui/             # Primitives shadcn/ui
│   ├── hooks/              # Custom hooks
│   ├── integrations/       # Intégrations externes
│   │   └── supabase/       # Client et types Supabase
│   ├── lib/                # Utilitaires et helpers
│   ├── locales/            # Fichiers de traduction
│   ├── pages/              # Pages/routes
│   ├── routes/             # Configuration du routing
│   ├── shared/             # Code partagé cross-modules
│   └── types/              # Définitions TypeScript
├── supabase/
│   ├── functions/          # 35 Edge Functions
│   └── migrations/         # 77 migrations SQL
└── tests/                   # Tests unitaires et e2e
```

## Flux de Données

### 1. Chargement Initial

```
User → App.tsx → AuthProvider → Check Session
                      ↓
              Session Valid? ─── No ──→ Redirect /auth
                      │
                     Yes
                      ↓
              SubscriptionProvider → Check Tier
                      ↓
              FeatureFlagProvider → Enable Features
                      ↓
                 Render App
```

### 2. Requête API Authentifiée

```
Component → useQuery/useMutation
                ↓
         Supabase Client
                ↓
    Add Authorization Header (JWT)
                ↓
         Edge Function
                ↓
    Validate JWT → Extract user_id
                ↓
    Execute Business Logic
                ↓
    Return Response + Apply RLS
```

### 3. Génération de Contenu AI

```
User Action → ai-assist Edge Function
                    ↓
        Check Subscription Tier
                    ↓
        Tier >= Premium? ─── No ──→ 403 Forbidden
                    │
                   Yes
                    ↓
        Call OpenAI/Lovable AI API
                    ↓
        Log to ai_activity_log
                    ↓
        Increment ai_usage_metering
                    ↓
        Return AI Response
```

## Modules Principaux

### Core (Toujours chargé)
- `Index` - Page d'accueil
- `Auth` - Authentification
- `About` - À propos
- `Header/Footer` - Navigation

### Lazy-Loaded (À la demande)

| Module | Routes | Composants Clés |
|--------|--------|-----------------|
| Countries | `/countries`, `/country/:id` | CountryCard, CountryDetail |
| Exit Keys | `/exit-keys/*` | ExitKeysPlanner, ExitKeysCatalog |
| Dashboard | `/dashboard` | DashboardProgress, DeadlinesList |
| Game | `/life-game` | AdaptiveScenarioEngine, HexagonalBoard |
| B2B | `/b2b`, `/cases/:id` | CaseDetail, GovernanceActors |
| Admin | `/admin/*` | TranslationsManager, Analytics |

## Providers (Ordre d'Initialisation)

```tsx
<GlobalErrorBoundary>           // 1. Capture toutes les erreurs
  <QueryClientProvider>         // 2. Cache des requêtes
    <AuthProvider>              // 3. Session utilisateur
      <SubscriptionProvider>    // 4. Tier d'abonnement
        <FeatureFlagProvider>   // 5. Feature flags
          <TooltipProvider>     // 6. UI
            <BrowserRouter>     // 7. Routing
              <SidebarProvider> // 8. Layout
                <DialogCoordinatorProvider> // 9. Modales
                  <App />
                </DialogCoordinatorProvider>
              </SidebarProvider>
            </BrowserRouter>
          </TooltipProvider>
        </FeatureFlagProvider>
      </SubscriptionProvider>
    </AuthProvider>
  </QueryClientProvider>
</GlobalErrorBoundary>
```

## Stratégies de Cache

### TanStack Query

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes
      gcTime: 30 * 60 * 1000,    // 30 minutes (garbage collection)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Service Worker (PWA)

```typescript
// Stratégie NetworkFirst pour API
runtimeCaching: [
  {
    urlPattern: /\/functions\/v1\/.*/,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'api-cache',
      expiration: { maxEntries: 100, maxAgeSeconds: 86400 },
    },
  },
]
```

## Métriques de Performance

| Métrique | Cible | Actuel |
|----------|-------|--------|
| First Contentful Paint | < 1.5s | ✅ 1.2s |
| Time to Interactive | < 3s | ✅ 2.4s |
| Largest Contentful Paint | < 2.5s | ✅ 2.1s |
| Cumulative Layout Shift | < 0.1 | ✅ 0.05 |
| Bundle Size (gzipped) | < 500KB | ✅ 420KB |
