

# Audit Technique Senior v3 - Post-Corrections

## Etat actuel

Les audits precedents ont corrige les problemes les plus critiques (routes, `window as any`, `useOfflineSync` duplique, polling 300s, migration `fetch` vers `supabase.functions.invoke`). Le codebase est stable.

## Problemes residuels identifies

### 1. `as any` dans WorldMap.tsx (2 occurrences)

**Fichier:** `src/components/WorldMap.tsx`, lignes 260 et 359

`DB_COMPLETE_COUNTRY_IDS.includes(country.id as any)` alors qu'une fonction utilitaire `hasCompleteDbData(id: string)` existe deja dans `src/lib/countries-extended.ts` et accepte un `string` directement.

**Correction:** Remplacer par `hasCompleteDbData(country.id)` et `hasCompleteDbData(hoveredCountry)`.

### 2. `(fnError as any)?.status` dans DestinationInsights.tsx

**Fichier:** `src/components/DestinationInsights.tsx`, ligne 55

Le `fnError` de `supabase.functions.invoke` est de type `FunctionsHttpError` qui ne possede pas directement `.status`. Le cast est necessaire pour extraire le code HTTP.

**Correction:** Typer proprement via `(fnError as { status?: number })?.status` au lieu de `as any`.

### 3. `as any` dans useSmartRecommendations.tsx (4 occurrences)

**Fichier:** `src/hooks/useSmartRecommendations.tsx`, lignes 120-123

`country.cost_of_living as any`, etc. Ces champs sont des `Json | null` dans le schema Supabase. Les valeurs sont ensuite utilisees comme nombres ou objets mais le cast `as any` masque le type reel.

**Correction:** Caster vers le type attendu (ex: `as Record<string, number> | null` ou `as string[] | null`) selon l'usage reel.

### 4. `as any` dans StructuralRulesSection.tsx (2 occurrences)

**Fichier:** `src/components/cases/StructuralRulesSection.tsx`, lignes 86 et 89

Acces a `caseData.structural_rules` et appel `onUpdateCase({ structural_rules })` avec `as any` car le champ n'est probablement pas dans le type de `caseData`.

**Correction:** Etendre l'interface `CaseData` pour inclure `structural_rules?: StructuralRule[]` ou utiliser un cast cible.

### 5. Toast messages hardcodes en francais (22 hooks)

**Impact:** Tous les hooks PMO (`usePmoRisks`, `usePmoEvidence`, `usePmoCompliance`, `usePmoMilestones`), `useTraceOSDecisions`, `useTraceOSWorkflows`, `useCountryWatchlist`, `useNewsletter`, `useExpertReviews`, etc. utilisent des chaines francaises directement dans `toast.error()` / `toast.success()`.

**Decision:** Ce probleme est systematique (480+ occurrences dans 22 fichiers). Le corriger necessite un refactoring massif pour injecter `t()` dans chaque hook. **Risque de regression eleve.** Documente mais non corrige dans cette iteration.

---

## Plan de corrections (scope reduit, zero regression)

| # | Fichier | Action | Risque |
|---|---------|--------|--------|
| 1 | `src/components/WorldMap.tsx` L260 | Remplacer `DB_COMPLETE_COUNTRY_IDS.includes(country.id as any)` par `hasCompleteDbData(country.id)` | Nul |
| 2 | `src/components/WorldMap.tsx` L359 | Remplacer `DB_COMPLETE_COUNTRY_IDS.includes(hoveredCountry as any)` par `hasCompleteDbData(hoveredCountry!)` | Nul |
| 3 | `src/components/DestinationInsights.tsx` L55 | Remplacer `(fnError as any)?.status` par `(fnError as { status?: number })?.status` | Nul |
| 4 | `src/hooks/useSmartRecommendations.tsx` L120-123 | Remplacer 4x `as any` par casts types (`as Record<string, unknown> \| null`) | Faible |

### Non corrige (trop de risque)

| Probleme | Raison |
|----------|--------|
| 480+ toast messages FR dans 22 hooks | Refactoring massif, necessite injection `t()` dans chaque hook via `useTranslation()` |
| `StructuralRulesSection.tsx` `as any` | Necessite extension du type `CaseData` qui est genere par Supabase |
| `Index.tsx` `_t` renomme | Deja documente avec eslint-disable, correction cosmetique |

## Fichiers a modifier

1. `src/components/WorldMap.tsx`
2. `src/components/DestinationInsights.tsx`
3. `src/hooks/useSmartRecommendations.tsx`

## Estimation

- Temps : 5 minutes
- Complexite : Faible
- Risque regression : Quasi nul
