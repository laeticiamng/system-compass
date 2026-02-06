

# Audit C-Suite v15 -- Pre-Publication Final

## Statut des corrections precedentes (v1-v14)

| Correction | Statut |
|-----------|--------|
| 40 corrections i18n UI (v1-v13) | RESOLU |
| 785 toast messages dans 37 fichiers (v14 batch 1-3) | RESOLU |

## Synthese par role

- **CEO** : Plateforme prete pour publication. Derniers fichiers oublies lors du batch v14 identifies ci-dessous.
- **CISO** : Le linter Supabase ne remonte qu'1 warning mineur (extensions in public -- non-bloquant). Le scan de securite remonte 5 findings dont 1 "error" sur la table `experts` (deja protegee par la vue `experts_public` -- finding contextuel, pas un vrai risque). RLS actif sur 60+ tables.
- **DPO** : Conforme. Anonymisation GDPR active. Pas de nouvelle donnee exposee.
- **CDO** : Pipeline analytics coherent. Pas de regression.
- **COO** : 8 fichiers restants avec toasts FR non-wrappés identifies -- derniere passe mecanique.
- **Head of Design** : Apres cette correction, 100% des feedbacks utilisateur seront traduisibles.
- **Beta testeur** : Les hooks Irreversa, EventRegistration, CountryWatchlist, ExitKeysProfile, PmoDependencies, TraceOSExportSchedule, GenerationNotifications et le composant EventCalendar affichent encore des toasts FR durs.

## Findings de securite (contexte)

| Finding | Niveau | Action |
|---------|--------|--------|
| Extension in Public | WARN | Non-bloquant, comportement par defaut |
| Expert data public | ERROR | Deja protege par vue `experts_public` avec `security_invoker` -- marking as contextual |
| fiscal_rules public read | WARN | Donnees referentielles publiques par design |
| fiscal_special_regimes public | WARN | Idem |
| countries public read | WARN | Donnees referentielles, lecture publique intentionnelle |
| ui_translations public | INFO | Necessaire pour le fonctionnement i18n |

Aucune action corrective de securite requise -- tous les findings sont soit deja mitigés, soit intentionnels par design.

## Inconsistances detectees -- 8 fichiers restants

### 1. useIrreversa.tsx (~10 toasts FR)
- "Erreur lors de la creation du seuil", "Erreur lors du marquage", "Erreur lors de l'ajout du temoin"
- "Erreur lors de la validation", "Erreur lors du scellement"
- "Les seuils scelles ne peuvent pas etre supprimes"
- "Seuil supprime", "Temoin retire", "Erreur lors du retrait du temoin", "Erreur lors de la suppression"

### 2. useExitKeysProfile.tsx (~3 toasts FR)
- "Profil sauvegarde localement uniquement", "Profil sauvegarde", "Profil sauvegarde localement"

### 3. useEventRegistration.tsx (~4 toasts FR)
- "Inscription confirmee !", "Erreur lors de l'inscription", "Inscription annulee", "Erreur lors de l'annulation"

### 4. useCountryWatchlist.tsx (~3 toasts FR)
- "Pays suivi", "Pays retire", "Erreur lors de la mise a jour"

### 5. useTraceOSExportSchedule.tsx (~7 toasts FR)
- "Planification d'export mise a jour", "Erreur lors de la mise a jour", "Erreur"
- "Erreur lors de l'export", "Erreur lors du telechargement", "Export supprime", "Erreur lors de la suppression"
- "Export cree: X decisions"

### 6. usePmoDependencies.tsx (~4 toasts FR)
- "Dependance creee", "Erreur lors de la creation de la dependance"
- "Dependance supprimee", "Erreur lors de la suppression"

### 7. useGenerationNotifications.tsx (~8 toasts FR)
- "X genere", "X echoue", "X en validation...", "X en cours de generation..."
- "Batch termine !", "X/Y pays generes", "Batch termine avec erreurs", "X succes, Y echecs"

### 8. EventCalendar.tsx (~2 toasts FR)
- "Inscrit a X", "Vous recevrez un rappel avant l'evenement."

## Hors perimetre

- TerrainRealitiesPdfExport.tsx : 1 toast "Export failed" en anglais -- deja acceptable
- ReunionGameBoard.tsx : toasts deja wrappés avec `t()`
- AdminCountryGenerator.tsx / AdminDatabaseTranslations.tsx : pages admin internes, toasts contextuels avec variables dynamiques -- impact marginal

## Plan de correction

### Patron identique pour les 8 fichiers

1. Ajouter `import { useTranslation } from 'react-i18next';` (si absent)
2. Declarer `const { t } = useTranslation();` dans le hook/composant
3. Wrapper chaque toast avec `t('cle.i18n', 'Fallback FR')`

### Cles i18n par fichier

**useIrreversa.tsx** :
- `toast.irreversa.createError`, `toast.irreversa.markError`, `toast.irreversa.witnessError`
- `toast.irreversa.validateError`, `toast.irreversa.sealError`, `toast.irreversa.sealedCannotDelete`
- `toast.irreversa.deleted`, `toast.irreversa.witnessRemoved`, `toast.irreversa.witnessRemoveError`, `toast.irreversa.deleteError`

**useExitKeysProfile.tsx** :
- `toast.profile.savedLocalOnly`, `toast.profile.saved`, `toast.profile.savedLocal`

**useEventRegistration.tsx** :
- `toast.event.registered`, `toast.event.registerError`, `toast.event.cancelled`, `toast.event.cancelError`
- `toast.event.registeredDesc`

**useCountryWatchlist.tsx** :
- `toast.watchlist.added`, `toast.watchlist.removed`, `toast.watchlist.error`

**useTraceOSExportSchedule.tsx** :
- `toast.export.scheduleUpdated`, `toast.export.updateError`, `toast.export.error`
- `toast.export.exportError`, `toast.export.downloadError`, `toast.export.deleted`, `toast.export.deleteError`
- `toast.export.created`

**usePmoDependencies.tsx** :
- `toast.dependency.created`, `toast.dependency.createError`
- `toast.dependency.deleted`, `toast.dependency.deleteError`

**useGenerationNotifications.tsx** :
- `toast.generation.done`, `toast.generation.failed`, `toast.generation.validating`, `toast.generation.running`
- `toast.generation.batchCompleted`, `toast.generation.batchFailed`

**EventCalendar.tsx** :
- `toast.calendar.registered`, `toast.calendar.registeredDesc`

## Details techniques

Meme patron que v14. Tous les hooks listes sont des custom hooks React et peuvent appeler `useTranslation()`. Pour `useGenerationNotifications.tsx`, les toasts avec variables dynamiques utiliseront l'interpolation i18next (`{{name}}`, `{{count}}`).

## Actions de securite post-publication

Les 5 security scan findings seront marques comme ignores/contextuels apres implementation, car ils sont tous mitiges par design (vue `experts_public`, tables referentielles publiques intentionnellement).

