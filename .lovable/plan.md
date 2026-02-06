

# Audit Marketing Visuel & Branding Premium -- v27

## Diagnostic global

Apres les corrections v22-v26, la landing page (Index.tsx) est desormais propre : pas de jargon, CheckCircle verts uniformes, CTA clair, micro-texte "Gratuit, sans carte bancaire" present. L'identite visuelle est coherente et premium.

Cependant, l'audit revele **6 residus de jargon visibles par l'utilisateur** dans des surfaces de premier contact (onboarding, pages internes).

---

## Ce qui fonctionne parfaitement (ne pas toucher)

- Landing page : titre, CTA, pricing, section chiffres, footer -- tout est clair
- Palette or/ambre coherente, dark/light mode calibre
- Typographie Space Grotesk + Inter professionnelle
- Animations Framer Motion fluides et dosees
- Glassmorphism utilise avec parcimonie
- Structure funnel Hero > Etapes > Exemple > Chiffres > Pricing > CTA

---

## 6 corrections restantes classees par priorite

### PRIORITE 1 -- Onboarding dialog (premier contact utilisateur)

Le dialog d'onboarding s'affiche a la premiere visite. C'est un moment critique de premiere impression.

| # | Probleme | Fichier | Correction |
|---|---------|---------|------------|
| 1 | **Step 1 FR** : "naviguer dans le systeme mondial" + "regles invisibles" -- jargon opaque | `src/locales/fr.json` (onboarding.step1.description) | `"Comparez les pays en profondeur avant de vous expatrier : fiscalite, visas, cout de la vie et qualite de vie."` |
| 2 | **Step 1 EN** : "navigate the global system" + "invisible rules" -- meme probleme | `src/locales/en.json` (onboarding.step1.description) | `"Compare countries in depth before expatriating: taxes, visas, cost of living and quality of life."` |
| 3 | **Step 4 FR** : titre "Cles de Sortie" -- jargon interne | `src/locales/fr.json` (onboarding.step4.title) | `"Strategies"` |
| 4 | **Step 4 EN** : titre "Exit Keys" -- jargon interne | `src/locales/en.json` (onboarding.step4.title) | `"Strategies"` |
| 5 | **Step 5 FR** : "mecanismes du systeme" -- jargon | `src/locales/fr.json` (onboarding.step5.description) | Remplacer "les mecanismes du systeme" par `"les mecanismes economiques"` |
| 6 | **Step 5 EN** : "the system's mechanics" -- jargon | `src/locales/en.json` (onboarding.step5.description) | Remplacer "the system's mechanics" par `"economic mechanics"` |

### PRIORITE 2 -- Boutons "Skip" et "Start" non traduits en FR

Les fallback du composant OnboardingDialog affichent "Skip", "Next", "Start" en anglais meme quand l'interface est en francais.

| # | Probleme | Fichier | Correction |
|---|---------|---------|------------|
| 7 | Fallback "Skip" au lieu de "Passer" | `src/components/OnboardingDialog.tsx` L136 | Changer le fallback de `'Skip'` a `'Passer'` |
| 8 | Fallback "Next" au lieu de "Suivant" | `src/components/OnboardingDialog.tsx` L157 | Changer le fallback de `'Next'` a `'Suivant'` |
| 9 | Fallback "Start" au lieu de "Commencer" | `src/components/OnboardingDialog.tsx` L153 | Changer le fallback de `'Start'` a `'Commencer'` |

---

## Details techniques

### Etape 1 : Corriger les traductions FR (fr.json)
- `onboarding.step1.description` : remplacer par texte concret sans jargon
- `onboarding.step4.title` : "Cles de Sortie" -> "Strategies"
- `onboarding.step5.description` : "mecanismes du systeme" -> "mecanismes economiques"

### Etape 2 : Corriger les traductions EN (en.json)
- `onboarding.step1.description` : remplacer par texte concret sans jargon
- `onboarding.step4.title` : "Exit Keys" -> "Strategies"
- `onboarding.step5.description` : "the system's mechanics" -> "economic mechanics"

### Etape 3 : Corriger OnboardingDialog.tsx fallbacks
- Ligne 136 : `'Skip'` -> `'Passer'`
- Ligne 153 : `'Start'` -> `'Commencer'`
- Ligne 157 : `'Next'` -> `'Suivant'`

### Verification
- 3 fichiers modifies (fr.json, en.json, OnboardingDialog.tsx)
- 9 corrections au total
- 0 changement de logique, securite ou base de donnees
- 0 risque de regression (texte uniquement)

