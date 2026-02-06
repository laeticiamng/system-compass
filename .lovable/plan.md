

# Triple Audit v5 - Technique + UX + Beta Testeur

## Etat post-audits precedents

Les audits v1 a v4 ont corrige : routes doublons, `window as any` global, `fetch()` vers `supabase.functions.invoke()`, dead code LazyRoutes, page 404 redesignee, breadcrumbs i18n, cookie consent i18n, contextual shortcuts i18n, onboarding aria-labels, ToolsHub outils fantomes avec badge "Bientot", redirect `/partner-services`, `navigate()` dans DisclaimerConsentDialog et InteractiveTutorial, typage `useCountryWatchlist`/`useGamification`/`useExperts`, `as any` dans WorldMap/DestinationInsights/useSmartRecommendations.

---

# PHASE 1 : AUDIT TECHNIQUE (Dev Senior)

## MAJEUR - `(supabase as any)` residuels dans 2 fichiers non traites

| Fichier | Occurrences | Tables |
|---------|-------------|--------|
| `usePmoCompliance.tsx` | 9 | `pmo_compliance_frameworks`, `pmo_compliance_requirements`, `pmo_compliance_mappings` |
| `ExpertMessaging.tsx` | 3 | `expert_conversations`, `expert_messages` |

**Correction :** Migrer vers `supabase.from('table_name' as any)` avec cast des resultats (meme pattern que useCountryWatchlist corrige precedemment). Supprimer les commentaires `eslint-disable` devenus inutiles.

## MAJEUR - `window.location.href` dans NotificationManager (2 occurrences)

**Fichier :** `src/components/common/NotificationManager.tsx`, lignes 134 et 336

Le composant n'importe pas `useNavigate`. Quand un utilisateur clique sur une notification avec un `actionHref`, la page se recharge completement au lieu d'une navigation SPA.

**Correction :** Ajouter `useNavigate` et remplacer les deux `window.location.href` par `navigate()`.

## MINEUR - `as any` residuels dans composants cases/governance

| Fichier | Lignes | Probleme |
|---------|--------|----------|
| `RiskRegisterEnhanced.tsx` | 103, 106 | `(caseData as any).risk_register_enhanced` et `onUpdateCase({...} as any)` |
| `StructuralRulesSection.tsx` | 86, 89 | `(caseData as any).structural_rules` et `onUpdateCase({...} as any)` |
| `GovernanceAdvanced.tsx` | 579-580 | `actor.sources as any[]` |
| `TerrainPOCPlanner.tsx` | 55, 106 | `notes.poc_plan as any` et `saveNotes({...} as any)` |

**Correction :** Utiliser des casts cibles (`as Record<string, unknown>`) ou des interfaces etendues locales au lieu de `as any` brut.

## MINEUR - `console.log` en production (13 fichiers, 30+ occurrences)

Des `console.log` de debug sont presents dans le code de production (`countries-store.ts`, `translations-store.ts`, `useOfflineSync.tsx`, `usePartnerProgram.tsx`, etc.). Pas critique mais bruyant en console et risque de fuite d'info.

**Decision :** Documenter pour une passe dediee. Risque faible.

---

# PHASE 2 : AUDIT UX (Designer Senior)

## MAJEUR - NotificationManager rechargement complet sur clic notification

Quand un utilisateur clique sur "Voir" dans une notification, la page recharge entierement (flash blanc). L'utilisateur perd son contexte de navigation. C'est le meme pattern que le DisclaimerConsentDialog corrige precedemment.

## MINEUR - Pas de nouveaux problemes UX critiques detectes

Les corrections precedentes (404 redesignee, ToolsHub outils fantomes, breadcrumbs i18n, cookie consent i18n) ont elimine les problemes UX les plus impactants. Les problemes restants sont du i18n massif (landing page, toasts) deja documentes.

---

# PHASE 3 : AUDIT BETA TESTEUR

## "Les notifications me font recharger la page"

En tant qu'utilisateur, quand je recois une notification et que je clique sur l'action, la page recharge au lieu de naviguer en douceur. C'est perturbant, surtout si j'etais au milieu d'un formulaire.

## "Certains modules pro affichent des erreurs TypeScript silencieuses"

Les modules de cas (RiskRegister, StructuralRules, GovernanceAdvanced) accedent a des champs via `as any`. Si le schema evolue, ces champs pourraient silencieusement retourner `undefined` sans avertissement.

---

# PLAN DE CORRECTIONS

## Priorite 1 : Navigation SPA dans NotificationManager

| # | Fichier | Action |
|---|---------|--------|
| 1 | `src/components/common/NotificationManager.tsx` | Ajouter `useNavigate`, remplacer 2x `window.location.href = notification.actionHref` par `navigate(notification.actionHref)` |

## Priorite 2 : Migrer `(supabase as any)` restants

| # | Fichier | Action |
|---|---------|--------|
| 2 | `src/hooks/usePmoCompliance.tsx` | Remplacer 9x `(supabase as any).from('table')` par `supabase.from('table' as any)`, supprimer les `eslint-disable` |
| 3 | `src/components/marketplace/ExpertMessaging.tsx` | Remplacer 3x `(supabase as any).from('table')` par `supabase.from('table' as any)` avec casts resultats |

## Priorite 3 : Typage cible dans composants cases

| # | Fichier | Action |
|---|---------|--------|
| 4 | `src/components/cases/RiskRegisterEnhanced.tsx` | Remplacer `(caseData as any).risk_register_enhanced` par `(caseData as Record<string, unknown>).risk_register_enhanced as Risk[]` |
| 5 | `src/components/cases/StructuralRulesSection.tsx` | Meme pattern pour `structural_rules` |
| 6 | `src/components/governance/TerrainPOCPlanner.tsx` | Caster `notes.poc_plan` vers `Record<string, unknown>` |

## Non corrige (documente)

| Probleme | Raison |
|----------|--------|
| `console.log` en production (13 fichiers) | Nettoyage dedie necessaire, risque faible |
| Toast messages FR (27 hooks) | Refactoring i18n massif, passe dediee |
| Landing page / ToolsHub labels FR | Passe i18n dediee |
| `GovernanceAdvanced.tsx` `actor.sources as any[]` | Necessite definition du type Source, composant secondaire |

## Fichiers a modifier

1. `src/components/common/NotificationManager.tsx` - `navigate()` au lieu de `window.location.href`
2. `src/hooks/usePmoCompliance.tsx` - Migration `(supabase as any)` vers `supabase.from('table' as any)`
3. `src/components/marketplace/ExpertMessaging.tsx` - Migration `(supabase as any)` vers `supabase.from('table' as any)`
4. `src/components/cases/RiskRegisterEnhanced.tsx` - Casts cibles
5. `src/components/cases/StructuralRulesSection.tsx` - Casts cibles
6. `src/components/governance/TerrainPOCPlanner.tsx` - Casts cibles

## Estimation

- Temps : 15 minutes
- Complexite : Faible
- Risque regression : Quasi nul (navigation, typage, et pattern deja valide sur les fichiers precedents)
