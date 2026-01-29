import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { ProgressStats } from '../ProgressStats';
import type { ExitKey } from '@/lib/exit-keys-engine';

// Mock recharts to avoid rendering issues in tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

// Mock exit key data
const mockExitKey: ExitKey = {
  id: 'test-exit-key',
  name: 'Test Exit Key',
  icon: '🔑',
  unlocks: 'Testing benefits',
  successCondition: 'Complete all tests',
  mainRisk: 'Missing edge cases',
  rawTruth: 'Testing is essential',
  difficulty: 'accessible',
  timeframe: '2-6 months',
  linkedPyramids: ['COMPETENCE_TRUST'],
  targetPyramids: ['STABILITY_REDIS'],
  requirements: ['Test requirement 1', 'Test requirement 2'],
  steps: [
    {
      phase: 1,
      name: 'Preparation',
      duration: '2 weeks',
      actions: ['Action 1.1', 'Action 1.2', 'Action 1.3'],
      milestone: 'Preparation complete',
    },
    {
      phase: 2,
      name: 'Execution',
      duration: '4 weeks',
      actions: ['Action 2.1', 'Action 2.2'],
      milestone: 'Execution complete',
    },
    {
      phase: 3,
      name: 'Finalization',
      duration: '1 week',
      actions: ['Action 3.1'],
      milestone: 'Finalization complete',
    },
  ],
  planB: 'Alternative plan if main approach fails',
};

// Mock progress data
const createMockProgress = (completedSteps: { phaseIndex: number; actionIndex: number }[]) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // Started 30 days ago

  return {
    exitKeyId: 'test-exit-key',
    startedAt: startDate.toISOString(),
    stepsProgress: completedSteps.map((step, index) => ({
      phaseIndex: step.phaseIndex,
      actionIndex: step.actionIndex,
      completed: true,
      completedAt: new Date(startDate.getTime() + (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
    })),
    phaseNotes: [],
  };
};

describe('ProgressStats', () => {
  beforeEach(() => {
    // Mock Date.now for consistent calculations
    const fixedDate = new Date('2024-06-15T12:00:00Z').getTime();
    vi.spyOn(Date, 'now').mockImplementation(() => fixedDate);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders key metrics cards', () => {
      const progress = createMockProgress([
        { phaseIndex: 0, actionIndex: 0 },
        { phaseIndex: 0, actionIndex: 1 },
      ]);

      render(<ProgressStats progress={progress} exitKey={mockExitKey} />);

      // Should render metric text - use getAllByText since "Actions" appears multiple times
      expect(screen.getAllByText(/Actions/i).length).toBeGreaterThan(0);
    });

    it('renders charts containers', () => {
      const progress = createMockProgress([{ phaseIndex: 0, actionIndex: 0 }]);

      render(<ProgressStats progress={progress} exitKey={mockExitKey} />);

      // Should render chart containers (mocked)
      expect(screen.getAllByTestId('pie-chart').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('bar-chart').length).toBeGreaterThan(0);
    });

    it('renders phase progress section', () => {
      const progress = createMockProgress([]);

      render(<ProgressStats progress={progress} exitKey={mockExitKey} />);

      // Should show phase names
      expect(screen.getByText('Phase 1')).toBeInTheDocument();
      expect(screen.getByText('Phase 2')).toBeInTheDocument();
      expect(screen.getByText('Phase 3')).toBeInTheDocument();
    });
  });

  describe('Progress Calculations', () => {
    it('calculates correct total actions displayed', () => {
      const progress = createMockProgress([]);

      render(<ProgressStats progress={progress} exitKey={mockExitKey} />);

      // Total actions should be 3 + 2 + 1 = 6, displayed as 0/6
      expect(screen.getByText('0/6')).toBeInTheDocument();
    });

    it('calculates correct completed actions', () => {
      const progress = createMockProgress([
        { phaseIndex: 0, actionIndex: 0 },
        { phaseIndex: 0, actionIndex: 1 },
        { phaseIndex: 1, actionIndex: 0 },
      ]);

      render(<ProgressStats progress={progress} exitKey={mockExitKey} />);

      // 3 completed out of 6 total
      expect(screen.getByText('3/6')).toBeInTheDocument();
    });

    it('shows percentage calculation', () => {
      const progress = createMockProgress([
        { phaseIndex: 0, actionIndex: 0 },
        { phaseIndex: 0, actionIndex: 1 },
        { phaseIndex: 0, actionIndex: 2 },
      ]);

      render(<ProgressStats progress={progress} exitKey={mockExitKey} />);

      // 3/6 = 50% - look for the percentage text
      expect(screen.getByText(/50%/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles zero completed steps', () => {
      const progress = {
        exitKeyId: 'test-exit-key',
        startedAt: new Date().toISOString(),
        stepsProgress: [],
        phaseNotes: [],
      };

      render(<ProgressStats progress={progress} exitKey={mockExitKey} />);

      // Should show 0/6
      expect(screen.getByText('0/6')).toBeInTheDocument();
    });

    it('handles all steps completed', () => {
      const progress = createMockProgress([
        { phaseIndex: 0, actionIndex: 0 },
        { phaseIndex: 0, actionIndex: 1 },
        { phaseIndex: 0, actionIndex: 2 },
        { phaseIndex: 1, actionIndex: 0 },
        { phaseIndex: 1, actionIndex: 1 },
        { phaseIndex: 2, actionIndex: 0 },
      ]);

      render(<ProgressStats progress={progress} exitKey={mockExitKey} />);

      // Should show 6/6 and 100%
      expect(screen.getByText('6/6')).toBeInTheDocument();
      expect(screen.getByText(/100%/)).toBeInTheDocument();
    });

    it('handles single phase exit key', () => {
      const singlePhaseExitKey: ExitKey = {
        ...mockExitKey,
        steps: [
          {
            phase: 1,
            name: 'Only Phase',
            duration: '1 week',
            actions: ['Action 1'],
            milestone: 'Phase complete',
          },
        ],
      };

      const progress = {
        exitKeyId: 'test-exit-key',
        startedAt: new Date().toISOString(),
        stepsProgress: [],
        phaseNotes: [],
      };

      render(<ProgressStats progress={progress} exitKey={singlePhaseExitKey} />);

      expect(screen.getByText('Phase 1')).toBeInTheDocument();
      // Use getAllByText since 0/1 may appear in multiple places
      expect(screen.getAllByText('0/1').length).toBeGreaterThan(0);
    });
  });

  describe('Phase Details', () => {
    it('shows correct phase names', () => {
      const progress = createMockProgress([]);

      render(<ProgressStats progress={progress} exitKey={mockExitKey} />);

      expect(screen.getByText('Preparation')).toBeInTheDocument();
      expect(screen.getByText('Execution')).toBeInTheDocument();
      expect(screen.getByText('Finalization')).toBeInTheDocument();
    });

    it('shows correct actions count per phase when partially complete', () => {
      const progress = createMockProgress([
        { phaseIndex: 0, actionIndex: 0 },
      ]);

      render(<ProgressStats progress={progress} exitKey={mockExitKey} />);

      // Phase 1 has 3 actions, 1 completed - use getAllByText since it may appear multiple times
      expect(screen.getAllByText('1/3').length).toBeGreaterThan(0);
    });
  });
});
