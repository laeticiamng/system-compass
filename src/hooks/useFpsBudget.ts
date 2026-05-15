/**
 * useFpsBudget — lightweight FPS / frame-time monitor.
 * Samples requestAnimationFrame deltas and warns once when the rolling
 * average drops under a budget. No-op in production unless explicitly enabled.
 */
import { useEffect } from 'react';

interface Options {
  /** Component label for log output. */
  label: string;
  /** Minimum acceptable FPS. Default 45. */
  minFps?: number;
  /** Number of frames to average. Default 60 (~1s). */
  windowFrames?: number;
  /** Force-enable in production. Default false. */
  enableInProd?: boolean;
}

export function useFpsBudget({ label, minFps = 45, windowFrames = 60, enableInProd = false }: Options) {
  useEffect(() => {
    const enabled = import.meta.env.DEV || enableInProd;
    if (!enabled || typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let rafId = 0;
    let last = performance.now();
    const samples: number[] = [];
    let warned = false;
    let stopped = false;

    const tick = (now: number) => {
      const delta = now - last;
      last = now;
      samples.push(delta);
      if (samples.length > windowFrames) samples.shift();

      if (samples.length === windowFrames && !warned) {
        const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
        const fps = 1000 / avg;
        if (fps < minFps) {
          warned = true;
          // eslint-disable-next-line no-console
          console.warn(
            `[perf] ${label}: ${fps.toFixed(1)} fps (avg frame ${avg.toFixed(1)}ms) — under budget ${minFps} fps`
          );
          // Custom event for analytics hookup
          window.dispatchEvent(
            new CustomEvent('perf:budget-exceeded', {
              detail: { component: label, fps, avgFrameMs: avg, budget: minFps },
            })
          );
        }
      }

      if (!stopped) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      stopped = true;
      cancelAnimationFrame(rafId);
    };
  }, [label, minFps, windowFrames, enableInProd]);
}
