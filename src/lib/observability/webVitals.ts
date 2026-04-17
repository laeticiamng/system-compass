/**
 * Web Vitals reporter — sends LCP / INP / CLS / FCP / TTFB as info-level logs
 * for aggregation in the governance dashboard.
 */
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';
import { logInfo } from './logger';

let installed = false;

export function installWebVitals() {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  const handler = (metric: Metric) => {
    logInfo(`web-vital:${metric.name}`, {
      kind: 'web-vital',
      name: metric.name,
      value: Math.round(metric.value * 100) / 100,
      rating: metric.rating,
      navigationType: metric.navigationType,
      id: metric.id,
    });
  };

  onLCP(handler);
  onINP(handler);
  onCLS(handler);
  onFCP(handler);
  onTTFB(handler);
}
