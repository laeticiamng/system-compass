

# AUDIT DEFINITIF v2 — System Compass (6 mars 2026)

---

## 1. RESUME EXECUTIF

La plateforme a progresse depuis l'audit precedent : les Edge Functions sensibles (`delete-account`, `send-email`, `seed-countries`, `seed-translations`) integrent desormais une verification JWT en code. La migration `useLocalizedNavigate()` est quasi-complete (1 fichier restant). Le disclaimer persiste correctement via `localStorage`. Cependant, de nouveaux problemes critiques emergent : **46 fichiers utilisent `Link` de react-router-dom au lieu de `LocalizedLink`**, l'endpoint `ai-chat` a un CORS `*` ouvert, la route `/seed-translations` n'est pas protegee par `RequireAdmin`, et le scan de securite releve 17 findings dont 5 erreurs. La surcharge de navigation (sidebar + header + dropdowns) n'a pas ete simplifiee.

**Publiable aujourd'hui : NON — OUI SOUS CONDITIONS** (4-6 correctifs P0/P1)

**Note globale : 14/20** — Progres significatifs, mais lacunes de securite et UX non resolues.

**Top 5 risques :**
1. `ai-chat` CORS `*` — tout domaine peut appeler le chatbot IA, abus de tokens
2. 46 fichiers avec `Link` de react-router-dom au lieu de `LocalizedLink` — liens cassent le prefixe langue
3. Route `/seed-translations` accessible sans `RequireAdmin` (ligne 171 de routes/index.tsx)
4. Stripe IDs exposes dans `profiles` et `user_subscriptions` cote client (5 findings securite erreur)
5. Navigation triple non simplifiee — sidebar + header + dropdowns + mobile bottom nav

**Top 5 forces :**
1. Auth solide avec validation Zod i18n, password strength, social login
2. JWT verification fonctionnelle sur `delete-account`, `send-email`, `seed-countries`, `seed-translations`
3. Hero landing page clair, proposition de valeur immediate
4. Migration `useLocalizedNavigate` quasi-complete (1/47 fichiers restant)
5. Disclaimer persiste apres acceptation

---

## 2. TABLEAU SCORE GLOBAL

| Dimension | Note /20 | Observation | Criticite | Decision |
|---|---|---|---|---|
| Comprehension produit | 15 | Hero excellent, perte apres. "6 profils d'expatrie" = flou | Majeur | Clarifier |
| Landing / Accueil | 16 | Structure solide, CTA clairs | Mineur | OK |
| Onboarding | 13 | Branching B2C/B2B OK, mais sequentiel avec disclaimer + cookie | Majeur | Fiabiliser |
| Navigation | 10 | Toujours triple : sidebar + header + dropdowns. 14 items dans Tools dropdown | Critique | Simplifier |
| Clarte UX | 12 | 80+ pages, "6 profils" et "44 pays" non expliques | Critique | Simplifier |
| Copywriting | 15 | i18n sur erreurs auth corrige, reste des textes hardcodes FR dans certains composants | Mineur | OK |
| Credibilite / confiance | 14 | Pages legales completes, disclaimer transparent. 0 temoignage reel | Majeur | Acceptable |
| Fonctionnalite principale | 15 | Comparateur, Quick Test, Simulateur = promesse tenue | Mineur | OK |
| Parcours utilisateur | 12 | Pas de funnel post-Quick Test vers inscription | Critique | Ajouter CTA |
| Bugs / QA | 14 | 1 fichier `useNavigate` restant, 46 fichiers `Link` non localise | Majeur | Migrer |
| Securite preproduction | 11 | ai-chat CORS *, seed-translations sans RequireAdmin, Stripe IDs exposes | Bloquant partiel | Corriger |
| Conformite go-live | 14 | RGPD OK, anonymisation 90j, deletion cascade. `og-image.png` a verifier | Majeur | Verifier |

---

## 3. PROBLEMES IDENTIFIES — PAR PRIORITE

### P0 — Bloquant production

**1. `ai-chat` CORS `Access-Control-Allow-Origin: *`**
- Fichier : `supabase/functions/ai-chat/index.ts` ligne 6
- Impact : Tout site externe peut appeler votre chatbot IA et consommer vos tokens LOVABLE_API_KEY
- Correction : Remplacer `"*"` par `corsHeaders` partage depuis `_shared/cors.ts`

**2. Route `/seed-translations` non protegee par RequireAdmin**
- Fichier : `src/routes/index.tsx` ligne 171
- Impact : Tout utilisateur authentifie peut acceder a la page de seed, potentiellement ecrire en base
- Correction : Wrapper avec `<RequireAdmin>` comme les autres routes admin

**3. `SubscriptionSuccess.tsx` utilise encore `useNavigate()` au lieu de `useLocalizedNavigate()`**
- Fichier : `src/pages/SubscriptionSuccess.tsx` ligne 37
- Impact : Apres paiement, l'utilisateur peut etre redirige sans prefixe langue

### P1 — Critique

**4. 46 fichiers utilisent `Link` de react-router-dom au lieu de `LocalizedLink`**
- Impact : Tous les liens `<Link to="/countries">` dans ces pages ignorent le prefixe langue. Cliquer sur un lien dans une page `/fr/dashboard` envoie vers `/countries` au lieu de `/fr/countries`, declenchant une redirection
- Fichiers concernes : `OVI.tsx`, `MentionsLegales.tsx`, `Resources.tsx`, `Pricing.tsx`, `Usage.tsx`, `Countries.tsx`, `Dashboard.tsx`, `NotFound.tsx`, `Blog.tsx`, `CountryDetail.tsx`, + 36 autres
- Correction : Remplacer `import { Link } from 'react-router-dom'` par `import { LocalizedLink as Link } from '@/components/i18n'` dans les 46 fichiers

**5. Stripe customer/subscription IDs exposes cote client**
- Tables `profiles.stripe_customer_id` et `user_subscriptions.stripe_customer_id`/`stripe_subscription_id` lisibles par le proprietaire du profil
- Impact : Pas critique en soi (l'utilisateur voit ses propres IDs) mais mauvaise pratique de securite. Si un XSS survient, ces IDs sont exfiltrables
- Correction P2 : Creer une vue backend-only ou exclure ces colonnes des requetes client

**6. Newsletter subscriptions : insert public avec validation minimale**
- Le scan de securite signale que la table permet des inserts publics avec juste une validation email basique
- Impact : Spam d'inscriptions possible
- Correction : Ajouter CAPTCHA ou rate limiting cote applicatif

### P2 — Amelioration forte valeur

**7. Navigation toujours triple** — Sidebar (13 items dans 3 groupes) + Header (6 items + 3 dropdowns avec 14+4+6 items) + Mobile bottom nav
- Consequence : Un utilisateur decouvre 30+ destinations en moins de 5 secondes d'exploration. Surcharge cognitive massive
- Correction : Supprimer la sidebar pour les utilisateurs non-connectes, ne garder que header + mobile nav

**8. Tools dropdown du Header contient 14 items**
- Fichier : `Header.tsx` lignes 69-84
- Impact : Un dropdown de 14 elements est un anti-pattern UX. L'utilisateur ne sait pas par ou commencer
- Correction : Regrouper en 3-4 categories ou renvoyer vers le Tools Hub

**9. Pas de CTA post-Quick Test vers inscription**
- Apres le test gratuit, aucune incitation a creer un compte pour sauvegarder les resultats
- Correction : Ajouter un CTA "Sauvegardez vos resultats — creez un compte gratuit"

### P3 — Finition

**10. `og-image.png` reference mais existence non verifiable**
- Fichier : `Index.tsx` ligne 57
- Correction : Verifier que le fichier existe sur `system-compass.app/og-image.png`

**11. Security Definer View detectee par le linter Supabase**
- Scan finding niveau "error"
- Correction : Auditer la vue concernee et verifier qu'elle ne contourne pas les RLS de maniere non-intentionnelle

**12. Toast hardcode en francais apres signup**
- `Auth.tsx` ligne 54 : `'Bienvenue ! Découvrez votre profil d\'expatrié 🧭'`
- Correction : Utiliser `t('auth.welcomeToast')`

---

## 4. SECURITE / GO-LIVE READINESS

| Observe | Risque | Action |
|---|---|---|
| `ai-chat` CORS `*` | CRITIQUE — abus de tokens IA depuis n'importe quel domaine | Restreindre a `system-compass.app` |
| `seed-translations` sans RequireAdmin | CRITIQUE — ecriture en base sans role admin | Ajouter RequireAdmin |
| `delete-account` verifie JWT en code | OK | Aucune |
| `send-email` verifie getClaims | OK | Aucune |
| `seed-countries` verifie admin | OK | Aucune |
| Stripe IDs dans profiles/subscriptions | Moyen — expose au client | Exclure des requetes client |
| Event registrations sans anonymisation | Moyen — RGPD | Implementer retention policy |
| Rate limiting Edge Functions | Non verifiable | Tester avant prod |
| CAPTCHA formulaires publics | Absent | Ajouter sur newsletter/contact |

---

## 5. PLAN D'IMPLEMENTATION

### Etape 1 : Correctifs P0 securite (estimee 1h)
- Corriger CORS de `ai-chat/index.ts` : importer `corsHeaders` de `_shared/cors.ts`
- Wrapper `/seed-translations` avec `<RequireAdmin>` dans `routes/index.tsx`
- Migrer `SubscriptionSuccess.tsx` vers `useLocalizedNavigate()`
- Corriger le toast hardcode FR dans `Auth.tsx`

### Etape 2 : Migration `Link` vers `LocalizedLink` (estimee 3h)
- Remplacer `import { Link } from 'react-router-dom'` par `import { LocalizedLink as Link } from '@/components/i18n'` dans les 46 fichiers identifies
- Attention : certains fichiers importent `Link` ET `useParams` ou `useLocation` — ne supprimer que l'import `Link`, pas les autres imports de react-router-dom

### Etape 3 : Simplification navigation (estimee 2h)  
- Reduire le Tools dropdown de 14 a 5 items essentiels, avec lien "Voir tous les outils" vers le Tools Hub
- Masquer la sidebar pour utilisateurs non-connectes

---

## 6. VERDICT FINAL

La plateforme a significativement progresse depuis le premier audit (de 13/20 a 14/20). Les corrections JWT sont en place sur les fonctions sensibles. La migration `useLocalizedNavigate` est quasi-complete. Les messages d'erreur auth sont internationalises.

**Ce qui bloque encore la production :**
- Le CORS `*` sur `ai-chat` est un risque financier direct (consommation de tokens IA)
- La route `seed-translations` sans RequireAdmin est une faille d'acces
- Les 46 fichiers avec `Link` non-localise cassent l'experience i18n sur chaque clic

**Les 3 corrections les plus rentables :**
1. Corriger le CORS de `ai-chat` (5 min, elimine le risque #1)
2. Ajouter `RequireAdmin` sur `seed-translations` (2 min)
3. Migrer les 46 `Link` vers `LocalizedLink` (3h, corrige toute la navigation i18n)

**Verdict : OUI SOUS CONDITIONS.** Apres les 3 corrections ci-dessus (estimable a une demi-journee), la plateforme est publiable en beta publique. La simplification de la navigation reste souhaitable mais n'est pas bloquante pour un lancement.

