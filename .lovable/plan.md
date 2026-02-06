
# Audit C-Suite v2 + Plan de Corrections

## Constat Principal

L'audit precedent a identifie 4 risques critiques. Deux ont ete traites (suppression de compte, temoignages), mais **avec des lacunes** :

### Problemes detectes

**1. Faux temoignages encore presents (CMO - CRITIQUE)**
Le composant `TestimonialsSection.tsx` a bien ete remplace par des stats reelles, mais la **landing page `Index.tsx` contient toujours les faux temoignages en dur** (Marie L., Thomas R., Sophie D.) aux lignes 275-367. Le composant `TestimonialsSection` n'est meme pas utilise dans `Index.tsx`. Les memes faux noms apparaissent aussi dans 4 autres fichiers :
- `MemberSpotlight.tsx`
- `CaseStudySystem.tsx`
- `ExpertProfileDialog.tsx`
- `ExpertReviews.tsx`
- `DiscussionThread.tsx`

**2. SecuritySettings.tsx - toasts hardcodes en francais**
Les messages toast (lignes 57-58 et 62-63) ne passent pas par i18n.

**3. Landing page non internationalisee**
`Index.tsx` contient ~40 chaines en francais dur qui ne passent pas par `t()`, malgre l'import de `useTranslation`.

---

## Plan de Corrections (3 chantiers)

### Chantier 1 : Supprimer les faux temoignages de Index.tsx
- Remplacer la section "Temoignages" (lignes 275-367) par le composant `TestimonialsSection` existant qui affiche des stats reelles
- Supprimer l'import `Quote` devenu inutile

### Chantier 2 : Nettoyer les faux noms dans les 4 autres fichiers
- `MemberSpotlight.tsx` : remplacer "Marie L." par "Utilisateur anonyme" ou un prenom generique non-trompeur
- `ExpertProfileDialog.tsx` : idem
- `ExpertReviews.tsx` : remplacer "Sophie D."
- `DiscussionThread.tsx` : remplacer "Thomas R."
- `CaseStudySystem.tsx` : remplacer "Thomas & Marie L."

### Chantier 3 : Internationaliser les toasts de SecuritySettings
- Passer les 2 messages toast hardcodes par `t()` avec fallback francais

### Details techniques

**Index.tsx** : Remplacer les lignes 275-367 (section temoignages inline avec faux quotes) par :
```tsx
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
// ...
<TestimonialsSection />
```

**SecuritySettings.tsx** : Lignes 57-58 et 62-63, ajouter `useTranslation` et utiliser `t()` pour les toasts.

**5 fichiers avec faux noms** : Remplacer par des labels comme "Membre beta", "Expert verifie", ou des prenoms clairement fictifs avec mention "(exemple)" pour les cas d'etude academiques.

---

## Resume de l'audit C-Suite v2

| Role | Verdict | Action |
|------|---------|--------|
| CEO | Positionnement unique confirme | Pas d'action immediate |
| CTO | Architecture solide, edge functions operationnelles | Monitoring a planifier |
| CPO | UX claire, trop de modules visibles | Simplification navigation (futur) |
| CISO | Suppression compte OK, CSP toujours manquant | CSP a planifier |
| DPO | Art. 17 implemente, delete-account fonctionnel | Politique retention a documenter |
| CDO | Stack IA avec fallbacks, pas de feedback loop | Thumbs up/down (futur) |
| COO | Documentation presente, pas de status page | Status page (futur) |
| CFO | Break-even a 20-40 abonnes | Plan annuel a ajouter (futur) |
| CMO | **Faux temoignages encore presents dans Index.tsx** | **A corriger maintenant** |
| CSO | Pas de CRM ni pipeline | Module futur |
| Design | Interface premium, i18n inconsistant | **Corrections i18n maintenant** |
| Beta testeur | Landing page coherente en 30s, mais temoignages suspects | **A corriger maintenant** |

### Corrections a appliquer maintenant
1. Remplacer les faux temoignages dans `Index.tsx` par `TestimonialsSection`
2. Nettoyer les faux noms dans 5 fichiers secondaires
3. Internationaliser les toasts de `SecuritySettings.tsx`
