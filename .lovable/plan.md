

# AUDIT BÊTA-TESTEUR NON TECHNIQUE — System Compass

---

## 1. RÉSUMÉ EXÉCUTIF

**Ce qu'un novice comprend en arrivant :** "C'est un outil pour comparer des pays avant de s'expatrier. C'est gratuit pour commencer." Le hero est clair et l'appel à l'action principal est visible.

**Ce qu'un novice NE comprend PAS :**
- Pourquoi le site est en français quand on choisit l'anglais (traductions manquantes partout)
- Ce que veulent dire "Profils de pays", "Stratégies", "Vie sur place", "Quiz Découverte" — jargon interne
- Qui est derrière la plateforme (aucune photo, aucun nom humain sur la homepage)
- Ce que le plan Premium apporte concrètement vs le gratuit
- Ce que sont les 57+ outils listés dans le "Centre des Outils" — surcharge cognitive massive

### 5 plus gros freins

1. **i18n cassée** : Le site prétend supporter 13 langues mais quasiment toutes les pages affichent du français même sur `/en`. Fausse promesse. Un anglophone arrive, voit du français partout, et part.
2. **Surcharge cognitive dans la navigation** : Le Tools Hub liste ~20 outils sans hiérarchie claire. Le footer expose 15+ liens. Le dropdown "Info" a 5 items. Un novice est noyé.
3. **Aucune preuve sociale humaine** : Pas un seul témoignage d'utilisateur réel, pas de photo, pas de nom. La section "En chiffres" montre des stats produit (80+ pays, 13 langues) mais aucun signe d'usage réel.
4. **Fonctionnalités mockées visibles** : Healthcare Community, Blog, Experts, Procedural Updates sont des coquilles vides. Un novice qui clique et trouve du contenu fake perd confiance.
5. **Le pricing est flou** : "Advanced system analysis", "Governance & Terrain", "Profiles that succeed" — ces labels ne veulent rien dire pour un novice. Aucun prix clair pour Pro/B2B.

### 5 priorités absolues

1. Corriger l'i18n EN : les fallback defaults français apparaissent partout en anglais
2. Supprimer ou masquer les fonctionnalités non fonctionnelles (Community, Blog, Experts)
3. Simplifier le Tools Hub et le footer — réduire à 6-8 entrées max visibles
4. Réécrire les labels de pricing en langage bénéfice clair
5. Ajouter au moins 3 témoignages crédibles (même fictifs mais réalistes)

---

## 2. TABLEAU D'AUDIT COMPLET

| Priorité | Page / Zone | Problème | Ressenti novice | Impact | Recommandation | Faisable ? |
|----------|------------|----------|-----------------|--------|----------------|------------|
| P0 | Toutes pages /en | Tout le texte UI est en français malgré le locale EN | "Ce site ne marche pas en anglais" | Abandon immédiat des non-francophones | Fournir les traductions EN ou masquer les langues non couvertes | Partiellement (gros volume) |
| P0 | Tools Hub | Page entière en français sur /en. 20+ outils sans hiérarchie | "C'est quoi tout ça ? Je suis perdu" | Abandon, surcharge cognitive | Réduire à 8 outils principaux, ajouter traductions EN | Oui |
| P0 | Pricing homepage | Labels abscons : "Advanced system analysis", "Profiles that succeed", "Governance & Terrain" | "Je ne comprends pas ce que j'achète" | Conversion tuée | Réécrire en bénéfices concrets | Oui |
| P1 | Homepage | Aucun témoignage humain, section "En chiffres" = stats produit pas social proof | "Personne n'utilise ce truc" | Perte de confiance | Ajouter de vrais témoignages ou les designer comme fact-cards | Oui |
| P1 | Footer | 15+ liens, "Stratégies", "Quiz Découverte", "Mon Journal", "Simulateur Fiscal" — trop de jargon | "Je ne sais pas quoi cliquer" | Paralysie de choix | Réduire à 8-10 liens essentiels | Oui |
| P1 | Healthcare section homepage | Bien conçue visuellement mais "MEBEKO / CNOM" et "LAMal vs Sécu" sont du jargon total pour un novice | "C'est quoi MEBEKO ?" | Friction | Ajouter des libellés explicites ("Reconnaissance de diplôme en Suisse") | Oui |
| P1 | Header `pyramid-disclaimer-dismissed` | Legacy localStorage key non renommée | Incohérence branding | Faible impact UX | Renommer en `compass-disclaimer-dismissed` | Oui |
| P1 | Mobile hero | Cookie banner + onboarding tour dialog + free profile test toast = 3 overlays simultanés au premier chargement | "Laissez-moi voir le site !" | Frustration immédiate | Séquencer : cookies d'abord, puis onboarding après 30s, supprimer le toast | Oui |
| P2 | Nav "Tools" dropdown | Ouvre le dropdown mais un clic rapide navigue vers /tools au lieu d'afficher les items | UX cassée sur certains clics | Friction | Séparer le trigger du lien | Oui |
| P2 | User Journeys section | 4 cards "Explorer / Test rapide / Comparer / Professionnel de Santé" — temps estimés ("~5 min", "2 min") sont arbitraires et non vérifiés | "Vraiment 5 min ?" | Crédibilité douteuse | Retirer les temps ou les affiner | Oui |
| P2 | FAQ | 4 questions seulement. Manque "Comment supprimer mon compte ?", "Puis-je exporter mes données ?" | FAQ insuffisante | Confiance | Ajouter 2-3 questions trust/RGPD | Oui |
| P2 | Homepage hero stat "6 profils d'expatrié" | Incompréhensible sans contexte | "6 profils de quoi ?" | Confusion | Remplacer par quelque chose de concret ("12 critères analysés") | Oui |
| P2 | Conflict Zones Map section | Section anxiogène sur une landing page d'expatriation | "Ce site me fait peur" | Peut décourager | Déplacer en page secondaire ou renommer "Zones à surveiller" | Décision produit |
| P3 | Footer "Revoir le tutoriel" | Bouton visible même pour les visiteurs qui n'ont jamais vu le tutoriel | Confusion | Faible | Masquer pour les non-authentifiés | Oui |
| P3 | Bottom guest banner | "🔓 Mode observation" — le cadenas et "observation" sonnent comme surveillance | Gêne subtile | Faible | Reformuler "Explorez librement — Créez un compte pour sauvegarder" | Oui |

---

## 3. AMÉLIORATIONS PRIORITAIRES À IMPLÉMENTER

### A. Pricing — Réécriture des labels (P0)
Remplacer les labels actuels par des bénéfices concrets compréhensibles :
- "Advanced system analysis" → "Analyses approfondies par pays" / "In-depth country analysis"
- "Profiles that succeed" → "Profils de réussite & risques" / "Success profiles & risk alerts"
- "Governance & Terrain" → "Données terrain & institutions" / "On-the-ground data"
- "Custom project analysis" → "Accompagnement personnalisé" / "Personalized guidance"

### B. Healthcare jargon — Clarification (P1)
- "MEBEKO / CNOM" → "Diplômes (MEBEKO 🇨🇭 / CNOM 🇫🇷)" — ajouter les drapeaux pour rendre les acronymes visuellement liés
- "LAMal vs Sécu, pilier 2 vs retraite" → "Assurance maladie & retraite comparées"

### C. Footer cleanup (P1)
Retirer du footer visible : "Quiz Découverte", "Mon Journal", "Profils de pays". Les garder dans le Tools Hub seulement.

### D. Legacy branding (P1)
- Renommer `pyramid-disclaimer-dismissed` → `compass-disclaimer-dismissed`

### E. Hero stat clarification (P2)
- "6 profils d'expatrié" → "6 profils de pays" ou supprimer et remplacer par "200+ indicateurs"

### F. Guest banner reformulation (P3)
- "🔓 Mode observation — Explore librement sans compte" → "Explorez librement — Créez un compte pour sauvegarder vos recherches"

### G. Mobile overlay sequencing (P1)
- Supprimer ou masquer le "Free profile test" toast notification en bas à droite — il chevauche le cookie banner et le chat bubble. Trop d'éléments flottants.

---

## 4. PLAN D'IMPLÉMENTATION

### Fichiers à modifier :

1. **`src/pages/Index.tsx`** — Pricing labels, hero stat "6 profils", guest banner text
2. **`src/components/landing/UserJourneys.tsx`** — Healthcare card jargon clarification  
3. **`src/components/Footer.tsx`** — Remove 5 low-value links, simplify
4. **`src/components/Header.tsx`** — Rename `pyramid-disclaimer-dismissed` to `compass-disclaimer-dismissed`
5. **`src/components/landing/FeatureDiscoveryTooltips.tsx`** — Check/suppress the "Free profile test" toast to avoid overlay collision on first load

### Not implementable without decision:
- Conflict zones map: keep/move/rename requires product decision
- Real testimonials: require real content
- Full EN translations: massive volume, needs systematic translation pass
- Removing mock features (Community, Blog, Experts): product decision on whether to hide or keep as "coming soon"

