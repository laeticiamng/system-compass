/**
 * CountryQuickActions — sticky bar with anchored shortcuts to dense sections.
 * Improves scannability of the country page by surfacing the 4 most useful
 * downstream sections (Fiscal, Strategies, Expert, Sources) without scrolling.
 */
import { useTranslation } from 'react-i18next';
import { Calculator, Compass, UserCheck, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { scrollToAnchor } from '@/components/SmoothScrollProvider';

interface QuickAction {
  id: string;
  labelKey: string;
  fallback: string;
  icon: typeof Calculator;
  anchor: string;
}

const ACTIONS: QuickAction[] = [
  { id: 'fiscal', labelKey: 'countryDetail.quickActions.fiscal', fallback: 'Fiscalité', icon: Calculator, anchor: 'fiscal-section' },
  { id: 'strategies', labelKey: 'countryDetail.quickActions.strategies', fallback: 'Stratégies', icon: Compass, anchor: 'strategies-section' },
  { id: 'expert', labelKey: 'countryDetail.quickActions.expert', fallback: 'Expert', icon: UserCheck, anchor: 'expert-section' },
  { id: 'sources', labelKey: 'countryDetail.quickActions.sources', fallback: 'Sources', icon: FileText, anchor: 'sources-section' },
];

export function CountryQuickActions() {
  const { t } = useTranslation();

  

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="mb-6 sm:mb-8"
    >
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0 snap-x snap-mandatory">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => scrollToAnchor(`#${action.anchor}`)}
              className="snap-start flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-full border border-border/60 bg-card/60 backdrop-blur text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
            >
              <Icon className="w-3.5 h-3.5" />
              {t(action.labelKey, action.fallback)}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
