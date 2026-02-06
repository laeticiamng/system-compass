

# Triple Audit Complet - Technique + UX + Beta Testeur

## Etat post-audits precedents

Les audits v1, v2 et v3 ont corrige : routes doublons, `window as any`, `fetch()` vers `supabase.functions.invoke()`, dead code LazyRoutes, page 404, breadcrumbs i18n, cookie consent i18n, contextual shortcuts i18n, onboarding aria-labels. Le codebase est stable.

---

# PHASE 1 : AUDIT TECHNIQUE (Dev Senior)

## CRITIQUE - `(supabase as any)` systematique (120 occurrences, 5 fichiers)

Les tables `user_country_watchlist`, `gamification_progress`, `pmo_compliance_*`, `expert_profiles`, `expert_conversations`, `expert_messages` ne sont pas dans les types generes (`src/integrations/supabase/types.ts`). Les hooks utilisent `(supabase as any).from(...)` pour contourner le typage.

**Fichiers :** `useCountryWatchlist.tsx`, `useGamification.tsx`, `usePmoCompliance.tsx`, `useExperts.tsx`, `ExpertMessaging.tsx`

**Impact :** Aucune verification de type sur les queries Supabase. Toute erreur de nom de colonne passe silencieusement.

**Correction :** Creer des interfaces locales pour ces tables et caster le client supabase avec un type etendu, ou utiliser `.from<TableType>()`. Approche pragmatique : definir les interfaces dans chaque fichier et caster le resultat, pas le client.

## MAJEUR - `window.location.href` au lieu de React Router (3 occurrences corrigeables)

| Fichier | Ligne | Context |
|---------|-------|---------|
| `DisclaimerConsentDialog.tsx` | 117 | `window.location.href = '/disclaimer'` - force rechargement complet |
| `CommunityQuickActions.tsx` | 77 | `window.location.href` pour copier lien - pas critique mais incohérent |
| `onboarding/InteractiveTutorial.tsx` | 315 | `window.location.href = currentStep.action.href` - navigation interne |

**Note :** Les ErrorBoundary et share/clipboard usages sont legimes.

**Correction :** Remplacer par `navigate()` de react-router-dom dans DisclaimerConsentDialog et InteractiveTutorial.

## MAJEUR - ToolsHub liens vers routes masquees

`src/pages/ToolsHub.tsx` contient des liens vers des routes qui redirigent maintenant :
- `/errors-illusions` -> redirige vers `/prevention-filter`
- `/personas` -> redirige vers `/profile-test`
- `/academic` -> redirige vers `/resources`
- `/latent` -> redirige vers `/dashboard`
- `/irreversa` -> redirige vers `/dashboard`
- `/ovi` -> redirige vers `/dashboard`
- `/community` -> redirige vers `/about`
- `/b2b` -> redirige vers `/institutions`
- `/partner-services` -> pas de redirect (404)

L'utilisateur clique sur "Zones Latentes" et atterrit sur le Dashboard sans comprendre pourquoi.

**Correction :** Supprimer ou masquer les outils dont les routes sont masquees dans ToolsHub, ou ajouter un badge "Bientot" avec le lien desactive.

## MINEUR - Toast messages hardcodes FR (791 occurrences, 27 fichiers)

Tous les hooks metier utilisent `toast.error('Erreur...')` et `toast.success('Succes...')` en francais brut. C'est le probleme i18n le plus massif restant.

**Decision :** Trop risque pour cette iteration (27 fichiers, 791 occurrences). Documenter pour une passe dediee.

## MINEUR - `as any` residuels non-supabase

| Fichier | Probleme |
|---------|----------|
| `LatentThresholdAlerts.tsx:215` | `variant={...as any}` sur Badge |
| `TerrainPartnerReliability.tsx:129` | `partners as any` dans saveNotes |
| `StrategicFrameworks.tsx:187,257,309,418` | Multiples `as any` pour tabs, positions, items |
| `SecurityChecker.tsx:135` | `window as any` |
| `TraceOSCollaboration.tsx:61` | `value[0] as any` sur presence |

---

# PHASE 2 : AUDIT UX (Designer Senior)

## CRITIQUE - ToolsHub affiche des outils fantomes

L'utilisateur voit 30+ outils organises en categories. Quand il clique sur "Zones Latentes", "Irreversa", "OVI", "Communaute", "B2B", "Parcours Persona" ou "Centre Academique", il est redirige vers une page generique sans rapport. Aucun indicateur visuel n'avertit que ces outils ne sont pas disponibles.

**Correction :** Ajouter un badge "Bientot" et desactiver le lien, ou retirer les outils masques.

## MAJEUR - Landing page (Index.tsx) 100% hardcodee en francais

La page d'accueil est la premiere impression de l'app. Tout le contenu est en francais brut : hero, etapes, temoignages, pricing. Un utilisateur anglophone voit "Comprends le systeme avant de t'engager" sans traduction possible.

**Correction :** Pas dans cette iteration (530 lignes, 80+ chaines). Documenter comme dette i18n majeure.

## MAJEUR - DisclaimerConsentDialog utilise `window.location.href`

Le lien "Voir les details complets" dans le disclaimer force un rechargement complet (`window.location.href = '/disclaimer'`). L'utilisateur perd son contexte (scroll, etat des formulaires) et voit un flash blanc.

**Correction :** Utiliser `navigate('/disclaimer')` via un hook ou passer `navigate` en prop.

## MINEUR - ToolsHub non internationalise

Toutes les categories et descriptions dans ToolsHub sont en francais brut : "Decouvrir", "Explorer les pays et comprendre les systemes", etc. Meme pattern que la landing page.

---

# PHASE 3 : AUDIT BETA TESTEUR (Utilisateur Final)

## "Je clique sur des outils et je ne comprends pas ou j'atterris"

En tant qu'utilisateur, je vais sur le Hub Outils (/tools). Je vois "Zones Latentes" avec "Risques caches" comme description. Je clique. J'arrive sur mon Dashboard. Je me dis "c'est un bug". Meme probleme avec OVI, Irreversa, Communaute, B2B, Parcours Persona. **C'est la source de confusion #1.**

## "Le lien /partner-services ne marche pas"

Dans le Hub Outils, la categorie "Communaute" affiche "Partenaires" avec le lien `/partner-services`. Ce lien n'a aucun redirect et aboutit a la page 404. C'est le seul lien casse de l'app.

## "Quand je clique 'Voir les details complets' dans le disclaimer, la page recharge"

Le flash blanc au rechargement donne l'impression que l'app a plante.

## "Tout est en francais, je ne peux pas changer"

Le language switcher existe dans le header mais la landing page, le hub outils, et les toasts restent en francais quel que soit le choix.

---

# PLAN DE CORRECTIONS (3 phases fusionnees)

## Priorite 1 : Liens casses et outils fantomes (UX breaking)

| # | Fichier | Action |
|---|---------|--------|
| 1 | `src/pages/ToolsHub.tsx` | Retirer ou desactiver (badge "Bientot" + `pointer-events-none opacity-60`) les outils dont les routes sont masquees : `/errors-illusions`, `/personas`, `/academic`, `/latent`, `/irreversa`, `/ovi`, `/community`, `/b2b`, `/partner-services` |
| 2 | `src/routes/index.tsx` | Ajouter redirect `/partner-services` -> `/about` pour eliminer le 404 |

## Priorite 2 : Navigation sans rechargement

| # | Fichier | Action |
|---|---------|--------|
| 3 | `src/components/DisclaimerConsentDialog.tsx` L117 | Remplacer `window.location.href = '/disclaimer'` par `navigate('/disclaimer')` via `useNavigate()` |
| 4 | `src/components/onboarding/InteractiveTutorial.tsx` L315 | Remplacer `window.location.href` par `navigate()` |

## Priorite 3 : Type safety Supabase (5 fichiers critiques)

| # | Fichier | Action |
|---|---------|--------|
| 5 | `src/hooks/useCountryWatchlist.tsx` | Definir interface `WatchlistRow` et caster les resultats au lieu du client |
| 6 | `src/hooks/useGamification.tsx` | Definir interface `GamificationRow` et caster les resultats |
| 7 | `src/hooks/useExperts.tsx` | Definir interface `ExpertProfileRow` et caster les resultats |

## Non corrige (documente)

| Probleme | Raison |
|----------|--------|
| 791 toast messages FR dans 27 hooks | Refactoring massif, passe i18n dediee necessaire |
| Landing page 530 lignes FR | Passe i18n dediee necessaire |
| ToolsHub labels FR | Meme passe i18n |
| `as any` residuels dans composants non-critiques | Risque faible, composants secondaires |
| `(supabase as any)` dans usePmoCompliance (12 occ.) | Module PMO en cours de stabilisation |

## Fichiers a modifier

1. `src/pages/ToolsHub.tsx` - Masquer outils fantomes
2. `src/routes/index.tsx` - Redirect `/partner-services`
3. `src/components/DisclaimerConsentDialog.tsx` - `navigate()` au lieu de `window.location.href`
4. `src/components/onboarding/InteractiveTutorial.tsx` - `navigate()` au lieu de `window.location.href`
5. `src/hooks/useCountryWatchlist.tsx` - Typage interfaces
6. `src/hooks/useGamification.tsx` - Typage interfaces
7. `src/hooks/useExperts.tsx` - Typage interfaces

## Estimation

- Temps : 20-25 minutes
- Complexite : Moyenne
- Risque regression : Faible (liens, navigation, et typage cible sans logique metier touchee)

