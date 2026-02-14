/**
 * API Monitoring & Error Tracking
 * Centralizes API error logging and performance monitoring
 */

interface ApiError {
  message: string;
  endpoint: string;
  timestamp: Date;
  statusCode?: number;
  userId?: string;
}

interface ApiMetric {
  endpoint: string;
  duration: number;
  success: boolean;
  timestamp: Date;
}

const MAX_ERRORS = 50;
const MAX_METRICS = 100;

class ApiMonitor {
  private errors: ApiError[] = [];
  private metrics: ApiMetric[] = [];
  private listeners: Set<(errors: ApiError[]) => void> = new Set();

  logError(error: Omit<ApiError, 'timestamp'>) {
    const apiError: ApiError = {
      ...error,
      timestamp: new Date(),
    };
    
    this.errors = [apiError, ...this.errors].slice(0, MAX_ERRORS);
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('[API Error]', error.endpoint, error.message);
    }
    
    // Notify listeners
    this.listeners.forEach(listener => listener(this.errors));
  }

  logMetric(metric: Omit<ApiMetric, 'timestamp'>) {
    const apiMetric: ApiMetric = {
      ...metric,
      timestamp: new Date(),
    };
    
    this.metrics = [apiMetric, ...this.metrics].slice(0, MAX_METRICS);
    
    // Warn on slow requests
    if (metric.duration > 1000) {
      console.warn(`[API Slow] ${metric.endpoint}: ${metric.duration}ms`);
    }
  }

  getErrors(): ApiError[] {
    return this.errors;
  }

  getMetrics(): ApiMetric[] {
    return this.metrics;
  }

  getAverageLatency(): number {
    const successfulMetrics = this.metrics.filter(m => m.success);
    if (successfulMetrics.length === 0) return 0;
    return Math.round(
      successfulMetrics.reduce((sum, m) => sum + m.duration, 0) / successfulMetrics.length
    );
  }

  getErrorRate(): number {
    if (this.metrics.length === 0) return 0;
    const errors = this.metrics.filter(m => !m.success).length;
    return Math.round((errors / this.metrics.length) * 100);
  }

  clearErrors() {
    this.errors = [];
    this.listeners.forEach(listener => listener(this.errors));
  }

  subscribe(listener: (errors: ApiError[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const apiMonitor = new ApiMonitor();

/**
 * Wrapper for Supabase calls with automatic monitoring
 */
export async function withMonitoring<T>(
  endpoint: string,
  operation: () => Promise<{ data: T | null; error: { message: string; code?: string } | null }>
): Promise<{ data: T | null; error: { message: string; code?: string } | null }> {
  const start = performance.now();
  
  try {
    const result = await operation();
    const duration = Math.round(performance.now() - start);
    
    apiMonitor.logMetric({
      endpoint,
      duration,
      success: !result.error,
    });
    
    if (result.error) {
      apiMonitor.logError({
        endpoint,
        message: result.error.message,
        statusCode: result.error.code ? parseInt(result.error.code, 10) : undefined,
      });
    }
    
    return result;
  } catch (error) {
    const duration = Math.round(performance.now() - start);
    
    apiMonitor.logMetric({
      endpoint,
      duration,
      success: false,
    });
    
    const message = error instanceof Error ? error.message : 'Unknown error';
    apiMonitor.logError({ endpoint, message });
    
    return { data: null, error: { message } };
  }
}
