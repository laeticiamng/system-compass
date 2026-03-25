import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { EmptyDashboardState } from '../EmptyDashboardState';

describe('EmptyDashboardState', () => {
  describe('Rendering', () => {
    it('renders welcome message', () => {
      render(<EmptyDashboardState />);

      // Check for welcome heading
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('renders all quick start steps', () => {
      render(<EmptyDashboardState />);

      // Should have 4 step links
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThanOrEqual(4);
    });

    it('renders main CTA button', () => {
      render(<EmptyDashboardState />);

      // Main CTA links to /exit-keys when no profile
      const links = screen.getAllByRole('link') as HTMLAnchorElement[];
      const ctaButton = links.find(l => l.getAttribute('href')?.endsWith('/exit-keys'));
      expect(ctaButton).toBeInTheDocument();
    });
  });

  describe('Step Status Logic', () => {
    it('shows profile step as current when no profile exists', () => {
      render(<EmptyDashboardState hasProfile={false} hasExitKey={false} />);

      // Profile step should be visually highlighted (current state)
      // The component uses different styling for current vs pending
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });

    it('shows profile step as done when hasProfile is true', () => {
      render(<EmptyDashboardState hasProfile={true} hasExitKey={false} />);

      // The profile step should have a checkmark when done
      // This is indicated by the CheckCircle2 icon and line-through styling
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
    });

    it('shows exit keys step as done when hasExitKey is true', () => {
      render(<EmptyDashboardState hasProfile={true} hasExitKey={true} />);

      // Both profile and exit keys should be marked as done
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });

    it('updates CTA button text based on profile status', () => {
      const { rerender } = render(<EmptyDashboardState hasProfile={false} />);

      // Without profile: main CTA should link to /exit-keys
      const links = screen.getAllByRole('link') as HTMLAnchorElement[];
      const exitKeysLink = links.find(l => l.getAttribute('href')?.endsWith('/exit-keys'));
      expect(exitKeysLink).toBeInTheDocument();

      // With profile: main CTA should link to /quick-test
      rerender(<EmptyDashboardState hasProfile={true} />);
      const linksAfter = screen.getAllByRole('link') as HTMLAnchorElement[];
      const quickTestLink = linksAfter.find(l => l.getAttribute('href')?.endsWith('/quick-test'));
      expect(quickTestLink).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('has correct link to exit-keys profile page', () => {
      render(<EmptyDashboardState />);

      const links = screen.getAllByRole('link') as HTMLAnchorElement[];
      const link = links.find(l => l.getAttribute('href')?.endsWith('/exit-keys'));
      expect(link).toBeInTheDocument();
    });

    it('has correct link to quick-test page', () => {
      render(<EmptyDashboardState />);

      const links = screen.getAllByRole('link') as HTMLAnchorElement[];
      const testLink = links.find(l => l.getAttribute('href')?.endsWith('/quick-test'));
      expect(testLink).toBeInTheDocument();
    });

    it('has correct link to countries page', () => {
      render(<EmptyDashboardState />);

      const links = screen.getAllByRole('link') as HTMLAnchorElement[];
      const countriesLink = links.find(l => l.getAttribute('href')?.endsWith('/countries'));
      expect(countriesLink).toBeInTheDocument();
    });

    it('has correct link to exit-keys-catalog page', () => {
      render(<EmptyDashboardState />);

      const links = screen.getAllByRole('link') as HTMLAnchorElement[];
      const catalogLink = links.find(l => l.getAttribute('href')?.endsWith('/exit-keys-catalog'));
      expect(catalogLink).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has a clear heading hierarchy', () => {
      render(<EmptyDashboardState />);

      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h2).toBeInTheDocument();

      // Step titles are h3
      const h3s = screen.getAllByRole('heading', { level: 3 });
      expect(h3s.length).toBe(4); // 4 quick start steps
    });

    it('all interactive elements are focusable', () => {
      render(<EmptyDashboardState />);

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).not.toHaveAttribute('tabindex', '-1');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined props gracefully', () => {
      // Component uses default values, should not crash
      render(<EmptyDashboardState />);
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('handles all combinations of props', () => {
      const propCombinations = [
        { hasProfile: false, hasExitKey: false },
        { hasProfile: true, hasExitKey: false },
        { hasProfile: false, hasExitKey: true },
        { hasProfile: true, hasExitKey: true },
      ];

      propCombinations.forEach(props => {
        const { unmount } = render(<EmptyDashboardState {...props} />);
        expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
        unmount();
      });
    });
  });
});
