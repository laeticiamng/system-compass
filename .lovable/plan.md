
The user wants to continue applying complex-system architecture + governance logic to the platform. We've already delivered:
- Phase 0: 360° audit (PDF)
- Chantier #1: Playwright E2E (44 tests, 6 paths)
- Chantier #2: Rate-limiting (5 edge functions) + i18n linter
- Hotfix: send-email JSX runtime

Remaining Phase 1 chantiers from the original plan:
- #3 Observabilité (logging maison via edge function + table `error_logs`, since user chose "alternative gratuite")
- #4 Bounded contexts `src/domains/` + Zustand migration of `GlobalConnector`
- #5 Dashboard gouvernance interne `/admin/governance`

Plan the next logical step. Given governance + system-architecture framing, the highest leverage now is **Observabilité maison** (prerequisite for the governance dashboard, which consumes its data). Then the governance dashboard. The Zustand refactor is heavier and benefits from having tests + observability already in place.

Proposing Chantier #3 + #5 as a coherent pair (observability → dashboard that visualizes it), keeping #4 (architecture refactor) as a separate next step.

---

## Plan — Phase 1 suite : Observabilité maison + Dashboard de gouvernance

### Objectif systémique
Donner à la plateforme un **système nerveux** : capter les signaux faibles (erreurs, latence, abus) puis les rendre lisibles dans un cockpit unique. Sans ça, toute décision d'architecture se fait à l'aveugle.

### Chantier #3 — Observabilité maison (alternative gratuite à Sentry)

**Backend**
- Migration : table `error_logs` (id, user_id nullable, level, source [`web`|`edge`|`api`], message, stack, context jsonb, url, user_agent, release, created_at)
- RLS : insert public anon (logs frontend), select admin only via `has_role`
- Index sur `(created_at desc)`, `(level)`, `(source)`
- Trigger : auto-purge > 30 jours

**Edge function `log-error`**
- POST { level, message, stack?, context?, source, url? }
- Validation Zod, rate-limit 60/min/IP (réutilise helper existant)
- `verify_jwt = false` (logs anonymes possibles), résout user_id via header si présent

**Client**
- `src/lib/observability/logger.ts` : `logError`, `logWarn`, `logInfo` → batch + flush toutes 5s
- Hook dans `GlobalErrorBoundary` existant → envoie automatiquement
- Wrapper `window.onerror` + `unhandledrejection`
- Web Vitals (`LCP`, `INP`, `CLS`) → même endpoint avec `level=info`

### Chantier #5 — Dashboard `/admin/governance`

Page protégée par `has_role('admin')`. Sections :

1. **Santé technique (24h / 7j / 30j)**
   - Erreurs par niveau (sparkline)
   - Top 10 erreurs par fréquence
   - p50/p95 Web Vitals
   - Edge functions : invocations + taux d'erreur (via `analytics_events`)

2. **Sécurité & abus**
   - Compteurs rate-limit hits par fonction
   - Tentatives auth échouées
   - Comptes supprimés (delete-account)

3. **Activation produit**
   - DAU/WAU/MAU (depuis `analytics_events`)
   - Funnel : signup → onboarding → premier export
   - Top pays consultés

4. **Dette & qualité (statique, snapshot manuel)**
   - Couverture E2E (badge)
   - Nb edge functions / tables / pages
   - Date dernier audit

### Détails techniques

```text
src/
├── lib/observability/
│   ├── logger.ts              ← API publique (logError, batch)
│   ├── webVitals.ts           ← onLCP/onINP/onCLS → logger
│   └── index.ts
├── pages/admin/
│   └── Governance.tsx         ← /admin/governance (route localisée)
└── components/admin/governance/
    ├── HealthSection.tsx
    ├── SecuritySection.tsx
    ├── ActivationSection.tsx
    └── QualityDebtSection.tsx

supabase/
├── migrations/
│   └── <ts>_error_logs.sql
└── functions/
    └── log-error/
        ├── index.ts
        └── deno.json (si JSX, sinon non)
```

- Route ajoutée dans le router avec garde `RequireRole admin`
- Aucun lien public — accès via URL directe ou menu admin existant
- Charts : `recharts` (déjà présent)
- Pas de polling temps réel pour v1 (refresh manuel + auto 60s) → coût 0

### Hors scope (prochaines étapes)
- Chantier #4 (Zustand + `src/domains/`) : à faire ensuite, demande un PR dédié
- Alerting email/Slack sur erreurs critiques : v2
- SOC2 evidence collection : Phase 4

### Livrables
- 1 migration SQL + 1 edge function `log-error`
- 1 module `lib/observability` câblé sur ErrorBoundary
- 1 page `/admin/governance` avec 4 sections fonctionnelles
- README court : comment lire le dashboard, comment forcer une purge

### Risques & mitigations
- **Volume logs** → purge auto 30j + niveaux (info filtré côté client en prod)
- **PII dans stacks** → scrub côté edge (regex email/UUID basique)
- **Faux positifs** → `level=warn` par défaut pour erreurs non-Error throw

<lov-actions>
<lov-suggestion message="Vas-y, exécute le Chantier #3 (Observabilité maison) puis enchaîne avec le Chantier #5 (Dashboard /admin/governance) comme prévu.">Exécuter #3 + #5</lov-suggestion>
<lov-suggestion message="Fais uniquement le Chantier #3 (Observabilité : table error_logs + edge function log-error + logger client + Web Vitals). On verra le dashboard ensuite.">Juste #3 d'abord</lov-suggestion>
<lov-suggestion message="Saute l'observabilité pour l'instant et attaque directement le Chantier #4 : refactor architecture src/domains/ + migration GlobalConnector vers Zustand.">Chantier #4 à la place</lov-suggestion>
<lov-suggestion message="Avant d'exécuter, ajoute au plan un système d'alerting (email admin via Resend) quand le taux d'erreur dépasse un seuil configurable.">Ajouter alerting au plan</lov-suggestion>
</lov-actions>
