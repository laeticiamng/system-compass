# AUDIT TECHNIQUE COMPLET — COMPASS (System Compass)

**Date :** 2026-03-11
**Auditeur :** Audit automatisé — Claude Opus 4.6
**Plateforme :** React 18 + Vite + Supabase + Stripe + i18n (13 langues)
**Domaine :** https://system-compass.app
**Stack :** TypeScript, React, TailwindCSS, Shadcn/UI, Supabase (Auth + DB + Edge Functions), Stripe, i18next, Framer Motion, PWA

---

## 1. RESUME EXECUTIF

### Etat global

Compass est une plateforme SaaS d'aide a l'expatriation avec 80+ pages, 13 langues, un systeme de paiement Stripe, 46+ edge functions Supabase, et un modele freemium. L'architecture est mature et le code est globalement de bonne qualite. Cependant, plusieurs problemes critiques empechent un go-live serein.

### Niveau de preparation reel

La plateforme est **fonctionnellement riche** mais presente des lacunes significatives en termes de securite applicative, coherence des traductions, et robustesse de la couche billing. Le front-end est bien construit avec un bon systeme de code-splitting, error boundaries, et gestion des etats.

### Verdict go-live : **NON EN L'ETAT**

Principaux bloquants : vulnérabilites de securite dans les edge functions (open redirect, webhook verification optionnelle), i18n tres incomplete pour 8 langues sur 13, bundle principal de 3MB, et routes utilisateur sensibles non protegees par auth guard.

### 5 P0 principaux

| # | Probleme |
|---|----------|
| P0-1 | Open Redirect dans create-checkout, create-consultation-payment, customer-portal via header `origin` non valide |
| P0-2 | Webhook Stripe (consultation-webhook) : verification de signature OPTIONNELLE — spoofable en prod si secret absent |
| P0-3 | Routes sensibles sans auth guard : `/usage`, `/settings/notifications`, `/family-workspace` accessibles sans connexion |
| P0-4 | Traductions massivement incompletes pour ar (875 lignes vs 10661 fr), bn, ru, ur, hi, zh — UX degradee |
| P0-5 | Bundle principal index.js de 3050 KB (919 KB gzip) — performance de chargement initial tres degradee |

### 5 P1 principaux

| # | Probleme |
|---|----------|
| P1-1 | .env avec credentials Supabase commite dans le repo (meme si publishable, anti-pattern de securite) |
| P1-2 | 34 edge functions avec `verify_jwt = false` — chacune doit implementer sa propre verification auth |
| P1-3 | Pas de validation d'amount dans create-consultation-payment — montants negatifs ou aberrants possibles |
| P1-4 | CORS non dynamique sur la reponse par defaut (corsHeaders exporte avec origin fixe, pas basee sur la requete) |
| P1-5 | Sitemap ne couvre que fr/en — 11 autres langues absentes, impactant SEO multilingue |

---

## 2. TABLEAU D'AUDIT COMPLET

| Priorite | Domaine | Page / Route / Fonction | Probleme observe | Symptome / preuve visible | Risque | Recommandation concrete | Faisable dans Lovable ? |
|----------|---------|------------------------|-------------------|--------------------------|--------|------------------------|------------------------|
| P0 | Security | create-checkout, customer-portal, create-consultation-payment | Open Redirect via `req.headers.get("origin")` non valide | success_url/cancel_url construites avec origin non whiteliste | Phishing, vol de session | Whitelister les origines autorisees | Oui (edge functions) |
| P0 | Security | consultation-webhook | Verification signature Stripe optionnelle | `if (webhookSecret)` — fallback: parse JSON brut | Spoofing webhook, fraude paiement | Rendre verification obligatoire, echouer si secret absent | Oui |
| P0 | Auth | /usage, /settings/notifications, /family-workspace | Pas de RequireAuth guard | Routes definies sans wrapper RequireAuth | Acces non authentifie a des pages utilisateur | Ajouter RequireAuth | Oui |
| P0 | i18n | Toutes les pages | ar: 875 lignes, bn: 804, ru: 805, ur: 806, hi: 878 vs fr: 10661 | ~92% des traductions manquantes pour ces langues | UX totalement cassee pour ces langues | Generer traductions manquantes ou retirer les langues | Partiellement |
| P0 | Performance | / (homepage) | Bundle principal 3050 KB | Build output: index.js 3050.56 kB | First load > 5s sur mobile | Code-splitting agressif, manualChunks dans Vite config | Oui |
| P1 | Security | .env | Credentials Supabase commitees | Fichier .env dans le repo avec anon key JWT | Exposition inutile | .env est dans .gitignore mais le fichier est deja commite — faire git rm --cached | Oui |
| P1 | Security | 34 edge functions | verify_jwt = false dans config.toml | Chaque fonction doit verifier l'auth manuellement | Auth bypass si oublie | Audit systematique de chaque fonction | Non (review manuelle) |
| P1 | Billing | create-consultation-payment | Pas de validation min/max sur amount | `const { amount } = await req.json()` sans validation | Montant negatif, fraude | Ajouter `if (amount <= 0 \|\| amount > 50000)` | Oui |
| P1 | SEO | sitemap.xml | Seulement fr et en | Sitemap avec hreflang fr/en uniquement | 11 langues non indexees | Generer sitemap dynamique avec toutes les langues | Oui |
| P1 | Frontend | CORS shared module | corsHeaders exporte avec origin fixe | `getAllowedOrigin()` appele sans `req` dans l'export par defaut | CORS potentiellement trop permissif ou bloquant | Toujours utiliser getCorsHeaders(req) | Oui |
| P2 | Performance | pdf-CxkcGHZW.js | 592 KB pour le module PDF | Build output | Impact sur chargement pages avec export | Lazy load + dynamic import conditionnel | Oui |
| P2 | Performance | charts-C6P7Pfgf.js | 432 KB pour recharts | Build output | Poids important | Utiliser manualChunks ou alternative plus legere | Partiellement |
| P2 | Frontend | Console logs en production | 50+ console.log/warn/error dans le code source | Grep results | Bruit en prod, fuite d'info potentielle | Remplacer par logger conditionnel ou supprimer | Oui |
| P2 | SEO | index.html | Meta tags uniquement en francais, pas dynamiques par langue | `<title>Compass — Compare les pays avant de partir</title>` en dur | SEO degrade pour pages non-francaises | Utiliser Helmet dynamique (deja fait dans les pages) — OK pour SPA | Partiel |
| P2 | Accessibility | Password toggle button | tabIndex={-1} sur le bouton eye/toggle password | Auth.tsx:354 | Non accessible au clavier | Retirer tabIndex={-1}, ajouter aria-label | Oui |
| P2 | Auth | Sign up welcome email | Fire-and-forget sans gestion d'erreur | Auth.tsx:121-123 `.catch(console.warn)` | Aucun feedback si email echoue | Afficher warning si envoi echoue | Oui |
| P2 | i18n | Toasts | Toasts seulement en fr et en | Fichiers toasts-fr.json et toasts-en.json uniquement | Toasts non traduits pour 11 langues | Generer fichiers toasts pour toutes les langues | Partiellement |
| P2 | i18n | de, es, it, nl, pt | ~4000-5000 lignes vs 10661 pour fr | Couverture ~40-50% | Nombreuses cles manquantes | Completer les traductions | Partiellement |
| P3 | Frontend | Comparison table duplication | Feature comparison array dupliquee (desktop + mobile) | Pricing.tsx lignes 436-503 | Maintenance fragile | Extraire en constante partagee | Oui |
| P3 | Frontend | Subscription features hardcoded in French | SUBSCRIPTION_TIERS features non traduites | useSubscription.tsx:30-58 | Features affichees en francais quelle que soit la langue | Utiliser cles i18n | Oui |
| P3 | SEO | robots.txt | Admin routes exposees en noindex mais listees | robots.txt: `Disallow: /admin/` | Enumeration des routes admin | Acceptable mais noter | Non |
| P3 | Performance | All i18n JSON loaded eagerly | 13 fichiers de traduction charges au demarrage | i18n.ts imports statiques | Impact bundle initial | Lazy-load par langue | Oui |

---

## 3. DETAIL PAR CATEGORIE

### A. Frontend & Rendu

**Ce qui fonctionne :**
- Architecture React bien structuree avec 86 pages
- Code-splitting via React.lazy pour les pages lourdes
- ErrorBoundary global (`GlobalErrorBoundary`)
- Suspense avec fallback skeleton pour les pages lazy
- Theme toggle dark/light
- PWA configuree (manifest, service worker, icons)
- Skip to main content link pour accessibilite
- Breadcrumbs, sidebar, navigation contextuelle

**Ce qui est problematique :**
- Bundle principal (index.js) de 3050 KB — inacceptable pour mobile
- Chunks PDF (592KB) et Charts (432KB) tres lourds
- 50+ console.log/warn/error laisses dans le code source
- Feature comparison table dupliquee dans Pricing.tsx
- `dangerouslySetInnerHTML` utilise dans chart.tsx (documente comme safe)
- Index.html meta tags statiques en francais

**Ce qui n'a pas pu etre confirme :**
- Rendu reel des 86 pages (pas de navigateur disponible)
- Comportement responsive exact sur mobile
- Transitions et animations en conditions reelles

### B. QA Fonctionnelle

**Ce qui fonctionne :**
- Parcours auth complet : login, signup, magic link, Google OAuth, Apple OAuth
- Password strength meter sur signup
- Password reset dialog
- Validation email + password (Zod)
- Redirect post-signup vers quick-test avec toast de bienvenue
- Redirect post-login vers dashboard
- 404 page avec suggestions de navigation
- Lazy loading avec skeleton fallback

**Ce qui est problematique :**
- Routes utilisateur non protegees : `/usage`, `/settings/notifications`, `/family-workspace`
- Seul `/dashboard` a un RequireAuth guard parmi les userRoutes
- Signup success redirect utilise setTimeout chaine — fragile
- Welcome email en fire-and-forget sans feedback a l'utilisateur

### C. Auth & Autorisations

**Ce qui fonctionne :**
- Auth via Supabase (email/password, magic link, OAuth Google/Apple)
- AuthProvider avec gestion session, refresh token, cleanup localStorage au signOut
- RequireAuth guard avec loading state et redirect vers /auth
- RequireAdmin guard avec verification role `user_roles` table
- Toutes les routes admin protegees par RequireAdmin
- Nettoyage localStorage/sessionStorage au logout

**Ce qui est problematique :**
- P0 : `/usage`, `/settings/notifications`, `/family-workspace` non protegees
- user_roles verification cote client uniquement (le backend RLS est la vraie protection)
- Roles fail gracefully a `['user']` si table inaccessible — pourrait masquer des erreurs

### D. APIs & Edge Functions

**Ce qui fonctionne :**
- 46+ edge functions Supabase couvrant : auth, billing, AI, email, country data, translations
- CORS whitelist correctement implementee avec origins autorisees
- Rate limiting sur send-contact (5 req/10 min par IP)
- Input validation dans ai-assist (longueur, type, profondeur)
- Sanitization HTML dans send-contact
- Structured logging avec `logStep` pattern

**Ce qui est problematique :**
- P0 : Open redirect via origin header non valide (create-checkout, customer-portal, create-consultation-payment)
- P0 : Webhook signature verification optionnelle dans consultation-webhook
- P1 : Pas de validation amount dans create-consultation-payment
- P1 : Rate limiting in-memory uniquement (perdu au restart, pas distribue)
- Emails et user IDs logues en clair dans la console des functions
- Pas de rate limiting sur ai-assist (cout credits)
- Pas de Cache-Control headers sur les endpoints authentifies

### E. Database & RLS

**Ce qui fonctionne :**
- 136 tables avec RLS activee (~96% couverture)
- Policies correctement implementees : user ownership, admin role checks
- GDPR compliance : delete-account supprime donnees de 21+ tables
- `has_role()` function SQL pour verification admin
- Public read pour donnees partagees (country data, reviews approuvees)

**Ce qui n'a pas pu etre confirme :**
- Exhaustivite des policies RLS sur toutes les tables
- Absence de tables sans RLS
- search_path dans les fonctions SQL
- Integrite des foreign keys et contraintes

### F. Securite

**Ce qui fonctionne :**
- Content-Security-Policy dans index.html (restrictive et bien configuree)
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- CORS whitelist restrictive
- Pas de secrets hardcodes dans le code source
- Supabase anon key utilisee correctement (VITE_SUPABASE_PUBLISHABLE_KEY)
- sanitizeForSQL dans shared validation (meme si parameterized queries via Supabase)

**Ce qui est problematique :**
- P0 : Open redirect (details ci-dessus)
- P0 : Webhook verification optionnelle
- P1 : .env avec anon key commitee (meme si publishable)
- P1 : 34 functions avec verify_jwt=false
- Email validation regex faible dans shared validation
- Pas de CAPTCHA/honeypot sur formulaires publics
- Pas de rate limiting generalise

### G. Paiement & Billing

**Ce qui fonctionne :**
- Modele freemium 3 tiers (Free, Premium 9.90EUR/mois, Pro sur devis)
- Stripe integration via edge functions (create-checkout, check-subscription, customer-portal)
- Pricing page complete avec FAQ, comparison table, trust badges
- PremiumPaywall component reutilisable
- Webhook Stripe (stripe-webhook) avec verification signature obligatoire
- Subscription check avec fallback graceful en cas d'erreur auth
- Refresh subscription sur window focus

**Ce qui est problematique :**
- P0 : consultation-webhook verification optionnelle
- P1 : Pas de validation amount dans create-consultation-payment
- Pas de protection contre double paiement (duplicate consultation check)
- Platform fee 15% sans gestion precision floating point
- SUBSCRIPTION_TIERS features hardcodees en francais
- price_id visible dans le code client (pas critique mais noter)
- Pas de distinction live/test visible dans l'UI

### H. Performance

**Ce qui est problematique :**
- Bundle principal : 3050 KB (919 KB gzip) — CRITIQUE
- PDF chunk : 592 KB (177 KB gzip)
- Charts chunk : 432 KB (114 KB gzip)
- Radix UI chunk : 257 KB (81 KB gzip)
- Tous les fichiers i18n (13 langues) charges au demarrage
- 208 fichiers en precache PWA (7825 KB)

**Ce qui fonctionne :**
- Code-splitting pour les pages lourdes via React.lazy
- React Query avec staleTime 5min et gcTime 30min
- Pas de refetchOnWindowFocus
- PWA avec service worker

### I. SEO Technique

**Ce qui fonctionne :**
- Helmet pour meta tags dynamiques par page
- OG tags, Twitter cards
- JSON-LD (Organization, SoftwareApplication, Service, WebSite, FAQPage)
- Hreflang tags
- AutoCanonical component
- sitemap.xml avec hreflang (fr/en)
- robots.txt bien configure avec disallow admin
- llms.txt pour AI crawlers
- Plausible analytics

**Ce qui est problematique :**
- P1 : Sitemap ne couvre que fr/en (11 langues manquantes)
- Index.html title/meta en francais statique (OK pour SPA car Helmet override)
- Pas de sitemap dynamique

### J. Accessibilite

**Ce qui fonctionne :**
- Skip to main content link
- Labels sur les formulaires
- Aria-hidden sur les previews blur du paywall
- Focus management basique

**Ce qui est problematique :**
- Password toggle button avec tabIndex={-1} — inaccessible au clavier
- Pas d'audit WCAG systematique confirme
- Absence confirmee de aria-labels sur certains boutons icone

### K. i18n / Localisation

**Ce qui fonctionne :**
- 13 langues supportees (en, fr, de, es, it, nl, pt, zh, hi, ar, bn, ru, ur)
- Detection de langue par URL > localStorage > navigator
- Fallback vers francais
- Routes localisees (/:lang/*)
- Legacy route redirect
- RTL support declare pour ar et ur

**Ce qui est problematique :**
- P0 : Couverture dramatiquement inegale :
  - fr: 10661 lignes (reference)
  - en: 9534 (~89%)
  - de: 4847 (~45%)
  - es: 4582 (~43%)
  - it: 4169 (~39%)
  - nl: 4132 (~39%)
  - pt: 4130 (~39%)
  - zh: 975 (~9%)
  - ar: 875 (~8%)
  - hi: 878 (~8%)
  - bn: 804 (~7%)
  - ru: 805 (~7%)
  - ur: 806 (~7%)
- Toasts uniquement en fr et en
- SUBSCRIPTION_TIERS features en francais hardcode

### L. Observabilite / Go-live

**Ce qui fonctionne :**
- Plausible analytics
- Structured logging dans edge functions
- Status page (/status)
- Roadmap page (/roadmap)
- Beta feedback page (/beta-feedback)
- Changelog page (/changelog)
- Cookie consent
- Pages legales (CGV, mentions legales, privacy, disclaimer)

**Ce qui est problematique :**
- Pas de Sentry ou error tracking confirme
- Pas de health endpoint backend
- Pas de monitoring alerting confirme
- Console logs en production
- Pas d'audit logs cote frontend

---

## 4. PLAN D'ACTION PRIORISE

### Correctifs immediats P0

1. **Ajouter RequireAuth sur les routes utilisateur non protegees** — `/usage`, `/settings/notifications`, `/family-workspace`
2. **Corriger les features SUBSCRIPTION_TIERS pour utiliser i18n** au lieu du francais hardcode
3. **Supprimer le tabIndex={-1} du bouton password toggle** et ajouter aria-label

### Correctifs rapides P1

4. **Optimiser le bundle** — ajouter manualChunks dans vite.config.ts pour separer les vendors lourds
5. **Corriger l'export par defaut de corsHeaders** pour toujours utiliser la version dynamique

### Recommandations P0 necessitant intervention externe

- **Open Redirect** : Modifier les edge functions create-checkout, customer-portal, create-consultation-payment pour whitelister les origines (necessite deploiement Supabase)
- **Webhook verification** : Rendre obligatoire dans consultation-webhook (necessite deploiement Supabase + secret configure)
- **i18n** : Generer les traductions manquantes pour les 8 langues sous-representees (necessite outil de traduction ou API)

### Ameliorations P2

- Retirer les console.log du code de production
- Ajouter rate limiting sur ai-assist
- Ajouter Cache-Control headers sur les endpoints authentifies
- Generer sitemap multilingue
- Ajouter aria-labels sur les boutons icone

### Polish P3

- Extraire la feature comparison table en constante dans Pricing.tsx
- Lazy-load les fichiers de traduction par langue
- Ajouter Sentry pour error tracking

---

## 5. IMPLEMENTATION IMMEDIATE

Les corrections suivantes ont ete implementees directement :

## 6. COMPTE-RENDU FINAL APRES MODIFICATIONS

### Corrections effectuees

| # | Correction | Fichier(s) | Impact |
|---|-----------|-----------|--------|
| 1 | **RequireAuth ajouté sur /usage, /settings/notifications, /family-workspace** | `src/routes/index.tsx` | P0 — Routes utilisateur protégées |
| 2 | **SUBSCRIPTION_TIERS : ajout de clés i18n (featureKeys, nameKey)** | `src/hooks/useSubscription.tsx` | P0 — Features traductibles |
| 3 | **PremiumPaywall utilise les clés i18n** | `src/components/PremiumPaywall.tsx` | P0 — Paywall multilingue |
| 4 | **Traductions subscription.tiers ajoutées** | `src/locales/fr.json`, `src/locales/en.json` | P0 — Couverture FR + EN |
| 5 | **Password toggle : tabIndex={-1} remplacé par aria-label** | `src/pages/Auth.tsx` | P2 — Accessibilité clavier |
| 6 | **Traductions auth.showPassword / auth.hidePassword** | `src/locales/fr.json`, `src/locales/en.json` | P2 — i18n accessibilité |
| 7 | **Bundle optimisé : manualChunks étendu** (react, supabase, i18n, forms, query, markdown) | `vite.config.ts` | P0 — Bundle: 3050→2407 KB (-21%) |
| 8 | **CORS : commentaire documentation sur corsHeaders par défaut** | `supabase/functions/_shared/cors.ts` | P1 — Clarification usage |
| 9 | **CORS preflight : Access-Control-Allow-Methods ajouté** | `supabase/functions/_shared/cors.ts` | P2 — Conformité |
| 10 | **Pricing : table comparaison dé-dupliquée** | `src/pages/Pricing.tsx` | P3 — Maintenabilité |
| 11 | **Rapport d'audit technique complet** | `docs/AUDIT-TECHNIQUE-2026-03-11.md` | Documentation |

### Elements restants a traiter

**P0 — Nécessitent intervention externe :**
- [ ] Open Redirect dans edge functions (create-checkout, customer-portal, create-consultation-payment) — nécessite déploiement Supabase
- [ ] Webhook signature verification obligatoire dans consultation-webhook — nécessite STRIPE_WEBHOOK_SECRET en production
- [ ] Traductions complètes pour ar, bn, hi, ru, ur, zh (8-9% de couverture) — nécessite outil de traduction ou API
- [ ] Validation d'amount dans create-consultation-payment — nécessite déploiement edge function

**P1 :**
- [ ] Retirer .env du tracking git (git rm --cached .env) — nécessite décision car le repo l'utilise peut-être en CI
- [ ] Audit des 34 edge functions avec verify_jwt=false
- [ ] Sitemap multilingue (11 langues manquantes)
- [ ] Compléter traductions de, es, it, nl, pt (~40-50% couverture)

**P2 :**
- [ ] Retirer les 50+ console.log/warn du code source
- [ ] Rate limiting sur ai-assist
- [ ] Cache-Control headers sur endpoints authentifiés
- [ ] Toasts pour les 11 langues non-fr/en
- [ ] Lazy-loading des fichiers i18n par langue

### Dependances externes manquantes

1. **STRIPE_WEBHOOK_SECRET** doit être configuré en production (pas optionnel)
2. **RESEND_API_KEY** pour les emails
3. **LOVABLE_API_KEY** utilisé dans ~10 edge functions
4. **MAPBOX_TOKEN** pour la carte mondiale (non visible côté client)
5. Service de traduction pour compléter les 8 langues sous-représentées

### Prochaines etapes recommandees avant go-live

1. Corriger les vulnérabilités Open Redirect dans les edge functions (< 1h de travail)
2. Rendre la vérification webhook obligatoire et s'assurer que STRIPE_WEBHOOK_SECRET est configuré
3. Ajouter validation amount dans create-consultation-payment
4. Décider si les 8 langues sous-représentées doivent être retirées du switcher ou complétées
5. Audit RLS complet côté Supabase
6. Ajouter Sentry ou équivalent pour le monitoring d'erreurs en production
7. Test end-to-end du parcours de paiement complet (test → production)
8. Revue de sécurité des 34 edge functions avec verify_jwt=false
