# 🚀 Guide de démarrage - Pyramid Compass

Ce guide vous accompagne pour installer et configurer Pyramid Compass en développement local.

## Prérequis

- **Node.js** 20+ ([télécharger](https://nodejs.org))
- **npm** (inclus avec Node.js) ou **bun**
- **Git** ([télécharger](https://git-scm.com))

## Installation rapide

### Option 1 : Script automatique (recommandé)

```bash
# Cloner le projet
git clone https://github.com/system-compass/system-compass.git
cd system-compass

# Lancer le script d'installation
./scripts/setup-dev.sh
```

Le script :
1. Vérifie les prérequis (Node.js, npm)
2. Installe les dépendances
3. Configure l'environnement
4. Lance les tests de vérification
5. Propose de démarrer le serveur

### Option 2 : Installation manuelle

```bash
# Cloner
git clone https://github.com/system-compass/system-compass.git
cd system-compass

# Installer les dépendances
npm ci

# Créer le fichier d'environnement
cp .env.example .env

# Démarrer le serveur de développement
npm run dev
```

## Configuration de l'environnement

### Mode développement local (sans backend)

Par défaut, l'application fonctionne avec des données mock. Créez un fichier `.env` :

```env
# Mode développement local
VITE_DEV_MODE=true
```

### Mode complet avec Lovable Cloud

Pour le backend complet (authentification, base de données, edge functions) :

1. Créez un projet sur [Lovable](https://lovable.dev)
2. Les variables sont automatiquement injectées :

```env
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[anon-key]
VITE_SUPABASE_PROJECT_ID=[project-id]
```

## Commandes disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement (port 8080) |
| `npm run build` | Build de production |
| `npm run test` | Exécuter les tests |
| `npm run test:coverage` | Tests avec rapport de couverture |
| `npm run lint` | Vérifier le linting ESLint |

## Structure du projet

```
pyramid-compass/
├── src/
│   ├── components/     # Composants React
│   │   ├── ui/         # Primitives shadcn/ui
│   │   ├── common/     # Composants réutilisables
│   │   └── [feature]/  # Composants par module
│   ├── hooks/          # Hooks personnalisés
│   ├── lib/            # Utilitaires
│   ├── pages/          # Pages/routes
│   ├── locales/        # Traductions i18n
│   └── integrations/   # Client Supabase (auto-généré)
├── supabase/
│   ├── functions/      # Edge Functions
│   └── migrations/     # Migrations SQL
├── docs/               # Documentation
└── scripts/            # Scripts utilitaires
```

## Données de test

### Utiliser les données mock

En mode développement local, les composants utilisent des données fictives intégrées. Aucune configuration supplémentaire n'est nécessaire.

### Charger des données de seed

Si vous avez accès à Lovable Cloud, vous pouvez peupler la base avec des données de test :

```bash
# Via l'interface Lovable Cloud > Database > Import
# Ou via les edge functions d'admin
```

## Résolution de problèmes

### Le serveur ne démarre pas

```bash
# Vérifier la version de Node
node -v  # Doit être >= 20

# Nettoyer et réinstaller
rm -rf node_modules
npm ci
```

### Erreurs TypeScript

```bash
# Vérifier les types
npm run typecheck

# Régénérer les types Supabase (si nécessaire)
# Les types sont auto-générés par Lovable
```

### Tests qui échouent

```bash
# Exécuter un test spécifique
npx vitest run src/hooks/__tests__/useAuth.test.ts

# Mode verbose
npx vitest run --reporter=verbose
```

## Prochaines étapes

1. **Explorer l'application** : Ouvrez http://localhost:8080
2. **Lire la documentation** : [Architecture](./audit/ARCHITECTURE.md)
3. **Contribuer** : [Guide de contribution](./CONTRIBUTING.md)
4. **Signaler un bug** : [Créer une issue](https://github.com/system-compass/system-compass/issues/new)

## Ressources

- [Documentation Lovable](https://docs.lovable.dev)
- [Documentation React](https://react.dev)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)
- [Documentation shadcn/ui](https://ui.shadcn.com)
