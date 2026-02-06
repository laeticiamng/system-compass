

# Triple Audit v6 - Technique + UX + Beta Testeur

## Etat post-audits v1 a v5

Les audits precedents ont corrige la majorite des problemes critiques. Le codebase est stable avec les migrations `supabase.from('table' as any)`, la navigation SPA dans la plupart des composants, les outils fantomes masques dans ToolsHub, la page 404 redesignee, l'i18n dans breadcrumbs/cookie consent/contextual shortcuts, et le typage cible dans les composants cases.

---

## PHASE 1 : AUDIT TECHNIQUE (Dev Senior)

### MAJEUR - `window.location.href` residuel dans NotificationCard (1 occurrence)

**Fichier :** `src/components/common/NotificationManager.tsx`, ligne 338

Le composant `NotificationCard` (utilise dans `NotificationCenter`) contient encore `window.location.href = notification.actionHref`. Le composant `NotificationDropdown` a ete corrige mais pas `NotificationCard`. C'est un composant React qui peut utiliser `useNavigate()`.

**Correction :** Ajouter `useNavigate()` dans `NotificationCard` et remplacer `window.location.href` par `navigate()`.

### MINEUR - `actor.sources as any[]` dans GovernanceAdvanced (2 occurrences)

**Fichier :** `src/components/cases/GovernanceAdvanced.tsx`, lignes 579-580

**Correction :** Caster vers `string[]` qui correspond au type reel des sources.

### MINEUR - `(window as any)` dans performance-utils.ts (2 occurrences)

**Fichier :** `src/lib/performance-utils.ts`, lignes 152, 165

Utilise `(window as any).requestIdleCallback` et `(window as any).cancelIdleCallback`. Ces APIs existent mais ne sont pas dans les types par defaut de TypeScript.

**Decision :** Pas critique - les `eslint-disable` sont deja en place et `requestIdleCallback` n'est pas dans les types TS standard. Garder tel quel.

### INFO - `console.log` en production (47 fichiers, 603 occurrences)

Deja documente dans les audits precedents. Nettoyage dedie necessaire.

### INFO - Tous les `(supabase as any)` ont ete migres vers `supabase.from('table' as any)`

Pas de regression detectee.

---

## PHASE 2 : AUDIT UX (Designer Senior)

### MAJEUR - NotificationCenter (page standalone) recharge la page au clic action

Le composant `NotificationCard` dans le `NotificationCenter` provoque un rechargement complet quand l'utilisateur clique sur une action. C'est le dernier composant avec ce probleme.

### INFO - Pas de nouveaux problemes UX critiques

Les corrections precedentes couvrent les problemes UX les plus impactants. Les problemes restants sont de l'i18n massif (landing page, toasts) deja documentes.

---

## PHASE 3 : AUDIT BETA TESTEUR

### "Les notifications dans le centre de notifications rechargent encore la page"

Si j'ouvre le centre de notifications complet (pas le dropdown), et que je clique sur une action, la page recharge. Le dropdown fonctionne bien mais pas la page centre de notifications.

---

## PLAN DE CORRECTIONS

### Correction 1 : Navigation SPA dans NotificationCard

| Fichier | Action |
|---------|--------|
| `src/components/common/NotificationManager.tsx` | Ajouter `useNavigate()` dans `NotificationCard`, remplacer `window.location.href = notification.actionHref` par `navigate(notification.actionHref)` |

### Correction 2 : Typage GovernanceAdvanced sources

| Fichier | Action |
|---------|--------|
| `src/components/cases/GovernanceAdvanced.tsx` | Remplacer `actor.sources as any[]` par `(actor.sources as string[])` (2 occurrences, lignes 579-580) |

## Non corrige (documente, inchange depuis v5)

| Probleme | Raison |
|----------|--------|
| `console.log` en production (47 fichiers) | Nettoyage dedie necessaire |
| Toast messages FR (27 hooks) | Refactoring i18n massif |
| Landing page / ToolsHub labels FR | Passe i18n dediee |
| `(window as any).requestIdleCallback` | API non typee dans TS, eslint-disable en place |

## Fichiers a modifier

1. `src/components/common/NotificationManager.tsx` - `navigate()` dans NotificationCard
2. `src/components/cases/GovernanceAdvanced.tsx` - `as string[]` au lieu de `as any[]`

## Estimation

- Temps : 5 minutes
- Complexite : Tres faible
- Risque regression : Quasi nul

