/**
 * Analytics Service - Tracking and metrics logic
 */

export interface AnalyticsEvent {
  category: string;
  name: string;
  metadata?: Record<string, unknown>;
  pagePath?: string;
}

export interface SessionMetrics {
  sessionId: string;
  duration: number;
  pageViews: number;
  events: number;
}

/**
 * Sanitize analytics event before sending
 */
export function sanitizeEvent(event: AnalyticsEvent): AnalyticsEvent {
  return {
    category: event.category.slice(0, 50),
    name: event.name.slice(0, 100),
    metadata: event.metadata ? JSON.parse(JSON.stringify(event.metadata)) : undefined,
    pagePath: event.pagePath?.slice(0, 255),
  };
}

/**
 * Calculate session duration in seconds
 */
export function calculateSessionDuration(startTime: Date, endTime: Date): number {
  return Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
}

/**
 * Generate anonymous session ID
 */
export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Check if session is expired (30 minutes of inactivity)
 */
export function isSessionExpired(lastActivity: Date, maxInactivityMs = 30 * 60 * 1000): boolean {
  return Date.now() - lastActivity.getTime() > maxInactivityMs;
}
