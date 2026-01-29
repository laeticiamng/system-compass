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

interface Shortcut {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
}

// Context-aware shortcuts based on current route
const CONTEXTUAL_SHORTCUTS: Record<string, Shortcut[]> = {
  '/': [
    { href: '/quick-test', icon: Zap, label: 'Test Rapide', description: 'Démarrer en 2 min' },
    { href: '/countries', icon: Map, label: 'Explorer', description: '195+ pays' },
    { href: '/tools', icon: Target, label: 'Tous les outils', description: 'Hub central' },
  ],
  '/countries': [
    { href: '/compare', icon: Scale, label: 'Comparer', description: 'Jusqu\'à 4 pays' },
    { href: '/profile-matcher', icon: Target, label: 'Matcher', description: 'Trouver le meilleur' },
    { href: '/world-map', icon: Map, label: 'Carte monde', description: 'Vue globale' },
  ],
  '/country': [
    { href: '/compare', icon: Scale, label: 'Comparer', description: 'Avec d\'autres pays' },
    { href: '/exit-keys', icon: Key, label: 'Exit Keys', description: 'Stratégies de sortie' },
    { href: '/terrain', icon: Map, label: 'Réalités terrain', description: 'Vécu quotidien' },
  ],
  '/profile-test': [
    { href: '/profile-matcher', icon: Target, label: 'Matcher', description: 'Après le test' },
    { href: '/life-trajectory', icon: BarChart3, label: 'Trajectoire', description: 'Simuler votre vie' },
    { href: '/gamification', icon: Award, label: 'Progression', description: 'Gagner des XP' },
  ],
  '/quick-test': [
    { href: '/profile-test', icon: User, label: 'Test Complet', description: 'Aller plus loin' },
    { href: '/profile-matcher', icon: Target, label: 'Matcher', description: 'Trouver votre pays' },
  ],
  '/exit-keys': [
    { href: '/exit-keys/catalog', icon: Key, label: 'Catalogue', description: '50+ clés' },
    { href: '/exit-keys/compare', icon: Scale, label: 'Comparer', description: 'Analyse comparative' },
    { href: '/prevention-filter', icon: Shield, label: 'Filtre', description: 'Éviter les pièges' },
  ],
  '/pyramid-types': [
    { href: '/pyramid-quiz', icon: Gamepad2, label: 'Quiz', description: 'Tester vos connaissances' },
    { href: '/countries', icon: Map, label: 'Voir par pays', description: 'Application concrète' },
    { href: '/errors-illusions', icon: BookOpen, label: 'Erreurs', description: 'Pièges à éviter' },
  ],
  '/dashboard': [
    { href: '/exit-keys', icon: Key, label: 'Exit Keys', description: 'Continuer votre plan' },
    { href: '/gamification', icon: Award, label: 'Progression', description: 'Vos défis' },
    { href: '/usage', icon: BarChart3, label: 'Consommation', description: 'Statistiques' },
  ],
  '/institutions': [
    { href: '/latent', icon: Building2, label: 'Zones Latentes', description: 'Risques cachés' },
    { href: '/irreversa', icon: Shield, label: 'Irreversa', description: 'Seuils critiques' },
    { href: '/ovi', icon: Building2, label: 'OVI', description: 'Observatoire' },
  ],
  '/fiscal-calculator': [
    { href: '/compare', icon: Scale, label: 'Comparer pays', description: 'Fiscalité comparée' },
    { href: '/exit-keys', icon: Key, label: 'Exit Keys', description: 'Plan de sortie' },
    { href: '/profile-matcher', icon: Target, label: 'Matcher', description: 'Pays compatible' },
  ],
  '/gamification': [
    { href: '/pyramid-quiz', icon: Gamepad2, label: 'Quiz', description: 'Gagner des XP' },
    { href: '/life-game', icon: Gamepad2, label: 'Mode Éducatif', description: 'Apprendre en jouant' },
    { href: '/dashboard', icon: BarChart3, label: 'Dashboard', description: 'Vue d\'ensemble' },
  ],
};

// Default shortcuts if no specific context
const DEFAULT_SHORTCUTS: Shortcut[] = [
  { href: '/tools', icon: Target, label: 'Hub Outils', description: 'Tous les outils' },
  { href: '/quick-test', icon: Zap, label: 'Test Rapide', description: 'Commencer' },
  { href: '/dashboard', icon: BarChart3, label: 'Dashboard', description: 'Vue d\'ensemble' },
];

export function ContextualShortcuts() {
  const { t } = useTranslation();
  const location = useLocation();

  // Find matching shortcuts for current route
  const getShortcuts = (): Shortcut[] => {
    // Exact match first
    if (CONTEXTUAL_SHORTCUTS[location.pathname]) {
      return CONTEXTUAL_SHORTCUTS[location.pathname];
    }
    
    // Partial match (for routes like /country/:id)
    for (const [route, shortcuts] of Object.entries(CONTEXTUAL_SHORTCUTS)) {
      if (location.pathname.startsWith(route) && route !== '/') {
        return shortcuts;
      }
    }
    
    return DEFAULT_SHORTCUTS;
  };

  const shortcuts = getShortcuts();

  // Hide on specific pages where it's not needed or may interfere
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
                      <p className="text-xs font-medium truncate">{shortcut.label}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{shortcut.description}</p>
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
