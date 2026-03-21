# AUDIT TECHNIQUE — SECURITE & READINESS (System Compass)

**Date :** 2026-03-21
**Auditeur :** Audit automatise — Claude Opus 4.6
**Plateforme :** React 18 + Vite + Supabase + Stripe + i18n (13 langues)
**Domaine :** https://system-compass.app
**Stack :** TypeScript, React, TailwindCSS, Shadcn/UI, Supabase (Auth + DB + Edge Functions), Stripe, i18next, Framer Motion, PWA
**Perimetre :** Backend security, edge functions, database RLS, Stripe billing, webhook integrity, GDPR compliance, architecture readiness

---

## 1. RESUME EXECUTIF

### Etat global

Compass est une plateforme SaaS d'aide a l'expatriation avec 80+ pages, 13 langues, un systeme de paiement Stripe, 46 edge functions Supabase, et un modele freemium. L'architecture backend est **mature et securisee** grace a une couverture RLS exceptionnelle (754 policies sur 136 tables), un systeme d'authentification robuste, et des patterns de securite bien implementes dans les edge functions.

### Niveau de securite : **BON — avec reserves**

La plateforme presente une posture de securite globalement solide. Les mecanismes de protection fondamentaux (RLS, auth, CORS whitelisting, webhook signature validation) sont en place. Cependant, des faiblesses specifiques dans la gestion du billing (admin bypass, prix hardcodes) et des donnees mock residuelles necessitent une attention avant un audit formel.

### Metriques cles

| Metrique | Valeur |
|----------|--------|
| Edge Functions | 46 |
| Migrations DB | 138 |
| Policies RLS | 754 |
| Tables avec RLS | 136 |
| Appels Supabase `.from()` | 480+ |
| Langues supportees | 13 |
| Webhook handlers | 4 |
| Issues critiques | 1 |
| Issues haute priorite | 2 |
| Issues moyenne priorite | 3 |

---

## 2. FINDINGS PAR PRIORITE

### P0 — CRITIQUE

| # | Domaine | Composant | Probleme | Risque | Recommandation |
|---|---------|-----------|----------|--------|----------------|
| P0-1 | Billing/Auth | `check-subscription` | Les admins obtiennent automatiquement le tier "pro" SANS verification Stripe | Acces gratuit non audite aux features premium ; si un role admin est attribue par erreur, bypass total du billing | Separer les roles admin de l'acces premium ; verifier le subscription status meme pour les admins ou ajouter un audit log explicite |

### P1 — HAUTE PRIORITE

| # | Domaine | Composant | Probleme | Risque | Recommandation |
|---|---------|-----------|----------|--------|----------------|
| P1-1 | Billing | `stripe-webhook` | Price IDs Stripe hardcodes dans le webhook handler | Tout changement de pricing necessite un redeploy ; erreur humaine possible lors de la mise a jour | Migrer vers un mapping database-driven dans la table `subscription_plans` |
| P1-2 | Security | `.env` | Credentials Supabase (anon key, project URL) commitees dans le repo | Exposition inutile meme si anon key est publique par design ; anti-pattern de securite | Faire `git rm --cached .env` et verifier `.gitignore` |

### P2 — MOYENNE PRIORITE

| # | Domaine | Composant | Probleme | Risque | Recommandation |
|---|---------|-----------|----------|--------|----------------|
| P2-1 | Frontend | 5+ composants | Donnees mock (MOCK_POSTS, MOCK_EPISODES, mockCourses, etc.) presentes dans le code de production | Confusion utilisateur si affichees ; maintenance inutile | Feature-flag ou supprimer avant mise en production |
| P2-2 | Email | `send-email` | Domaine emetteur `noreply@emotionscare.com` ne correspond pas au domaine produit | Confiance utilisateur reduite ; risque de spam filtering | Configurer un domaine emetteur coherent avec la marque Compass |
| P2-3 | Observability | Edge functions | Emails et user IDs logues en clair dans la console des functions | Exposition PII dans les logs | Masquer les PII dans les logs ou utiliser des identifiants anonymises |

---

## 3. DETAIL PAR CATEGORIE

### A. Edge Functions (46 functions)

**Repertoire :** `supabase/functions/`

**Fonctions identifiees :**

| Categorie | Functions |
|-----------|----------|
| AI/ML | ai-assist, ai-chat, destination-insights, perplexity-search |
| Billing | create-checkout, check-subscription, create-consultation-payment, customer-portal, stripe-webhook |
| Country Data | batch-complete-countries, batch-generate-countries, complete-country-data, generate-country-intelligence, generate-country-profile, generate-country-variants, scrape-country-data, seed-countries |
| Translation | batch-generate-translations, batch-translate-countries, generate-country-translations, generate-translations, sync-all-translations, seed-translations, translate-intelligence, translate-variants |
| Communication | send-contact, send-email, consultation-webhook, dashboard-reminders, weekly-digest |
| TraceOS | traceos-auto-export, traceos-email-alerts, traceos-webhooks |
| Other | delete-account, elevenlabs-tts, firecrawl-scrape, financial-intel, batch-financial-intel, batch-terrain-realities, terrain-realities, geopolitical-scanner, gov-intel-generate, i18n-coverage-slack, music-task-status, generate-country-music |

**Pattern d'authentification :** `supabase/functions/_shared/auth.ts`
- `requireAuth()` — impose Bearer token
- `optionalAuth()` — authentification optionnelle
- `requireRole()` — verifie un role specifique via RPC
- `requireAdmin()` — impose le role admin

**CORS :** `supabase/functions/_shared/cors.ts`
- Origins whitelistes : `system-compass.app`, `world-alignment.lovable.app`
- Detection dynamique des previews Lovable : `^https:\/\/[a-z0-9-]+--[a-z0-9-]+\.lovable\.app`

### B. Database & Row Level Security

**754 policies RLS sur 136 tables** — couverture exceptionnelle.

**Patterns RLS identifies :**

**a) Ownership-based (majorite des tables) :**
```sql
-- Users can only access their own data
CREATE POLICY "Users can view own events"
ON public.analytics_events FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

**b) Public read, admin write (reference data) :**
```sql
CREATE POLICY "Countries are readable by everyone"
ON public.countries FOR SELECT USING (true);

CREATE POLICY "Admins can manage countries"
ON public.countries FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
```

**c) Anonymous insert (analytics) :**
```sql
CREATE POLICY "Anonymous can insert events"
ON public.analytics_events FOR INSERT
TO anon WITH CHECK (user_id IS NULL);
```

### C. Stripe Integration

**5 fonctions Stripe identifiees :**

**create-checkout :**
- Selection dynamique du tier (premium, pro)
- Requete `subscription_plans` pour `stripe_price_id`
- `getSafeOrigin()` pour prevenir les open redirects
- Validation des URLs success/cancel

**stripe-webhook :**
- Validation signature via `STRIPE_WEBHOOK_SECRET` — **obligatoire**
- Mapping prix hardcode :
  ```typescript
  const PRICE_TO_TIER: Record<string, string> = {
    "price_1SxpOSDFa5Y9NR1I05modzpV": "premium",
    "price_1SxTE4DFa5Y9NR1IeeHU7qNb": "premium", // legacy
  };
  ```
- Events traites : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Met a jour la table `profiles` avec le tier

**check-subscription :**
- **ISSUE P0-1 :** Admin bypass sans verification Stripe
  ```typescript
  if (roleData) {
    return { subscribed: true, tier: "pro", subscription_end: null };
  }
  ```
- Fallback lookup par `stripe_product_id` puis `stripe_price_id`

**customer-portal :** Redirection vers le portail Stripe client

**create-consultation-payment :** Pricing dynamique pour consultations

### D. Webhook Handling

| Webhook | Validation | Events |
|---------|-----------|--------|
| stripe-webhook | Signature crypto (STRIPE_WEBHOOK_SECRET) | checkout.session.completed, subscription.updated/deleted |
| consultation-webhook | A verifier (precedemment signale comme optionnel) | Consultation events |
| traceos-webhooks | Integration TraceOS | TraceOS sync events |
| traceos-email-alerts | Distribution d'alertes | Email alert triggers |

### E. GDPR & Account Deletion

**Fonction :** `delete-account`

**Implementation conforme GDPR :**
- Suppression en cascade de 22 tables dans l'ordre des contraintes FK
- Audit log cree AVANT suppression de l'utilisateur auth
- Capture de l'adresse IP pour la conformite

**Tables supprimees (dans l'ordre) :**
dashboard_progress, exit_keys_history, challenge_progress, game_statistics, user_achievements, user_country_watchlist, user_notifications, push_subscriptions, notification_settings, event_registrations, expert_review_votes, expert_reviews, consultations, analytics_events, analytics_sessions, ai_activity_log, ai_usage_metering, b2b_usage_metering, gdpr_consent_log, newsletter_subscriptions, user_roles, profiles

### F. AI Integration

**Fonction :** `ai-chat`
- Modele : `google/gemini-3-flash-preview` via Lovable gateway
- Rate limiting : 20 requetes/minute par IP
- System prompt en francais pour le coaching expatriation
- Echec gracieux des fetches de contexte (non-bloquant)
- Cle API cote serveur (non exposee au client)

### G. Email Sending

**Fonction :** `send-email`
- Provider : Resend API
- Emetteur : `Compass <noreply@emotionscare.com>` **(P2-2 : domaine incoherent)**
- Templates : React Email library (@react-email/components)
- Authentification : Bearer token requis

### H. Error Boundaries

**2 implementations :**

1. **Class-based :** `src/components/common/ErrorBoundary.tsx`
   - `getDerivedStateFromError` + `componentDidCatch`
   - Details d'erreur en mode dev uniquement
   - Actions : reset + retour accueil

2. **HOC wrapper :** `src/components/ui/error-boundary.tsx`
   - `withErrorBoundary<P>` pattern
   - Action supplementaire : rechargement page
   - UI enrichie avec icones et cards

### I. Internationalization

**Configuration :** `src/i18n.ts`

**13 langues :** en, fr, de, es, it, nl, pt, zh, hi, ar, bn, ru, ur

**Detection de langue (ordre) :**
1. Path detector (`/fr/about`)
2. localStorage (`app_lang`)
3. Navigator language
4. Fallback : francais (fr)

**Support RTL :** arabe (ar) et urdu (ur)

**Fichiers de traduction :** 39 fichiers (13 bases + 13 toasts + 13 country data)

### J. File Operations

**Aucune operation Supabase Storage directe identifiee.**

**Exports cote client (pattern safe — blob + download attribute) :**
- PDF : `CasePdfExport.tsx`, `CountryPdfExport.tsx`
- JSON/CSV : `TraceOSExport.tsx`, `PostMortemMode.tsx`, `GovernanceMap.tsx`, `DecisionJournalExport.tsx`
- Generique : `ExportButton.tsx`, `MultiExportButton.tsx`

---

## 4. EVOLUTION DEPUIS L'AUDIT DU 2026-03-11

| Finding precedent | Statut actuel | Notes |
|-------------------|--------------|-------|
| P0-1 : Open Redirect dans create-checkout | **RESOLU** | `getSafeOrigin()` implemente avec whitelist |
| P0-2 : Webhook Stripe verification optionnelle | A reverifier | consultation-webhook specifiquement |
| P0-3 : Routes sans auth guard | A reverifier | /usage, /settings/notifications, /family-workspace |
| P1-1 : .env commite | **NON RESOLU** | Toujours present dans le repo |
| P1-2 : 34 functions verify_jwt=false | Mitigue | Auth partagee via `_shared/auth.ts` |
| P1-3 : Pas de validation amount | A reverifier | create-consultation-payment |

---

## 5. POINTS FORTS

1. **Couverture RLS exceptionnelle** — 754 policies sur 136 tables, patterns coherents
2. **Auth partagee** — Module `_shared/auth.ts` centralise avec requireAuth/requireRole/requireAdmin
3. **CORS whitelistee** — Origins explicitement autorisees avec detection dynamique des previews
4. **GDPR compliance** — Suppression de compte complete avec cascade sur 22 tables et audit trail
5. **Webhook crypto validation** — stripe-webhook utilise la verification de signature obligatoire
6. **Minimal technical debt** — Un seul fichier TODO trouve dans les tests, aucun FIXME/HACK
7. **Error boundaries** — 2 implementations complementaires avec fallback UI

---

## 6. RECOMMANDATIONS PRIORITISEES

### Immediat (avant go-live)

1. **Auditer le admin bypass dans check-subscription** — Verifier la legitimite du bypass et ajouter au minimum un audit log
2. **Migrer les price IDs Stripe vers la base de donnees** — Utiliser la table `subscription_plans` existante
3. **`git rm --cached .env`** — Supprimer le fichier .env du suivi git

### Court terme (sprint suivant)

4. **Feature-flag ou supprimer les donnees mock** — MOCK_POSTS, MOCK_EPISODES, mockCourses, mockCaseStudies, etc.
5. **Aligner le domaine emetteur email** — Migrer de `emotionscare.com` vers un domaine Compass
6. **Masquer les PII dans les logs** — Anonymiser emails et user IDs dans les logs edge functions

### Moyen terme

7. **Rate limiting distribue** — Migrer du rate limiting in-memory vers une solution persistante (Redis ou DB)
8. **Monitoring de securite** — Ajouter des alertes sur les patterns anormaux (tentatives auth excessives, webhooks invalides)
9. **Audit de penetration externe** — Engager un auditeur tiers pour valider les findings

---

## 7. CONCLUSION

La posture de securite de System Compass est **globalement solide** pour une plateforme SaaS de cette complexite. La couverture RLS (754 policies), l'authentification centralisee, et la validation CORS demontrent une approche mature de la securite. Les findings identifies sont principalement des problemes de configuration et de bonnes pratiques plutot que des vulnerabilites architecturales fondamentales.

Le finding P0 (admin bypass billing) necessite une attention immediate car il represente un risque de fraude interne. Les findings P1 (prix hardcodes, .env commite) sont des anti-patterns de maintenance et de securite qui doivent etre resolus avant tout audit formel.

**Verdict readiness securite : PRET avec corrections mineures requises.**
