# 🔍 Audit Technique + Sécurité + QA + Go-Live Readiness

**Date:** 2026-04-17 · **Cible:** SaaS multi-pays "Compass" (world-alignment.lovable.app)

---

## 1. RÉSUMÉ EXÉCUTIF

**État global :** Plateforme **mature techniquement** mais **NON prête en l'état** pour un go-live commercial demain. ~70 pages, 594 composants, 49 edge functions, 75 tests, i18n 12 langues, observabilité maison, cron de purge actifs.

**Verdict go-live : NON EN L'ÉTAT.** Plateforme corrigeable en 3-5 jours de travail ciblé. Aucun défaut bloquant majeur (auth OK, RLS OK, Stripe webhooks signés OK), mais plusieurs risques opérationnels et financiers.

### 5 P0 principaux
1. **`elevenlabs-tts`** : aucune auth, aucun rate-limit → spam possible de l'API ElevenLabs payante. **CORRIGÉ ✅**
2. **Bucket `email-assets`** publiquement listable (énumération de fichiers). **CORRIGÉ ✅**
3. **`error_logs`** acceptait n'importe quel payload anonyme. **CORRIGÉ ✅** (validation level/longueurs)
4. **30 edge functions sans rate-limit** (incluant `customer-portal`, `create-checkout`, `generate-*`) → coût AI/Stripe non borné.
5. **Secret `ALERT_EMAIL_TO` non configuré** → alerting Phase 2 inactif (les alertes sont calculées mais jamais envoyées).

### 5 P1 principaux
1. **5 policies RLS dupliquées** sur tables i18n. **CORRIGÉ ✅**
2. **Clés i18n manquantes** `search.page.*` (902 warnings console). **CORRIGÉ ✅** (fr/en/es)
3. **Dashboard skeletons silencieux** : aucun indicateur de chargement, l'utilisateur voit 4 carrés gris sans contexte.
4. **8 console.log** laissés dans le code source de production (`AiErrorHandler`, `CountryMusicPlayer`, `DialogCoordinator`...).
5. **Cookie banner** s'affiche pour utilisateurs déjà loggés ayant probablement déjà consenti.

### Avis franc
La base est solide : RLS systématique, fonctions SECURITY DEFINER avec `search_path` figé, Stripe webhooks signés, observabilité custom, tests E2E + unitaires (75), domains isolés en bounded contexts. **Mais** : trop de surface d'attaque côté edge functions (49 fonctions, dont 30 sans rate-limit, plusieurs sans auth), data hardcodée volumineuse (498 occurrences `mock/fake/dummy/placeholder`), et plusieurs flows d'admin/seed qui n'ont rien à faire en production.

---

## 2. TABLEAU D'AUDIT PRIORISÉ

| P | Domaine | Page/Fonction | Problème | Preuve | Risque | Recommandation | Lovable ? |
|---|---------|---------------|----------|--------|--------|----------------|-----------|
| P0 | Security | `elevenlabs-tts` | Aucune auth, aucun rate limit | grep + lecture | Coût ElevenLabs illimité | Auth + rate limit + cap text | ✅ FAIT |
| P0 | Security | Storage `email-assets` | Bucket public listable | linter warning #2 | Énumération de tous fichiers | Restreindre SELECT | ✅ FAIT |
| P0 | Security | `error_logs` | INSERT public sans validation | linter warning #1 | Pollution table | Validation payload | ✅ FAIT |
| P0 | Cost | 30 edge functions | Pas de rate limit | grep | Spam API/coûts | Wrap avec `_shared/rate-limit.ts` | Partiel |
| P0 | Observability | Alerting | `ALERT_EMAIL_TO` non set | secrets list | Aucune alerte ne part | Demander secret au user | ⚠️ User |
| P1 | RLS | 5 tables | Policies SELECT dupliquées | pg_policies | Bruit, audit confus | Drop doublons | ✅ FAIT |
| P1 | i18n | GlobalSearch | 8 keys `search.page.*` manquantes | console: 902 warns | UX dégradée 12 langues | Ajout fr/en/es | ✅ FAIT (fr/en/es) |
| P1 | UX | Dashboard | Skeletons sans label | screenshot | Utilisateur perdu | Ajouter "Loading..." | À faire |
| P1 | Hygiène | 8 fichiers | console.log en prod | grep | Fuite info | Remplacer par logger | À faire |
| P1 | UX | Cookie banner | Réaffiché aux loggés | screenshot | Friction | Persister par user_id | À faire |
| P2 | Security | 7 edge fct | `verify_jwt=false` justifié mais non documenté | config.toml | Audit difficile | Commenter chaque cas | À faire |
| P2 | Hygiène | 498 occurrences | "mock/fake/dummy" dans src | grep | Fonctionnalités fake possibles | Audit ligne par ligne | À faire |
| P2 | i18n | 9 langues | `search.page.*` manquant | grep locales/ | Fallback EN visible | Compléter ar/bn/de/hi/it/nl/pt/ru/ur/zh | À faire |
| P3 | Perf | Bundle | 594 composants | find | Bundle lourd | Audit code-splitting | À faire |

---

## 3. DÉTAIL PAR CATÉGORIE

### Frontend & rendu
✅ **OK :** Homepage rend, hiérarchie H1/H2 correcte, design cohérent, dark mode actif, sidebar fonctionnelle, badge XP, switcher langue.
⚠️ **Douteux :** Dashboard montre 4 skeletons gris sans label "Loading". Cookie banner s'affiche pour user loggé. 70 pages — couverture QA visuelle non exhaustive (testé : `/`, `/dashboard`, `/admin/governance`, `/country/bahrain`).

### Auth & autorisations
✅ **OK :** `RequireAuth` + `RequireAdmin` correctement appliqués au niveau router pour toutes les routes admin (12 routes vérifiées). Test live : `/admin/governance` redirige bien vers `/` pour non-admin. Table `user_roles` séparée (pattern correct), fonction `has_role` SECURITY DEFINER.
⚠️ **À vérifier :** Reset password flow non testé end-to-end. Email verification non testé.

### APIs & edge functions
✅ **OK :** Stripe webhook + consultation-webhook signent les payloads (`constructEvent` + `STRIPE_WEBHOOK_SECRET`). `send-contact` rate-limité.
❌ **Problèmes :** 30/49 fonctions sans rate-limit. 8 fonctions sans validation auth en code (dont `elevenlabs-tts` corrigé, `health` légitime, `stripe-webhook`/`consultation-webhook` légitimes via signature, mais `i18n-coverage-slack`, `music-task-status` à revoir).

### Database & RLS
✅ **OK :** Toutes les tables `public.*` ont RLS activé. Toutes les fonctions SECURITY DEFINER ont `search_path=public` figé. Bucket `traceos-exports` correctement segmenté par user_id.
✅ **CORRIGÉ :** 5 doublons de policies, 1 bucket public listable, 1 INSERT permissif.

### Sécurité applicative
✅ **OK :** Pas de secrets côté client, validation Zod côté formulaires (à étendre), CORS configuré via `_shared/cors.ts`, CSP via Lovable.
⚠️ **Non confirmé :** Pas de honeypot/captcha visible sur formulaires publics (`send-contact` rate-limité mais pas de captcha). Webhooks Stripe signés ✅.

### Paiement & billing
✅ **OK :** `create-checkout`, `customer-portal`, webhook Stripe signé, `subscription_plans` table = single source of truth pour mapping price_id → tier.
⚠️ **Non confirmé :** Mode live vs test non audité. Limites de plan appliquées (RLS) non testées E2E.

### Performance
- 594 composants → bundle probablement lourd. Mesure Web Vitals déjà installée (`installWebVitals`) ✅.
- Lazy routes via `LazyRoutes.tsx` ✅.
- Pas mesuré dans cet audit faute de temps.

### Accessibilité
- Tests axe-core E2E intégrés Phase 3 ✅ (sur 6 parcours).
- Skip-to-main-content présent ✅.
- Non testé manuellement dans cet audit.

### i18n
- 12 langues, badge "i18n coverage 99.9%".
- ❌ 902 warnings console pour `search.page.*` → manquait dans **toutes** les langues. Corrigé pour fr/en/es. Reste 9 langues à compléter.
- Linter i18n existe (Phase 1) ✅.

### Observabilité / go-live readiness
- ✅ `error_logs` + `log-error` edge function + Web Vitals (Phase 1)
- ✅ Cron `purge_old_error_logs` daily 03:17 UTC + `check-error-rate` toutes les 15 min (Phase 2)
- ✅ Health endpoint `/functions/v1/health`
- ✅ Cockpit `/admin/governance`
- ❌ `ALERT_EMAIL_TO` secret manquant → alerting silencieux
- ❌ Backups Supabase : runbook documenté mais drill non effectué

### Conformité observable
- ✅ Cookie consent visible
- ✅ Pages CGV, Disclaimer présentes
- ✅ Page `delete-account` + edge function dédiée
- ✅ `gdpr_consent_log` + anonymisation auto > 90j (trigger SQL)
- ⚠️ Pas de page Privacy Policy distincte vue dans la liste pages (à confirmer)

---

## 4. PLAN D'ACTION

### P0 immédiats (faits dans cet audit)
- [x] `elevenlabs-tts` : auth + rate limit + cap text
- [x] `email-assets` bucket : restriction listing
- [x] `error_logs` INSERT : validation payload
- [x] 5 policies RLS dupliquées supprimées
- [x] Clés i18n `search.page.*` (fr/en/es)

### P0 restants (action user/équipe)
- [ ] Configurer secret `ALERT_EMAIL_TO` pour activer l'alerting
- [ ] Wrap les 30 edge functions critiques avec `_shared/rate-limit.ts` (notamment `create-checkout`, `customer-portal`, `generate-*`, `batch-*`)
- [ ] Drill backup Supabase (runbook existe : `docs/BACKUP_RESTORE.md`)

### P1 court terme
- [ ] Dashboard : ajouter labels "Chargement..." sur les skeletons
- [ ] Supprimer/wrapper les 8 console.log restants
- [ ] Cookie banner : persister consent par user_id (pas seulement localStorage)
- [ ] Compléter `search.page.*` pour les 9 autres langues
- [ ] Documenter pourquoi chaque `verify_jwt = false` est légitime dans `config.toml`

### P2/P3
- [ ] Audit des 498 occurrences "mock/fake/dummy" en src/
- [ ] Bundle analyzer + code splitting agressif
- [ ] Augmenter couverture tests (75 → cible 200+)
- [ ] Ajouter captcha/honeypot sur formulaires publics

---

## 5. CORRECTIONS EFFECTUÉES DANS CET AUDIT

1. **`supabase/functions/elevenlabs-tts/index.ts`** : ajout auth Bearer + rate limit 10req/5min/user + cap 2000 chars
2. **Migration RLS** : suppression de 5 policies SELECT dupliquées (`country_intelligence_translations`, `country_variants_translations`, `generated_translations`, `ui_translations`, `financial_intel_country_snapshots`)
3. **Migration storage** : `email-assets` bucket — listage restreint aux authentifiés (l'accès direct par URL CDN reste public)
4. **Migration RLS** : `error_logs` INSERT — validation level + longueurs message/source
5. **i18n** : 8 clés `search.page.*` ajoutées dans fr.json, en.json, es.json

---

## 6. CE QUI N'A PAS PU ÊTRE MODIFIÉ AUTOMATIQUEMENT

- Configuration secret `ALERT_EMAIL_TO` (action user)
- Drill restore Supabase (action humaine)
- Audit ligne par ligne des 498 "mock/fake/dummy" (volume → décision produit nécessaire)
- Suppression de fonctionnalités encore en alpha (`/seed-translations`, `/diagnostics`, `/quick-test`...) → décision produit
- Configuration Stripe live vs test (action user)

---

**Verdict final :** Code solide, sécurité de base correcte, mais **pas prêt pour un go-live payant immédiat**. Compter 3-5 jours de stabilisation avant ouverture commerciale.
