# 🌍 System Compass

[![CI Tests](https://github.com/system-compass/system-compass/actions/workflows/test.yml/badge.svg)](https://github.com/system-compass/system-compass/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Lovable Cloud](https://img.shields.io/badge/Backend-Lovable_Cloud-3ecf8e.svg)](https://lovable.dev/)

> **Plateforme open-source d'aide à la décision** pour comprendre les systèmes-pays, planifier des trajectoires de vie et naviguer la relocalisation internationale.

**🔗 Demo live** : [system-compass.app](https://system-compass.app)

---

## 📸 Aperçu

<p align="center">
  <img src="./docs/screenshots/home.png" alt="Page d'accueil" width="45%" />
  <img src="./docs/screenshots/country-analysis.png" alt="Analyse pays" width="45%" />
</p>

<p align="center">
  <img src="./docs/screenshots/exit-keys.png" alt="Exit Keys" width="45%" />
  <img src="./docs/screenshots/game-mode.png" alt="Mode jeu" width="45%" />
</p>

---

## 🎯 À propos

System Compass aide les expatriés, entrepreneurs et institutions à prendre des décisions éclairées concernant la relocalisation internationale. La plateforme analyse 50+ pays selon leurs systèmes socio-économiques et génère des stratégies personnalisées.

### Cibles
- **B2C** : Expatriés, nomades digitaux, familles en relocalisation
- **B2B** : Consultants internationaux, ONG, institutions

---

## ✨ Fonctionnalités principales

| Module | Statut | Description |
|--------|--------|-------------|
| 🌍 **Profils Pays** | ✅ Stable | Analyse de 50+ pays avec données structurées |
| 🔑 **Exit Keys** | ✅ Stable | Stratégies personnalisées selon profil utilisateur |
| 📊 **Dashboard** | ✅ Stable | Suivi de progression avec timelines |
| 🔄 **Comparateur** | ✅ Stable | Comparaison multi-pays côte-à-côte |
| 📄 **Exports PDF** | ✅ Stable | Rapports professionnels exportables |
| 🎮 **Life Game** | 🔄 Beta | Simulation gamifiée tour par tour |
| 🛒 **Marketplace** | 🔄 Beta | Mise en relation avec experts |
| 🏛️ **Governance B2B** | 🔄 Beta | Outils pour institutions |

> Voir [`docs/MODULES-STATUS.md`](./docs/MODULES-STATUS.md) pour le statut détaillé et la roadmap.

---

## 🚀 Démarrage rapide

### Prérequis
- Node.js 20+
- npm ou bun

### Installation

```bash
# Cloner le projet
git clone https://github.com/system-compass/system-compass.git
cd system-compass

# Installation automatique (recommandé)
./scripts/setup-dev.sh

# Ou installation manuelle
npm install
npm run dev
```

> **Note** : L'application fonctionne en mode local avec données mock. Pour le backend complet, utilisez [Lovable Cloud](https://lovable.dev).

📖 Voir [`docs/GETTING-STARTED.md`](./docs/GETTING-STARTED.md) pour les instructions détaillées.

---

## 📁 Documentation

| Document | Description |
|----------|-------------|
| [Getting Started](./docs/GETTING-STARTED.md) | Guide d'installation complet |
| [Contributing](./docs/CONTRIBUTING.md) | Guide de contribution |
| [Testing](./docs/TESTING.md) | Stratégie de tests |
| [API Reference](./docs/API.md) | Documentation des Edge Functions |
| [Architecture](./docs/audit/ARCHITECTURE.md) | Diagrammes et flux de données |
| [Modules Status](./docs/MODULES-STATUS.md) | Statut et roadmap des modules |
| [Audit Reports](./docs/audit/) | Métriques de qualité vérifiables |

---

## 🧪 Tests

```bash
# Exécuter les tests
npm run test

# Avec couverture
npm run test:coverage
```

**Métriques actuelles** (v7.0.8 - vérifiables via CI) :
- Tests unitaires : 749+ passants (100%)
- Couverture estimée : ~82%
- Tables avec RLS : 60+/60+ (sécurité A+)
- Edge Functions : 36 opérationnelles
- Pages : 58 opérationnelles
- Langues supportées : 13 (FR/EN 100%, autres partielles)
- Service layer : 6 modules isolés
- Schémas Zod : 15+ formulaires validés
- Skeletons UI : Pages clés couvertes
- Error handling : Service centralisé
- Dashboard widgets : 40+ composants
- Community components : 11 modules (v7.0.7)
- Game components : 42 modules (v7.0.7)
- Marketplace components : 12 modules (v7.0.7)
- Academic components : 5 modules niveau grande école (v7.0.7)
- Latent components : 23 modules (v7.0.7 - détection tensions)
- Irreversa components : 22 modules (v7.0.7 - seuils irréversibles)
- Terrain components : 11 modules (v7.0.7 - analyse risques terrain)
- Governance components : 20 modules (v7.0.7 - scoring gouvernance)
- PMO components : 20 modules (v7.0.7 - gestion de projet)
- OVI components : 10 modules (v7.0.7 - observations stratégiques)
- Fiscal components : 5 modules (v7.0.7 - simulations fiscales)
- Country components : 16 modules (v7.0.7 - analyse pays)
- Cases components : 13 modules (v7.0.7 - gestion B2B)
- Exit Keys components : 25 modules (v7.0.7 - stratégies de sortie)
- Auth components : 5 modules (v7.0.7 - sécurité authentification)
- AI components : 3 modules (v7.0.7 - assistance IA)
- **Nouveaux index v7.0.7** :
  - Institutions components : 28 modules (TraceOS, DecisionTree)
  - Quiz components : 4 modules (Game modes)
  - Financial Intel components : 15 modules (Scams/Legit detection)
  - Pyramid components : 2 modules
  - Gamification components : 6 modules
  - Life Trajectory components : 1 module
  - Resources components : 1 module
  - Recommendations components : 1 module
  - Admin components : 1 module
  - Diagnostics components : 3 modules
  - PWA components : 1 module
  - Navigation components : 10 modules
  - Persona components : 4 modules
  - Partner/Partners components : 6 modules
  - TraceOS components : 11 modules
  - Services components : CacheService + presets
  - Common components : 38 exports (v7.0.8)
  - Landing components : 9 exports (v7.0.8)
  - GDPR components : 1 export (v7.0.8)
- Security scan : 16 findings documentés et ignorés par design
- Linter Supabase : 1 warning infra (Extension in Public - non critique)

📖 Voir [`docs/TESTING.md`](./docs/TESTING.md) pour la stratégie de tests détaillée.

---

## 🛠️ Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| Backend | Lovable Cloud (Supabase) |
| Tests | Vitest |
| i18n | react-i18next (FR, EN + 11 langues) |

---

## 🤝 Contribuer

Les contributions sont bienvenues ! Consultez le [guide de contribution](./docs/CONTRIBUTING.md).

```bash
# Workflow rapide
git checkout -b feature/ma-feature
# ... modifications ...
npm run test
npm run lint
git commit -m "feat: description"
git push origin feature/ma-feature
```

### Premiers pas

1. 🐛 Cherchez les [issues "good first issue"](https://github.com/system-compass/system-compass/labels/good%20first%20issue)
2. 💬 Posez vos questions dans les [Discussions](https://github.com/system-compass/system-compass/discussions)
3. 📖 Lisez la [documentation](./docs/)

---

## 📄 Licence

MIT — Voir [LICENSE](./LICENSE)

---

<p align="center">
  <sub>Construit avec ❤️ en utilisant <a href="https://lovable.dev">Lovable</a></sub>
</p>
