/**
 * Breadcrumbs - Dynamic breadcrumb navigation based on current route
 * Provides contextual navigation for deep pages
 */

import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Route segment to i18n key mapping
const ROUTE_I18N_KEYS: Record<string, string> = {
  '': 'breadcrumbs.home',
  'countries': 'breadcrumbs.countries',
  'country': 'breadcrumbs.countryDetail',
  'world-map': 'breadcrumbs.worldMap',
  'compare': 'breadcrumbs.compare',
  'dashboard': 'breadcrumbs.dashboard',
  'tools': 'breadcrumbs.tools',
  'quick-test': 'breadcrumbs.quickTest',
  'profile-test': 'breadcrumbs.profileTest',
  'profile-matcher': 'breadcrumbs.matcher',
  'life-trajectory': 'breadcrumbs.trajectory',
  'fiscal-calculator': 'breadcrumbs.fiscalCalculator',
  'exit-keys': 'breadcrumbs.exitKeys',
  'catalog': 'breadcrumbs.catalog',
  'prevention-filter': 'breadcrumbs.preventionFilter',
  'errors-illusions': 'breadcrumbs.errorsIllusions',
  'universal-errors': 'breadcrumbs.universalErrors',
  'pyramid-quiz': 'breadcrumbs.quiz',
  'life-game': 'breadcrumbs.lifeGame',
  'pyramid-types': 'breadcrumbs.pyramidTypes',
  'personas': 'breadcrumbs.personas',
  'gamification': 'breadcrumbs.gamification',
  'institutions': 'breadcrumbs.traceOS',
  'latent': 'breadcrumbs.latent',
  'irreversa': 'breadcrumbs.irreversa',
  'ovi': 'breadcrumbs.ovi',
  'b2b': 'breadcrumbs.b2b',
  'cases': 'breadcrumbs.cases',
  'terrain': 'breadcrumbs.terrain',
  'terrain-realities': 'breadcrumbs.terrain',
  'financial-safety-intel': 'breadcrumbs.financialIntel',
  'experts': 'breadcrumbs.experts',
  'community': 'breadcrumbs.community',
  'partner-services': 'breadcrumbs.partnerServices',
  'usage': 'breadcrumbs.usage',
  'settings': 'breadcrumbs.settings',
  'notifications': 'breadcrumbs.notifications',
  'about': 'breadcrumbs.about',
  'pricing': 'breadcrumbs.pricing',
  'partners': 'breadcrumbs.partners',
  'resources': 'breadcrumbs.resources',
  'how-to-read': 'breadcrumbs.howToRead',
  'install': 'breadcrumbs.install',
  'admin': 'breadcrumbs.admin',
  'translations': 'breadcrumbs.translations',
  'analytics': 'breadcrumbs.analytics',
  'country-generator': 'breadcrumbs.countryGenerator',
  'diagnostics': 'breadcrumbs.diagnostics',
};

// Fallback labels (used as default values for t())
const ROUTE_FALLBACKS: Record<string, string> = {
  '': 'Accueil',
  'countries': 'Pays',
  'country': 'Détail Pays',
  'world-map': 'Carte Monde',
  'compare': 'Comparer',
  'dashboard': 'Dashboard',
  'tools': 'Outils',
  'quick-test': 'Test Rapide',
  'profile-test': 'Test Complet',
  'profile-matcher': 'Matcher',
  'life-trajectory': 'Trajectoire',
  'fiscal-calculator': 'Calculateur Fiscal',
  'exit-keys': 'Exit Keys',
  'catalog': 'Catalogue',
  'prevention-filter': 'Filtre Décision',
  'errors-illusions': 'Erreurs & Illusions',
  'universal-errors': 'Erreur Universelle',
  'pyramid-quiz': 'Quiz',
  'life-game': 'Mode Éducatif',
  'pyramid-types': 'Types Pyramides',
  'personas': 'Personas',
  'gamification': 'Progression',
  'institutions': 'TraceOS',
  'latent': 'Zones Latentes',
  'irreversa': 'Irreversa',
  'ovi': 'OVI',
  'b2b': 'Solutions B2B',
  'cases': 'Cas',
  'terrain': 'Réalités Terrain',
  'terrain-realities': 'Réalités Terrain',
  'financial-safety-intel': 'Intel Financière',
  'experts': 'Experts',
  'community': 'Communauté',
  'partner-services': 'Services Partenaires',
  'usage': 'Consommation',
  'settings': 'Paramètres',
  'notifications': 'Notifications',
  'about': 'À propos',
  'pricing': 'Tarifs',
  'partners': 'Partenaires',
  'resources': 'Ressources',
  'how-to-read': 'Guide de Lecture',
  'install': 'Installer',
  'admin': 'Administration',
  'translations': 'Traductions',
  'analytics': 'Analytics',
  'country-generator': 'Générateur Pays',
  'diagnostics': 'Diagnostics',
};

// Pages that should NOT show breadcrumbs (top-level pages)
const HIDE_BREADCRUMBS_ON = ['/', '/auth', '/countries', '/dashboard', '/tools'];

export function Breadcrumbs() {
  const location = useLocation();
  const { t } = useTranslation();
  
  if (HIDE_BREADCRUMBS_ON.includes(location.pathname)) {
    return null;
  }
  
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  if (pathSegments.length < 2) {
    return null;
  }
  
  const breadcrumbs: BreadcrumbItem[] = [
    { label: t('breadcrumbs.home', 'Accueil'), href: '/' },
  ];
  
  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathSegments.length - 1;
    
    const isId = segment.length === 36 || segment.length === 2 || /^[a-z]{2,3}$/i.test(segment);
    
    const i18nKey = ROUTE_I18N_KEYS[segment];
    const fallback = ROUTE_FALLBACKS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    let label = i18nKey ? t(i18nKey, fallback) : fallback;
    
    if (isId && pathSegments[index - 1]) {
      const parentSegment = pathSegments[index - 1];
      if (parentSegment === 'country') {
        label = segment.toUpperCase();
      } else {
        label = t('breadcrumbs.detail', 'Détail');
      }
    }
    
    breadcrumbs.push({
      label,
      href: isLast ? undefined : currentPath,
    });
  });
  
  return (
    <nav 
      aria-label={t('breadcrumbs.ariaLabel', "Fil d'Ariane")}
      className="container mx-auto px-4 py-2 mt-14 md:mt-16"
    >
      <ol className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
        {breadcrumbs.map((item, index) => {
          const isFirst = index === 0;
          
          return (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
              )}
              {item.href ? (
                <Link
                  to={item.href}
                  className={cn(
                    "hover:text-foreground transition-colors flex items-center gap-1",
                    isFirst && "font-medium"
                  )}
                >
                  {isFirst && <Home className="w-3 h-3" />}
                  <span className={cn(isFirst && "sr-only sm:not-sr-only")}>
                    {item.label}
                  </span>
                </Link>
              ) : (
                <span className="text-foreground font-medium truncate max-w-[200px]">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
