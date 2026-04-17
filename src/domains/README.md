# Bounded Contexts (`src/domains/`)

This folder organizes the codebase by **business domain** rather than by technical type. Each subdirectory is a *bounded context* with its own state, types, and Supabase access.

## Domains

| Domain | Responsibility |
|---|---|
| `_shared` | Cross-domain primitives (navigation context, common types) |
| `auth` | User session, roles, admin checks |
| `country` | Country data, comparison, saved countries |
| `exit-keys` | User profile and computed exit-key suggestions |
| `governance` | TraceOS decisions, latent zones, irreversa thresholds |
| `observability` | Re-export of `lib/observability` (logger, web vitals) |

## Dependency rules

1. A domain may import from `_shared` and from itself.
2. A domain **must not** import directly from another domain. Cross-domain communication goes through `_shared/navigationStore` or via a published store API.
3. UI (`src/components`, `src/pages`) may import any domain's `index.ts` (barrel) — never internals.

The ESLint rule `no-restricted-imports` (warn) flags violations.

## Migration status

| Item | Status |
|---|---|
| `useNavigationContext` (replaces `GlobalConnector`) | ✅ active |
| `GlobalConnector.tsx` | ⚠️ deprecated shim (logs warning) |
| Per-domain Zustand stores | ✅ scaffolded |
| Move of `useExitKeysProfile`, `useAuth` into domains | ⏳ next sprint |

Removal target for the shim: **after one stable sprint with no console warnings**.
