

# Audit UX Senior - Rapport et Corrections

## Methodologie

Audit visuel et fonctionnel complet : navigation mobile/desktop, flux utilisateur, micro-interactions, accessibilite, coherence visuelle, feedback utilisateur, et friction dans les parcours cles.

---

## PROBLEMES CRITIQUES

### 1. Page 404 minimaliste et deconnectee du design system

**Fichier:** `src/pages/NotFound.tsx`

La page 404 est un composant brut sans aucune coherence avec le reste de l'app :
- Pas de Header/Footer (elle utilise `min-h-screen` qui double avec le layout existant)
- Texte en anglais ("Oops! Page not found") alors que l'app est en francais
- Pas d'i18n, pas d'icone, pas de CTA vers les pages populaires
- Lien `<a href="/">` au lieu de `<Link to="/">` (force un rechargement complet)
- Pas d'animation, pas de branding

**Impact UX:** Un utilisateur perdu recoit un ecran impersonnel qui casse la confiance et n'offre aucune aide pour retrouver son chemin.

**Correction:** Redesigner completement avec le design system existant (`EmptyState`, Button, i18n), navigation contextuelle, et lien React Router.

### 2. Cookie Consent bloque le contenu en bas de page

**Fichier:** `src/components/ui/cookie-consent.tsx`

Le banner est `fixed bottom-0` et occupe ~200px de hauteur. Sur mobile (390px), il masque la moitie du viewport et n'a pas de marge inferieure pour eviter de chevaucher le footer ou les `ContextualShortcuts`.

De plus, tout le contenu du banner ("Parametres de confidentialite", descriptions, labels) est hardcode en francais sans i18n.

**Correction:** Ajouter les cles i18n pour tout le texte du cookie consent.

### 3. Breadcrumbs hardcodes en francais (pas d'i18n)

**Fichier:** `src/components/navigation/Breadcrumbs.tsx`

Le dictionnaire `ROUTE_LABELS` (lignes 17-85) contient 40+ labels en francais brut. Un utilisateur anglophone verra "Pays", "Calculateur Fiscal", etc. dans ses breadcrumbs.

**Correction:** Remplacer les valeurs statiques par des cles `t()`.

### 4. ContextualShortcuts hardcodes en francais

**Fichier:** `src/components/navigation/ContextualShortcuts.tsx`

Tous les labels et descriptions des raccourcis contextuels (lignes 24-85) sont en francais brut : "Demarrer en 2 min", "Jusqu'a 4 pays", etc.

**Correction:** Utiliser les cles i18n existantes ou creer des cles dediees.

---

## PROBLEMES MAJEURS

### 5. Absence de feedback de chargement sur les pages cles

**Fichier:** `src/pages/Countries.tsx`

La page pays affiche un skeleton loader correct, mais d'autres pages comme `Dashboard.tsx` (1260 lignes) chargent de nombreux hooks sans indicateur de chargement global.

**Decision:** Pas de correction dans cette iteration - le pattern skeleton est deja en place sur Countries. A surveiller.

### 6. Hero CTA mobile : taille de cible tactile limite

**Fichier:** `src/pages/Index.tsx`, ligne 112-120

Le bouton principal "Decouvrir mon profil gratuitement" a `h-14` (56px) ce qui est correct, mais les stats en dessous (`38+`, `50+`, `6`) ont des zones de texte petites sans padding tactile. Ce ne sont pas des boutons donc pas de probleme fonctionnel, mais l'espacement `gap-8` sur mobile cree un bloc dense.

**Correction:** Pas critique - design intentionnel.

### 7. Disclaimer dialog non-dismissable sans checkbox

**Fichier:** `src/components/DisclaimerConsentDialog.tsx`

Le dialog bloque l'interaction (pas de close sur Escape, pas de click outside). C'est intentionnel pour la conformite legale, mais le bouton "J'ai compris, continuer" est desactive tant que la checkbox n'est pas cochee. Sur mobile, le contenu scrolle dans le dialog ce qui peut masquer la checkbox si l'utilisateur ne scrolle pas assez.

**Correction:** Ajouter un indicateur visuel "Scrollez pour continuer" quand le contenu deborde, ou s'assurer que la checkbox est toujours visible.

---

## PROBLEMES MINEURS

### 8. Onboarding step dots sans aria-label

**Fichier:** `src/components/OnboardingDialog.tsx`, lignes 113-127

Les boutons dots de navigation d'etape sont des `<button>` sans `aria-label`. Un utilisateur avec lecteur d'ecran ne saura pas a quoi servent ces boutons.

**Correction:** Ajouter `aria-label={t('onboarding.goToStep', { step: index + 1 })}`.

### 9. Footer trop dense sur mobile

**Fichier:** `src/components/Footer.tsx`

Le footer a 4 colonnes (`grid-cols-2 md:grid-cols-4`) mais les colonnes "Tools" contiennent 7 liens + un "Voir tout". Sur mobile 390px, ca fait 2 colonnes tres denses avec des textes qui se chevauchent potentiellement.

**Correction:** Reduire les liens visibles sur mobile ou utiliser un accordeon.

### 10. ContextualShortcuts position fixe chevauche potentiellement le contenu

**Fichier:** `src/components/navigation/ContextualShortcuts.tsx`, ligne 122

`fixed bottom-20 right-4` - sur certaines pages avec du contenu en bas (comme le footer), le panel flottant peut chevaucher le contenu. Il est `hidden md:block` donc mobile n'est pas affecte.

**Correction:** Pas critique - desktop only, position standard pour un panel contextuel.

---

## CE QUI EST BIEN FAIT (UX)

- Systeme d'onboarding sequentiel bien orchestre (Disclaimer -> Onboarding -> Cookie Consent)
- Header responsive avec menu mobile Sheet et sidebar desktop
- Breadcrumbs intelligents qui se cachent sur les pages top-level
- Empty state component reusable avec animations
- Contextual shortcuts qui guident le parcours utilisateur
- CountryCard avec forwardRef pour les animations de liste
- Loading skeleton sur la page Countries
- Focus trap et keyboard shortcuts accessibles
- Reduced motion support dans useAccessibility

---

## PLAN DE CORRECTIONS

### Priorite 1 : UX Breaking (page 404)

| Fichier | Action |
|---------|--------|
| `src/pages/NotFound.tsx` | Redesign complet : utiliser le design system (icone, branding, CTA vers accueil/pays/test, i18n, Link au lieu de `<a>`, animations) |

### Priorite 2 : i18n dans les composants de navigation

| Fichier | Action |
|---------|--------|
| `src/components/navigation/Breadcrumbs.tsx` | Remplacer `ROUTE_LABELS` par des appels `t()` |
| `src/components/navigation/ContextualShortcuts.tsx` | Internationaliser tous les labels et descriptions |
| `src/components/ui/cookie-consent.tsx` | Internationaliser tout le texte du banner |

### Priorite 3 : Accessibilite et micro-interactions

| Fichier | Action |
|---------|--------|
| `src/components/OnboardingDialog.tsx` | Ajouter `aria-label` sur les boutons dots de navigation |
| `src/components/DisclaimerConsentDialog.tsx` | Ajouter un indicateur scroll si le contenu deborde |

---

## Fichiers a modifier

1. `src/pages/NotFound.tsx` - Redesign complet
2. `src/components/navigation/Breadcrumbs.tsx` - i18n labels
3. `src/components/navigation/ContextualShortcuts.tsx` - i18n labels
4. `src/components/ui/cookie-consent.tsx` - i18n texte
5. `src/components/OnboardingDialog.tsx` - Accessibilite dots

## Estimation

- Temps : 20-25 minutes
- Complexite : Moyenne
- Risque regression : Faible (modifications cosmetiques et i18n, pas de logique metier touchee)

