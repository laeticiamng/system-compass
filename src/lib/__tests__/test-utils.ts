/**
 * Test utilities for mocking Supabase and common test helpers
 */
import { vi } from 'vitest';

// Mock user for tests
export const mockUser = {
  id: 'test-user-id-123',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: { display_name: 'Test User' },
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00Z'
};

// Mock Supabase query builder
export function createMockQueryBuilder<T>(data: T | T[] | null, error: Error | null = null) {
  const mockBuilder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
    then: vi.fn((resolve) => resolve({ data, error })),
  };

  // For array results (no .single())
  mockBuilder.select.mockImplementation(() => ({
    ...mockBuilder,
    then: vi.fn((resolve) => resolve({ data, error })),
  }));

  return mockBuilder;
}

// Create mock Supabase client
export function createMockSupabaseClient() {
  return {
    from: vi.fn(() => createMockQueryBuilder([])),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
  };
}

// Test data factories
export function createMockIrreversaThreshold(overrides = {}) {
  return {
    id: 'threshold-1',
    user_id: mockUser.id,
    organization_name: 'Test Org',
    title: 'Critical Decision',
    context: 'Business expansion context',
    domain: 'strategic' as const,
    detection_date: '2024-01-15',
    detection_source: 'compass_analysis' as const,
    compass_country_id: 'france',
    threshold_nature: 'resource_commitment' as const,
    irreversibility_reason: 'Large capital commitment',
    alternatives_before: ['Option A', 'Option B'],
    validated_by: 'John Doe',
    validator_role: 'ceo' as const,
    validation_date: null,
    validation_statement: null,
    status: 'detected' as const,
    sealed_at: null,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    ...overrides
  };
}

export function createMockLatentZone(overrides = {}) {
  return {
    id: 'zone-1',
    user_id: mockUser.id,
    title: 'Market Entry Timing',
    description: 'Uncertainty about the right timing for market entry',
    status: 'dormant' as const,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    tensions: [],
    ...overrides
  };
}

export function createMockZoneTension(overrides = {}) {
  return {
    id: 'tension-1',
    zone_id: 'zone-1',
    tension_type: 'nourishing' as const,
    content: 'Strong market indicators',
    created_at: '2024-01-15T00:00:00Z',
    ...overrides
  };
}

export function createMockTraceOSDecision(overrides = {}) {
  return {
    id: 'decision-1',
    user_id: mockUser.id,
    parent_id: null,
    title: 'Expansion Strategy',
    context: 'International expansion decision',
    main_hypothesis: 'European market entry',
    alternative_hypotheses: ['Asian market', 'Focus domestic'],
    constraints: ['Budget', 'Timeline'],
    decision: 'Enter European market',
    author: 'CEO',
    scope: 'Company-wide',
    status: 'pending' as const,
    abandoned_branches: [],
    decision_date: '2024-01-15',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    ...overrides
  };
}

export function createMockFinancialIntelResult(overrides = {}) {
  return {
    country_profile: {
      name: 'France',
      currency: 'EUR',
      main_regulators: ['AMF', 'ACPR'],
      source_confidence: 'high' as const,
    },
    scam_top7: [
      {
        name: 'Pyramid Schemes',
        category: 'investment',
        process: 'Multi-level marketing',
        typical_targets: 'Young investors',
        red_flags: ['Guaranteed returns', 'Pressure to recruit'],
        psychological_tactics: ['FOMO', 'Social proof'],
        risks: ['Total loss', 'Legal issues'],
        protection_checklist: ['Verify registration', 'Check reviews'],
        where_to_verify: ['AMF website'],
        where_to_report: ['AMF', 'Police'],
      },
    ],
    legit_top7: [
      {
        name: 'Regulated Investment Funds',
        category: 'investment',
        why_safer: 'Regulated by AMF',
        what_its_not: 'Not a get-rich-quick scheme',
        verification_checklist: ['Check AMF registration'],
        when_to_avoid: ['When promising unrealistic returns'],
        official_resources: ['amf-france.org'],
      },
    ],
    sources: [{ name: 'AMF', type: 'regulator', url: 'https://www.amf-france.org' }],
    confidence: 85,
    disclaimer: 'For informational purposes only',
    cached: false,
    ...overrides
  };
}

// Validation helpers
export function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export function isValidISODate(str: string): boolean {
  const date = new Date(str);
  return !isNaN(date.getTime());
}

// Domain-specific validators
export const VALID_THRESHOLD_DOMAINS = ['strategic', 'financial', 'organizational', 'legal', 'ethical'];
export const VALID_THRESHOLD_NATURES = ['resource_commitment', 'contractual', 'reputational', 'structural', 'temporal'];
export const VALID_DETECTION_SOURCES = ['compass_analysis', 'manual', 'external_signal'];
export const VALID_VALIDATOR_ROLES = ['ceo', 'board', 'founder', 'director', 'comex'];
export const VALID_THRESHOLD_STATUSES = ['detected', 'marked', 'validated', 'sealed'];

export const VALID_ZONE_STATUSES = ['dormant', 'emergent', 'fragile', 'blocked'];
export const VALID_TENSION_TYPES = ['nourishing', 'blocking', 'fragility', 'premature_crushing'];
export const VALID_HISTORY_ACTIONS = ['created', 'status_changed', 'transformed', 'merged', 'archived', 'put_to_sleep'];

export const VALID_DECISION_STATUSES = ['pending', 'validated', 'abandoned'];
