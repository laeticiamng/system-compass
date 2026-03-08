
# Audit complet pre-production -- System Compass

---

## A. SECURITE

### A1. CRITIQUE -- Toutes les Edge Functions ont `verify_jwt = false`
**Severite: P0**
Les 38 fonctions dans `supabase/config.toml` ont `verify_jwt = false`. Cela signifie que n'importe qui peut appeler directement les endpoints batch, admin, suppression de compte, IA, paiement, etc. sans authentification JWT verifiee au niveau gateway.

**Impact:** Abus de credits IA, suppression de comptes arbitraires, generation batch non autorisee, contournement Stripe.

**Correction:** Passer `verify_jwt = true` pour toutes les fonctions sauf les webhooks Stripe (`stripe-webhook`, `consultation-webhook`) qui recoivent des appels externes. Verifier que chaque fonction valide le JWT manuellement si necessaire.

### A2. CORS trop permissif en fallback
Le fichier `supabase/functions/_shared/cors.ts` n'inclut pas le domaine de preview Lovable (`id-preview--*.lovable.app`). En production c'est correct, mais le fallback `getAllowedOrigin()` sans `req` retourne le premier domaine -- les fonctions qui utilisent `corsHeaders` directement (sans passer `req`) acceptent tout via le fallback.

**Correction:** S'assurer que toutes les fonctions appellent `getCorsHeaders(req)` et non `corsHeaders` directement.

### A3. `RequireAdmin` redirige vers `/auth` sans prefixe i18n
Ligne 25 de `RequireAdmin.tsx`: `<Navigate to="/auth" replace />` -- contourne le systeme i18n et provoque une redirection 302 supplementaire via `LegacyRedirect`.

**Correction:** Utiliser `useLocalizedPath` pour construire le chemin.

---

## B. SEO & GEO

### B1. `llms.txt` affiche "44+ pays" au lieu de "80+"
**Severite: P1**
Lignes 6, 10 de `public/llms.txt` : "44+ pays" -- incoherent avec le reste du site qui affiche "80+". Les LLM (GPT, Claude, Perplexity) indexeront la mauvaise metrique.

### B2. Sitemap statique avec `lastmod` fixe
Le `sitemap.xml` est un fichier statique avec `lastmod: 2026-03-01` partout. Ce n'est pas bloquant mais degrade le signal de fraicheur pour Google.

### B3. Description JSON-LD Organization hardcodee en francais
`JsonLd.tsx` ligne 33 : la description Organization est en francais uniquement, meme quand `lang=en`. Impact GEO negatif pour le marche anglophone.

### B4. FAQ JSON-LD hardcodee en francais sur la landing
`Index.tsx` lignes 67-75 : les FAQs du schema JSON-LD sont en francais en dur, pas localisees via `t()`.

---

## C. i18n

### C1. SUBSCRIPTION_TIERS hardcode en francais
`useSubscription.tsx` ligne 28 : `name: 'Gratuit'`, `name: 'Premium'` etc. -- pas de `t()`. Visible sur le dashboard en anglais.

### C2. Accessibilite aria-label quasi absente
La recherche sur `aria-label` dans `src/pages` ne retourne qu'1 resultat (AdminDataSources). Les formulaires, boutons d'action et composants interactifs des 80+ pages n'ont pratiquement aucun label d'accessibilite.

---

## D. PERFORMANCE & ARCHITECTURE

### D1. 80+ pages -- bundle initial potentiellement lourd
Les pages core (Index, Auth, About, Contact, etc.) sont chargees de facon eager dans `routes/index.tsx`. C'est 12 imports synchrones. Les pages lazy sont bien configurees.

**Recommandation:** Verifier que le chunk principal ne depasse pas 250KB gzippe. Les chunks manuels (radix-ui, charts, maps, pdf) sont bien configures.

### D2. `autoSeedTranslationsIfEmpty` au demarrage
`main.tsx` execute un seed de traductions au chargement. Si le reseau est lent ou le seed echoue, cela ne bloque pas mais ajoute de la latence. Le `.catch(console.warn)` est correct.

### D3. Triple ErrorBoundary
Il existe 4 implementations d'ErrorBoundary (`common/ErrorBoundary`, `ui/error-boundary`, `common/GranularErrorBoundary`, `diagnostics/GlobalErrorBoundary`). Fonctionnel mais maintenance complexe.

---

## E. PAIEMENT & STRIPE

### E1. Price ID en dur
`useSubscription.tsx` ligne 39 : `priceId: 'price_1SxpOSDFa5Y9NR1I05modzpV'` -- si ce price ID est celui de test Stripe, il cassera en production. Verifier que c'est le bon price ID live.

---

## F. UX / CONTENU

### F1. Manifest PWA `start_url: "/"` sans prefixe langue
`manifest.json` ligne 6 : `"start_url": "/"` -- l'utilisateur qui installe la PWA sera redirige vers `/` puis vers `/:lang/`, ajoutant un delai de chargement initial.

### F2. FAQ landing non localisee (contenu)
Les questions/reponses FAQ (lignes 67-75 Index.tsx) passent par `t()` avec fallback francais, mais le schema JSON-LD associe est en francais brut.

---

## G. LEGAL / RGPD

### G1. Configuration correcte
- Cookie consent via DialogCoordinator : OK
- Pages legales (CGV, Mentions, Privacy, Disclaimer) : presentes et dans le sitemap
- Anonymisation IPs apres 90 jours : trigger en place
- Suppression de compte : edge function `delete-account` presente

---

## RESUME DES ACTIONS

| # | Action | Priorite | Effort |
|---|--------|----------|--------|
| A1 | Passer `verify_jwt = true` sur ~35 fonctions (sauf webhooks) | P0 | 30min |
| A3 | Corriger redirect `/auth` dans RequireAdmin avec i18n | P0 | 10min |
| B1 | Mettre a jour `llms.txt` : "44+" → "80+" | P0 | 5min |
| B3 | Localiser description JSON-LD Organization | P1 | 20min |
| B4 | Localiser FAQ JSON-LD sur landing | P1 | 30min |
| C1 | Internationaliser `SUBSCRIPTION_TIERS` labels | P1 | 15min |
| C2 | Ajouter aria-labels sur les formulaires et boutons principaux | P2 | 2h |
| E1 | Verifier price ID Stripe (test vs live) | P0 | 5min |
| F1 | Mettre `start_url` PWA a `"/fr/"` ou detection dynamique | P2 | 10min |
| A2 | Audit usage `corsHeaders` vs `getCorsHeaders(req)` dans chaque fonction | P1 | 1h |
| D3 | Consolider les ErrorBoundary en 2 max | P3 | 1h |

**Score pre-prod estime : 15/20** -- Les P0 (JWT, llms.txt, price ID, RequireAdmin i18n) doivent etre resolus avant publication. Le reste peut etre traite en sprint post-launch.

Veux-tu que j'implemente les correctifs P0 en priorite ?
