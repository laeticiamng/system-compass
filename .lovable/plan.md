
# Audit Marketing Visuel & Branding Premium -- v26

## Diagnostic global

La plateforme a un excellent socle technique (dark/light mode, glassmorphism, Framer Motion, typographies premium Inter + Space Grotesk, design system coherent). Cependant, plusieurs problemes concrets impactent la credibilite, la conversion et la comprehension immediate.

---

## Corrections classees par priorite

### PRIORITE 1 -- Credibilite (impact immediat sur la confiance)

| # | Probleme | Fichier | Correction |
|---|---------|---------|------------|
| 1 | **Fausses statistiques social proof** : "15,247 utilisateurs actifs", "4.9/5 note", "89% recommandent" -- un beta testeur identifie immediatement que c'est invente. Detruit la credibilite. | `src/components/landing/SocialProofBanner.tsx` | Ce composant n'est PAS utilise sur la landing page actuelle (Index.tsx), mais il est exporte et disponible. **Aucune action requise** tant qu'il n'est pas reintegre. A nettoyer si inutilise. |
| 2 | **TestimonialsSection description** : "Systemes decryptes en profondeur" -- jargon incomprehensible | `src/components/landing/TestimonialsSection.tsx` L21 | Remplacer par `'Analyses detaillees de chaque pays'` |
| 3 | **Section "Exemple concret"** : "systeme, risques, opportunites et strategies" -- le mot "systeme" est du jargon | `src/pages/Index.tsx` L246 | Remplacer par `'Chaque pays est analyse en profondeur : economie, risques, opportunites et strategies.'` |

### PRIORITE 2 -- Coherence visuelle (perception premium)

| # | Probleme | Fichier | Correction |
|---|---------|---------|------------|
| 4 | **Pricing Premium : CheckCircle en or au lieu de vert** : Les cartes Free et Pro/B2B utilisent `text-green-500`, mais Premium utilise `text-primary` (dore). L'incoherence casse la lisibilite et donne un sentiment de "pas fini". | `src/pages/Index.tsx` L365, 369, 373, 377 | Remplacer `text-primary` par `text-green-500` sur les 4 CheckCircle du plan Premium |
| 5 | **HeroSection.tsx : jargon "systeme" visible** si le composant est utilise ailleurs (il est exporte) | `src/components/landing/HeroSection.tsx` L196, 276, 278 | Mettre a jour les fallbacks : "Comprends le systeme" -> "Comprends les regles", "cles de sortie" -> "criteres compares", "types de systemes" -> "profils d'expatrie" |

### PRIORITE 3 -- Conversion et guidage

| # | Probleme | Fichier | Correction |
|---|---------|---------|------------|
| 6 | **Section "Rejoignez les premiers explorateurs"** : Le texte dit "profil pyramidal" -- jargon interne incomprehensible pour un nouvel utilisateur | `src/components/landing/TestimonialsSection.tsx` L108 | Remplacer par `'Testez gratuitement l\'analyse de 3 pays et decouvrez votre profil d\'expatrie. Vos retours faconnent la plateforme.'` |
| 7 | **Footer : lien "Exit Keys" visible** dans la colonne Outils | `src/components/Footer.tsx` L59 | Le `t('nav.exitKeys')` renvoie probablement "Exit Keys" ou un texte traduit. Verifier la traduction et remplacer le fallback si necessaire. Changer le texte affiche vers "Strategies" si le fallback est "Exit Keys". |

### PRIORITE 4 -- Mobile et details

| # | Probleme | Fichier | Correction |
|---|---------|---------|------------|
| 8 | **CTA final manque de prix/ancrage** : Le bouton "Commencer maintenant" est bon mais la section ne rappelle pas que c'est gratuit, alors que le hero le fait. Ajouter un micro-texte sous le CTA. | `src/pages/Index.tsx` L462 (apres le Button) | Ajouter `<p className="text-sm text-muted-foreground mt-4">Gratuit, sans carte bancaire</p>` |

---

## Ce qui fonctionne bien (a ne pas toucher)

- **Palette de couleurs** : Or/ambre coherent, dark/light mode bien calibre, contrastes WCAG AA
- **Typographie** : Space Grotesk pour les titres + Inter pour le body = combinaison professionnelle
- **Hero landing (Index.tsx)** : CTA < 3 secondes, titre clair "Tu veux t'expatrier ? Compare les pays"
- **Animations** : Framer Motion fluides, pas excessives, particles reduites sur mobile
- **Structure des pages** : Hero > Comment ca marche > Exemple > Chiffres > Pricing > CTA = funnel classique et efficace
- **Glassmorphism** : Utilise avec parcimonie, renforce la perception premium
- **Footer** : Structure claire avec CGV, mentions legales, lien vers outils

---

## Details techniques

### Etape 1 : TestimonialsSection.tsx -- 2 corrections de jargon
- Ligne 21 : `'Systemes decryptes en profondeur'` -> `'Analyses detaillees de chaque pays'`
- Ligne 108 : `'profil pyramidal'` -> `'profil d\'expatrie'`

### Etape 2 : Index.tsx -- 5 corrections
- Ligne 246 : Remplacer "systeme, risques" par "economie, risques"
- Lignes 365, 369, 373, 377 : `text-primary` -> `text-green-500` sur les CheckCircle Premium
- Apres ligne 462 : Ajouter micro-texte "Gratuit, sans carte bancaire"

### Etape 3 : HeroSection.tsx -- 3 corrections de fallback
- Ligne 196 : "Comprends le systeme." -> "Comprends les regles."
- Ligne 276 : "cles de sortie" -> "criteres compares"
- Ligne 278 : "types de systemes" -> "profils d'expatrie"

### Etape 4 : Footer.tsx -- 1 correction
- Ligne 59 : Ajouter un fallback explicite `t('nav.exitKeys', 'Strategies')` si le fallback actuel est "Exit Keys"

### Verification
- 4 fichiers modifies
- 11 corrections au total
- 0 changement de logique, securite ou base de donnees
- 0 risque de regression (texte et couleur CSS uniquement)
