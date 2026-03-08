/**
 * Feature Discovery Tooltips
 * Shows contextual hints to help users discover key features.
 * Tracks which hints have been dismissed.
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface Tip {
  id: string;
  titleKey: string;
  titleDefault: string;
  descKey: string;
  descDefault: string;
}

const TIPS: Tip[] = [
  {
    id: 'quick_test',
    titleKey: 'tips.quickTest.title',
    titleDefault: '🎯 Test de profil gratuit',
    descKey: 'tips.quickTest.desc',
    descDefault: 'En 2 minutes, découvre les pays les plus compatibles avec ton profil.',
  },
  {
    id: 'compare',
    titleKey: 'tips.compare.title',
    titleDefault: '📊 Compare jusqu\'à 4 pays',
    descKey: 'tips.compare.desc',
    descDefault: 'Utilise l\'outil de comparaison pour voir les différences côte à côte.',
  },
  {
    id: 'exit_keys',
    titleKey: 'tips.exitKeys.title',
    titleDefault: '🔑 Clés de sortie',
    descKey: 'tips.exitKeys.desc',
    descDefault: 'Découvre les étapes concrètes pour te relocaliser dans un pays.',
  },
];

const STORAGE_KEY = 'sc_dismissed_tips';

function getDismissed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function FeatureDiscoveryTooltips() {
  const { t } = useTranslation();
  const location = useLocation();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [currentTip, setCurrentTip] = useState<Tip | null>(null);

  // Pages where specific tips are redundant
  const pathname = location.pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/';
  const suppressedTips: string[] = [];
  if (pathname.startsWith('/quick-test') || pathname.startsWith('/profile-test')) suppressedTips.push('quick_test');
  if (pathname.startsWith('/compare')) suppressedTips.push('compare');
  if (pathname.startsWith('/exit-keys') || pathname.startsWith('/strategies')) suppressedTips.push('exit_keys');

  useEffect(() => {
    const d = getDismissed();
    setDismissed(d);

    // Show first undismissed + non-suppressed tip after delay
    const timer = setTimeout(() => {
      const next = TIPS.find(tip => !d.includes(tip.id) && !suppressedTips.includes(tip.id));
      if (next) setCurrentTip(next);
    }, 8000);

    return () => clearTimeout(timer);
  }, [pathname]);

  const dismissTip = (tipId: string) => {
    const updated = [...dismissed, tipId];
    setDismissed(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setCurrentTip(null);

    // Show next tip after a delay
    setTimeout(() => {
      const next = TIPS.find(tip => !updated.includes(tip.id));
      if (next) setCurrentTip(next);
    }, 30000); // 30s before next tip
  };

  return (
    <AnimatePresence>
      {currentTip && (
        <motion.div
          key={currentTip.id}
          initial={{ opacity: 0, y: 20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed bottom-20 right-4 z-40 max-w-xs"
        >
          <div className="bg-card border border-border rounded-xl shadow-xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold mb-1">
                  {t(currentTip.titleKey, currentTip.titleDefault)}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t(currentTip.descKey, currentTip.descDefault)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0"
                onClick={() => dismissTip(currentTip.id)}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
