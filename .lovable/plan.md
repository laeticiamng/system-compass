
Phase 1 (stabilisation) is now 4/5 done: E2E tests, rate-limiting, i18n linter, observabilité maison + cockpit gouvernance. Reste **Chantier #4** : refactor architecture en bounded contexts + migration de `GlobalConnector` (sessionStorage) vers Zustand.

C'est le chantier le plus structurant pour la gouvernance long terme : il transforme un codebase organisé par type technique (`components/`, `hooks/`, `services/`) en codebase organisé par **domaine métier**, ce qui rend les règles de dépendance explicites et auditables.

---

## Plan — Chantier #4 : Bounded Contexts + Zustand

### Objectif systémique
Passer d'une architecture **plate** (couplages diffus via sessionStorage + props drilling) à une architecture **par domaine** avec frontières explicites et état réactif typé. Bénéfice gouvernance : chaque domaine devient auditable, testable et remplaçable indépendamment.

### Diagnostic actuel
- `GlobalConnector.tsx` utilise `sessionStorage` → état non réactif, pas de re-render automatique, perte au refresh
- 6 helpers de connexion inter-modules (`connectExitKeysToDashboard`, `connectCountryToCompare`, etc.) → logique métier dispersée
- Code organisé par **type technique** (components/hooks/services) → frontières de domaine implicites

### Architecture cible : `src/domains/`

```text
src/domains/
├── _shared/              ← types & utils transverses
│   └── types.ts
├── country/              ← données pays, comparaison
│   ├── store.ts          (Zustand: selectedCountries, comparisonMode)
│   ├── api.ts            (queries Supabase typées)
│   ├── types.ts
│   └── index.ts          (barrel export = API publique du domaine)
├── exit-keys/            ← profil + clés de sortie
│   ├── store.ts          (profile, computedKeys, navigation context)
│   ├── api.ts
│   └── index.ts
├── governance/           ← traceos, latent zones, irreversa
│   ├── store.ts          (decisions, thresholds, cross-module links)
│   ├── api.ts
│   └── index.ts
├── observability/        ← logger + web vitals (existe déjà, on déplace)
│   └── index.ts          (re-export depuis lib/observability)
└── auth/                 ← user, roles, session
    ├── store.ts          (user, roles, isAdmin)
    └── index.ts
```

**Règle de dépendance** (vérifiable par lint) : un domaine ne peut importer que `_shared` ou ses propres fichiers. Cross-domain = via store explicite.

### Migration `GlobalConnector` → Zustand

**Avant** (sessionStorage, non réactif) :
```ts
setModuleContext({ sourceModule, targetModule, data })
const ctx = getModuleContext() // lecture impérative
```

**Après** (Zustand, réactif + persisté) :
```ts
// src/domains/_shared/navigationStore.ts
const useNavigationContext = create(persist(...))

// Composant cible
const ctx = useNavigationContext(s => s.context)
// re-render auto quand le contexte change
```

- `persist` middleware sur sessionStorage → compatibilité ascendante
- TTL 30min géré dans le store (pas de helper externe)
- Helpers métier (`connectExitKeysToDashboard`, etc.) déplacés dans le store du domaine source

### Périmètre du chantier (volontairement borné)

**Inclus** :
1. Créer `src/domains/` avec 5 sous-dossiers + barrel exports
2. Créer `useNavigationContext` (Zustand + persist) qui remplace `GlobalConnector`
3. Migrer les 6 `connectXxxToYyy` helpers vers les stores de domaine
4. Adapter les ~10 consumers (search & remplacement guidé)
5. Garder `GlobalConnector.tsx` comme **shim deprecated** (re-export, console.warn) pour ne rien casser
6. Lint : règle ESLint custom `no-cross-domain-import` (warning d'abord)
7. Test Vitest : équivalence comportementale (le test existant `GlobalConnector.test.tsx` doit toujours passer)

**Exclus** (chantiers ultérieurs) :
- Migration complète de tous les `useState` éparpillés vers Zustand
- Réorganisation physique de `components/` par domaine (juste règles d'import pour l'instant)
- Suppression définitive de `GlobalConnector.tsx` (après 1 sprint de stabilité)

### Détails techniques

- **Dépendance** : `zustand` (probablement déjà présent — à vérifier)
- **Pattern** : 1 store par domaine, slice pattern si > 200 lignes
- **Types** : interfaces exportées depuis `domains/<x>/types.ts`, pas de `any`
- **Test** : un test par store (init, mutation, persist round-trip)

### Livrables
- 5 stores Zustand typés
- 1 shim de compatibilité `GlobalConnector.tsx`
- 1 règle ESLint `no-cross-domain-import` (warn)
- 1 README `src/domains/README.md` expliquant les frontières
- Tests verts (E2E + unit)

### Risques & mitigations
- **Casse silencieuse** des consumers → shim deprecated + tests E2E (déjà en place grâce au Chantier #1)
- **Sur-ingénierie** → on borne à 5 domaines, pas un par feature
- **Zustand pas installé** → fallback sur Context API + useReducer (à confirmer après check)

<lov-actions>
<lov-suggestion message="Vas-y, exécute le Chantier #4 tel que planifié : src/domains/ + Zustand pour GlobalConnector + shim deprecated + règle ESLint en warning.">Exécuter Chantier #4</lov-suggestion>
<lov-suggestion message="Réduis le scope : fais uniquement la migration GlobalConnector → Zustand (avec persist), sans créer src/domains/ ni la règle ESLint pour l'instant.">Juste Zustand, pas de domains/</lov-suggestion>
<lov-suggestion message="Avant le refactor, ajoute un test E2E qui couvre les 6 connexions inter-modules (connectExitKeysToDashboard, connectCountryToCompare, etc.) pour garantir zéro régression.">Filet E2E d'abord</lov-suggestion>
<lov-suggestion message="Passe Phase 1 et attaque Phase 2 : alerting email admin (Resend) sur taux d'erreur > seuil + purge auto cron pour error_logs.">Phase 2 : alerting</lov-suggestion>
</lov-actions>
