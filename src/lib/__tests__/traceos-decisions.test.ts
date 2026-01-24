/**
 * Tests for TraceOS Decisions module (decision tree tracking)
 *
 * Tests cover:
 * - Decision data structure validation
 * - Tree building from flat data
 * - Status workflow (pending → validated/abandoned)
 * - Parent-child relationships
 * - Decision search and navigation
 * - Abandoned branches tracking
 */
import { describe, it, expect } from 'vitest';
import {
  createMockTraceOSDecision,
  VALID_DECISION_STATUSES,
  isValidISODate,
} from './test-utils';

// Types for validation
type DecisionStatus = 'pending' | 'validated' | 'abandoned';

interface DBDecision {
  id: string;
  user_id: string;
  parent_id: string | null;
  title: string;
  context: string;
  main_hypothesis: string;
  alternative_hypotheses: string[];
  constraints: string[];
  decision: string;
  author: string;
  scope: string;
  status: DecisionStatus;
  abandoned_branches: { title: string; reason: string }[];
  decision_date: string;
  created_at: string;
  updated_at: string;
}

interface DecisionNodeData {
  id: string;
  title: string;
  context: string;
  mainHypothesis: string;
  alternativeHypotheses: string[];
  constraints: string[];
  decision: string;
  date: string;
  author: string;
  scope: string;
  status: DecisionStatus;
  abandonedBranches: { title: string; reason: string }[];
  children?: DecisionNodeData[];
}

// Business logic functions (extracted for pure testing)
function validateDecisionStatus(status: string): status is DecisionStatus {
  return VALID_DECISION_STATUSES.includes(status);
}

function canTransitionDecisionStatus(current: DecisionStatus, target: DecisionStatus): boolean {
  // From pending, can go to validated or abandoned
  // From validated or abandoned, cannot transition (terminal states)
  if (current === 'pending') {
    return target === 'validated' || target === 'abandoned';
  }
  return false;
}

function dbToUIDecision(dbDecision: DBDecision, children: DecisionNodeData[] = []): DecisionNodeData {
  return {
    id: dbDecision.id,
    title: dbDecision.title,
    context: dbDecision.context,
    mainHypothesis: dbDecision.main_hypothesis,
    alternativeHypotheses: dbDecision.alternative_hypotheses || [],
    constraints: dbDecision.constraints || [],
    decision: dbDecision.decision,
    date: dbDecision.decision_date,
    author: dbDecision.author,
    scope: dbDecision.scope,
    status: dbDecision.status,
    abandonedBranches: dbDecision.abandoned_branches || [],
    children
  };
}

function buildDecisionTree(decisions: DBDecision[]): DecisionNodeData[] {
  const decisionMap = new Map<string, DecisionNodeData>();
  const rootDecisions: DecisionNodeData[] = [];

  // First pass: create all nodes
  decisions.forEach(d => {
    decisionMap.set(d.id, dbToUIDecision(d, []));
  });

  // Second pass: build tree structure
  decisions.forEach(d => {
    const node = decisionMap.get(d.id)!;
    if (d.parent_id && decisionMap.has(d.parent_id)) {
      const parent = decisionMap.get(d.parent_id)!;
      if (!parent.children) parent.children = [];
      parent.children.push(node);
    } else {
      rootDecisions.push(node);
    }
  });

  // Sort by date descending
  rootDecisions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return rootDecisions;
}

function findDecisionById(decisions: DecisionNodeData[], id: string): DecisionNodeData | undefined {
  for (const decision of decisions) {
    if (decision.id === id) return decision;
    if (decision.children) {
      const match = findDecisionById(decision.children, id);
      if (match) return match;
    }
  }
  return undefined;
}

function getDecisionDepth(decisions: DecisionNodeData[], id: string, depth: number = 0): number {
  for (const decision of decisions) {
    if (decision.id === id) return depth;
    if (decision.children) {
      const childDepth = getDecisionDepth(decision.children, id, depth + 1);
      if (childDepth >= 0) return childDepth;
    }
  }
  return -1;
}

function getDecisionPath(decisions: DecisionNodeData[], id: string, path: DecisionNodeData[] = []): DecisionNodeData[] | null {
  for (const decision of decisions) {
    if (decision.id === id) return [...path, decision];
    if (decision.children) {
      const childPath = getDecisionPath(decision.children, id, [...path, decision]);
      if (childPath) return childPath;
    }
  }
  return null;
}

function countDecisions(decisions: DecisionNodeData[]): number {
  return decisions.reduce((count, d) => {
    return count + 1 + (d.children ? countDecisions(d.children) : 0);
  }, 0);
}

function validateDecision(data: Partial<DBDecision>): string[] {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!data.context || data.context.trim().length === 0) {
    errors.push('Context is required');
  }

  if (!data.main_hypothesis || data.main_hypothesis.trim().length === 0) {
    errors.push('Main hypothesis is required');
  }

  if (!data.decision || data.decision.trim().length === 0) {
    errors.push('Decision is required');
  }

  if (!data.author || data.author.trim().length === 0) {
    errors.push('Author is required');
  }

  if (!data.scope || data.scope.trim().length === 0) {
    errors.push('Scope is required');
  }

  if (data.status && !validateDecisionStatus(data.status)) {
    errors.push('Invalid status');
  }

  return errors;
}

function validateAbandonedBranch(branch: { title?: string; reason?: string }): string[] {
  const errors: string[] = [];

  if (!branch.title || branch.title.trim().length === 0) {
    errors.push('Branch title is required');
  }

  if (!branch.reason || branch.reason.trim().length === 0) {
    errors.push('Branch abandonment reason is required');
  }

  return errors;
}

describe('TraceOS Decisions Module', () => {
  describe('Data Structure Validation', () => {
    it('should create a valid decision with all required fields', () => {
      const decision = createMockTraceOSDecision();

      expect(decision.id).toBeDefined();
      expect(decision.user_id).toBeDefined();
      expect(decision.title).toBeDefined();
      expect(decision.context).toBeDefined();
      expect(decision.main_hypothesis).toBeDefined();
      expect(decision.decision).toBeDefined();
      expect(decision.author).toBeDefined();
      expect(decision.scope).toBeDefined();
      expect(decision.status).toBeDefined();
      expect(decision.decision_date).toBeDefined();
    });

    it('should have valid ISO dates', () => {
      const decision = createMockTraceOSDecision();

      expect(isValidISODate(decision.created_at)).toBe(true);
      expect(isValidISODate(decision.updated_at)).toBe(true);
    });

    it('should allow null parent_id for root decisions', () => {
      const decision = createMockTraceOSDecision({ parent_id: null });
      expect(decision.parent_id).toBeNull();
    });

    it('should have arrays for hypotheses and constraints', () => {
      const decision = createMockTraceOSDecision();
      expect(Array.isArray(decision.alternative_hypotheses)).toBe(true);
      expect(Array.isArray(decision.constraints)).toBe(true);
    });

    it('should have array for abandoned_branches', () => {
      const decision = createMockTraceOSDecision();
      expect(Array.isArray(decision.abandoned_branches)).toBe(true);
    });

    it('should default status to pending', () => {
      const decision = createMockTraceOSDecision();
      expect(decision.status).toBe('pending');
    });
  });

  describe('Decision Status Validation', () => {
    it('should validate all decision statuses', () => {
      VALID_DECISION_STATUSES.forEach(status => {
        expect(validateDecisionStatus(status)).toBe(true);
      });
    });

    it('should reject invalid statuses', () => {
      expect(validateDecisionStatus('invalid')).toBe(false);
      expect(validateDecisionStatus('approved')).toBe(false);
      expect(validateDecisionStatus('')).toBe(false);
    });

    it('should have exactly 3 valid statuses', () => {
      expect(VALID_DECISION_STATUSES).toHaveLength(3);
      expect(VALID_DECISION_STATUSES).toContain('pending');
      expect(VALID_DECISION_STATUSES).toContain('validated');
      expect(VALID_DECISION_STATUSES).toContain('abandoned');
    });
  });

  describe('Decision Status Transitions', () => {
    it('should allow transition from pending to validated', () => {
      expect(canTransitionDecisionStatus('pending', 'validated')).toBe(true);
    });

    it('should allow transition from pending to abandoned', () => {
      expect(canTransitionDecisionStatus('pending', 'abandoned')).toBe(true);
    });

    it('should not allow transition from validated', () => {
      expect(canTransitionDecisionStatus('validated', 'pending')).toBe(false);
      expect(canTransitionDecisionStatus('validated', 'abandoned')).toBe(false);
    });

    it('should not allow transition from abandoned', () => {
      expect(canTransitionDecisionStatus('abandoned', 'pending')).toBe(false);
      expect(canTransitionDecisionStatus('abandoned', 'validated')).toBe(false);
    });

    it('should not allow same-status transition', () => {
      expect(canTransitionDecisionStatus('pending', 'pending')).toBe(false);
      expect(canTransitionDecisionStatus('validated', 'validated')).toBe(false);
    });
  });

  describe('DB to UI Conversion', () => {
    it('should correctly map DB fields to UI fields', () => {
      const dbDecision = createMockTraceOSDecision() as DBDecision;
      const uiDecision = dbToUIDecision(dbDecision);

      expect(uiDecision.id).toBe(dbDecision.id);
      expect(uiDecision.title).toBe(dbDecision.title);
      expect(uiDecision.context).toBe(dbDecision.context);
      expect(uiDecision.mainHypothesis).toBe(dbDecision.main_hypothesis);
      expect(uiDecision.alternativeHypotheses).toEqual(dbDecision.alternative_hypotheses);
      expect(uiDecision.constraints).toEqual(dbDecision.constraints);
      expect(uiDecision.decision).toBe(dbDecision.decision);
      expect(uiDecision.date).toBe(dbDecision.decision_date);
      expect(uiDecision.author).toBe(dbDecision.author);
      expect(uiDecision.scope).toBe(dbDecision.scope);
      expect(uiDecision.status).toBe(dbDecision.status);
      expect(uiDecision.abandonedBranches).toEqual(dbDecision.abandoned_branches);
    });

    it('should initialize empty children array', () => {
      const dbDecision = createMockTraceOSDecision() as DBDecision;
      const uiDecision = dbToUIDecision(dbDecision);

      expect(uiDecision.children).toBeDefined();
      expect(uiDecision.children).toHaveLength(0);
    });

    it('should accept provided children array', () => {
      const dbDecision = createMockTraceOSDecision() as DBDecision;
      const childDecision = dbToUIDecision(createMockTraceOSDecision({ id: 'child-1' }) as DBDecision);
      const uiDecision = dbToUIDecision(dbDecision, [childDecision]);

      expect(uiDecision.children).toHaveLength(1);
      expect(uiDecision.children![0].id).toBe('child-1');
    });

    it('should handle null arrays by defaulting to empty', () => {
      const dbDecision = {
        ...createMockTraceOSDecision(),
        alternative_hypotheses: null,
        constraints: null,
        abandoned_branches: null,
      } as unknown as DBDecision;

      const uiDecision = dbToUIDecision(dbDecision);

      expect(uiDecision.alternativeHypotheses).toEqual([]);
      expect(uiDecision.constraints).toEqual([]);
      expect(uiDecision.abandonedBranches).toEqual([]);
    });
  });

  describe('Decision Tree Building', () => {
    it('should build tree from flat list with parent-child relationships', () => {
      const decisions: DBDecision[] = [
        createMockTraceOSDecision({ id: 'root-1', parent_id: null, decision_date: '2024-01-15' }) as DBDecision,
        createMockTraceOSDecision({ id: 'child-1', parent_id: 'root-1', decision_date: '2024-01-16' }) as DBDecision,
        createMockTraceOSDecision({ id: 'child-2', parent_id: 'root-1', decision_date: '2024-01-17' }) as DBDecision,
      ];

      const tree = buildDecisionTree(decisions);

      expect(tree).toHaveLength(1);
      expect(tree[0].id).toBe('root-1');
      expect(tree[0].children).toHaveLength(2);
    });

    it('should handle multiple root decisions', () => {
      const decisions: DBDecision[] = [
        createMockTraceOSDecision({ id: 'root-1', parent_id: null, decision_date: '2024-01-15' }) as DBDecision,
        createMockTraceOSDecision({ id: 'root-2', parent_id: null, decision_date: '2024-01-20' }) as DBDecision,
      ];

      const tree = buildDecisionTree(decisions);

      expect(tree).toHaveLength(2);
    });

    it('should sort root decisions by date descending', () => {
      const decisions: DBDecision[] = [
        createMockTraceOSDecision({ id: 'old', parent_id: null, decision_date: '2024-01-01' }) as DBDecision,
        createMockTraceOSDecision({ id: 'new', parent_id: null, decision_date: '2024-01-20' }) as DBDecision,
        createMockTraceOSDecision({ id: 'mid', parent_id: null, decision_date: '2024-01-10' }) as DBDecision,
      ];

      const tree = buildDecisionTree(decisions);

      expect(tree[0].id).toBe('new');
      expect(tree[1].id).toBe('mid');
      expect(tree[2].id).toBe('old');
    });

    it('should build nested tree structure', () => {
      const decisions: DBDecision[] = [
        createMockTraceOSDecision({ id: 'root', parent_id: null }) as DBDecision,
        createMockTraceOSDecision({ id: 'level-1', parent_id: 'root' }) as DBDecision,
        createMockTraceOSDecision({ id: 'level-2', parent_id: 'level-1' }) as DBDecision,
        createMockTraceOSDecision({ id: 'level-3', parent_id: 'level-2' }) as DBDecision,
      ];

      const tree = buildDecisionTree(decisions);

      expect(tree[0].children![0].children![0].children![0].id).toBe('level-3');
    });

    it('should handle orphan decisions as roots', () => {
      const decisions: DBDecision[] = [
        createMockTraceOSDecision({ id: 'orphan', parent_id: 'non-existent' }) as DBDecision,
      ];

      const tree = buildDecisionTree(decisions);

      expect(tree).toHaveLength(1);
      expect(tree[0].id).toBe('orphan');
    });

    it('should return empty array for empty input', () => {
      const tree = buildDecisionTree([]);
      expect(tree).toHaveLength(0);
    });
  });

  describe('Decision Search', () => {
    const tree = buildDecisionTree([
      createMockTraceOSDecision({ id: 'root', parent_id: null }) as DBDecision,
      createMockTraceOSDecision({ id: 'child-1', parent_id: 'root' }) as DBDecision,
      createMockTraceOSDecision({ id: 'grandchild-1', parent_id: 'child-1' }) as DBDecision,
    ]);

    it('should find root decision by id', () => {
      const found = findDecisionById(tree, 'root');
      expect(found).toBeDefined();
      expect(found!.id).toBe('root');
    });

    it('should find nested decision by id', () => {
      const found = findDecisionById(tree, 'grandchild-1');
      expect(found).toBeDefined();
      expect(found!.id).toBe('grandchild-1');
    });

    it('should return undefined for non-existent id', () => {
      const found = findDecisionById(tree, 'non-existent');
      expect(found).toBeUndefined();
    });

    it('should work with empty tree', () => {
      const found = findDecisionById([], 'any-id');
      expect(found).toBeUndefined();
    });
  });

  describe('Decision Depth Calculation', () => {
    const tree = buildDecisionTree([
      createMockTraceOSDecision({ id: 'root', parent_id: null }) as DBDecision,
      createMockTraceOSDecision({ id: 'level-1', parent_id: 'root' }) as DBDecision,
      createMockTraceOSDecision({ id: 'level-2', parent_id: 'level-1' }) as DBDecision,
    ]);

    it('should return 0 for root decision', () => {
      expect(getDecisionDepth(tree, 'root')).toBe(0);
    });

    it('should return correct depth for nested decisions', () => {
      expect(getDecisionDepth(tree, 'level-1')).toBe(1);
      expect(getDecisionDepth(tree, 'level-2')).toBe(2);
    });

    it('should return -1 for non-existent decision', () => {
      expect(getDecisionDepth(tree, 'non-existent')).toBe(-1);
    });
  });

  describe('Decision Path Finding', () => {
    const tree = buildDecisionTree([
      createMockTraceOSDecision({ id: 'root', parent_id: null }) as DBDecision,
      createMockTraceOSDecision({ id: 'child', parent_id: 'root' }) as DBDecision,
      createMockTraceOSDecision({ id: 'grandchild', parent_id: 'child' }) as DBDecision,
    ]);

    it('should return path to root decision', () => {
      const path = getDecisionPath(tree, 'root');
      expect(path).toHaveLength(1);
      expect(path![0].id).toBe('root');
    });

    it('should return full path to nested decision', () => {
      const path = getDecisionPath(tree, 'grandchild');
      expect(path).toHaveLength(3);
      expect(path![0].id).toBe('root');
      expect(path![1].id).toBe('child');
      expect(path![2].id).toBe('grandchild');
    });

    it('should return null for non-existent decision', () => {
      const path = getDecisionPath(tree, 'non-existent');
      expect(path).toBeNull();
    });
  });

  describe('Decision Counting', () => {
    it('should count all decisions in tree', () => {
      const tree = buildDecisionTree([
        createMockTraceOSDecision({ id: 'root', parent_id: null }) as DBDecision,
        createMockTraceOSDecision({ id: 'child-1', parent_id: 'root' }) as DBDecision,
        createMockTraceOSDecision({ id: 'child-2', parent_id: 'root' }) as DBDecision,
        createMockTraceOSDecision({ id: 'grandchild', parent_id: 'child-1' }) as DBDecision,
      ]);

      expect(countDecisions(tree)).toBe(4);
    });

    it('should return 0 for empty tree', () => {
      expect(countDecisions([])).toBe(0);
    });

    it('should count single decision', () => {
      const tree = buildDecisionTree([
        createMockTraceOSDecision({ id: 'single', parent_id: null }) as DBDecision,
      ]);

      expect(countDecisions(tree)).toBe(1);
    });
  });

  describe('Decision Validation', () => {
    it('should pass validation for complete decision data', () => {
      const decision = createMockTraceOSDecision();
      const errors = validateDecision(decision);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation for missing title', () => {
      const decision = createMockTraceOSDecision({ title: '' });
      const errors = validateDecision(decision);
      expect(errors).toContain('Title is required');
    });

    it('should fail validation for missing context', () => {
      const decision = createMockTraceOSDecision({ context: '' });
      const errors = validateDecision(decision);
      expect(errors).toContain('Context is required');
    });

    it('should fail validation for missing main hypothesis', () => {
      const decision = createMockTraceOSDecision({ main_hypothesis: '' });
      const errors = validateDecision(decision);
      expect(errors).toContain('Main hypothesis is required');
    });

    it('should fail validation for missing decision', () => {
      const decision = createMockTraceOSDecision({ decision: '' });
      const errors = validateDecision(decision);
      expect(errors).toContain('Decision is required');
    });

    it('should fail validation for missing author', () => {
      const decision = createMockTraceOSDecision({ author: '' });
      const errors = validateDecision(decision);
      expect(errors).toContain('Author is required');
    });

    it('should fail validation for missing scope', () => {
      const decision = createMockTraceOSDecision({ scope: '' });
      const errors = validateDecision(decision);
      expect(errors).toContain('Scope is required');
    });

    it('should fail validation for invalid status', () => {
      const decision = { ...createMockTraceOSDecision(), status: 'invalid' as DecisionStatus };
      const errors = validateDecision(decision);
      expect(errors).toContain('Invalid status');
    });
  });

  describe('Abandoned Branch Validation', () => {
    it('should pass validation for complete branch data', () => {
      const branch = { title: 'Alternative Path', reason: 'Cost too high' };
      const errors = validateAbandonedBranch(branch);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation for missing title', () => {
      const branch = { title: '', reason: 'Some reason' };
      const errors = validateAbandonedBranch(branch);
      expect(errors).toContain('Branch title is required');
    });

    it('should fail validation for missing reason', () => {
      const branch = { title: 'Some title', reason: '' };
      const errors = validateAbandonedBranch(branch);
      expect(errors).toContain('Branch abandonment reason is required');
    });
  });

  describe('Decision Scenarios', () => {
    it('should handle strategic expansion decision tree', () => {
      const decisions: DBDecision[] = [
        createMockTraceOSDecision({
          id: 'expansion',
          parent_id: null,
          title: 'International Expansion',
          main_hypothesis: 'European market entry',
        }) as DBDecision,
        createMockTraceOSDecision({
          id: 'market-france',
          parent_id: 'expansion',
          title: 'France Market Entry',
          main_hypothesis: 'Paris-based operation',
        }) as DBDecision,
        createMockTraceOSDecision({
          id: 'market-germany',
          parent_id: 'expansion',
          title: 'Germany Market Entry',
          main_hypothesis: 'Berlin-based operation',
        }) as DBDecision,
      ];

      const tree = buildDecisionTree(decisions);

      expect(tree[0].title).toBe('International Expansion');
      expect(tree[0].children).toHaveLength(2);
    });

    it('should track abandoned branches with reasons', () => {
      const decision = createMockTraceOSDecision({
        abandoned_branches: [
          { title: 'Asian Market Entry', reason: 'Regulatory complexity' },
          { title: 'Domestic Focus Only', reason: 'Growth limitations' },
        ],
      }) as DBDecision;

      const uiDecision = dbToUIDecision(decision);

      expect(uiDecision.abandonedBranches).toHaveLength(2);
      expect(uiDecision.abandonedBranches[0].title).toBe('Asian Market Entry');
      expect(uiDecision.abandonedBranches[0].reason).toBe('Regulatory complexity');
    });

    it('should maintain decision audit trail through tree', () => {
      const decisions: DBDecision[] = [
        createMockTraceOSDecision({
          id: 'root',
          parent_id: null,
          author: 'CEO',
          decision_date: '2024-01-01',
        }) as DBDecision,
        createMockTraceOSDecision({
          id: 'child',
          parent_id: 'root',
          author: 'CTO',
          decision_date: '2024-01-15',
        }) as DBDecision,
      ];

      const tree = buildDecisionTree(decisions);
      const path = getDecisionPath(tree, 'child');

      expect(path).toHaveLength(2);
      expect(path![0].author).toBe('CEO');
      expect(path![1].author).toBe('CTO');
    });
  });
});
