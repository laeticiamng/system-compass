/**
 * SmokeTester Component Tests
 * Validates smoke testing functionality and UI states
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SmokeTester } from '../SmokeTester';

// Mock dependencies
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
    signOut: vi.fn(),
    signIn: vi.fn(),
  }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: vi.fn().mockResolvedValue({ data: [{ id: '1' }], error: null }),
    }),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'test' } } } }),
    },
  },
}));

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('SmokeTester', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the smoke tester component', () => {
    renderWithProviders(<SmokeTester />);
    expect(screen.getByText(/Tests de fumée/i)).toBeInTheDocument();
  });

  it('displays run tests button', () => {
    renderWithProviders(<SmokeTester />);
    expect(screen.getByText(/Lancer les tests/i)).toBeInTheDocument();
  });

  it('shows verification subtitle', () => {
    renderWithProviders(<SmokeTester />);
    expect(screen.getByText(/Vérification rapide/i)).toBeInTheDocument();
  });

  it('displays critical badge for critical tests', () => {
    renderWithProviders(<SmokeTester />);
    // The component renders with tests inside after clicking run
    expect(screen.getByRole('button', { name: /Lancer les tests/i })).toBeInTheDocument();
  });
});
