/**
 * HeroMiniDemo - Interactive "wow moment" country comparison widget
 * Animated 5-second auto-comparison between 2 countries on the hero
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountryData {
  name: string;
  emoji: string;
  tax: number;
  cost: number;
  safety: number;
  quality: number;
}

const COUNTRY_PAIRS: [CountryData, CountryData][] = [
  [
    { name: 'France', emoji: '🇫🇷', tax: 45, cost: 2800, safety: 72, quality: 78 },
    { name: 'Portugal', emoji: '🇵🇹', tax: 20, cost: 1600, safety: 81, quality: 82 },
  ],
  [
    { name: 'France', emoji: '🇫🇷', tax: 45, cost: 2800, safety: 72, quality: 78 },
    { name: 'Dubaï', emoji: '🇦🇪', tax: 0, cost: 3200, safety: 89, quality: 84 },
  ],
  [
    { name: 'France', emoji: '🇫🇷', tax: 45, cost: 2800, safety: 72, quality: 78 },
    { name: 'Thaïlande', emoji: '🇹🇭', tax: 15, cost: 900, safety: 68, quality: 70 },
  ],
];

const METRICS = [
  { key: 'tax' as const, label: 'Impôts', suffix: '%', lower: true },
  { key: 'cost' as const, label: 'Coût/mois', suffix: '€', lower: true },
  { key: 'safety' as const, label: 'Sécurité', suffix: '/100', lower: false },
  { key: 'quality' as const, label: 'Qualité vie', suffix: '/100', lower: false },
];

export function HeroMiniDemo() {
  const [pairIndex, setPairIndex] = useState(0);
  const [visibleMetric, setVisibleMetric] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const pair = COUNTRY_PAIRS[pairIndex];

  // Auto-cycle through metrics then switch pair
  useEffect(() => {
    if (!isAnimating) return;

    const timer = setInterval(() => {
      setVisibleMetric(prev => {
        if (prev >= METRICS.length - 1) {
          // Switch to next pair after showing all metrics
          setTimeout(() => {
            setPairIndex(p => (p + 1) % COUNTRY_PAIRS.length);
            setVisibleMetric(0);
          }, 800);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);

    return () => clearInterval(timer);
  }, [isAnimating, pairIndex]);

  const getDelta = (a: number, b: number, lowerIsBetter: boolean) => {
    const diff = b - a;
    if (lowerIsBetter) return diff < 0 ? 'better' : diff > 0 ? 'worse' : 'neutral';
    return diff > 0 ? 'better' : diff < 0 ? 'worse' : 'neutral';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.8 }}
      className="max-w-md mx-auto mt-12 mb-20 sm:mb-12"
      onMouseEnter={() => setIsAnimating(false)}
      onMouseLeave={() => setIsAnimating(true)}
    >
      <div className="relative rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-4 shadow-xl overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Country headers */}
        <AnimatePresence mode="wait">
          <motion.div
            key={pairIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between mb-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{pair[0].emoji}</span>
              <span className="font-semibold text-sm">{pair[0].name}</span>
            </div>
            <ArrowLeftRight className="w-4 h-4 text-primary" />
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{pair[1].name}</span>
              <span className="text-xl">{pair[1].emoji}</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Metrics rows */}
        <div className="space-y-1.5">
          {METRICS.map((metric, i) => {
            const valA = pair[0][metric.key];
            const valB = pair[1][metric.key];
            const delta = getDelta(valA, valB, metric.lower);
            const show = i <= visibleMetric;

            return (
              <AnimatePresence key={metric.key}>
                {show && (
                  <motion.div
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-muted/30"
                  >
                    <span className="text-xs text-muted-foreground w-20">{metric.label}</span>
                    <span className="text-xs font-medium w-16 text-right">
                      {metric.key === 'cost' ? `${valA.toLocaleString()}` : valA}{metric.suffix}
                    </span>
                    <div className="w-8 flex justify-center">
                      {delta === 'better' ? (
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      ) : delta === 'worse' ? (
                        <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                      ) : (
                        <Minus className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </div>
                    <span className={cn(
                      "text-xs font-bold w-16 text-left",
                      delta === 'better' ? 'text-emerald-400' : delta === 'worse' ? 'text-red-400' : 'text-foreground'
                    )}>
                      {metric.key === 'cost' ? `${valB.toLocaleString()}` : valB}{metric.suffix}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            );
          })}
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mt-3">
          {COUNTRY_PAIRS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setPairIndex(i); setVisibleMetric(0); }}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all",
                i === pairIndex ? "w-4 bg-primary" : "bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
