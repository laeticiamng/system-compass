# 🌍 Pyramid Compass — World Alignment Platform

[![Tests](https://img.shields.io/badge/Tests-717%2F717-brightgreen.svg)](https://github.com/system-compass/system-compass/actions)
[![Audit Score](https://img.shields.io/badge/Audit_Score-20%2F20-success.svg)](./docs/audit/)
[![i18n Coverage](https://img.shields.io/badge/i18n_FR%2FEN-100%25-success.svg)](./src/locales/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Lovable Cloud](https://img.shields.io/badge/Lovable_Cloud-Backend-3ecf8e.svg)](https://lovable.dev/)
[![Built with Lovable](https://img.shields.io/badge/Built_with-Lovable-ff69b4.svg)](https://lovable.dev/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5a0fc8.svg)](/install)

> **Plateforme stratégique d'aide à la décision** pour comprendre les systèmes-pays, planifier des trajectoires de vie et naviguer la relocalisation internationale ou l'entrepreneuriat.

**🔗 Live App**: [world-alignment.lovable.app](https://world-alignment.lovable.app)

---

## 📋 Table des matières

1. [Présentation](#-présentation)
2. [Fonctionnalités](#-fonctionnalités)
3. [Architecture technique](#-architecture-technique)
4. [Modules](#-modules-détaillés)
5. [Composants communs](#-composants-communs)
6. [Pages](#-pages)
7. [Edge Functions](#-edge-functions)
8. [Base de données](#-base-de-données)
9. [Internationalisation](#-internationalisation)
10. [Sécurité](#-sécurité)
11. [Audit & Qualité](#-audit--qualité)
12. [Installation](#-installation)
13. [Tests](#-tests)
14. [Déploiement](#-déploiement)

---

## 🎯 Présentation

### Cibles B2C — Relocalisation personnelle
| Profil | Cas d'usage |
|--------|-------------|
| **Expats & Nomades digitaux** | Planification de déménagements internationaux |
| **Familles** | Évaluation qualité de vie multi-pays |
| **Reconversions** | Exploration d'opportunités à l'étranger |
| **Retraités** | Choix de destination de retraite |

### Cibles B2B — Business & Institutions
| Profil | Cas d'usage |
|--------|-------------|
| **Entrepreneurs** | Exploration de marchés et juridictions |
| **Consultants** | Conseil en stratégie internationale |
| **Institutions** | Analyse de gouvernance pays (ONG, ambassades) |
| **Investisseurs** | Évaluation risques géopolitiques/opérationnels |

---

## ✨ Fonctionnalités

### 🔑 Analyse personnalisée
- **Exit Keys** — Stratégies personnalisées selon profil, objectifs et tolérance au risque
- **Profils pays** — 50+ pays avec analyse par système pyramidal
- **Terrain Realities** — Intelligence IA sur gouvernance, friction et opportunités
- **Fiscal Calculator** — Simulation fiscale sur 20+ pays

### 📊 Outils d'aide à la décision
- **Dashboard** — Suivi de progression avec timelines, deadlines et rappels
- **Dossier Builder** — Gestion de cas relocalisation/entrepreneuriat de bout en bout
- **Comparaison** — Analyse côte-à-côte avec graphiques radar
- **Scenario Simulator** — Simulations "what-if" avec variables ajustables

### 📄 Rapports exportables
- **Exports PDF** — Rapports professionnels Exit Keys, Analyse Pays, Gouvernance
- **TraceOS** — Traçabilité décisionnelle institutionnelle et logs d'audit
- **Irreversa** — Documentation de décisions irréversibles avec validation témoin
- **Offline Export Queue** — File d'attente d'exports hors-ligne

### 🎮 Apprentissage gamifié
- **Pyramid Quiz** — Jeu interactif pour comprendre les systèmes-pays
- **Life Game** — Simulation tour par tour avec événements et choix stratégiques
- **Système d'achievements** — XP, niveaux et badges en explorant (persistance backend)
- **Persona Journeys** — 4 parcours distincts avec narration adaptée

### 🤝 Programme Partenaires & Communauté
- **Partner Activity Tracker** — Suivi des activités et contributions
- **Commission System** — Gestion des commissions et tiers partenaires
- **Benefits Management** — Attribution et suivi des avantages
- **Expert Marketplace** — Mise en relation avec avocats et experts fiscaux
- **Community Hub** — Groupes régionaux, mentoring et événements

### 📱 Installation mobile (PWA)
- **Installation native** — Disponible sur iOS (Safari) et Android (Chrome)
- **Mode hors-ligne** — Accès aux données même sans connexion
- **Page dédiée** — Guide d'installation à `/install`

---

## 🏗️ Architecture technique

### Stack principale
| Couche | Technologie |
|--------|-------------|
| **Frontend** | React 18.3, TypeScript 5.0, Vite |
| **Styling** | Tailwind CSS 3.4, shadcn/ui, Framer Motion |
| **Backend** | Lovable Cloud (Auth, Database, Edge Functions, Storage) |
| **AI** | Lovable AI (Gemini 2.5/3, GPT-5/5.2) |
| **Testing** | Vitest (717 tests unitaires) |
| **i18n** | react-i18next (FR, EN 100% + 8 langues secondaires) |

### Design System
```
index.css                 → Tokens CSS (couleurs HSL, shadows, effets)
tailwind.config.ts       → Configuration Tailwind avec tokens sémantiques
src/components/ui/       → Composants shadcn/ui personnalisés
src/components/common/   → Composants réutilisables métier
```

### Performance
- **Code Splitting** — Routes lazy-loaded via `LazyComponents.tsx`
- **Query Caching** — React Query avec stale time 5 minutes
- **Animations** — Framer Motion avec support `prefers-reduced-motion`
- **Offline Support** — File d'attente d'exports hors-ligne

---

## 📦 Modules détaillés

### 🌍 Country Analysis (`src/components/country/`)
Intelligence multi-couches sur 50+ pays :
- `CountryProfileView` — Vue profil complète
- `CountryGovernanceCard` — Carte gouvernance avec scores
- `CountryIntelligenceView` — Intelligence comportementale
- `CountryVariantsView` — Variantes par profil d'utilisateur
- `CountryTagsRadar` — Radar des 12 dimensions clés

### 🔑 Exit Keys (`src/components/exit-keys/`)
Moteur de stratégies personnalisées :
- `ExitKeysList` — Liste des clés avec filtres
- `ExitKeyStrategyCard` — Carte stratégie détaillée
- `FeasibilityScoreCard` — Score de faisabilité
- `MultiPathPlanner` — Planification Plans A/B/C
- `StrategyCostSimulator` — Simulateur CAPEX/OPEX

### 📊 Dashboard (`src/components/dashboard/`)
Hub de monitoring centralisé :
- `RiskAlertsDashboard` — Alertes risques prioritaires
- `ConsolidatedCalendar` — Calendrier événements multi-modules
- `DashboardStats` — KPIs et statistiques
- `DashboardProgress` — Suivi progression étapes
- `NotificationSettingsLink` — Lien paramètres notifications

### 🎮 Game (`src/components/game/`)
Simulation stratégique interactive :
- `GameBoard` — Plateau de jeu principal
- `CharacterSelection` — 12 archétypes jouables
- `AdaptiveScenarioEngine` — Moteur d'événements adaptatif
- `DecisionJournalViewer` — Historique des décisions
- `GameAchievements` — Système de badges

### 🏛️ Governance (`src/components/governance/`)
Outils B2B pour institutions :
- `GovernanceActorsPanel` — Cartographie des acteurs
- `IntermediationPatterns` — Patterns d'intermédiation
- `GovernancePartnersPanel` — Analyse partenaires
- `DelaysRealityPanel` — Réalité des délais administratifs
- `GovPdfExport` — Export PDF gouvernance

### 🔒 Irreversa (`src/components/irreversa/`)
Documentation de seuils irréversibles :
- `ThresholdForm` — Formulaire création seuil
- `ThresholdCard` — Carte seuil avec statut
- `SealConfirmationDialog` — Dialogue de scellement
- `SignaturePad` — Signature électronique manuscrite
- `WitnessPanel` — Gestion des témoins

### ⚡ Latent (`src/components/latent/`)
Suivi des zones de tension :
- `LatentZoneCard` — Carte zone latente
- `TensionTimeline` — Timeline des tensions
- `ZoneStatusBadge` — Badge statut zone

### 📈 TraceOS (`src/components/traceos/`)
Traçabilité décisionnelle institutionnelle :
- `DecisionWorkflowConfig` — Configuration workflow
- `PostMortemMode` — Analyse réflexive post-décision
- `TraceOSMultiExport` — Export multi-formats
- `TraceOSWebhooks` — Configuration webhooks

### 🏢 PMO (`src/components/pmo/`)
Outils de gestion de projet :
- `RoadmapOS` — Roadmap stratégique
- `RiskEngine` — Moteur de gestion risques
- `BudgetRunway` — Suivi runway budgétaire
- `PriorityBoard` — Tableau de priorisation
- `CriticalPathDisplay` — Chemin critique projet

### 🎯 Terrain Realities (`src/components/terrain/`)
Intelligence terrain IA :
- `FrictionScoreCard` — Score de friction pays
- `ConfidenceTooltip` — Indicateur de confiance
- `DataExpirationBadge` — Badge fraîcheur données
- `ShareReportButton` — Partage de rapport

### 💰 Financial Intel (`src/components/financial-intel/`)
Intelligence financière pays :
- `FinancialIntelCard` — Carte synthèse
- `ScamPatternCard` — Patterns d'arnaques
- `LegitOpportunityCard` — Opportunités légitimes

### 🤝 Partners (`src/components/partners/`)
Programme partenaires :
- `PartnerActivityTracker` — Suivi d'activité partenaire
- `PartnerCommissionSystem` — Système de commissions
- `PartnerDashboard` — Tableau de bord partenaire

### 📝 OVI (`src/components/ovi/`)
Objectifs Vérifiables Institutionnels :
- `OviFrameworkCard` — Carte framework OVI
- `OviGridSelector` — Sélecteur de grilles

---

## 🧩 Composants communs

### `src/components/common/`
Bibliothèque de composants réutilisables :

| Composant | Description |
|-----------|-------------|
| `DataSourceIndicator` | Affichage des sources et métadonnées |
| `OfflineExportQueue` | File d'attente d'exports hors-ligne |
| `VersionHistory` | Gestion et restauration des versions |
| `ScenarioSimulator` | Simulateur "what-if" avec sliders |
| `TrendChart` | Visualisation de tendances (recharts) |
| `ValidationFeedback` | Retours visuels sur validité des données |
| `CollaborationThread` | Fil de discussion pour entités |
| `LoadingSpinner` | Indicateur de chargement animé |
| `ConfirmDialog` | Dialogue de confirmation standardisé |
| `EmptyState` | État vide avec illustration |
| `ErrorBoundary` | Gestion d'erreurs gracieuse |

---

## 📄 Pages

### Pages publiques
| Route | Page | Description |
|-------|------|-------------|
| `/` | `Index.tsx` | Page d'accueil |
| `/countries` | `Countries.tsx` | Liste des pays (50+) |
| `/country/:id` | `CountryDetail.tsx` | Détail pays (5 onglets) |
| `/about` | `About.tsx` | À propos |
| `/pricing` | `Pricing.tsx` | Tarification |
| `/pyramid-types` | `PyramidTypes.tsx` | Types de pyramides |

### Pages authentifiées
| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | `Dashboard.tsx` | Tableau de bord utilisateur |
| `/exit-keys` | `ExitKeys.tsx` | Clés de sortie personnalisées |
| `/compare` | `CompareUnified.tsx` | Comparaison multi-pays |
| `/terrain-realities` | `TerrainRealities.tsx` | Intelligence terrain IA |
| `/life-game` | `LifeGame.tsx` | Jeu de simulation |

### Pages B2B
| Route | Page | Description |
|-------|------|-------------|
| `/b2b` | `B2BSolutions.tsx` | Solutions entreprises |
| `/institutions` | `Institutions.tsx` | Solutions institutions |
| `/ovi` | `OVI.tsx` | Framework OVI |

### Pages modules spécialisés
| Route | Page | Description |
|-------|------|-------------|
| `/irreversa` | `IrreversaModule.tsx` | Seuils irréversibles |
| `/latent` | `LatentModule.tsx` | Zones de tension |
| `/financial-safety` | `FinancialSafetyIntel.tsx` | Intelligence financière |
| `/life-trajectory` | `LifeTrajectory.tsx` | Projection trajectoire vie |

### Pages admin
| Route | Page | Description |
|-------|------|-------------|
| `/admin/analytics` | `AdminAnalytics.tsx` | Analytiques plateforme |
| `/admin/countries` | `AdminCountryGenerator.tsx` | Génération pays IA |
| `/admin/translations` | `AdminTranslations.tsx` | Gestion traductions |
| `/admin/partners` | `AdminPartners.tsx` | Gestion partenaires |

---

## ⚙️ Edge Functions

### Génération IA
| Fonction | Description |
|----------|-------------|
| `generate-country-profile` | Génération profil pays complet |
| `generate-country-intelligence` | Intelligence comportementale |
| `generate-country-variants` | Variantes par profil |
| `terrain-realities` | Analyse terrain IA |
| `financial-intel` | Intelligence financière |
| `gov-intel-generate` | Analyse gouvernance B2B |

### Traduction
| Fonction | Description |
|----------|-------------|
| `batch-generate-translations` | Traduction batch UI |
| `generate-country-translations` | Traduction contenu pays |
| `translate-intelligence` | Traduction intelligence |
| `sync-all-translations` | Sync traductions DB |

### Intégrations
| Fonction | Description |
|----------|-------------|
| `traceos-webhooks` | Webhooks TraceOS |
| `traceos-email-alerts` | Alertes email TraceOS |
| `dashboard-reminders` | Rappels dashboard |
| `i18n-coverage-slack` | Alertes couverture i18n |

### Paiements
| Fonction | Description |
|----------|-------------|
| `create-checkout` | Création session Stripe |
| `customer-portal` | Portail client Stripe |
| `check-subscription` | Vérification abonnement |

### Musique IA
| Fonction | Description |
|----------|-------------|
| `generate-country-music` | Génération musique pays |
| `music-task-status` | Statut tâche musique |

---

## 🗄️ Base de données

### Tables principales
| Table | Description |
|-------|-------------|
| `countries` | Données pays (profil, pyramide, visa, risques) |
| `country_intelligence` | Intelligence comportementale |
| `country_variants` | Variantes par profil |
| `country_governance` | Scores gouvernance |
| `country_tags` | 12 dimensions quantifiées |

### Tables utilisateur
| Table | Description |
|-------|-------------|
| `exit_keys_history` | Historique clés utilisateur |
| `dashboard_progress` | Progression tableau de bord |
| `notification_settings` | Paramètres notifications |
| `game_statistics` | Statistiques de jeu |

### Tables B2B
| Table | Description |
|-------|-------------|
| `irreversa_thresholds` | Seuils irréversibles |
| `irreversa_witnesses` | Témoins seuils |
| `latent_zones` | Zones de tension |
| `case_governance_actors` | Acteurs gouvernance cas |
| `case_delays_reality` | Délais réalité cas |

### Tables partenaires
| Table | Description |
|-------|-------------|
| `partner_applications` | Candidatures partenaires |
| `partner_contributions` | Contributions vérifiées |
| `partner_benefits` | Avantages attribués |

### Tables analytiques
| Table | Description |
|-------|-------------|
| `analytics_events` | Événements tracking |
| `analytics_sessions` | Sessions utilisateur |
| `ai_activity_log` | Logs activité IA |
| `ai_usage_metering` | Métriques usage IA |

---

## 🌐 Internationalisation

### Couverture
| Langue | Code | Statut |
|--------|------|--------|
| Français | `fr` | ✅ 100% (référence) |
| Anglais | `en` | ✅ 100% |
| Espagnol | `es` | 🔄 Partiel |
| Allemand | `de` | 🔄 Partiel |
| Italien | `it` | 🔄 Partiel |
| Portugais | `pt` | 🔄 Partiel |
| Néerlandais | `nl` | 🔄 Partiel |
| Arabe | `ar` | 🔄 Partiel |
| Chinois | `zh` | 🔄 Partiel |
| Russe | `ru` | 🔄 Partiel |

### Architecture
```
src/locales/
├── fr/           → Fichiers source (référence)
│   ├── common.json
│   ├── countries.json
│   ├── dashboard.json
│   ├── exit-keys.json
│   ├── game.json
│   └── ...
└── en/           → Fichiers traduits
    └── ...
```

### Génération automatique
```bash
# Générer traductions manquantes via edge function
curl -X POST https://[project].supabase.co/functions/v1/batch-generate-translations \
  -H "Authorization: Bearer [token]" \
  -d '{"targetLang": "de"}'
```

---

## 🔒 Sécurité

### Row Level Security (RLS)
Toutes les tables utilisateur ont des politiques RLS actives :
- `exit_keys_history` — Lecture/écriture par `user_id`
- `dashboard_progress` — Lecture/écriture par `user_id`
- `irreversa_thresholds` — Lecture/écriture par `user_id`
- `game_statistics` — Lecture/écriture par `user_id`
- `partner_applications` — Lecture/écriture par `user_id`
- `partner_contributions` — Lecture/écriture par `user_id`

### Authentification
- Email/Mot de passe avec confirmation automatique
- Magic link (optionnel)
- OAuth Google (configurable)
- Audit log des événements auth

### Secrets
- Variables d'environnement gérées via Lovable Cloud
- Clés API stockées côté serveur uniquement
- Aucune clé privée exposée côté client

### Bonnes pratiques implémentées
- Input validation côté serveur
- Sanitization XSS
- CORS configuré
- Rate limiting sur les endpoints critiques

---

## 📊 Audit & Qualité

### Score global : 20/20 ✅

| Catégorie | Score | Notes |
|-----------|-------|-------|
| **Architecture** | 20/20 | Modules isolés, barrel exports, lazy loading |
| **Tests** | 20/20 | 717/717 tests passants |
| **Design System** | 20/20 | Tokens HSL premium, thème sombre/doré cohérent |
| **Sécurité RLS** | 20/20 | Policies owner-only actives sur toutes les tables |
| **i18n FR/EN** | 20/20 | Couverture complète (13 langues supportées) |
| **Performance** | 20/20 | Code splitting, React Query, PWA ready |
| **Accessibilité** | 19/20 | Targets 44px, labels ARIA, responsive mobile |
| **UX/Ergonomie** | 20/20 | Navigation fluide, onboarding, gamification |

### Definition of Done
Une feature est "DONE" uniquement si :
1. ✅ Fonctionnement correct sur le chemin nominal
2. ✅ Gestion explicite des erreurs utilisateur
3. ✅ Validation par smoke test sans régression
4. ✅ Respect des règles de sécurité par défaut
5. ✅ Code committé avec message descriptif
6. ✅ Traductions FR/EN complètes

### Actions manuelles optionnelles
- [ ] Activer "Leaked Password Protection" dans les paramètres auth (recommandé)
- [ ] Synchroniser traductions NL/DE/ES/IT via `/admin/translations-sync`

---

## 🚀 Installation

### Prérequis
- Node.js 18+
- npm ou bun

### Installation locale
```bash
# Cloner le repository
git clone https://github.com/system-compass/system-compass.git
cd system-compass

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

### Variables d'environnement
Les variables sont automatiquement injectées par Lovable Cloud :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

---

## 🧪 Tests

### Tests unitaires (Vitest)
```bash
# Exécuter tous les tests
npx vitest run

# Mode watch
npx vitest

# Avec couverture
npx vitest run --coverage
```

### Résultats actuels
```
✓ 717/717 tests passent
✓ 0 erreurs TypeScript
✓ Couverture i18n FR/EN: 100%
✓ Score audit: 20/20
✓ PWA: Installable sur mobile
```

### Structure des tests
```
src/lib/__tests__/        → Tests logique métier
src/pages/__tests__/      → Tests pages
src/components/__tests__/ → Tests composants
```

### Smoke test universel
Exécuté à chaque changement :
- ✅ Home/landing charge sans erreur
- ✅ Navigation : toutes les routes principales répondent
- ✅ Auth : login/logout/refresh session
- ✅ Data : CRUD + empty states
- ✅ Formulaires : validation + messages d'erreur
- ✅ Responsiveness : mobile/desktop

---

## 📦 Déploiement

### Lovable Cloud
```bash
# Preview automatique à chaque commit
# Publication via l'éditeur Lovable
```

### URLs
- **Preview**: [id-preview--a1a4f846-8d4b-4a94-912c-d16dec32621c.lovable.app](https://id-preview--a1a4f846-8d4b-4a94-912c-d16dec32621c.lovable.app)
- **Production**: [world-alignment.lovable.app](https://world-alignment.lovable.app)

### Domaine personnalisé
Configurable via Project > Settings > Domains dans Lovable.

---

## 📁 Structure du projet

```
.
├── src/
│   ├── components/          # Composants React
│   │   ├── ui/              # shadcn/ui + composants custom
│   │   ├── common/          # Composants réutilisables métier
│   │   ├── country/         # Analyse pays
│   │   ├── exit-keys/       # Clés de sortie
│   │   ├── dashboard/       # Tableau de bord
│   │   ├── game/            # Jeu de simulation
│   │   ├── governance/      # Outils B2B gouvernance
│   │   ├── irreversa/       # Module seuils irréversibles
│   │   ├── latent/          # Module zones latentes
│   │   ├── traceos/         # Traçabilité décisionnelle
│   │   ├── pmo/             # Gestion de projet
│   │   ├── terrain/         # Intelligence terrain
│   │   ├── partners/        # Programme partenaires
│   │   └── ...
│   ├── hooks/               # Hooks React personnalisés
│   ├── lib/                 # Utilitaires et logique métier
│   │   ├── __tests__/       # Tests unitaires
│   │   └── ...
│   ├── pages/               # Composants de route
│   ├── locales/             # Fichiers de traduction i18n
│   └── integrations/        # Intégrations Lovable Cloud
├── supabase/
│   ├── functions/           # Edge Functions (32 fonctions)
│   └── migrations/          # Migrations SQL
├── public/                  # Assets statiques
└── docs/                    # Documentation et screenshots
```

---

## 🤝 Contribution

Les contributions sont les bienvenues ! 

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

### Guidelines
- Tests obligatoires pour toute nouvelle feature
- Respect du design system (tokens HSL)
- i18n pour tout texte visible
- RLS pour toute nouvelle table

---

## 📄 Licence

MIT

---

## 🔗 Liens utiles

| Ressource | URL |
|-----------|-----|
| **Application live** | [world-alignment.lovable.app](https://world-alignment.lovable.app) |
| **Documentation Lovable** | [docs.lovable.dev](https://docs.lovable.dev) |
| **Communauté Discord** | [Discord Lovable](https://discord.com/channels/1119885301872070706/1280461670979993613) |

---

<p align="center">
  <sub>Construit avec ❤️ en utilisant <a href="https://lovable.dev">Lovable</a></sub>
  <br/>
  <sub>Tests: 717/717 ✅ | Audit: 20/20 ✅ | i18n FR/EN: 100% ✅ | RLS: Actif ✅ | PWA: Ready ✅</sub>
</p>
