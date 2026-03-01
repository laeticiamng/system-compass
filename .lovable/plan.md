
# Ajout de Helmet complet sur toutes les pages publiques

## Etat des lieux

### Pages SANS Helmet (a creer) - 15 pages
| Page | Route | Title propose |
|------|-------|---------------|
| ProfileTest | `/profile-test` | Test de Profil Expatrie - System Compass |
| LifeTrajectory | `/life-trajectory` | Simulation de Trajectoire de Vie - System Compass |
| LifeGame | `/life-game` | Jeu de Simulation de Vie - System Compass |
| PyramidQuiz | `/pyramid-quiz` | Quiz des Pyramides - System Compass |
| B2BSolutions | `/b2b` | Solutions B2B - System Compass |
| ExitKeysCatalog | `/exit-keys/catalog` | Catalogue des Cles de Sortie - System Compass |
| Community | `/community` | Communaute - System Compass |
| Install | `/install` | Installer l'Application - System Compass |
| Resources | `/resources` | Ressources & Guides d'Expatriation - System Compass |
| PreventionFilter | `/prevention-filter` | Filtre de Prevention - System Compass |
| Institutions | `/institutions` | Entreprises & Institutions - System Compass |
| FinancialSafetyIntel | `/financial-safety-intel` | Intelligence Financiere - System Compass |
| ExpertMarketplace | `/experts` | Experts en Expatriation - System Compass |
| AcademicHub | `/academic` | Centre Academique - System Compass |
| CompareExitKeys | `/exit-keys/compare` | Comparer les Cles de Sortie - System Compass |

### Pages AVEC Helmet mais INCOMPLET (a enrichir) - 17 pages
Toutes les pages existantes (CGV, MentionsLegales, Disclaimer, About, Privacy, Index, Countries, Blog, ToolsHub, ThematicPaths, QuickTest, Partners, ExitKeys, CompareUnified, ProfileMatcher, FiscalCalculator, Auth) ont un Helmet mais il leur manque :
- `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- `og:type`, `og:image`

Seul `BlogArticle` a des twitter: tags complets.

## Format Helmet complet cible

Chaque page publique recevra ce bloc standardise :

```text
<Helmet>
  <title>[TITLE] - System Compass</title>
  <meta name="description" content="[DESCRIPTION]" />
  <link rel="canonical" href="https://system-compass.app/[ROUTE]" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="[TITLE] - System Compass" />
  <meta property="og:description" content="[OG_DESC]" />
  <meta property="og:url" content="https://system-compass.app/[ROUTE]" />
  <meta property="og:image" content="https://system-compass.app/og-image.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="[TITLE] - System Compass" />
  <meta name="twitter:description" content="[TWITTER_DESC]" />
  <meta name="twitter:image" content="https://system-compass.app/og-image.png" />
</Helmet>
```

## Plan d'execution

### Etape 1 : Enrichir les 17 Helmets existants
Ajouter les tags manquants (`og:type`, `og:image`, `twitter:*`) aux pages qui ont deja un Helmet incomplet :
- Index, About, Pricing (via Index), Countries, Blog, ToolsHub, ThematicPaths, Auth, Privacy
- CGV, MentionsLegales, Disclaimer, QuickTest, Partners, ExitKeys, CompareUnified, ProfileMatcher, FiscalCalculator

### Etape 2 : Creer les Helmets pour les 15 pages sans
Ajouter l'import `react-helmet-async` et le bloc `<Helmet>` complet dans :
- ProfileTest, LifeTrajectory, LifeGame, PyramidQuiz
- B2BSolutions, ExitKeysCatalog, CompareExitKeys
- Community, Install, Resources
- PreventionFilter, Institutions, FinancialSafetyIntel
- ExpertMarketplace, AcademicHub

### Pages exclues (non publiques)
Dashboard, Usage, Diagnostics, Admin*, SeedTranslations, TraceJournal, ConsultationSuccess, SubscriptionSuccess, CaseDetail, UniversalErrorDetail, TerrainRealities (page dynamique interne), NotFound.

## Fichiers modifies : 32 fichiers

Aucune nouvelle dependance requise. Utilisation de `react-helmet-async` deja installe.
