/**
 * Shared types across all domains.
 * Keep this file minimal — only put primitives that 2+ domains genuinely need.
 */

export type DomainName =
  | 'auth'
  | 'country'
  | 'exit-keys'
  | 'governance'
  | 'observability';

export interface ModuleContext {
  sourceModule: string;
  targetModule: string;
  data: Record<string, unknown>;
  timestamp: number;
}
