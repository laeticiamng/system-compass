# 🤝 Guide de Contribution

Bienvenue ! Ce guide explique comment contribuer efficacement à Compass.

## Prérequis

- Node.js 20+
- npm ou bun
- Git
- Compte GitHub

## Installation Rapide

```bash
# 1. Cloner le projet
git clone https://github.com/system-compass/system-compass.git
cd system-compass

# 2. Installation automatique
./scripts/setup-dev.sh

# 3. Lancer en développement
npm run dev
```

## Structure du Projet

```
src/
├── components/     # Composants React
│   ├── common/     # Partagés (boutons, modales...)
│   ├── ui/         # Primitives shadcn/ui
│   └── [feature]/  # Par fonctionnalité
├── hooks/          # Custom hooks
├── lib/            # Utilitaires
├── pages/          # Pages/routes
├── locales/        # Traductions i18n
└── types/          # Types TypeScript
```

## Conventions de Code

### Nommage

| Type | Convention | Exemple |
|------|------------|---------|
| Composants | PascalCase | `CountryCard.tsx` |
| Hooks | camelCase + use | `useCountryData.ts` |
| Utils | camelCase | `formatCurrency.ts` |
| Types | PascalCase | `CountryProfile.ts` |
| Constants | UPPER_SNAKE | `MAX_RETRY_COUNT` |

### Structure d'un Composant

```tsx
// src/components/feature/MyComponent.tsx

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onAction?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-lg bg-card">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Button onClick={handleClick} disabled={loading}>
        {t('common.submit')}
      </Button>
    </div>
  );
}
```

### Hooks Personnalisés

```tsx
// src/hooks/useMyFeature.ts

import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useMyFeature(id: string) {
  const query = useQuery({
    queryKey: ['my-feature', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('my_table')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
```

## Écrire des Tests

### Emplacement des Tests

```
src/
├── components/
│   └── MyComponent.tsx
│   └── MyComponent.test.tsx  # Test unitaire adjacent
tests/
├── integration/              # Tests d'intégration
└── e2e/                      # Tests end-to-end
```

### Structure d'un Test

```tsx
// src/components/MyComponent.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from './MyComponent';

// Mock des dépendances
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('MyComponent', () => {
  it('renders title correctly', () => {
    render(<MyComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('calls onAction when button clicked', async () => {
    const onAction = vi.fn();
    render(<MyComponent title="Test" onAction={onAction} />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('disables button while loading', async () => {
    const onAction = vi.fn(() => new Promise(r => setTimeout(r, 100)));
    render(<MyComponent title="Test" onAction={onAction} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(button).toBeDisabled();
  });
});
```

### Lancer les Tests

```bash
# Tous les tests
npm run test

# Tests avec couverture
npm run test:coverage

# Tests en mode watch
npm run test:watch

# Tests d'un fichier spécifique
npx vitest run src/components/MyComponent.test.tsx
```

## Internationalisation (i18n)

### Ajouter une Traduction

1. Ajouter la clé dans `src/locales/fr/translation.json`
2. Ajouter la même clé dans `src/locales/en/translation.json`
3. Utiliser dans le code :

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <p>{t('myFeature.description')}</p>;
}
```

### Vérifier les Traductions

```bash
# Vérifier les clés manquantes
node scripts/check-translation-keys.js

# Vérifier les duplications
node scripts/check-duplicate-keys.js

# Générer le rapport de couverture
node scripts/generate-i18n-coverage.js
```

## Workflow Git

### Branches

| Branche | Usage |
|---------|-------|
| `main` | Production stable |
| `develop` | Intégration features |
| `feature/xxx` | Nouvelle fonctionnalité |
| `fix/xxx` | Correction de bug |
| `docs/xxx` | Documentation |

### Commits

Format : `type(scope): description`

```bash
# Types
feat:     Nouvelle fonctionnalité
fix:      Correction de bug
docs:     Documentation
style:    Formatage (pas de changement de code)
refactor: Refactoring
test:     Ajout/modification de tests
chore:    Maintenance

# Exemples
git commit -m "feat(countries): add comparison chart"
git commit -m "fix(auth): handle session expiry"
git commit -m "docs(readme): update installation steps"
```

### Pull Request

1. Créer une branche depuis `develop`
2. Implémenter la fonctionnalité
3. Écrire/mettre à jour les tests
4. Vérifier le linting : `npm run lint`
5. Vérifier les types : `npm run typecheck`
6. Pousser et créer la PR

## Checklist Avant Commit

- [ ] Code formaté (`npm run lint`)
- [ ] Types valides (`npm run typecheck`)
- [ ] Tests passants (`npm run test`)
- [ ] Traductions ajoutées (fr + en minimum)
- [ ] Documentation mise à jour si nécessaire
- [ ] Pas de `console.log` ou code de debug
- [ ] Pas de secrets ou credentials

## Ressources

- [Documentation API](./API.md)
- [Architecture](./audit/ARCHITECTURE.md)
- [Schéma DB](./audit/DATABASE-SCHEMA.md)
- [shadcn/ui Components](https://ui.shadcn.com)
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Obtenir de l'Aide

- GitHub Issues pour les bugs
- GitHub Discussions pour les questions
- Slack/Discord de la communauté (à venir)
