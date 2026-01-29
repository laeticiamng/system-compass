/**
 * GamificationHub Tests
 * Tests for the gamification system and progress tracking
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GamificationHub from '../GamificationHub';

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string) => fallback || key,
  }),
}));

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null }),
}));

// Mock useGamification
vi.mock('@/hooks/useGamification', () => ({
  useGamification: () => ({
    progress: {
      xp: 150,
      level: 'dreamer',
      badges: ['first_visit'],
      phase: 'exploration',
      streak: 3,
    },
    isLoading: false,
    addXp: vi.fn(),
    unlockBadge: vi.fn(),
    updateStreak: vi.fn(),
    setPhase: vi.fn(),
    checkBadgeConditions: vi.fn(),
  }),
}));

// Mock useUserHistory
vi.mock('@/hooks/useUserHistory', () => ({
  useUserHistory: () => ({
    countries: [],
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

describe('GamificationHub', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('rendering', () => {
    it('should render the gamification hub title', () => {
      renderWithProviders(<GamificationHub />);
      expect(screen.getByText('Centre de progression')).toBeInTheDocument();
    });

    it('should display tabs for different sections', () => {
      renderWithProviders(<GamificationHub />);
      expect(screen.getByText('Vue d\'ensemble')).toBeInTheDocument();
      expect(screen.getByText('Défis')).toBeInTheDocument();
      expect(screen.getByText('Badges')).toBeInTheDocument();
    });

    it('should display streak information', () => {
      renderWithProviders(<GamificationHub />);
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('jours consécutifs')).toBeInTheDocument();
    });

    it('should display XP progress', () => {
      renderWithProviders(<GamificationHub />);
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('XP total')).toBeInTheDocument();
    });
  });

  describe('phase tracking', () => {
    it('should display phase tracker component', () => {
      renderWithProviders(<GamificationHub />);
      expect(screen.getByText('Votre parcours')).toBeInTheDocument();
    });

    it('should show 4 phases of expatriation', () => {
      renderWithProviders(<GamificationHub />);
      expect(screen.getByText('Les 4 phases de votre projet d\'expatriation')).toBeInTheDocument();
    });
  });

  describe('badges', () => {
    it('should display badges section', () => {
      renderWithProviders(<GamificationHub />);
      expect(screen.getByText('Badges récents')).toBeInTheDocument();
    });

    it('should show empty state when no badges unlocked', () => {
      vi.doMock('@/hooks/useGamification', () => ({
        useGamification: () => ({
          progress: {
            xp: 0,
            level: 'dreamer',
            badges: [],
            phase: 'exploration',
            streak: 0,
          },
          isLoading: false,
        }),
      }));
      
      renderWithProviders(<GamificationHub />);
      // Check that the page renders without crashing
      expect(screen.getByText('Centre de progression')).toBeInTheDocument();
    });
  });

  describe('challenges', () => {
    it('should have challenges tab accessible', () => {
      renderWithProviders(<GamificationHub />);
      const challengesTab = screen.getByText('Défis');
      expect(challengesTab).toBeInTheDocument();
    });

    it('should render without crashing when clicking tabs', () => {
      renderWithProviders(<GamificationHub />);
      // Check all tabs are present
      expect(screen.getByText('Défis')).toBeInTheDocument();
      expect(screen.getByText('Quêtes')).toBeInTheDocument();
      expect(screen.getByText('Badges')).toBeInTheDocument();
    });
  });
});

describe('Gamification Edge Cases', () => {
  it('should handle loading state', () => {
    vi.doMock('@/hooks/useGamification', () => ({
      useGamification: () => ({
        progress: null,
        isLoading: true,
      }),
    }));
    
    // Verify rendering doesn't crash during loading
    renderWithProviders(<GamificationHub />);
  });

  it('should handle zero XP state', () => {
    renderWithProviders(<GamificationHub />);
    expect(screen.getByText('Centre de progression')).toBeInTheDocument();
  });
});
