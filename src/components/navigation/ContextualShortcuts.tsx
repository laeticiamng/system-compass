/**
 * ContextualShortcuts - Smart shortcuts that appear based on current page context
 * Shows relevant next actions to guide user journey
 */

import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Map, Key, Scale, Gamepad2, User,
  BarChart3, Shield, Target, Building2, BookOpen, Zap, Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShortcutDef {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  labelFallback: string;
  descKey: string;
  descFallback: string;
}

const CONTEXTUAL_SHORTCUTS: Record<string, ShortcutDef[]> = {
  '/': [
    { href: '/quick-test', icon: Zap, labelKey: 'shortcuts.quickTest', labelFallback: 'Test Rapide', descKey: 'shortcuts.quickTestDesc', descFallback: 'Démarrer en 2 min' },
    { href: '/countries', icon: Map, labelKey: 'shortcuts.explore', labelFallback: 'Explorer', descKey: 'shortcuts.exploreDesc', descFallback: '44 pays analysés' },
    { href: '/tools', icon: Target, labelKey: 'shortcuts.allTools', labelFallback: 'Tous les outils', descKey: 'shortcuts.allToolsDesc', descFallback: 'Hub central' },
  ],
  '/countries': [
    { href: '/compare', icon: Scale, labelKey: 'shortcuts.compare', labelFallback: 'Comparer', descKey: 'shortcuts.compareDesc', descFallback: "Jusqu'à 4 pays" },
    { href: '/profile-matcher', icon: Target, labelKey: 'shortcuts.matcher', labelFallback: 'Matcher', descKey: 'shortcuts.matcherDesc', descFallback: 'Trouver le meilleur' },
    { href: '/world-map', icon: Map, labelKey: 'shortcuts.worldMap', labelFallback: 'Carte monde', descKey: 'shortcuts.worldMapDesc', descFallback: 'Vue globale' },
  ],
  '/country': [
    { href: '/compare', icon: Scale, labelKey: 'shortcuts.compare', labelFallback: 'Comparer', descKey: 'shortcuts.compareCountryDesc', descFallback: "Avec d'autres pays" },
    { href: '/exit-keys', icon: Key, labelKey: 'shortcuts.exitKeys', labelFallback: 'Stratégies', descKey: 'shortcuts.exitKeysDesc', descFallback: 'Stratégies de sortie' },
    { href: '/terrain', icon: Map, labelKey: 'shortcuts.terrain', labelFallback: 'Réalités terrain', descKey: 'shortcuts.terrainDesc', descFallback: 'Vécu quotidien' },
  ],
  '/profile-test': [
    { href: '/profile-matcher', icon: Target, labelKey: 'shortcuts.matcher', labelFallback: 'Matcher', descKey: 'shortcuts.afterTestDesc', descFallback: 'Après le test' },
    { href: '/life-trajectory', icon: BarChart3, labelKey: 'shortcuts.trajectory', labelFallback: 'Trajectoire', descKey: 'shortcuts.trajectoryDesc', descFallback: 'Simuler votre vie' },
    { href: '/gamification', icon: Award, labelKey: 'shortcuts.progression', labelFallback: 'Progression', descKey: 'shortcuts.progressionDesc', descFallback: 'Gagner des XP' },
  ],
  '/quick-test': [
    { href: '/profile-test', icon: User, labelKey: 'shortcuts.fullTest', labelFallback: 'Test Complet', descKey: 'shortcuts.fullTestDesc', descFallback: 'Aller plus loin' },
    { href: '/profile-matcher', icon: Target, labelKey: 'shortcuts.matcher', labelFallback: 'Matcher', descKey: 'shortcuts.matcherCountryDesc', descFallback: 'Trouver votre pays' },
  ],
  '/exit-keys': [
    { href: '/exit-keys/catalog', icon: Key, labelKey: 'shortcuts.catalog', labelFallback: 'Catalogue', descKey: 'shortcuts.catalogDesc', descFallback: '50+ clés' },
    { href: '/exit-keys/compare', icon: Scale, labelKey: 'shortcuts.compare', labelFallback: 'Comparer', descKey: 'shortcuts.comparativeDesc', descFallback: 'Analyse comparative' },
    { href: '/prevention-filter', icon: Shield, labelKey: 'shortcuts.filter', labelFallback: 'Filtre', descKey: 'shortcuts.filterDesc', descFallback: 'Éviter les pièges' },
  ],
  '/pyramid-types': [
    { href: '/pyramid-quiz', icon: Gamepad2, labelKey: 'shortcuts.quiz', labelFallback: 'Quiz', descKey: 'shortcuts.quizDesc', descFallback: 'Tester vos connaissances' },
    { href: '/countries', icon: Map, labelKey: 'shortcuts.byCountry', labelFallback: 'Voir par pays', descKey: 'shortcuts.byCountryDesc', descFallback: 'Application concrète' },
    { href: '/errors-illusions', icon: BookOpen, labelKey: 'shortcuts.errors', labelFallback: 'Erreurs', descKey: 'shortcuts.errorsDesc', descFallback: 'Pièges à éviter' },
  ],
  '/dashboard': [
    { href: '/exit-keys', icon: Key, labelKey: 'shortcuts.exitKeys', labelFallback: 'Stratégies', descKey: 'shortcuts.continuePlanDesc', descFallback: 'Continuer votre plan' },
    { href: '/gamification', icon: Award, labelKey: 'shortcuts.progression', labelFallback: 'Progression', descKey: 'shortcuts.challengesDesc', descFallback: 'Vos défis' },
    { href: '/usage', icon: BarChart3, labelKey: 'shortcuts.usage', labelFallback: 'Consommation', descKey: 'shortcuts.usageDesc', descFallback: 'Statistiques' },
  ],
  '/institutions': [
    { href: '/latent', icon: Building2, labelKey: 'shortcuts.latent', labelFallback: 'Zones Latentes', descKey: 'shortcuts.latentDesc', descFallback: 'Risques cachés' },
    { href: '/irreversa', icon: Shield, labelKey: 'shortcuts.irreversa', labelFallback: 'Irreversa', descKey: 'shortcuts.irreversaDesc', descFallback: 'Seuils critiques' },
    { href: '/ovi', icon: Building2, labelKey: 'shortcuts.ovi', labelFallback: 'OVI', descKey: 'shortcuts.oviDesc', descFallback: 'Observatoire' },
  ],
  '/fiscal-calculator': [
    { href: '/compare', icon: Scale, labelKey: 'shortcuts.compareCountries', labelFallback: 'Comparer pays', descKey: 'shortcuts.fiscalCompareDesc', descFallback: 'Fiscalité comparée' },
    { href: '/exit-keys', icon: Key, labelKey: 'shortcuts.exitKeys', labelFallback: 'Stratégies', descKey: 'shortcuts.exitPlanDesc', descFallback: 'Plan stratégique' },
    { href: '/profile-matcher', icon: Target, labelKey: 'shortcuts.matcher', labelFallback: 'Matcher', descKey: 'shortcuts.compatibleDesc', descFallback: 'Pays compatible' },
  ],
  '/gamification': [
    { href: '/pyramid-quiz', icon: Gamepad2, labelKey: 'shortcuts.quiz', labelFallback: 'Quiz', descKey: 'shortcuts.earnXPDesc', descFallback: 'Gagner des XP' },
    { href: '/life-game', icon: Gamepad2, labelKey: 'shortcuts.lifeGame', labelFallback: 'Mode Éducatif', descKey: 'shortcuts.learnPlayDesc', descFallback: 'Apprendre en jouant' },
    { href: '/dashboard', icon: BarChart3, labelKey: 'shortcuts.dashboard', labelFallback: 'Dashboard', descKey: 'shortcuts.overviewDesc', descFallback: "Vue d'ensemble" },
  ],
};

const DEFAULT_SHORTCUTS: ShortcutDef[] = [
  { href: '/tools', icon: Target, labelKey: 'shortcuts.toolsHub', labelFallback: 'Hub Outils', descKey: 'shortcuts.allToolsDesc', descFallback: 'Tous les outils' },
  { href: '/quick-test', icon: Zap, labelKey: 'shortcuts.quickTest', labelFallback: 'Test Rapide', descKey: 'shortcuts.startDesc', descFallback: 'Commencer' },
  { href: '/dashboard', icon: BarChart3, labelKey: 'shortcuts.dashboard', labelFallback: 'Dashboard', descKey: 'shortcuts.overviewDesc', descFallback: "Vue d'ensemble" },
];

export function ContextualShortcuts() {
  const { t } = useTranslation();
  const location = useLocation();

  const getShortcuts = (): ShortcutDef[] => {
    if (CONTEXTUAL_SHORTCUTS[location.pathname]) {
      return CONTEXTUAL_SHORTCUTS[location.pathname];
    }
    for (const [route, shortcuts] of Object.entries(CONTEXTUAL_SHORTCUTS)) {
      if (location.pathname.startsWith(route) && route !== '/') {
        return shortcuts;
      }
    }
    return DEFAULT_SHORTCUTS;
  };

  const shortcuts = getShortcuts();

  const hiddenRoutes = ['/', '/tools', '/experts', '/marketplace', '/partner'];
  if (hiddenRoutes.some(route => location.pathname === route || location.pathname.startsWith(route + '/'))) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="fixed bottom-20 right-4 z-40 hidden md:block"
      >
        <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg p-3 space-y-2 max-w-[200px]">
          <p className="text-xs text-muted-foreground font-medium px-1">
            {t('shortcuts.nextSteps', 'Prochaines étapes')}
          </p>
          <div className="space-y-1">
            {shortcuts.map((shortcut, index) => {
              const Icon = shortcut.icon;
              return (
                <Link key={shortcut.href} to={shortcut.href}>
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg",
                      "hover:bg-primary/10 transition-colors group cursor-pointer"
                    )}
                  >
                    <div className="p-1.5 rounded-md bg-secondary group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{t(shortcut.labelKey, shortcut.labelFallback)}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{t(shortcut.descKey, shortcut.descFallback)}</p>
                    </div>
                    <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
