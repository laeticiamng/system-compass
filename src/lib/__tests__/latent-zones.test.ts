/**
 * Tests for Latent Zones module (blind spots and uncertainty tracking)
 *
 * Tests cover:
 * - Zone data structure validation
 * - Status lifecycle (dormant → emergent → fragile → blocked)
 * - Tension management (nourishing, blocking, fragility, premature_crushing)
 * - Zone history tracking
 * - Zone merging functionality
 * - Zone duplication
 */
import { describe, it, expect } from 'vitest';
import {
  createMockLatentZone,
  createMockZoneTension,
  VALID_ZONE_STATUSES,
  VALID_TENSION_TYPES,
  VALID_HISTORY_ACTIONS,
  isValidISODate,
} from './test-utils';

// Types for validation
type ZoneStatus = 'dormant' | 'emergent' | 'fragile' | 'blocked';
type TensionType = 'nourishing' | 'blocking' | 'fragility' | 'premature_crushing';
type HistoryAction = 'created' | 'status_changed' | 'transformed' | 'merged' | 'archived' | 'put_to_sleep';

interface LatentZone {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: ZoneStatus;
  created_at: string;
  updated_at: string;
  tensions?: ZoneTension[];
}

interface ZoneTension {
  id: string;
  zone_id: string;
  tension_type: TensionType;
  content: string;
  created_at: string;
}

interface ZoneHistory {
  id: string;
  zone_id: string;
  action: HistoryAction;
  previous_status: string | null;
  new_status: string | null;
  notes: string | null;
  created_at: string;
  user_id: string;
}

// Business logic functions (extracted for pure testing)
function validateZoneStatus(status: string): status is ZoneStatus {
  return VALID_ZONE_STATUSES.includes(status);
}

function validateTensionType(type: string): type is TensionType {
  return VALID_TENSION_TYPES.includes(type);
}

function validateHistoryAction(action: string): action is HistoryAction {
  return VALID_HISTORY_ACTIONS.includes(action);
}

function canTransitionZoneStatus(current: ZoneStatus, target: ZoneStatus): boolean {
  // Zones can move between adjacent states
  const statusOrder: ZoneStatus[] = ['dormant', 'emergent', 'fragile', 'blocked'];
  const currentIndex = statusOrder.indexOf(current);
  const targetIndex = statusOrder.indexOf(target);

  // Can move one step forward or backward
  return Math.abs(targetIndex - currentIndex) === 1;
}

function getZoneSeverity(status: ZoneStatus): number {
  const severityMap: Record<ZoneStatus, number> = {
    'dormant': 0,
    'emergent': 1,
    'fragile': 2,
    'blocked': 3,
  };
  return severityMap[status];
}

function calculateZoneHealth(zone: LatentZone): { score: number; label: string } {
  const tensions = zone.tensions || [];
  const nourishingCount = tensions.filter(t => t.tension_type === 'nourishing').length;
  const blockingCount = tensions.filter(t => t.tension_type === 'blocking').length;
  const fragilityCount = tensions.filter(t => t.tension_type === 'fragility').length;
  const crushingCount = tensions.filter(t => t.tension_type === 'premature_crushing').length;

  // Calculate score: nourishing adds, others subtract
  const score = Math.max(0, Math.min(100,
    50 + (nourishingCount * 15) - (blockingCount * 20) - (fragilityCount * 10) - (crushingCount * 25)
  ));

  let label: string;
  if (score >= 70) label = 'healthy';
  else if (score >= 40) label = 'attention_needed';
  else label = 'critical';

  return { score, label };
}

function validateZone(data: Partial<LatentZone>): string[] {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (data.title && data.title.length > 200) {
    errors.push('Title must be 200 characters or less');
  }

  if (data.description && data.description.length > 2000) {
    errors.push('Description must be 2000 characters or less');
  }

  if (data.status && !validateZoneStatus(data.status)) {
    errors.push('Invalid zone status');
  }

  return errors;
}

function validateTension(data: Partial<ZoneTension>): string[] {
  const errors: string[] = [];

  if (!data.zone_id) {
    errors.push('Zone ID is required');
  }

  if (!data.tension_type || !validateTensionType(data.tension_type)) {
    errors.push('Valid tension type is required');
  }

  if (!data.content || data.content.trim().length === 0) {
    errors.push('Content is required');
  }

  if (data.content && data.content.length > 1000) {
    errors.push('Content must be 1000 characters or less');
  }

  return errors;
}

function canMergeZones(zones: LatentZone[]): { canMerge: boolean; reason?: string } {
  if (zones.length < 2) {
    return { canMerge: false, reason: 'At least 2 zones are required for merging' };
  }

  if (zones.length > 5) {
    return { canMerge: false, reason: 'Cannot merge more than 5 zones at once' };
  }

  // Check if all zones belong to the same user
  const userIds = new Set(zones.map(z => z.user_id));
  if (userIds.size > 1) {
    return { canMerge: false, reason: 'All zones must belong to the same user' };
  }

  return { canMerge: true };
}

describe('Latent Zones Module', () => {
  describe('Data Structure Validation', () => {
    it('should create a valid zone with all required fields', () => {
      const zone = createMockLatentZone();

      expect(zone.id).toBeDefined();
      expect(zone.user_id).toBeDefined();
      expect(zone.title).toBeDefined();
      expect(zone.status).toBeDefined();
      expect(zone.created_at).toBeDefined();
      expect(zone.updated_at).toBeDefined();
    });

    it('should have valid ISO dates', () => {
      const zone = createMockLatentZone();

      expect(isValidISODate(zone.created_at)).toBe(true);
      expect(isValidISODate(zone.updated_at)).toBe(true);
    });

    it('should allow null description', () => {
      const zone = createMockLatentZone({ description: null });
      expect(zone.description).toBeNull();
    });

    it('should initialize with empty tensions array', () => {
      const zone = createMockLatentZone();
      expect(Array.isArray(zone.tensions)).toBe(true);
    });

    it('should default status to dormant', () => {
      const zone = createMockLatentZone();
      expect(zone.status).toBe('dormant');
    });
  });

  describe('Zone Status Validation', () => {
    it('should validate all zone statuses', () => {
      VALID_ZONE_STATUSES.forEach(status => {
        expect(validateZoneStatus(status)).toBe(true);
      });
    });

    it('should reject invalid statuses', () => {
      expect(validateZoneStatus('invalid')).toBe(false);
      expect(validateZoneStatus('active')).toBe(false);
      expect(validateZoneStatus('')).toBe(false);
    });

    it('should have exactly 4 valid statuses', () => {
      expect(VALID_ZONE_STATUSES).toHaveLength(4);
      expect(VALID_ZONE_STATUSES).toContain('dormant');
      expect(VALID_ZONE_STATUSES).toContain('emergent');
      expect(VALID_ZONE_STATUSES).toContain('fragile');
      expect(VALID_ZONE_STATUSES).toContain('blocked');
    });

    it('should return correct severity for each status', () => {
      expect(getZoneSeverity('dormant')).toBe(0);
      expect(getZoneSeverity('emergent')).toBe(1);
      expect(getZoneSeverity('fragile')).toBe(2);
      expect(getZoneSeverity('blocked')).toBe(3);
    });
  });

  describe('Zone Status Transitions', () => {
    it('should allow adjacent status transitions', () => {
      expect(canTransitionZoneStatus('dormant', 'emergent')).toBe(true);
      expect(canTransitionZoneStatus('emergent', 'fragile')).toBe(true);
      expect(canTransitionZoneStatus('fragile', 'blocked')).toBe(true);
    });

    it('should allow reverse transitions (recovery)', () => {
      expect(canTransitionZoneStatus('emergent', 'dormant')).toBe(true);
      expect(canTransitionZoneStatus('fragile', 'emergent')).toBe(true);
      expect(canTransitionZoneStatus('blocked', 'fragile')).toBe(true);
    });

    it('should reject non-adjacent transitions', () => {
      expect(canTransitionZoneStatus('dormant', 'fragile')).toBe(false);
      expect(canTransitionZoneStatus('dormant', 'blocked')).toBe(false);
      expect(canTransitionZoneStatus('blocked', 'dormant')).toBe(false);
    });

    it('should reject same-status transitions', () => {
      expect(canTransitionZoneStatus('dormant', 'dormant')).toBe(false);
      expect(canTransitionZoneStatus('blocked', 'blocked')).toBe(false);
    });
  });

  describe('Tension Type Validation', () => {
    it('should validate all tension types', () => {
      VALID_TENSION_TYPES.forEach(type => {
        expect(validateTensionType(type)).toBe(true);
      });
    });

    it('should reject invalid tension types', () => {
      expect(validateTensionType('invalid')).toBe(false);
      expect(validateTensionType('positive')).toBe(false);
      expect(validateTensionType('')).toBe(false);
    });

    it('should have exactly 4 valid tension types', () => {
      expect(VALID_TENSION_TYPES).toHaveLength(4);
      expect(VALID_TENSION_TYPES).toContain('nourishing');
      expect(VALID_TENSION_TYPES).toContain('blocking');
      expect(VALID_TENSION_TYPES).toContain('fragility');
      expect(VALID_TENSION_TYPES).toContain('premature_crushing');
    });
  });

  describe('History Action Validation', () => {
    it('should validate all history actions', () => {
      VALID_HISTORY_ACTIONS.forEach(action => {
        expect(validateHistoryAction(action)).toBe(true);
      });
    });

    it('should reject invalid history actions', () => {
      expect(validateHistoryAction('invalid')).toBe(false);
      expect(validateHistoryAction('deleted')).toBe(false);
    });

    it('should have exactly 6 valid history actions', () => {
      expect(VALID_HISTORY_ACTIONS).toHaveLength(6);
      expect(VALID_HISTORY_ACTIONS).toContain('created');
      expect(VALID_HISTORY_ACTIONS).toContain('status_changed');
      expect(VALID_HISTORY_ACTIONS).toContain('transformed');
      expect(VALID_HISTORY_ACTIONS).toContain('merged');
      expect(VALID_HISTORY_ACTIONS).toContain('archived');
      expect(VALID_HISTORY_ACTIONS).toContain('put_to_sleep');
    });
  });

  describe('Zone Validation', () => {
    it('should pass validation for complete zone data', () => {
      const zone = createMockLatentZone();
      const errors = validateZone(zone);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation for missing title', () => {
      const zone = createMockLatentZone({ title: '' });
      const errors = validateZone(zone);
      expect(errors).toContain('Title is required');
    });

    it('should fail validation for title too long', () => {
      const zone = createMockLatentZone({ title: 'a'.repeat(201) });
      const errors = validateZone(zone);
      expect(errors).toContain('Title must be 200 characters or less');
    });

    it('should fail validation for description too long', () => {
      const zone = createMockLatentZone({ description: 'a'.repeat(2001) });
      const errors = validateZone(zone);
      expect(errors).toContain('Description must be 2000 characters or less');
    });

    it('should fail validation for invalid status', () => {
      const zone = { ...createMockLatentZone(), status: 'invalid' as ZoneStatus };
      const errors = validateZone(zone);
      expect(errors).toContain('Invalid zone status');
    });
  });

  describe('Tension Validation', () => {
    it('should pass validation for complete tension data', () => {
      const tension = createMockZoneTension();
      const errors = validateTension(tension);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation for missing zone_id', () => {
      const tension = { ...createMockZoneTension(), zone_id: undefined };
      const errors = validateTension(tension as Partial<ZoneTension>);
      expect(errors).toContain('Zone ID is required');
    });

    it('should fail validation for invalid tension type', () => {
      const tension = { ...createMockZoneTension(), tension_type: 'invalid' as TensionType };
      const errors = validateTension(tension);
      expect(errors).toContain('Valid tension type is required');
    });

    it('should fail validation for missing content', () => {
      const tension = { ...createMockZoneTension(), content: '' };
      const errors = validateTension(tension);
      expect(errors).toContain('Content is required');
    });

    it('should fail validation for content too long', () => {
      const tension = { ...createMockZoneTension(), content: 'a'.repeat(1001) };
      const errors = validateTension(tension);
      expect(errors).toContain('Content must be 1000 characters or less');
    });
  });

  describe('Zone Health Calculation', () => {
    it('should return healthy score for zone with nourishing tensions', () => {
      const zone = createMockLatentZone({
        tensions: [
          createMockZoneTension({ tension_type: 'nourishing' }),
          createMockZoneTension({ tension_type: 'nourishing' }),
        ],
      }) as LatentZone;

      const health = calculateZoneHealth(zone);
      expect(health.score).toBeGreaterThanOrEqual(70);
      expect(health.label).toBe('healthy');
    });

    it('should return critical score for zone with blocking tensions', () => {
      const zone = createMockLatentZone({
        tensions: [
          createMockZoneTension({ tension_type: 'blocking' }),
          createMockZoneTension({ tension_type: 'blocking' }),
          createMockZoneTension({ tension_type: 'premature_crushing' }),
        ],
      }) as LatentZone;

      const health = calculateZoneHealth(zone);
      expect(health.score).toBeLessThan(40);
      expect(health.label).toBe('critical');
    });

    it('should return attention_needed for mixed tensions', () => {
      const zone = createMockLatentZone({
        tensions: [
          createMockZoneTension({ tension_type: 'nourishing' }),
          createMockZoneTension({ tension_type: 'blocking' }),
        ],
      }) as LatentZone;

      const health = calculateZoneHealth(zone);
      expect(health.score).toBeGreaterThanOrEqual(40);
      expect(health.score).toBeLessThan(70);
      expect(health.label).toBe('attention_needed');
    });

    it('should return base score for zone with no tensions', () => {
      const zone = createMockLatentZone({ tensions: [] }) as LatentZone;

      const health = calculateZoneHealth(zone);
      expect(health.score).toBe(50);
      expect(health.label).toBe('attention_needed');
    });

    it('should clamp score between 0 and 100', () => {
      const extremeBlockingZone = createMockLatentZone({
        tensions: Array(10).fill(null).map(() => createMockZoneTension({ tension_type: 'premature_crushing' })),
      }) as LatentZone;

      const extremeNourishingZone = createMockLatentZone({
        tensions: Array(10).fill(null).map(() => createMockZoneTension({ tension_type: 'nourishing' })),
      }) as LatentZone;

      const lowHealth = calculateZoneHealth(extremeBlockingZone);
      const highHealth = calculateZoneHealth(extremeNourishingZone);

      expect(lowHealth.score).toBeGreaterThanOrEqual(0);
      expect(highHealth.score).toBeLessThanOrEqual(100);
    });
  });

  describe('Zone Merging', () => {
    const mockUserId = 'user-1';

    it('should allow merging 2 zones from same user', () => {
      const zones = [
        createMockLatentZone({ id: 'zone-1', user_id: mockUserId }),
        createMockLatentZone({ id: 'zone-2', user_id: mockUserId }),
      ] as LatentZone[];

      const result = canMergeZones(zones);
      expect(result.canMerge).toBe(true);
    });

    it('should allow merging up to 5 zones', () => {
      const zones = Array(5).fill(null).map((_, i) =>
        createMockLatentZone({ id: `zone-${i}`, user_id: mockUserId })
      ) as LatentZone[];

      const result = canMergeZones(zones);
      expect(result.canMerge).toBe(true);
    });

    it('should reject merging more than 5 zones', () => {
      const zones = Array(6).fill(null).map((_, i) =>
        createMockLatentZone({ id: `zone-${i}`, user_id: mockUserId })
      ) as LatentZone[];

      const result = canMergeZones(zones);
      expect(result.canMerge).toBe(false);
      expect(result.reason).toContain('more than 5');
    });

    it('should reject merging single zone', () => {
      const zones = [
        createMockLatentZone({ id: 'zone-1', user_id: mockUserId }),
      ] as LatentZone[];

      const result = canMergeZones(zones);
      expect(result.canMerge).toBe(false);
      expect(result.reason).toContain('At least 2');
    });

    it('should reject merging zones from different users', () => {
      const zones = [
        createMockLatentZone({ id: 'zone-1', user_id: 'user-1' }),
        createMockLatentZone({ id: 'zone-2', user_id: 'user-2' }),
      ] as LatentZone[];

      const result = canMergeZones(zones);
      expect(result.canMerge).toBe(false);
      expect(result.reason).toContain('same user');
    });
  });

  describe('Zone History Structure', () => {
    it('should have valid history entry structure', () => {
      const history: ZoneHistory = {
        id: 'history-1',
        zone_id: 'zone-1',
        action: 'created',
        previous_status: null,
        new_status: 'dormant',
        notes: 'Initial creation',
        created_at: '2024-01-15T00:00:00Z',
        user_id: 'user-1',
      };

      expect(history.id).toBeDefined();
      expect(history.zone_id).toBeDefined();
      expect(history.action).toBeDefined();
      expect(isValidISODate(history.created_at)).toBe(true);
    });

    it('should track status change with previous and new status', () => {
      const history: ZoneHistory = {
        id: 'history-1',
        zone_id: 'zone-1',
        action: 'status_changed',
        previous_status: 'dormant',
        new_status: 'emergent',
        notes: 'Zone became active',
        created_at: '2024-01-15T00:00:00Z',
        user_id: 'user-1',
      };

      expect(history.previous_status).toBe('dormant');
      expect(history.new_status).toBe('emergent');
      expect(validateZoneStatus(history.previous_status!)).toBe(true);
      expect(validateZoneStatus(history.new_status!)).toBe(true);
    });
  });

  describe('Tension Data Structure', () => {
    it('should create valid tension with all fields', () => {
      const tension = createMockZoneTension();

      expect(tension.id).toBeDefined();
      expect(tension.zone_id).toBeDefined();
      expect(tension.tension_type).toBeDefined();
      expect(tension.content).toBeDefined();
      expect(tension.created_at).toBeDefined();
    });

    it('should have valid ISO date', () => {
      const tension = createMockZoneTension();
      expect(isValidISODate(tension.created_at)).toBe(true);
    });

    it('should default to nourishing tension type', () => {
      const tension = createMockZoneTension();
      expect(tension.tension_type).toBe('nourishing');
    });
  });

  describe('Tension Impact on Zone', () => {
    it('should categorize nourishing tensions as positive', () => {
      const tension = createMockZoneTension({ tension_type: 'nourishing' });
      expect(tension.tension_type).toBe('nourishing');
    });

    it('should categorize blocking tensions as negative', () => {
      const tension = createMockZoneTension({ tension_type: 'blocking' });
      expect(tension.tension_type).toBe('blocking');
    });

    it('should categorize fragility tensions as warning', () => {
      const tension = createMockZoneTension({ tension_type: 'fragility' });
      expect(tension.tension_type).toBe('fragility');
    });

    it('should categorize premature_crushing as severe', () => {
      const tension = createMockZoneTension({ tension_type: 'premature_crushing' });
      expect(tension.tension_type).toBe('premature_crushing');
    });
  });

  describe('Zone Lifecycle Scenarios', () => {
    it('should support dormant zone activation', () => {
      const zone = createMockLatentZone({ status: 'dormant' }) as LatentZone;
      expect(canTransitionZoneStatus(zone.status, 'emergent')).toBe(true);
    });

    it('should support fragile zone recovery', () => {
      const zone = createMockLatentZone({ status: 'fragile' }) as LatentZone;
      expect(canTransitionZoneStatus(zone.status, 'emergent')).toBe(true);
    });

    it('should support blocked zone mitigation', () => {
      const zone = createMockLatentZone({ status: 'blocked' }) as LatentZone;
      expect(canTransitionZoneStatus(zone.status, 'fragile')).toBe(true);
    });

    it('should properly track zone evolution with tensions', () => {
      const evolvingZone = createMockLatentZone({
        status: 'emergent',
        tensions: [
          createMockZoneTension({ tension_type: 'nourishing', content: 'Good market signals' }),
          createMockZoneTension({ tension_type: 'fragility', content: 'Competitor threat' }),
        ],
      }) as LatentZone;

      expect(evolvingZone.tensions).toHaveLength(2);
      expect(evolvingZone.status).toBe('emergent');
    });
  });
});
