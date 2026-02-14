/**
 * PerformanceMonitor - Track and display performance metrics
 * Addresses: "Performance pas pensée" from audit requirements
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Activity, 
  Gauge, 
  Timer,
  MemoryStick,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface PerformanceMetrics {
  fps: number;
  memory: {
    usedHeap: number;
    totalHeap: number;
    limit: number;
  } | null;
  domNodes: number;
  longTasks: number;
  renderTime: number;
}

interface PerformanceMonitorProps {
  showInProduction?: boolean;
  className?: string;
}

export function PerformanceMonitor({ 
  showInProduction = false,
  className 
}: PerformanceMonitorProps) {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memory: null,
    domNodes: 0,
    longTasks: 0,
    renderTime: 0
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const rafIdRef = useRef<number>();
  const longTaskCountRef = useRef(0);

  // Only show in development by default
  const isDev = import.meta.env.DEV;

  // FPS calculation
  const measureFps = useCallback(() => {
    const now = performance.now();
    const delta = now - lastFrameTimeRef.current;
    lastFrameTimeRef.current = now;
    
    frameTimesRef.current.push(delta);
    if (frameTimesRef.current.length > 60) {
      frameTimesRef.current.shift();
    }
    
    const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
    const fps = Math.round(1000 / avgFrameTime);
    
    return fps;
  }, []);

  // Collect all metrics
  const collectMetrics = useCallback(() => {
    // FPS
    const fps = measureFps();
    
    // Memory (Chrome only)
    let memory: PerformanceMetrics['memory'] = null;
    if ('memory' in performance) {
      const mem = (performance as unknown as { 
        memory: { 
          usedJSHeapSize: number;
          totalJSHeapSize: number;
          jsHeapSizeLimit: number;
        } 
      }).memory;
      memory = {
        usedHeap: Math.round(mem.usedJSHeapSize / 1024 / 1024),
        totalHeap: Math.round(mem.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(mem.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    
    // DOM nodes
    const domNodes = document.querySelectorAll('*').length;
    
    // Render timing
    const paintEntries = performance.getEntriesByType('paint');
    const lastPaint = paintEntries[paintEntries.length - 1];
    const renderTime = lastPaint ? Math.round(lastPaint.startTime) : 0;
    
    setMetrics({
      fps,
      memory,
      domNodes,
      longTasks: longTaskCountRef.current,
      renderTime
    });
    
    rafIdRef.current = requestAnimationFrame(collectMetrics);
  }, [measureFps]);

  // Set up observers and start monitoring
  useEffect(() => {
    // Long Task Observer
    let observer: PerformanceObserver | null = null;
    if ('PerformanceObserver' in window) {
      try {
        observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) { // Tasks longer than 50ms
              longTaskCountRef.current++;
            }
          }
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch {
        // longtask not supported
      }
    }
    
    // Start FPS monitoring
    rafIdRef.current = requestAnimationFrame(collectMetrics);
    
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (observer) {
        observer.disconnect();
      }
    };
  }, [collectMetrics]);

  // Early return after all hooks
  if (!isDev && !showInProduction) return null;

  const getFpsStatus = () => {
    if (metrics.fps >= 55) return { color: 'text-green-500', icon: CheckCircle2, label: 'Excellent' };
    if (metrics.fps >= 30) return { color: 'text-amber-500', icon: AlertTriangle, label: 'Acceptable' };
    return { color: 'text-destructive', icon: AlertTriangle, label: 'Faible' };
  };

  const getMemoryStatus = () => {
    if (!metrics.memory) return null;
    const usage = (metrics.memory.usedHeap / metrics.memory.limit) * 100;
    if (usage < 50) return { color: 'text-green-500', trend: TrendingDown };
    if (usage < 80) return { color: 'text-amber-500', trend: Minus };
    return { color: 'text-destructive', trend: TrendingUp };
  };

  const getDomStatus = () => {
    if (metrics.domNodes < 1000) return 'text-green-500';
    if (metrics.domNodes < 2000) return 'text-amber-500';
    return 'text-destructive';
  };

  const fpsStatus = getFpsStatus();
  const memoryStatus = getMemoryStatus();

  // Compact badge view
  if (!isExpanded) {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          'cursor-pointer gap-1 font-mono text-xs',
          fpsStatus.color,
          className
        )}
        onClick={() => setIsExpanded(true)}
      >
        <Activity className="w-3 h-3" />
        {metrics.fps} FPS
      </Badge>
    );
  }

  // Expanded panel view
  return (
    <Card className={cn('w-64 shadow-lg', className)}>
      <CardHeader className="pb-2">
        <CardTitle 
          className="text-sm flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(false)}
        >
          <span className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-primary" />
            {t('performance.monitor', 'Performance')}
          </span>
          <Badge variant="outline" className="text-xs">DEV</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* FPS */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Activity className="w-3 h-3" />
              FPS
            </span>
            <span className={cn('font-mono font-medium', fpsStatus.color)}>
              {metrics.fps}
            </span>
          </div>
          <Progress value={(metrics.fps / 60) * 100} className="h-1.5" />
        </div>

        {/* Memory */}
        {metrics.memory && memoryStatus && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <MemoryStick className="w-3 h-3" />
                Mémoire
              </span>
              <span className={cn('font-mono font-medium flex items-center gap-1', memoryStatus.color)}>
                {metrics.memory.usedHeap}MB
                <memoryStatus.trend className="w-3 h-3" />
              </span>
            </div>
            <Progress 
              value={(metrics.memory.usedHeap / metrics.memory.limit) * 100} 
              className="h-1.5" 
            />
            <p className="text-xs text-muted-foreground">
              {metrics.memory.usedHeap} / {metrics.memory.limit} MB
            </p>
          </div>
        )}

        {/* DOM Nodes */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Nœuds DOM</span>
          <span className={cn('font-mono font-medium', getDomStatus())}>
            {metrics.domNodes.toLocaleString()}
          </span>
        </div>

        {/* Long Tasks */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Tâches longues</span>
          <span className={cn(
            'font-mono font-medium',
            metrics.longTasks > 5 ? 'text-destructive' : 'text-muted-foreground'
          )}>
            {metrics.longTasks}
          </span>
        </div>

        {/* First Paint */}
        {metrics.renderTime > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Timer className="w-3 h-3" />
              First Paint
            </span>
            <span className="font-mono font-medium">
              {metrics.renderTime}ms
            </span>
          </div>
        )}

        {/* Warnings */}
        {(metrics.fps < 30 || (metrics.memory && metrics.memory.usedHeap > metrics.memory.limit * 0.8)) && (
          <div className="p-2 rounded bg-destructive/10 border border-destructive/20">
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Performance dégradée détectée
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Hook for measuring component render time
export function useRenderTime(componentName: string) {
  const startRef = useRef(performance.now());
  
  useEffect(() => {
    const renderTime = performance.now() - startRef.current;
    if (import.meta.env.DEV && renderTime > 16) {
      console.warn(`[Performance] ${componentName} render: ${renderTime.toFixed(2)}ms`);
    }
  });
}

// Hook for debounced performance tracking
export function usePerformanceTrack() {
  const trackEvent = useCallback((eventName: string, duration: number) => {
    if (import.meta.env.DEV) {
      console.debug(`[Perf] ${eventName}: ${duration.toFixed(2)}ms`);
    }
    
    // Could send to analytics in production
    if (duration > 100) {
      // Log slow operations
      let slowOps: unknown[] = [];
      try { slowOps = JSON.parse(localStorage.getItem('slow_operations') || '[]'); } catch { /* corrupted data */ }
      slowOps.unshift({ event: eventName, duration, timestamp: Date.now() });
      localStorage.setItem('slow_operations', JSON.stringify(slowOps.slice(0, 50)));
    }
  }, []);
  
  const measure = useCallback(<T,>(name: string, fn: () => T): T => {
    const start = performance.now();
    const result = fn();
    trackEvent(name, performance.now() - start);
    return result;
  }, [trackEvent]);
  
  const measureAsync = useCallback(async <T,>(name: string, fn: () => Promise<T>): Promise<T> => {
    const start = performance.now();
    const result = await fn();
    trackEvent(name, performance.now() - start);
    return result;
  }, [trackEvent]);
  
  return { trackEvent, measure, measureAsync };
}
