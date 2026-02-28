

# Plan: Fix des 8 tickets UX + erreurs de build

## Partie 1 -- Corriger les erreurs de build (prerequis)

Les erreurs de build bloquent le deploiement. Elles doivent etre corrigees en premier.

### 1.1 Edge function `send-email` -- import npm manquant
Le fichier `supabase/functions/send-email/index.ts` importe `@react-email/components@0.0.22` via `npm:` mais aucun `deno.json` n'existe pour cette fonction. Solution : creer un `supabase/functions/send-email/deno.json` avec l'import map necessaire, ou remplacer l'import par un approach inline (render HTML string au lieu de React Email).

### 1.2 Imports inutilises (TS6133) -- 5 fichiers
- `src/components/GamificationProgressBar.tsx` : retirer `Progress` et `Badge` des imports
- `src/components/irreversa/ExpatTimeline.tsx` : retirer `ArrowRight`, `ExpatPhase`, et `t` (ligne 103, doublon)
- `src/pages/Blog.tsx` : retirer `t` (inutilise)
- `src/pages/BlogArticle.tsx` : retirer `t` (inutilise)

### 1.3 Type manquant `TaxProfile` (TS2339/TS2304)
- `src/components/fiscal/wizard/FiscalDetailsStep.tsx` : `TaxProfile` n'a pas les proprietes `familyStatus` ni `socialStatus`. Le type utilise `status` et `incomeType`. Corriger les references ligne 143/145 pour utiliser `profile.status` et `profile.incomeType`.
- `src/components/fiscal/FiscalHistorySaver.tsx` : `t` n'est pas importe dans la portee ou il est utilise (lignes 132, 140, 150). Ajouter `const { t } = useTranslation()` dans le scope correct ou utiliser les traductions existantes.

### 1.4 `pushManager` TypeScript (TS2339)
- `src/hooks/useNotificationSettings.tsx` : `pushManager` n'existe pas dans le type standard `ServiceWorkerRegistration`. Ajouter un cast `as any` ou etendre le type avec une declaration.

---

## Partie 2 -- Verification des tickets UX deja implementes

Apres examen du code, les tickets T1 a T8 sont dans les etats suivants :

| Ticket | Statut | Details |
|---|---|---|
| **T1 Pricing** | DEJA FAIT | Badge "Recommande pour commencer", texte "Pas de carte bancaire requise", bouton primary -- tout est en place (lignes 59, 69, 241-243, 273-276, 337) |
| **T2 Dashboard** | DEJA FAIT | `EmptyDashboardState` s'affiche quand `!profile && !selectedKeyId` (ligne 361). La card "Profil non configure" ne s'affiche que quand `!profile && selectedKeyId` (ligne 388). Pas de redondance. |
| **T3 Compare** | DEJA FAIT | Message "Selectionne 2 pays", texte d'aide, et 3 suggestions cliquables (France vs Portugal, etc.) sont en place (lignes 615-646). |
| **T4 Community** | DEJA FAIT | `statusLabel: 'En preparation'` sur les ressources (lignes 93, 99, 105), badges "Bientot" (ligne 314-317), CTA "Etre informe du lancement" (lignes 347-365). |
| **T5 Disclaimer** | DEJA FAIT | Section "En resume" avec 3 points cles visuels (lignes 49-78) : Outil educatif, Pas de conseil pro, Vous decidez. |
| **T6 Life Game** | DEJA FAIT | CTA deplace au-dessus de la Clarification Box (ligne 114 = CTA, ligne 130 = Clarification Box). |
| **T7 Countries** | A FAIRE | Les country cards utilisent `glass-card glow-subtle` mais manquent de contraste net (bordure/ombre/hover). |
| **T8 Auth** | DEJA FAIT | Ecran de confirmation post-inscription avec animation, checkmark, et barre de progression (lignes 207-249). |

---

## Partie 3 -- Ticket T7 : Contraste des CountryCards

Le seul ticket UX restant a implementer. Modifications dans `src/components/CountryCard.tsx` :

- Ajouter une bordure plus visible : `border border-border/60` 
- Renforcer l'ombre au hover : `hover:shadow-lg hover:shadow-primary/5`
- Ajouter un fond leger au survol : `hover:bg-card/80`
- S'assurer que le focus est accessible : `focus-visible:ring-2 focus-visible:ring-primary`
- Verifier la lisibilite en mode clair et sombre (les classes existantes utilisent des variables CSS qui s'adaptent)

---

## Resume des fichiers a modifier

| Fichier | Action |
|---|---|
| `supabase/functions/send-email/deno.json` | CREER -- ajouter import map pour `@react-email/components` |
| `src/components/GamificationProgressBar.tsx` | Retirer imports `Progress`, `Badge` |
| `src/components/irreversa/ExpatTimeline.tsx` | Retirer imports `ArrowRight`, `ExpatPhase`, `t` doublon |
| `src/pages/Blog.tsx` | Retirer import `t` |
| `src/pages/BlogArticle.tsx` | Retirer import `t` |
| `src/components/fiscal/wizard/FiscalDetailsStep.tsx` | Corriger `familyStatus` -> `status`, `socialStatus` -> `incomeType` |
| `src/components/fiscal/FiscalHistorySaver.tsx` | Ajouter/corriger l'acces a `t` dans le scope PDF |
| `src/hooks/useNotificationSettings.tsx` | Cast `pushManager` pour eviter l'erreur TS |
| `src/components/CountryCard.tsx` | Ameliorer contraste (bordure, ombre, hover, focus) |

