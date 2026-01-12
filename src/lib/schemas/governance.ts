import { z } from 'zod';

export const GovernanceStakeholderSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  role: z.string().min(1),
  level: z.enum(['official', 'influential', 'blocker']),
  power: z.enum(['sign', 'block', 'access', 'advise']),
  reliability: z.enum(['unknown', 'low', 'medium', 'high']),
  notes: z.string().optional().nullable(),
});

export const GovernanceRedFlagSchema = z.object({
  id: z.string(),
  label: z.string(),
  severity: z.enum(['low', 'medium', 'high']),
});

export const GovernanceSchema = z.object({
  map: z.array(GovernanceStakeholderSchema),
  notes: z.string().optional().nullable(),
  redFlags: z.array(GovernanceRedFlagSchema),
});

export type GovernanceStakeholder = z.infer<typeof GovernanceStakeholderSchema>;
export type GovernanceRedFlag = z.infer<typeof GovernanceRedFlagSchema>;
export type GovernanceData = z.infer<typeof GovernanceSchema>;
