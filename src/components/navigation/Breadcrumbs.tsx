/**
 * Breadcrumbs - Dynamic breadcrumb navigation based on current route
 * Provides contextual navigation for deep pages
 */

import { LocalizedLink as Link } from '@/components/i18n';
import { usePathWithoutLang } from '@/hooks/useLocalizedPath';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Pages that should NOT show breadcrumbs (top-level pages)

// Pages that should NOT show breadcrumbs (top-level pages)
const HIDE_BREADCRUMBS_ON = ['/', '/auth', '/countries', '/dashboard', '/tools'];

export function Breadcrumbs() {
  
  const { t } = useTranslation();
  
  const rawPath = usePathWithoutLang();
  
  if (HIDE_BREADCRUMBS_ON.includes(rawPath)) {
    return null;
  }
  
  const pathSegments = rawPath.split('/').filter(Boolean);
  
  if (pathSegments.length < 2) {
    return null;
  }

  // Fallback labels using t() for i18n
  const routeFallbacks: Record<string, string> = {
    '': t('breadcrumbs.home', 'Accueil'),
    'countries': t('breadcrumbs.countries', 'Pays'),
    'country': t('breadcrumbs.countryDetail', 'Détail Pays'),
    'world-map': t('breadcrumbs.worldMap', 'Carte Monde'),
    'compare': t('breadcrumbs.compare', 'Comparer'),
    'dashboard': t('breadcrumbs.dashboard', 'Dashboard'),
    'tools': t('breadcrumbs.tools', 'Outils'),
    'quick-test': t('breadcrumbs.quickTest', 'Test Rapide'),
    'profile-test': t('breadcrumbs.profileTest', 'Test Complet'),
    'profile-matcher': t('breadcrumbs.matcher', 'Matcher'),
    'life-trajectory': t('breadcrumbs.trajectory', 'Trajectoire'),
    'fiscal-calculator': t('breadcrumbs.fiscalCalculator', 'Calculateur Fiscal'),
    'exit-keys': t('breadcrumbs.exitKeys', 'Stratégies'),
    'catalog': t('breadcrumbs.catalog', 'Catalogue'),
    'prevention-filter': t('breadcrumbs.preventionFilter', 'Filtre Décision'),
    'errors-illusions': t('breadcrumbs.errorsIllusions', 'Erreurs & Illusions'),
    'universal-errors': t('breadcrumbs.universalErrors', 'Erreur Universelle'),
    'pyramid-quiz': t('breadcrumbs.quiz', 'Quiz'),
    'life-game': t('breadcrumbs.lifeGame', 'Mode Éducatif'),
    'pyramid-types': t('breadcrumbs.pyramidTypes', 'Types Pyramides'),
    'personas': t('breadcrumbs.personas', 'Personas'),
    'gamification': t('breadcrumbs.gamification', 'Progression'),
    'institutions': t('breadcrumbs.traceOS', 'TraceOS'),
    'latent': t('breadcrumbs.latent', 'Zones Latentes'),
    'irreversa': t('breadcrumbs.irreversa', 'Irreversa'),
    'ovi': t('breadcrumbs.ovi', 'OVI'),
    'b2b': t('breadcrumbs.b2b', 'Solutions B2B'),
    'cases': t('breadcrumbs.cases', 'Cas'),
    'terrain': t('breadcrumbs.terrain', 'Réalités Terrain'),
    'terrain-realities': t('breadcrumbs.terrain', 'Réalités Terrain'),
    'financial-safety-intel': t('breadcrumbs.financialIntel', 'Intel Financière'),
    'experts': t('breadcrumbs.experts', 'Experts'),
    'community': t('breadcrumbs.community', 'Communauté'),
    'partner-services': t('breadcrumbs.partnerServices', 'Services Partenaires'),
    'usage': t('breadcrumbs.usage', 'Consommation'),
    'settings': t('breadcrumbs.settings', 'Paramètres'),
    'notifications': t('breadcrumbs.notifications', 'Notifications'),
    'about': t('breadcrumbs.about', 'À propos'),
    'pricing': t('breadcrumbs.pricing', 'Tarifs'),
    'partners': t('breadcrumbs.partners', 'Partenaires'),
    'resources': t('breadcrumbs.resources', 'Ressources'),
    'how-to-read': t('breadcrumbs.howToRead', 'Guide de Lecture'),
    'install': t('breadcrumbs.install', 'Installer'),
    'admin': t('breadcrumbs.admin', 'Administration'),
    'translations': t('breadcrumbs.translations', 'Traductions'),
    'analytics': t('breadcrumbs.analytics', 'Analytics'),
    'country-generator': t('breadcrumbs.countryGenerator', 'Générateur Pays'),
    'diagnostics': t('breadcrumbs.diagnostics', 'Diagnostics'),
  };
  
  const breadcrumbs: BreadcrumbItem[] = [
    { label: routeFallbacks[''], href: '/' },
  ];
  
  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathSegments.length - 1;
    
    const isId = segment.length === 36 || segment.length === 2 || /^[a-z]{2,3}$/i.test(segment);
    
    let label = routeFallbacks[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    
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
