

# Audit Critique Pre-Publication -- Multi-Role v28

## Synthese Executive

Apres 7 audits iteratifs (v22-v27), la landing page et l'onboarding sont propres. Cependant, un audit exhaustif pre-publication revele **encore du jargon "Cles de Sortie" massif** dans les pages internes (visible par les utilisateurs), une fausse preuve sociale toujours exportee, et quelques incohérences mineures. La securite et la conformite RGPD sont solides (1 seul warning mineur cote base de donnees).

---

## Ce qui est valide (ne pas toucher)

- Landing page (Index.tsx) : titre, CTA, pricing, micro-texte "Gratuit sans carte bancaire", CheckCircle verts uniformes
- Onboarding dialog : jargon elimine, fallbacks FR corriges
- Authentification : Google + Apple OAuth, validation Zod, password strength meter, rate limiting
- Footer : "Strategies" comme fallback, liens legaux presents (CGV, mentions, confidentialite)
- Architecture securite : RLS actif sur toutes les tables, 1 seul warning mineur (extension dans public schema)
- RGPD : anonymisation IP 90j, consentement cookies, disclaimer simulations, masquage donnees sensibles
- 404 : page propre, suggestions pertinentes
- Navigation : config dans navigation.ts deja corrigee ("Strategies")
- Design system : palette or/ambre coherente, typo premium, Framer Motion dose, glassmorphism, contrastes WCAG AA

---

## Corrections classees par priorite

### PRIORITE 1 -- Jargon "Cles de Sortie" encore visible dans les traductions FR (surface utilisateur)

Le terme "Cles de Sortie" apparait encore dans **75+ cles de traduction** du fichier `fr.json`. Toutes ces chaines sont rendues a l'ecran quand l'utilisateur navigue sur les pages internes. C'est le dernier gros chantier de coherence.

**Corrections dans `src/locales/fr.json` :**

| # | Cle de traduction | Texte actuel | Correction |
|---|------------------|-------------|------------|
| 1 | `nav.exitKeys` | "Cles de Sortie" | "Strategies" |
| 2 | `nav.exitKeysCatalog` | "Catalogue Exit Keys" | "Catalogue Strategies" |
| 3 | `exitKeys.title` (racine, L7818) | "Trouvez Votre Cle de Sortie" | "Trouvez Votre Strategie" |
| 4 | `exitKeys.pdf.title` | "Rapport Cles de Sortie" | "Rapport Strategies" |
| 5 | `exitKeys.pdf.resultsSection` | "Cles de Sortie Recommandees" | "Strategies Recommandees" |
| 6 | `exitKeys.savedKeys.loginPrompt` | "sauvegarder et suivre vos cles de sortie" | "sauvegarder et suivre vos strategies" |
| 7 | `exitKeys.savedKeys.explorePrompt` | "Explorez les cles de sortie pour les sauvegarder ici" | "Explorez les strategies pour les sauvegarder ici" |
| 8 | `exitKeys.catalog.title` | "Catalogue des Cles de Sortie" | "Catalogue des Strategies" |
| 9 | `ai.exitKeysAssistant` | "Assistant Cles de Sortie" | "Assistant Strategies" |
| 10 | `tools.exitKeys.title` (L7704) | "Cles de Sortie" | "Strategies" |
| 11 | `errorsIllusions.exploreExitKeys` | "Explorer les cles de sortie associees" | "Explorer les strategies associees" |
| 12 | `errorsIllusions.viewExitKeys` | "Voir les cles de sortie" | "Voir les strategies" |
| 13 | `universalErrors.exitKeys` | "Cles de sortie possibles" | "Strategies possibles" |
| 14 | `irreversa.nextSteps.exitKeys` | "Cles de Sortie" | "Strategies" |
| 15 | `latent.nextSteps.exitKeys` | "Cles de Sortie" | "Strategies" |
| 16 | `pyramidQuiz.nextSteps.exitKeys` | "Cles de sortie" | "Strategies" |
| 17 | `tools.viewExitKeys` (L7814) | "Voir les Cles de Sortie" | "Voir les Strategies" |

**Corrections dans `src/locales/en.json` :**

| # | Cle | Texte actuel | Correction |
|---|-----|-------------|------------|
| 18 | `exitKeys.title` | "Find Your Exit Key" | "Find Your Strategy" |
| 19 | `search.typeExitKey` | "Exit Key" | "Strategy" |

### PRIORITE 2 -- Fallbacks jargon dans les composants TSX

Certains composants ont des fallbacks hardcodes "Cles de Sortie" qui s'affichent si la traduction manque.

| # | Fichier | Ligne approx. | Fallback actuel | Correction |
|---|---------|--------------|----------------|------------|
| 20 | `src/pages/CountryDetail.tsx` | 459 | `'Cles de Sortie'` | `'Strategies'` |
| 21 | `src/pages/About.tsx` | 281 | `'Cles de Sortie'` (via `t('nav.exitKeys')`) | Le fallback sera corrige par la traduction #1 ci-dessus |
| 22 | `src/pages/CompareExitKeys.tsx` | 95, 114, 122, 252, 253 | Multiples fallbacks "cles de sortie" | Remplacer par "strategies" |
| 23 | `src/pages/ExitKeysCatalog.tsx` | 79, 103 | "Catalogue des Cles de Sortie" | "Catalogue des Strategies" |
| 24 | `src/pages/PreventionFilter.tsx` | 170, 201, 335 | "Explorer les cles de sortie", "Cles de sortie metier" | "Explorer les strategies", "Strategies metier" |
| 25 | `src/components/exit-keys/SavedExitKeysPanel.tsx` | 88, 205 | "cles de sortie" | "strategies" |
| 26 | `src/components/exit-keys/ExitKeysPdfExport.tsx` | 43, 81 | "Rapport Cles de Sortie", "Cles de Sortie Recommandees" | "Rapport Strategies", "Strategies Recommandees" |
| 27 | `src/pages/IrreversaModule.tsx` | 42 | "Cles de Sortie" | "Strategies" |
| 28 | `src/pages/LatentModule.tsx` | 46 | "Cles de Sortie" | "Strategies" |
| 29 | `src/components/gamification/DestinationQuests.tsx` | 84 | "Creer votre Exit Key" | "Finaliser votre strategie" |
| 30 | `src/components/landing/SocialProofBanner.tsx` | 25 | "a sauvegarde 3 cles de sortie" | "a sauvegarde 3 strategies" |

### PRIORITE 3 -- Sous-titre "analyses systemiques" dans TestimonialsSection

| # | Fichier | Ligne | Texte actuel | Correction |
|---|---------|-------|-------------|------------|
| 31 | `src/components/landing/TestimonialsSection.tsx` | 64 | `'Des donnees verifiables, des analyses systemiques, des strategies concretes.'` | `'Des donnees verifiables, des analyses detaillees, des strategies concretes.'` |

### PRIORITE 4 -- Navigation description jargon

| # | Fichier | Ligne | Texte actuel | Correction |
|---|---------|-------|-------------|------------|
| 32 | `src/config/navigation.ts` | 81 | `description: 'Explorer les pays et comprendre les systemes'` | `description: 'Explorer les pays et comprendre les differences'` |

---

## Audits specialises -- Synthese

### CISO / Securite
- **RLS** : actif sur toutes les tables. 1 warning mineur (extension dans public schema -- risque faible, pas bloquant pour publication).
- **Secrets** : geres via le systeme integre. Aucune cle API exposee cote client.
- **Auth** : validation Zod, password strength meter, OAuth Google/Apple, rate limiting client-side.
- **Verdict** : **Pret pour publication**. Le warning extension peut etre corrige post-lancement.

### DPO / RGPD
- Anonymisation IP apres 90 jours (trigger PL/pgSQL)
- Consentement cookies avec CookieConsent component
- Disclaimer simulations present sur les pages concernees
- Mentions legales, CGV, politique de confidentialite accessibles depuis le footer
- **Verdict** : **Conforme** pour un lancement beta.

### CDO / Data
- Analytics client-side avec hooks dedies (useAnalytics)
- KPIs basees sur des donnees reelles (38 pays, 50+ criteres, 13 langues)
- Fausses statistiques dans SocialProofBanner.tsx NON utilisees sur la landing (composant exporte mais pas importe dans Index.tsx)
- **Verdict** : **OK** tant que SocialProofBanner n'est pas reimporte.

### COO / Operations
- 749 tests unitaires passants
- Edge Functions deployes automatiquement
- Pipeline i18n avec 13 langues
- **Verdict** : **Operationnel**.

### Head of Design / UX
- Landing page : funnel clair Hero > Etapes > Exemple > Chiffres > Pricing > CTA
- Mobile responsive avec breakpoints coherents
- Dark/light mode bien calibre
- **Verdict** : **Pret**, aucune correction UI necessaire.

### Beta Testeur
- Comprehension en 3 secondes : OK sur landing page
- Premier clic guide vers /quick-test : OK
- Pas de bug 404 critique (page 404 bien geree)
- **Seul probleme restant** : le jargon "Cles de Sortie" apparait des que l'utilisateur navigue au-dela de la landing page

---

## Details techniques d'implementation

### Etape 1 : Corriger `src/locales/fr.json` -- 17 cles de traduction
Remplacer toutes les occurrences de "Cles de Sortie", "cles de sortie", "Cle de Sortie" par "Strategies" / "strategies" dans les cles listees en Priorite 1.

### Etape 2 : Corriger `src/locales/en.json` -- 2 cles
- `exitKeys.title` : "Find Your Exit Key" -> "Find Your Strategy"
- `search.typeExitKey` : "Exit Key" -> "Strategy"

### Etape 3 : Corriger les fallbacks dans 10+ fichiers TSX
Mettre a jour les fallback strings hardcodes dans les composants listes en Priorite 2 (corrections #20-#30).

### Etape 4 : Corriger TestimonialsSection.tsx et navigation.ts
- Ligne 64 : "analyses systemiques" -> "analyses detaillees"
- Ligne 81 : "comprendre les systemes" -> "comprendre les differences"

### Verification
- ~15 fichiers modifies (2 JSON + ~13 TSX)
- ~35 corrections textuelles au total
- 0 changement de logique, securite ou base de donnees
- 0 risque de regression (texte uniquement)
- Les noms de fichiers, hooks, variables internes restent inchanges (convention technique maintenue)

