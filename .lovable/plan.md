

# Audit C-Suite v22 -- Corrections Pre-Publication

## Resume Executif

L'audit a identifie **11 corrections concretes** reparties en 2 categories : jargon "Exit Keys" encore visible par les utilisateurs finaux (8 occurrences) et ameliorations UX/coherence (3 corrections). La securite, la conformite RGPD, l'architecture et le design sont valides.

---

## Audit par role

| Role | Verdict | Corrections |
|------|---------|-------------|
| CISO | OK | RLS actif, secrets configures, pas de fuite |
| DPO | OK | RGPD conforme, consent, anonymisation |
| CDO | OK | KPIs coherents, prix 9,90 EUR unifie |
| COO | OK | Tous modules actifs, lazy loading |
| Design | OK | CTA < 3s, responsive, WCAG AA |
| CEO | **8 residus jargon** | Voir tableau ci-dessous |
| Beta testeur | **3 incoherences UX** | Voir ci-dessous |

---

## Corrections CEO : 8 fichiers avec jargon "Exit Keys" visible utilisateur

| # | Fichier | Ligne | Texte actuel | Correction |
|---|---------|-------|-------------|------------|
| 1 | `src/config/navigation.ts` | 87 | `label: 'Exit Keys'` | `label: 'Strategies'` |
| 2 | `src/pages/ToolsHub.tsx` | 78 | `label: t('hub.tool.exitKeys', 'Exit Keys')` | `label: t('hub.tool.exitKeys', 'Strategies')` |
| 3 | `src/pages/ToolsHub.tsx` | 141 | `'Exit Keys, calculateur fiscal'` (meta description) | `'strategies, calculateur fiscal'` |
| 4 | `src/components/dashboard/WeeklyDigestSetup.tsx` | 149 | `'Exit Keys Progress'` | `'Progression Strategies'` |
| 5 | `src/components/dashboard/WeeklyDigestGenerator.tsx` | 51 | `'Profil Exit Keys complete'` | `'Profil strategique complete'` |
| 6 | `src/components/dashboard/ConsolidatedRiskAlerts.tsx` | 91 | `'exit-keys': 'Exit Keys'` | `'exit-keys': 'Strategies'` |
| 7 | `src/components/exit-keys/RoadmapPdfExport.tsx` | 192 | `'Exit Keys - World Alignment Platform'` (PDF footer) | `'Strategies - Pyramid Compass'` |
| 8 | `src/components/Header.tsx` | 81 | `label: 'Catalogue Cles'` et ligne 82 `label: 'Comparer Cles'` | `'Catalogue Strategies'` et `'Comparer Strategies'` |

Note : Les commentaires de code, noms de variables et fichiers de test ne sont pas corriges (pas visibles par l'utilisateur).

---

## Corrections Beta Testeur : 3 incoherences UX

| # | Probleme | Fichier | Correction |
|---|----------|---------|------------|
| 1 | Landing page : section pricing affiche 2 plans au lieu de 3 (pas de Pro/B2B) | `src/pages/Index.tsx` (l.300) | Ajouter la carte Pro/B2B dans la grille (passer de `md:grid-cols-2` a `md:grid-cols-3`) ou ajouter un lien "Voir le plan Pro" |
| 2 | Landing page : etape 2 "Analyse ton systeme" -- le mot "systeme" est vague pour un beta testeur | `src/pages/Index.tsx` (l.204) | Remplacer par "Compare les pays" |
| 3 | Fake social proof avec chiffres inventes (15,247 utilisateurs, 4.9/5 avec 2,847 avis) | `src/components/landing/SocialProofBanner.tsx` | Ce composant n'est pas utilise sur la landing page actuellement -- aucune action requise, mais a surveiller si reintegre |

---

## Details techniques

### Etape 1 : Corriger les 8 fichiers jargon (remplacement de texte)
Remplacement simple de chaines de caracteres dans chaque fichier -- aucun changement de logique.

### Etape 2 : Coherence pricing landing page
Ajouter une troisieme carte "Pro / B2B" dans la section pricing de la page d'accueil, ou a minima un lien visible vers `/pricing` pour decouvrir le plan Pro. La grille passera de 2 a 3 colonnes.

### Etape 3 : Clarifier l'etape 2 du "Comment ca marche"
Remplacer le fallback "Analyse ton systeme" par "Compare les pays" pour coller au positionnement concret de la plateforme.

### Etape 4 : Verification
Confirmer que la plateforme se charge sans erreur apres les corrections.

---

## Resume

- **8 fichiers corriges** (jargon "Exit Keys" -> "Strategies")
- **1 amelioration UX landing** (pricing 3 colonnes)
- **1 clarification copywriting** (etape 2 du funnel)
- **0 modification de securite/structure/base de donnees**
- **0 risque de regression** (texte uniquement + ajout carte pricing)

