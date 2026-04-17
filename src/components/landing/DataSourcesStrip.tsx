/**
 * DataSourcesStrip - Bandeau de sources vérifiables sous le hero.
 * Renforce la crédibilité en exposant les institutions de référence
 * réellement utilisées pour produire les analyses pays.
 */

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Database } from 'lucide-react';

const SOURCES = [
  'Banque Mondiale',
  'OCDE',
  'FMI',
  'Transparency International',
  'Numbeo',
  'OMS',
];

export function DataSourcesStrip() {
  const { t } = useTranslation();

  return (
    <section
      aria-label={t('landing.sources.aria', 'Sources de données utilisées')}
      className="border-y border-border/40 bg-muted/20"
    >
      <div className="container mx-auto px-4 py-6 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8"
        >
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground uppercase tracking-widest">
            <Database className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
            <span>
              {t('landing.sources.label', 'Données issues de sources publiques vérifiables')}
            </span>
          </div>
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 md:gap-x-6">
            {SOURCES.map((source) => (
              <li
                key={source}
                className="text-xs md:text-sm font-medium text-foreground/70"
              >
                {source}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
