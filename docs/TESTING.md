# 🧪 Stratégie de Tests - Compass

> Ce document décrit la stratégie de tests et les bonnes pratiques du projet.

## Vue d'ensemble

| Type de test | Framework | Couverture | Emplacement |
|--------------|-----------|------------|-------------|
| **Unitaires** | Vitest | ~75% | `src/**/*.test.ts(x)` |
| **Intégration** | Vitest | Partiel | `src/**/__tests__/` |
| **E2E** | Manuel | - | Tests manuels |

## Commandes

```bash
# Exécuter tous les tests
npm run test

# Mode watch (développement)
npm run test:watch

# Avec rapport de couverture
npm run test:coverage

# Test spécifique
npx vitest run src/hooks/__tests__/useAuth.test.ts
```

## Structure des Tests

### Tests unitaires

Les tests unitaires sont colocalisés avec le code source :

```
src/
├── components/
│   ├── CountryCard.tsx
│   └── CountryCard.test.tsx      # ← Test adjacent
├── hooks/
│   ├── __tests__/
│   │   └── useAuth.test.ts       # ← Dossier __tests__
│   └── useAuth.ts
└── lib/
    ├── __tests__/
    │   └── formatters.test.ts
    └── formatters.ts
```

### Convention de nommage

- `*.test.ts(x)` — Tests unitaires
- `*.spec.ts(x)` — Alternative acceptée
- `__tests__/` — Dossier pour regrouper les tests

## Exemples de Tests Clés

### Test de composant React

```tsx
// src/components/CountryCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CountryCard } from './CountryCard';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('CountryCard', () => {
  it('affiche le nom du pays', () => {
    render(<CountryCard name="France" iso2="FR" />);
    expect(screen.getByText('France')).toBeInTheDocument();
  });
});
```

### Test de hook

```tsx
// src/hooks/__tests__/useAuth.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}));

describe('useAuth', () => {
  it('retourne null quand non authentifié', async () => {
    const { result } = renderHook(() => useAuth());
    await waitFor(() => {
      expect(result.current.user).toBeNull();
    });
  });
});
```

### Test de fonction utilitaire

```tsx
// src/lib/__tests__/formatters.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate } from '../formatters';

describe('formatCurrency', () => {
  it('formate en EUR', () => {
    expect(formatCurrency(1000, 'EUR')).toBe('1 000,00 €');
  });

  it('formate en USD', () => {
    expect(formatCurrency(1000, 'USD')).toBe('$1,000.00');
  });
});
```

### Test de sécurité RLS

```tsx
// src/hooks/__tests__/useLatentZones.test.ts
describe('Latent Zones Security', () => {
  it('refuse les mutations sans authentification', async () => {
    mockUseAuth.mockReturnValue({ user: null });
    const { result } = renderHook(() => useLatentZones());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(await result.current.createZone('Test')).toBeNull();
    expect(await result.current.deleteZone('id')).toBe(false);
  });
});
```

## Bonnes Pratiques

### 1. Mocker les dépendances externes

```tsx
// Toujours mocker react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mocker Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { /* ... */ },
}));
```

### 2. Utiliser des factories

```tsx
// factories.ts
export const createMockCountry = (overrides = {}) => ({
  id: 'test-id',
  name: 'Test Country',
  iso2: 'TC',
  pyramid_type: 'meritocratic',
  ...overrides,
});
```

### 3. Tester les cas d'erreur

```tsx
it('gère les erreurs réseau', async () => {
  mockFetch.mockRejectedValue(new Error('Network error'));
  
  const { result } = renderHook(() => useCountries());
  
  await waitFor(() => {
    expect(result.current.error).toBe('Failed to fetch');
  });
});
```

### 4. Tests de régression i18n

```tsx
it('utilise les clés de traduction correctes', () => {
  const { getByText } = render(<MyComponent />);
  expect(getByText('common.submit')).toBeInTheDocument();
});
```

## Couverture

### Générer le rapport

```bash
npm run test:coverage
```

### Seuils minimum (objectif)

| Métrique | Seuil |
|----------|-------|
| Statements | 70% |
| Branches | 65% |
| Functions | 70% |
| Lines | 70% |

### Fichiers prioritaires

1. **Hooks d'authentification** — 100%
2. **Logique métier** (lib/) — 80%
3. **Composants critiques** — 70%

## CI/CD

Les tests sont exécutés automatiquement sur GitHub Actions :

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: npx vitest run --reporter=verbose

- name: Run tests with coverage
  run: npx vitest run --coverage
```

### Artifacts

- Rapport de couverture disponible en artifact CI
- Badges mis à jour automatiquement

## Déboguer les Tests

### Mode verbose

```bash
npx vitest run --reporter=verbose
```

### Test unique en mode debug

```bash
npx vitest run src/hooks/__tests__/useAuth.test.ts --reporter=verbose
```

### Ignorer un test temporairement

```tsx
it.skip('test à ignorer', () => {
  // ...
});
```

## Ressources

- [Documentation Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Guide de contribution](./CONTRIBUTING.md)
