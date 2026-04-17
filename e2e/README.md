# E2E Tests — Playwright

Tests end-to-end pour les parcours critiques de Pyramid Compass.

## Installation (1ère fois)

```bash
npm run test:e2e:install
```

## Lancer les tests

```bash
# Mode headless (CI / dev rapide)
npm run test:e2e

# Mode UI interactif (debug visuel)
npm run test:e2e:ui

# Matrice complète (Chromium + Firefox + WebKit + mobile)
PLAYWRIGHT_FULL_MATRIX=1 npm run test:e2e
```

Par défaut, seul **Chromium desktop** tourne pour rester rapide. La matrice complète
n'est lancée qu'à la demande (CI nightly, validation release).

## Parcours couverts (J30 — Phase 1 stabilisation)

| Spec | Parcours | Criticité |
|------|----------|-----------|
| `auth.spec.ts` | Login, signup, validation, password toggle | P0 |
| `navigation.spec.ts` | Header, footer, lang switch, 404, responsive | P0 |
| `dashboard.spec.ts` | Accès dashboard, redirection guest, tabs | P0 |
| `exit-keys.spec.ts` | Wizard, catalog, filtres, comparaison | P0 |
| `compare.spec.ts` | Sélecteurs pays, table comparative | P1 |
| `payment.spec.ts` | Pricing, CTAs, redirection checkout | P1 |

## Convention

- Toutes les routes publiques utilisent le **préfixe `/fr`** (i18n routing).
- Préférer `getByRole`, `getByLabel`, sélecteurs sémantiques.
- Tests **idempotents** : ne créent pas de données persistantes, ne passent pas par Stripe live.

## Roadmap (J90)

- Authenticated tests via Playwright `storageState`
- Visual regression sur landing + 3 country pages
- Lighthouse perf budget par parcours
