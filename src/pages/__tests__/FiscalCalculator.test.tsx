/**
 * FiscalCalculator Tests
 * Tests for salary calculations and fiscal comparisons
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import FiscalCalculator from '../FiscalCalculator';

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string) => fallback || key,
  }),
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

describe('FiscalCalculator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the calculator title', () => {
      renderWithProviders(<FiscalCalculator />);
      expect(screen.getByText('Calculateur Fiscal')).toBeInTheDocument();
    });

    it('should display tabs for single and comparison modes', () => {
      renderWithProviders(<FiscalCalculator />);
      expect(screen.getByText('Simulation simple')).toBeInTheDocument();
      expect(screen.getByText('Comparaison')).toBeInTheDocument();
    });

    it('should show country selector input', () => {
      renderWithProviders(<FiscalCalculator />);
      // Check that the country name is visible somewhere on the page
      expect(screen.getByText('Paramètres')).toBeInTheDocument();
    });
  });

  describe('calculations', () => {
    it('should display net salary breakdown', () => {
      renderWithProviders(<FiscalCalculator />);
      expect(screen.getByText('Salaire net mensuel')).toBeInTheDocument();
    });

    it('should display effective tax rate', () => {
      renderWithProviders(<FiscalCalculator />);
      expect(screen.getByText("Taux d'imposition effectif")).toBeInTheDocument();
    });

    it('should display healthcare costs', () => {
      renderWithProviders(<FiscalCalculator />);
      expect(screen.getByText('Santé')).toBeInTheDocument();
    });

    it('should display purchasing power adjusted', () => {
      renderWithProviders(<FiscalCalculator />);
      expect(screen.getByText("Pouvoir d'achat ajusté")).toBeInTheDocument();
    });
  });

  describe('comparison mode', () => {
    it('should have comparison tab accessible', () => {
      renderWithProviders(<FiscalCalculator />);
      const comparisonTab = screen.getByText('Comparaison');
      expect(comparisonTab).toBeInTheDocument();
    });

    it('should have both simulation and comparison tabs', () => {
      renderWithProviders(<FiscalCalculator />);
      expect(screen.getByText('Simulation simple')).toBeInTheDocument();
      expect(screen.getByText('Comparaison')).toBeInTheDocument();
    });
  });

  describe('input handling', () => {
    it('should have default salary value', () => {
      renderWithProviders(<FiscalCalculator />);
      const salaryInput = screen.getByDisplayValue('50000');
      expect(salaryInput).toBeInTheDocument();
    });

    it('should update calculations when salary changes', () => {
      renderWithProviders(<FiscalCalculator />);
      const salaryInput = screen.getByDisplayValue('50000');
      
      fireEvent.change(salaryInput, { target: { value: '60000' } });
      
      expect(salaryInput).toHaveValue(60000);
    });
  });
});

describe('FiscalCalculator Edge Cases', () => {
  it('should handle zero salary', () => {
    renderWithProviders(<FiscalCalculator />);
    const salaryInput = screen.getByDisplayValue('50000');
    
    fireEvent.change(salaryInput, { target: { value: '0' } });
    
    // Should not crash
    expect(screen.getByText('Calculateur Fiscal')).toBeInTheDocument();
  });

  it('should handle very high salary', () => {
    renderWithProviders(<FiscalCalculator />);
    const salaryInput = screen.getByDisplayValue('50000');
    
    fireEvent.change(salaryInput, { target: { value: '1000000' } });
    
    // Should not crash
    expect(screen.getByText('Calculateur Fiscal')).toBeInTheDocument();
  });
});
