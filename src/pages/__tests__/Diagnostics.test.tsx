/**
 * Diagnostics Page Tests
 * Tests for system diagnostics and smoke tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Diagnostics from '../Diagnostics';

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string) => fallback || key,
  }),
}));

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    session: { access_token: 'test-token' },
  }),
}));

// Mock useUserRoles
vi.mock('@/hooks/useUserRoles', () => ({
  useUserRoles: () => ({
    roles: ['admin'],
    isAdmin: true,
    isLoading: false,
  }),
}));

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        limit: () => Promise.resolve({ data: [{ id: 'test' }], error: null }),
        eq: () => ({
          single: () => Promise.resolve({ data: { id: 'test' }, error: null }),
        }),
      }),
    }),
    functions: {
      invoke: () => Promise.resolve({ data: {}, error: null }),
    },
  },
}));

// Mock network utils
vi.mock('@/lib/network-utils', () => ({
  useNetworkQuality: () => 'good',
  getNetworkStatus: () => ({
    online: true,
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Diagnostics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the diagnostics title', () => {
      renderWithProviders(<Diagnostics />);
      expect(screen.getByText('Diagnostics')).toBeInTheDocument();
    });

    it('should display system and smoke test tabs', () => {
      renderWithProviders(<Diagnostics />);
      expect(screen.getByText('Système')).toBeInTheDocument();
      expect(screen.getByText('Tests de Fumée')).toBeInTheDocument();
    });

    it('should show authentication status', () => {
      renderWithProviders(<Diagnostics />);
      expect(screen.getByText('Authentification')).toBeInTheDocument();
      expect(screen.getByText('Connecté')).toBeInTheDocument();
    });
  });

  describe('system information', () => {
    it('should display database status', () => {
      renderWithProviders(<Diagnostics />);
      expect(screen.getByText('Base de données')).toBeInTheDocument();
    });

    it('should display roles and permissions', () => {
      renderWithProviders(<Diagnostics />);
      expect(screen.getByText('Rôles & Permissions')).toBeInTheDocument();
    });

    it('should display latency section', () => {
      renderWithProviders(<Diagnostics />);
      expect(screen.getByText('Latence API')).toBeInTheDocument();
    });

    it('should display network status', () => {
      renderWithProviders(<Diagnostics />);
      expect(screen.getByText('Réseau')).toBeInTheDocument();
    });

    it('should display environment info', () => {
      renderWithProviders(<Diagnostics />);
      expect(screen.getByText('Environnement')).toBeInTheDocument();
    });
  });

  describe('admin access', () => {
    it('should show admin badge when user is admin', () => {
      renderWithProviders(<Diagnostics />);
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getAllByText('Oui')[0]).toBeInTheDocument();
    });
  });
});

describe('Diagnostics Access Control', () => {
  it('should render for admin users', () => {
    renderWithProviders(<Diagnostics />);
    expect(screen.getByText('Diagnostics')).toBeInTheDocument();
  });
});

describe('Diagnostics Smoke Tests Tab', () => {
  it('should have smoke tests tab accessible', () => {
    renderWithProviders(<Diagnostics />);
    const smokeTab = screen.getByText('Tests de Fumée');
    expect(smokeTab).toBeInTheDocument();
  });
});
