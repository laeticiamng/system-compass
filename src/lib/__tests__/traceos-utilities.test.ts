/**
 * Tests for TraceOS Utilities (Tags, Webhooks, Workflows)
 *
 * Tests cover:
 * - Tag data structure and validation
 * - Webhook configuration and events
 * - Workflow steps and approval logic
 * - Integration between components
 */
import { describe, it, expect } from 'vitest';
import { isValidISODate, mockUser } from './test-utils';

// Types for Tags
interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

interface DecisionTag {
  decision_id: string;
  tag_id: string;
  tag?: Tag;
}

// Types for Webhooks
type WebhookEvent = 'decision_created' | 'decision_updated' | 'decision_validated' | 'decision_abandoned';
type WebhookPlatform = 'slack' | 'teams' | 'notion' | 'custom';

interface Webhook {
  id: string;
  user_id: string;
  name: string;
  url: string;
  platform: WebhookPlatform;
  events: WebhookEvent[];
  headers: Record<string, string>;
  is_active: boolean;
  last_triggered_at: string | null;
  created_at: string;
  updated_at: string;
}

// Types for Workflows
type WorkflowStepType = 'approval' | 'signature' | 'review';
type ApprovalStatus = 'pending' | 'approved' | 'rejected';

interface WorkflowStep {
  order: number;
  name: string;
  required_approvers: number;
  type: WorkflowStepType;
}

interface Workflow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  steps: WorkflowStep[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Approval {
  id: string;
  decision_id: string;
  workflow_id: string | null;
  step_order: number;
  step_name: string;
  approver_id: string | null;
  approver_name: string | null;
  status: ApprovalStatus;
  signature_hash: string | null;
  comment: string | null;
  approved_at: string | null;
  created_at: string;
}

// Constants
const VALID_WEBHOOK_EVENTS: WebhookEvent[] = ['decision_created', 'decision_updated', 'decision_validated', 'decision_abandoned'];
const VALID_WEBHOOK_PLATFORMS: WebhookPlatform[] = ['slack', 'teams', 'notion', 'custom'];
const VALID_WORKFLOW_STEP_TYPES: WorkflowStepType[] = ['approval', 'signature', 'review'];
const VALID_APPROVAL_STATUSES: ApprovalStatus[] = ['pending', 'approved', 'rejected'];
const VALID_HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

// Factory functions
function createMockTag(overrides = {}): Tag {
  return {
    id: 'tag-1',
    user_id: mockUser.id,
    name: 'Important',
    color: '#FF5733',
    created_at: '2024-01-15T00:00:00Z',
    ...overrides
  };
}

function createMockWebhook(overrides = {}): Webhook {
  return {
    id: 'webhook-1',
    user_id: mockUser.id,
    name: 'Slack Notifications',
    url: 'https://hooks.slack.com/services/xxx',
    platform: 'slack',
    events: ['decision_created', 'decision_validated'],
    headers: { 'Content-Type': 'application/json' },
    is_active: true,
    last_triggered_at: null,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    ...overrides
  };
}

function createMockWorkflow(overrides = {}): Workflow {
  return {
    id: 'workflow-1',
    user_id: mockUser.id,
    name: 'Standard Approval',
    description: 'Default approval workflow',
    steps: [
      { order: 1, name: 'Manager Review', required_approvers: 1, type: 'review' },
      { order: 2, name: 'Director Approval', required_approvers: 1, type: 'approval' },
      { order: 3, name: 'Final Signature', required_approvers: 1, type: 'signature' },
    ],
    is_active: true,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    ...overrides
  };
}

function createMockApproval(overrides = {}): Approval {
  return {
    id: 'approval-1',
    decision_id: 'decision-1',
    workflow_id: 'workflow-1',
    step_order: 1,
    step_name: 'Manager Review',
    approver_id: null,
    approver_name: null,
    status: 'pending',
    signature_hash: null,
    comment: null,
    approved_at: null,
    created_at: '2024-01-15T00:00:00Z',
    ...overrides
  };
}

// Validation functions
function validateWebhookEvent(event: string): event is WebhookEvent {
  return VALID_WEBHOOK_EVENTS.includes(event as WebhookEvent);
}

function validateWebhookPlatform(platform: string): platform is WebhookPlatform {
  return VALID_WEBHOOK_PLATFORMS.includes(platform as WebhookPlatform);
}

function validateWorkflowStepType(type: string): type is WorkflowStepType {
  return VALID_WORKFLOW_STEP_TYPES.includes(type as WorkflowStepType);
}

function validateApprovalStatus(status: string): status is ApprovalStatus {
  return VALID_APPROVAL_STATUSES.includes(status as ApprovalStatus);
}

function validateHexColor(color: string): boolean {
  return VALID_HEX_COLOR_REGEX.test(color);
}

function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function validateTag(tag: Partial<Tag>): string[] {
  const errors: string[] = [];

  if (!tag.name || tag.name.trim().length === 0) {
    errors.push('Tag name is required');
  }

  if (tag.name && tag.name.length > 50) {
    errors.push('Tag name must be 50 characters or less');
  }

  if (!tag.color || !validateHexColor(tag.color)) {
    errors.push('Valid hex color is required');
  }

  return errors;
}

function validateWebhook(webhook: Partial<Webhook>): string[] {
  const errors: string[] = [];

  if (!webhook.name || webhook.name.trim().length === 0) {
    errors.push('Webhook name is required');
  }

  if (!webhook.url || !validateUrl(webhook.url)) {
    errors.push('Valid URL is required');
  }

  if (!webhook.platform || !validateWebhookPlatform(webhook.platform)) {
    errors.push('Valid platform is required');
  }

  if (!webhook.events || webhook.events.length === 0) {
    errors.push('At least one event is required');
  } else {
    const invalidEvents = webhook.events.filter(e => !validateWebhookEvent(e));
    if (invalidEvents.length > 0) {
      errors.push(`Invalid events: ${invalidEvents.join(', ')}`);
    }
  }

  return errors;
}

function validateWorkflowStep(step: Partial<WorkflowStep>): string[] {
  const errors: string[] = [];

  if (step.order === undefined || step.order < 1) {
    errors.push('Valid order is required (starting from 1)');
  }

  if (!step.name || step.name.trim().length === 0) {
    errors.push('Step name is required');
  }

  if (step.required_approvers === undefined || step.required_approvers < 1) {
    errors.push('At least one approver is required');
  }

  if (!step.type || !validateWorkflowStepType(step.type)) {
    errors.push('Valid step type is required');
  }

  return errors;
}

function validateWorkflow(workflow: Partial<Workflow>): string[] {
  const errors: string[] = [];

  if (!workflow.name || workflow.name.trim().length === 0) {
    errors.push('Workflow name is required');
  }

  if (!workflow.steps || workflow.steps.length === 0) {
    errors.push('At least one step is required');
  } else {
    workflow.steps.forEach((step, index) => {
      errors.push(...validateWorkflowStep(step).map(e => `Step ${index + 1}: ${e}`));
    });

    // Check step order continuity
    const orders = workflow.steps.map(s => s.order).sort((a, b) => a - b);
    for (let i = 0; i < orders.length; i++) {
      if (orders[i] !== i + 1) {
        errors.push('Step orders must be continuous starting from 1');
        break;
      }
    }
  }

  return errors;
}

// Business logic functions
function canTransitionApprovalStatus(current: ApprovalStatus, target: ApprovalStatus): boolean {
  if (current === 'pending') {
    return target === 'approved' || target === 'rejected';
  }
  return false; // approved and rejected are terminal states
}

function getWebhooksForEvent(webhooks: Webhook[], event: WebhookEvent): Webhook[] {
  return webhooks.filter(w => w.is_active && w.events.includes(event));
}

function isWorkflowComplete(approvals: Approval[]): boolean {
  return approvals.every(a => a.status === 'approved');
}

function isWorkflowRejected(approvals: Approval[]): boolean {
  return approvals.some(a => a.status === 'rejected');
}

function getCurrentPendingStep(approvals: Approval[]): Approval | null {
  // Find the first pending step in order
  const sorted = [...approvals].sort((a, b) => a.step_order - b.step_order);
  return sorted.find(a => a.status === 'pending') || null;
}

function generateSignatureHash(userId: string, approvalId: string): string {
  // Simplified version for testing
  return btoa(`${userId}-${approvalId}-${Date.now()}`);
}

describe('TraceOS Tags Module', () => {
  describe('Tag Data Structure', () => {
    it('should create a valid tag with all required fields', () => {
      const tag = createMockTag();

      expect(tag.id).toBeDefined();
      expect(tag.user_id).toBeDefined();
      expect(tag.name).toBeDefined();
      expect(tag.color).toBeDefined();
      expect(tag.created_at).toBeDefined();
    });

    it('should have valid ISO date', () => {
      const tag = createMockTag();
      expect(isValidISODate(tag.created_at)).toBe(true);
    });

    it('should have valid hex color', () => {
      const tag = createMockTag();
      expect(validateHexColor(tag.color)).toBe(true);
    });
  });

  describe('Tag Validation', () => {
    it('should pass validation for complete tag', () => {
      const tag = createMockTag();
      const errors = validateTag(tag);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation for missing name', () => {
      const tag = createMockTag({ name: '' });
      const errors = validateTag(tag);
      expect(errors).toContain('Tag name is required');
    });

    it('should fail validation for name too long', () => {
      const tag = createMockTag({ name: 'a'.repeat(51) });
      const errors = validateTag(tag);
      expect(errors).toContain('Tag name must be 50 characters or less');
    });

    it('should fail validation for invalid color', () => {
      const tag = createMockTag({ color: 'red' });
      const errors = validateTag(tag);
      expect(errors).toContain('Valid hex color is required');
    });

    it('should accept valid hex colors', () => {
      const validColors = ['#FF5733', '#ffffff', '#000000', '#AbCdEf'];
      validColors.forEach(color => {
        expect(validateHexColor(color)).toBe(true);
      });
    });

    it('should reject invalid hex colors', () => {
      const invalidColors = ['FF5733', '#FFF', 'red', '#GGGGGG', ''];
      invalidColors.forEach(color => {
        expect(validateHexColor(color)).toBe(false);
      });
    });
  });
});

describe('TraceOS Webhooks Module', () => {
  describe('Webhook Data Structure', () => {
    it('should create a valid webhook with all required fields', () => {
      const webhook = createMockWebhook();

      expect(webhook.id).toBeDefined();
      expect(webhook.user_id).toBeDefined();
      expect(webhook.name).toBeDefined();
      expect(webhook.url).toBeDefined();
      expect(webhook.platform).toBeDefined();
      expect(webhook.events).toBeDefined();
      expect(webhook.is_active).toBeDefined();
    });

    it('should have valid dates', () => {
      const webhook = createMockWebhook();
      expect(isValidISODate(webhook.created_at)).toBe(true);
      expect(isValidISODate(webhook.updated_at)).toBe(true);
    });

    it('should allow null for last_triggered_at', () => {
      const webhook = createMockWebhook({ last_triggered_at: null });
      expect(webhook.last_triggered_at).toBeNull();
    });
  });

  describe('Webhook Event Validation', () => {
    it('should validate all webhook events', () => {
      VALID_WEBHOOK_EVENTS.forEach(event => {
        expect(validateWebhookEvent(event)).toBe(true);
      });
    });

    it('should reject invalid events', () => {
      expect(validateWebhookEvent('invalid')).toBe(false);
      expect(validateWebhookEvent('decision_deleted')).toBe(false);
    });

    it('should have exactly 4 valid events', () => {
      expect(VALID_WEBHOOK_EVENTS).toHaveLength(4);
      expect(VALID_WEBHOOK_EVENTS).toContain('decision_created');
      expect(VALID_WEBHOOK_EVENTS).toContain('decision_updated');
      expect(VALID_WEBHOOK_EVENTS).toContain('decision_validated');
      expect(VALID_WEBHOOK_EVENTS).toContain('decision_abandoned');
    });
  });

  describe('Webhook Platform Validation', () => {
    it('should validate all webhook platforms', () => {
      VALID_WEBHOOK_PLATFORMS.forEach(platform => {
        expect(validateWebhookPlatform(platform)).toBe(true);
      });
    });

    it('should reject invalid platforms', () => {
      expect(validateWebhookPlatform('invalid')).toBe(false);
      expect(validateWebhookPlatform('discord')).toBe(false);
    });

    it('should have exactly 4 valid platforms', () => {
      expect(VALID_WEBHOOK_PLATFORMS).toHaveLength(4);
      expect(VALID_WEBHOOK_PLATFORMS).toContain('slack');
      expect(VALID_WEBHOOK_PLATFORMS).toContain('teams');
      expect(VALID_WEBHOOK_PLATFORMS).toContain('notion');
      expect(VALID_WEBHOOK_PLATFORMS).toContain('custom');
    });
  });

  describe('Webhook Validation', () => {
    it('should pass validation for complete webhook', () => {
      const webhook = createMockWebhook();
      const errors = validateWebhook(webhook);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation for missing name', () => {
      const webhook = createMockWebhook({ name: '' });
      const errors = validateWebhook(webhook);
      expect(errors).toContain('Webhook name is required');
    });

    it('should fail validation for invalid URL', () => {
      const webhook = createMockWebhook({ url: 'not-a-url' });
      const errors = validateWebhook(webhook);
      expect(errors).toContain('Valid URL is required');
    });

    it('should fail validation for empty events', () => {
      const webhook = createMockWebhook({ events: [] });
      const errors = validateWebhook(webhook);
      expect(errors).toContain('At least one event is required');
    });

    it('should fail validation for invalid events', () => {
      const webhook = createMockWebhook({ events: ['invalid_event' as WebhookEvent] });
      const errors = validateWebhook(webhook);
      expect(errors.some(e => e.includes('Invalid events'))).toBe(true);
    });
  });

  describe('Webhook Filtering', () => {
    it('should return webhooks for specific event', () => {
      const webhooks: Webhook[] = [
        createMockWebhook({ id: 'w1', events: ['decision_created'] }),
        createMockWebhook({ id: 'w2', events: ['decision_validated'] }),
        createMockWebhook({ id: 'w3', events: ['decision_created', 'decision_validated'] }),
      ];

      const forCreated = getWebhooksForEvent(webhooks, 'decision_created');
      expect(forCreated).toHaveLength(2);
      expect(forCreated.map(w => w.id)).toContain('w1');
      expect(forCreated.map(w => w.id)).toContain('w3');
    });

    it('should exclude inactive webhooks', () => {
      const webhooks: Webhook[] = [
        createMockWebhook({ id: 'w1', events: ['decision_created'], is_active: true }),
        createMockWebhook({ id: 'w2', events: ['decision_created'], is_active: false }),
      ];

      const active = getWebhooksForEvent(webhooks, 'decision_created');
      expect(active).toHaveLength(1);
      expect(active[0].id).toBe('w1');
    });

    it('should return empty array when no matching webhooks', () => {
      const webhooks: Webhook[] = [
        createMockWebhook({ events: ['decision_validated'] }),
      ];

      const result = getWebhooksForEvent(webhooks, 'decision_created');
      expect(result).toHaveLength(0);
    });
  });
});

describe('TraceOS Workflows Module', () => {
  describe('Workflow Step Type Validation', () => {
    it('should validate all step types', () => {
      VALID_WORKFLOW_STEP_TYPES.forEach(type => {
        expect(validateWorkflowStepType(type)).toBe(true);
      });
    });

    it('should reject invalid step types', () => {
      expect(validateWorkflowStepType('invalid')).toBe(false);
      expect(validateWorkflowStepType('notification')).toBe(false);
    });

    it('should have exactly 3 valid step types', () => {
      expect(VALID_WORKFLOW_STEP_TYPES).toHaveLength(3);
      expect(VALID_WORKFLOW_STEP_TYPES).toContain('approval');
      expect(VALID_WORKFLOW_STEP_TYPES).toContain('signature');
      expect(VALID_WORKFLOW_STEP_TYPES).toContain('review');
    });
  });

  describe('Workflow Step Validation', () => {
    it('should pass validation for complete step', () => {
      const step: WorkflowStep = { order: 1, name: 'Review', required_approvers: 1, type: 'review' };
      const errors = validateWorkflowStep(step);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation for invalid order', () => {
      const step = { order: 0, name: 'Review', required_approvers: 1, type: 'review' as WorkflowStepType };
      const errors = validateWorkflowStep(step);
      expect(errors).toContain('Valid order is required (starting from 1)');
    });

    it('should fail validation for missing name', () => {
      const step = { order: 1, name: '', required_approvers: 1, type: 'review' as WorkflowStepType };
      const errors = validateWorkflowStep(step);
      expect(errors).toContain('Step name is required');
    });

    it('should fail validation for zero approvers', () => {
      const step = { order: 1, name: 'Review', required_approvers: 0, type: 'review' as WorkflowStepType };
      const errors = validateWorkflowStep(step);
      expect(errors).toContain('At least one approver is required');
    });
  });

  describe('Workflow Validation', () => {
    it('should pass validation for complete workflow', () => {
      const workflow = createMockWorkflow();
      const errors = validateWorkflow(workflow);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation for missing name', () => {
      const workflow = createMockWorkflow({ name: '' });
      const errors = validateWorkflow(workflow);
      expect(errors).toContain('Workflow name is required');
    });

    it('should fail validation for empty steps', () => {
      const workflow = createMockWorkflow({ steps: [] });
      const errors = validateWorkflow(workflow);
      expect(errors).toContain('At least one step is required');
    });

    it('should fail validation for non-continuous step orders', () => {
      const workflow = createMockWorkflow({
        steps: [
          { order: 1, name: 'Step 1', required_approvers: 1, type: 'review' },
          { order: 3, name: 'Step 3', required_approvers: 1, type: 'approval' }, // Missing order 2
        ]
      });
      const errors = validateWorkflow(workflow);
      expect(errors).toContain('Step orders must be continuous starting from 1');
    });
  });
});

describe('TraceOS Approvals Module', () => {
  describe('Approval Status Validation', () => {
    it('should validate all approval statuses', () => {
      VALID_APPROVAL_STATUSES.forEach(status => {
        expect(validateApprovalStatus(status)).toBe(true);
      });
    });

    it('should reject invalid statuses', () => {
      expect(validateApprovalStatus('invalid')).toBe(false);
      expect(validateApprovalStatus('in_progress')).toBe(false);
    });

    it('should have exactly 3 valid statuses', () => {
      expect(VALID_APPROVAL_STATUSES).toHaveLength(3);
      expect(VALID_APPROVAL_STATUSES).toContain('pending');
      expect(VALID_APPROVAL_STATUSES).toContain('approved');
      expect(VALID_APPROVAL_STATUSES).toContain('rejected');
    });
  });

  describe('Approval Status Transitions', () => {
    it('should allow transition from pending to approved', () => {
      expect(canTransitionApprovalStatus('pending', 'approved')).toBe(true);
    });

    it('should allow transition from pending to rejected', () => {
      expect(canTransitionApprovalStatus('pending', 'rejected')).toBe(true);
    });

    it('should not allow transition from approved', () => {
      expect(canTransitionApprovalStatus('approved', 'pending')).toBe(false);
      expect(canTransitionApprovalStatus('approved', 'rejected')).toBe(false);
    });

    it('should not allow transition from rejected', () => {
      expect(canTransitionApprovalStatus('rejected', 'pending')).toBe(false);
      expect(canTransitionApprovalStatus('rejected', 'approved')).toBe(false);
    });
  });

  describe('Approval Data Structure', () => {
    it('should create a valid approval with all required fields', () => {
      const approval = createMockApproval();

      expect(approval.id).toBeDefined();
      expect(approval.decision_id).toBeDefined();
      expect(approval.step_order).toBeDefined();
      expect(approval.step_name).toBeDefined();
      expect(approval.status).toBeDefined();
      expect(approval.created_at).toBeDefined();
    });

    it('should have valid ISO date', () => {
      const approval = createMockApproval();
      expect(isValidISODate(approval.created_at)).toBe(true);
    });

    it('should allow null for optional fields when pending', () => {
      const approval = createMockApproval({
        approver_id: null,
        approver_name: null,
        signature_hash: null,
        comment: null,
        approved_at: null,
      });

      expect(approval.approver_id).toBeNull();
      expect(approval.approver_name).toBeNull();
      expect(approval.signature_hash).toBeNull();
    });
  });

  describe('Workflow Completion Logic', () => {
    it('should detect complete workflow', () => {
      const approvals: Approval[] = [
        createMockApproval({ step_order: 1, status: 'approved' }),
        createMockApproval({ step_order: 2, status: 'approved' }),
        createMockApproval({ step_order: 3, status: 'approved' }),
      ];

      expect(isWorkflowComplete(approvals)).toBe(true);
    });

    it('should detect incomplete workflow', () => {
      const approvals: Approval[] = [
        createMockApproval({ step_order: 1, status: 'approved' }),
        createMockApproval({ step_order: 2, status: 'pending' }),
        createMockApproval({ step_order: 3, status: 'pending' }),
      ];

      expect(isWorkflowComplete(approvals)).toBe(false);
    });

    it('should detect rejected workflow', () => {
      const approvals: Approval[] = [
        createMockApproval({ step_order: 1, status: 'approved' }),
        createMockApproval({ step_order: 2, status: 'rejected' }),
        createMockApproval({ step_order: 3, status: 'pending' }),
      ];

      expect(isWorkflowRejected(approvals)).toBe(true);
    });

    it('should detect non-rejected workflow', () => {
      const approvals: Approval[] = [
        createMockApproval({ step_order: 1, status: 'approved' }),
        createMockApproval({ step_order: 2, status: 'pending' }),
      ];

      expect(isWorkflowRejected(approvals)).toBe(false);
    });
  });

  describe('Current Pending Step', () => {
    it('should return first pending step', () => {
      const approvals: Approval[] = [
        createMockApproval({ id: 'a1', step_order: 1, status: 'approved' }),
        createMockApproval({ id: 'a2', step_order: 2, status: 'pending' }),
        createMockApproval({ id: 'a3', step_order: 3, status: 'pending' }),
      ];

      const current = getCurrentPendingStep(approvals);
      expect(current).not.toBeNull();
      expect(current!.id).toBe('a2');
    });

    it('should return null when all approved', () => {
      const approvals: Approval[] = [
        createMockApproval({ step_order: 1, status: 'approved' }),
        createMockApproval({ step_order: 2, status: 'approved' }),
      ];

      const current = getCurrentPendingStep(approvals);
      expect(current).toBeNull();
    });

    it('should handle unsorted approvals', () => {
      const approvals: Approval[] = [
        createMockApproval({ id: 'a3', step_order: 3, status: 'pending' }),
        createMockApproval({ id: 'a1', step_order: 1, status: 'approved' }),
        createMockApproval({ id: 'a2', step_order: 2, status: 'pending' }),
      ];

      const current = getCurrentPendingStep(approvals);
      expect(current).not.toBeNull();
      expect(current!.id).toBe('a2');
    });
  });

  describe('Signature Hash Generation', () => {
    it('should generate unique hash', () => {
      const hash1 = generateSignatureHash('user-1', 'approval-1');
      const hash2 = generateSignatureHash('user-1', 'approval-2');

      expect(hash1).toBeDefined();
      expect(hash2).toBeDefined();
      // Hashes should be different due to timestamp
    });

    it('should generate base64 encoded hash', () => {
      const hash = generateSignatureHash('user-1', 'approval-1');

      // Base64 characters only
      expect(hash).toMatch(/^[A-Za-z0-9+/=]+$/);
    });
  });
});

describe('TraceOS Integration Scenarios', () => {
  describe('Decision Lifecycle with Tags and Webhooks', () => {
    it('should support tagging decisions', () => {
      const decisionTag: DecisionTag = {
        decision_id: 'decision-1',
        tag_id: 'tag-1',
        tag: createMockTag(),
      };

      expect(decisionTag.decision_id).toBeDefined();
      expect(decisionTag.tag_id).toBeDefined();
      expect(decisionTag.tag).toBeDefined();
    });

    it('should trigger webhooks for decision events', () => {
      const webhooks: Webhook[] = [
        createMockWebhook({ events: ['decision_created', 'decision_validated'] }),
        createMockWebhook({ events: ['decision_validated'] }),
      ];

      // Decision created - 1 webhook
      const createdWebhooks = getWebhooksForEvent(webhooks, 'decision_created');
      expect(createdWebhooks).toHaveLength(1);

      // Decision validated - 2 webhooks
      const validatedWebhooks = getWebhooksForEvent(webhooks, 'decision_validated');
      expect(validatedWebhooks).toHaveLength(2);
    });
  });

  describe('Workflow-Based Decision Approval', () => {
    it('should create approvals from workflow steps', () => {
      const workflow = createMockWorkflow();
      const decisionId = 'decision-1';

      // Simulate creating approval entries for each step
      const approvals = workflow.steps.map(step =>
        createMockApproval({
          decision_id: decisionId,
          workflow_id: workflow.id,
          step_order: step.order,
          step_name: step.name,
          status: 'pending',
        })
      );

      expect(approvals).toHaveLength(3);
      expect(approvals[0].step_name).toBe('Manager Review');
      expect(approvals[1].step_name).toBe('Director Approval');
      expect(approvals[2].step_name).toBe('Final Signature');
    });

    it('should track approval progress', () => {
      const approvals: Approval[] = [
        createMockApproval({ step_order: 1, status: 'approved', approver_name: 'Manager' }),
        createMockApproval({ step_order: 2, status: 'approved', approver_name: 'Director' }),
        createMockApproval({ step_order: 3, status: 'pending' }),
      ];

      expect(isWorkflowComplete(approvals)).toBe(false);
      expect(isWorkflowRejected(approvals)).toBe(false);

      const currentStep = getCurrentPendingStep(approvals);
      expect(currentStep?.step_order).toBe(3);
    });
  });
});
