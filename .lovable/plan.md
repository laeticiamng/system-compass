

# AUDIT TECHNIQUE COMPLET — System Compass / Lovable Cloud

---

## 1. RÉSUMÉ EXÉCUTIF

**État global** : La plateforme est techniquement impressionnante en scope (113 tables, 47 edge functions, 80+ pages, 13 langues). Le socle architectural est solide (code splitting, i18n routing, RLS généralisée, auth complète). Cependant, des **problèmes critiques de sécurité (CORS, RLS, injection de notifications), d'incohérence de branding (3 domaines email coexistent), et de fonctionnalités mockées en production** empêchent un lancement immédiat.

**Verdict go-live : NON EN L'ÉTAT**

### Top 5 P0 — Bloquants critiques
1. **CORS hardcodé `system-compass.app` dans ~17 edge functions** — Les fonctions check-subscription, create-checkout, ai-assist, etc. n'utilisent pas `_shared/cors.ts` et rejettent les requêtes depuis le domaine preview/lovable. **Toute fonctionnalité Stripe, IA, contact échoue hors du domaine de prod.**
2. **Injection de notifications (RLS)** — Tout utilisateur public peut insérer des notifications arbitraires dans la boîte de réception de n'importe quel utilisateur via `generation_notifications` (confirmé par security scan).
3. **Packs PMO exposés sans vérification de token** — La policy RLS de `pmo_generated_packs` expose toutes les packs partagés (snapshot_data, file_url) à tous les utilisateurs tant que `share_token IS NOT NULL`.
4. **Email "from" = `noreply@pyramid-compass.com`** — L'email de bienvenue, contact et digest hebdomadaire utilisent un domaine différent du domaine de production et du domaine légal (`emotionscare.com`). Risque de bounce/spam et incohérence de marque.
5. **Contact form envoie à `contact@system-compass.app`** — Au lieu de `contact@emotionscare.com` (mis à jour côté frontend mais pas dans l'edge function `send-contact`).

### Top 5 P1 — Très importants
1. **Price ID dans `useSubscription.tsx` (l. 39) ne correspond pas aux price IDs du webhook** — `price_1T8k86DFa5Y9NR1IPzfZhZrx` vs `price_1SxpOSDFa5Y9NR1I05modzpV` → risque de checkout non fonctionnel ou de mapping de tier incorrect.
2. **RLS permissives sur `country_generation_jobs` et `country_generation_batches`** — Tout utilisateur authentifié peut lire et modifier tous les jobs/batches de génération.
3. **Dashboard non protégé par guard d'auth** — `/dashboard` est accessible par URL directe sans être connecté (le composant gère l'état "non connecté" mais le contenu s'affiche).
4. **Données mockées/hardcodées présentées comme fonctionnelles** — Healthcare Community (MOCK_PEERS), Procedural Updates (dates 2026 inventées), Blog articles hardcodés, Expert Marketplace sans données DB.
5. **17+ edge functions n'utilisent pas `_shared/cors.ts`** — Duplication massive de CORS headers, maintenance impossible, et ajout de nouveau domaine nécessite de modifier chaque fichier.

---

## 2. TABLEAU D'AUDIT COMPLET

| Priorité | Domaine | Localisation | Problème | Risque | Recommandation | Faisable ? |
|----------|---------|-------------|----------|--------|----------------|------------|
| P0 | Security/CORS | 17 edge functions | CORS hardcodé `system-compass.app` au lieu de `_shared/cors.ts` | Toutes les APIs bloquées hors prod | Migrer vers `_shared/cors.ts` | Oui |
| P0 | RLS | `generation_notifications` | INSERT policy permet à tout public d'injecter des notifs à n'importe quel user | Injection de spam/phishing | Ajouter `auth.uid() = user_id` à WITH CHECK | Oui (migration) |
| P0 | RLS | `pmo_generated_packs` | SELECT exposé si `share_token IS NOT NULL` sans vérification du token | Fuite de données business | Exiger token dans la query | Oui (migration) |
| P0 | Branding | `send-email`, `send-contact`, `weekly-digest` | Email "from" = `noreply@pyramid-compass.com` | Bounce/spam + incohérence marque | Changer vers domaine vérifié | Oui |
| P0 | Branding | `send-contact/index.ts` l.68 | `to: ['contact@system-compass.app']` | Contact perdu | Changer vers `contact@emotionscare.com` | Oui |
| P1 | Billing | `useSubscription.tsx` l.39 | priceId `price_1T8k86...` ≠ webhook priceId `price_1Sxp...` | Checkout/tier mapping cassé | Aligner les IDs | Non (vérifier Stripe dashboard) |
| P1 | RLS | `country_generation_jobs/batches` | Tout authenticated peut SELECT/UPDATE tous les jobs | Data corruption admin | Restreindre à admin | Oui (migration) |
| P1 | Auth | `/dashboard` route | Pas de RequireAuth guard | Contenu affiché aux visiteurs anonymes | Ajouter guard ou redirect | Oui |
| P1 | UX/Data | Healthcare Community, Blog, Experts | Données 100% mockées en production | Fausse fonctionnalité | Bannières "en construction" | Partiellement fait |
| P1 | RLS | `financial_intel_generation_runs`, `ovi_suggestions` | `user_id IS NULL` rend les rows visibles à tous | Fuite de données | Supprimer le branch NULL | Oui (migration) |
| P2 | CORS | `_shared/cors.ts` | Preview domain `id-preview--*.lovable.app` non inclus | Dev/test bloqué | Ajouter pattern matching ou wildcard | Oui |
| P2 | SEO | `sitemap.xml` | Non confirmé si généré automatiquement | Indexation manquante | Vérifier/générer | Non confirmé |
| P2 | Performance | `SubscriptionProvider` | Check subscription toutes les 5 min même si pas de changement | Appels API inutiles | Vérifier uniquement au focus/auth change | Oui |
| P2 | i18n | `HealthcareCommunity`, `TaxCalculator` | Labels hardcodés en français | Cassé en multilingue | Wrapper `t()` | Partiellement fait |
| P2 | Security | `send-contact/index.ts` | HTML injection dans email body (sanitizedMessage non échappé) | XSS dans l'email admin | Échapper les HTML entities | Oui |
| P3 | Branding | localStorage keys | `pyramid-compass-*` prefix partout | Incohérence branding | Renommer en `compass-*` | Oui |
| P3 | Security | Security Definer Views | 6 vues SECURITY DEFINER (scan Supabase) | Risque si mal configuré | Auditer chaque vue | Non confirmé |

---

## 3. DÉTAIL PAR CATÉGORIE

### A. Frontend & Rendu
**Fonctionne** : Code splitting avec LazyRoutes/Suspense, Helmet SEO sur toutes les pages, i18n routing complet, error boundary global, responsive design avec breakpoints cohérents, sidebar + header adaptatifs.
**Cassé** : Rien de bloquant côté rendu pur.
**Douteux** : Dashboard loading state affiche "Chargement..." en français hardcodé (l.269).

### B. QA Fonctionnelle
**Fonctionne** : Auth flow (login/signup/OAuth/magic link/password reset), navigation i18n, country exploration, quick test, pricing display.
**Cassé** : Toute edge function appelée depuis le preview Lovable échoue (CORS). Send-contact envoie au mauvais email.
**Non confirmé** : Stripe checkout end-to-end (price IDs potentiellement désalignés).

### C. Auth & Autorisations
**Fonctionne** : `RequireAdmin` avec `useUserRoles` (table séparée, `has_role` SECURITY DEFINER). OAuth Google/Apple via Lovable Cloud auth. Session refresh. Logout avec nettoyage localStorage.
**Cassé** : Dashboard accessible sans auth (pas de guard, contenu visible).
**Douteux** : `rememberMe` checkbox dans Auth.tsx ne fait rien (Supabase persiste toujours la session).

### D. APIs & Edge Functions
**Fonctionne** : Architecture edge functions solide (47 fonctions), `_shared/` avec CORS, rate-limit, validation. Admin functions vérifient les claims.
**Cassé** : 17+ fonctions ignorent `_shared/cors.ts` et hardcodent `system-compass.app`. Preview domain bloqué.
**Douteux** : `verify_jwt = false` sur toutes les fonctions — correctement compensé par validation manuelle dans le code, mais certaines fonctions admin (seed-countries) pourraient être mieux protégées.

### E. Database & RLS
**Fonctionne** : 113 tables, RLS activée globalement, `has_role` SECURITY DEFINER avec `search_path` fixé.
**Cassé** : `generation_notifications` INSERT public sans vérification owner. `pmo_generated_packs` SELECT trop permissif.
**Douteux** : `country_generation_jobs/batches` UPDATE accessible à tous les authenticated.

### F. Sécurité
**Fonctionne** : Input validation Zod côté client, password strength meter, rate limiting sur send-contact/ai-chat, GDPR consent, account deletion cascade, IP anonymization trigger.
**Cassé** : HTML injection possible dans email send-contact (sanitizedMessage injecté dans HTML sans échappement). Notification injection via RLS.
**Douteux** : 6 SECURITY DEFINER views détectées par le linter Supabase — intentionnel selon le memory mais à confirmer.

### G. Paiement & Billing
**Fonctionne** : Flow checkout → success page avec confetti. Customer portal. Webhook handler avec HMAC verification. Tier reflected in UI.
**Cassé** : Price ID mismatch entre `useSubscription.tsx` (display) et `stripe-webhook/index.ts` (processing). Le webhook hardcode `PRICE_TO_TIER` avec des IDs différents du frontend.
**Non confirmé** : Si les Stripe price IDs sont en mode test ou live.

### H. Performance
**Fonctionne** : Code splitting, staleTime 5min, gcTime 30min, lazy loading routes.
**Douteux** : Homepage charge framer-motion, recharts potentiellement lourds. Subscription check toutes les 5 min.

### I. SEO Technique
**Fonctionne** : AutoCanonical, HreflangTags, JSON-LD (Organization, SoftwareApplication, FAQ), og:image configuré, llms.txt link.
**Non confirmé** : Existence du sitemap.xml, robots.txt.

### J. i18n
**Fonctionne** : Routing /:lang/*, LEGACY_ROUTE_SEGMENTS pour redirects, LanguageSwitcher, fallback keys.
**Cassé** : Healthcare module labels partiellement hardcodés (partiellement corrigé). Dashboard "Chargement..." hardcodé.

### K. Observabilité / Go-live
**Fonctionne** : Console logging structuré dans edge functions, analytics sessions/events, Status page, DevDiagnosticsPanel en DEV.
**Manquant** : Sentry/error tracking, health endpoint backend, monitoring, alerts.

---

## 4. PLAN D'ACTION PRIORISÉ

### P0 — Corrections critiques
1. **Migrer les 17 edge functions vers `_shared/cors.ts`** — check-subscription, create-checkout, customer-portal, ai-assist, generate-translations, create-consultation-payment, generate-country-profile, batch-generate-countries, dashboard-reminders, gov-intel-generate, generate-country-translations, complete-country-data, translate-variants, generate-country-variants, translate-intelligence, batch-terrain-realities, seed-countries
2. **Ajouter le preview domain dans `_shared/cors.ts`** ALLOWED_ORIGINS
3. **Fix RLS `generation_notifications`** — Ajouter `auth.uid() = user_id` à la policy INSERT
4. **Fix RLS `pmo_generated_packs`** — Exiger token dans le query parameter
5. **Fix email `from` domain** — Changer `pyramid-compass.com` vers `emotionscare.com` ou domaine vérifié dans send-email, send-contact, weekly-digest
6. **Fix `send-contact` recipient** — Changer `contact@system-compass.app` vers `contact@emotionscare.com`

### P1 — Corrections rapides
7. **Aligner Stripe price IDs** entre frontend et backend (nécessite vérification Stripe dashboard)
8. **Restreindre RLS `country_generation_jobs/batches`** à admin
9. **Ajouter auth guard sur `/dashboard`** route ou créer un RequireAuth wrapper
10. **Fix RLS `financial_intel_generation_runs` et `ovi_suggestions`** — Supprimer branch `user_id IS NULL`
11. **Échapper HTML dans `send-contact`** pour prévenir XSS dans l'email admin

### P2 — Améliorations
12. Renommer localStorage keys `pyramid-compass-*` → `compass-*`
13. Réduire fréquence subscription check
14. Vérifier/générer sitemap.xml
15. Auditer les 6 SECURITY DEFINER views

### P3 — Polish
16. Supprimer le checkbox `rememberMe` non fonctionnel ou l'implémenter
17. i18n du "Chargement..." hardcodé dans Dashboard

---

## 5. IMPLÉMENTATION IMMÉDIATE

Les corrections suivantes seront appliquées :

### Edge Functions CORS (P0)
Les 17 fonctions qui hardcodent `"Access-Control-Allow-Origin": "https://system-compass.app"` seront migrées vers `import { corsHeaders, getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts"`. Le preview domain sera ajouté à ALLOWED_ORIGINS dans `_shared/cors.ts`.

### Branding Email (P0)
- `send-contact/index.ts` : `to` → `contact@emotionscare.com`, `from` → `Compass <noreply@emotionscare.com>` (ou garder pyramid-compass.com si c'est le seul domaine vérifié Resend — à confirmer)
- `send-email/index.ts` : `from` → idem
- `weekly-digest/index.ts` : `from` → idem

### RLS Fixes (P0/P1)
Migrations SQL pour :
- `generation_notifications` : Fix INSERT policy
- `pmo_generated_packs` : Fix SELECT policy
- `country_generation_jobs` : Restrict to admin
- `country_generation_batches` : Restrict to admin
- `financial_intel_generation_runs` : Remove NULL branch
- `ovi_suggestions` : Remove NULL branch

### HTML Escaping (P1)
- `send-contact/index.ts` : Échapper `sanitizedMessage` et `sanitizedName` avant injection dans HTML

### Auth Guard (P1)
- Ajouter un `RequireAuth` wrapper et l'appliquer au route `/dashboard`

### Dashboard i18n (P3)
- Remplacer "Chargement..." hardcodé par `t('common.loading')`

---

## 6. DÉPENDANCES EXTERNES NON RÉSOLVABLES

1. **Resend email domain** — Les `from` addresses doivent correspondre à un domaine vérifié dans Resend. Changer vers `emotionscare.com` nécessite que ce domaine soit vérifié dans le compte Resend. **Nécessite configuration externe.**
2. **Stripe Price IDs** — Impossible de confirmer les IDs corrects sans accès au dashboard Stripe. **Nécessite vérification manuelle.**
3. **Sentry/monitoring** — Non implémentable sans décision produit et clé API.
4. **Sitemap.xml** — À vérifier si servi statiquement ou généré.

