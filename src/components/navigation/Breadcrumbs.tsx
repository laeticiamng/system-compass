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

// Route to breadcrumb mapping
const ROUTE_LABELS: Record<string, string> = {
  // Core
  '': 'Accueil',
  'countries': 'Pays',
  'country': 'Détail Pays',
  'world-map': 'Carte Monde',
  'compare': 'Comparer',
  'dashboard': 'Dashboard',
  'tools': 'Outils',
  
  // Analysis
  'quick-test': 'Test Rapide',
  'profile-test': 'Test Complet',
  'profile-matcher': 'Matcher',
  'life-trajectory': 'Trajectoire',
  'fiscal-calculator': 'Calculateur Fiscal',
  
  // Planning
  'exit-keys': 'Exit Keys',
  'catalog': 'Catalogue',
  'prevention-filter': 'Filtre Décision',
  'errors-illusions': 'Erreurs & Illusions',
  'universal-errors': 'Erreur Universelle',
  
  // Learning
  'pyramid-quiz': 'Quiz',
  'life-game': 'Mode Éducatif',
  'pyramid-types': 'Types Pyramides',
  'personas': 'Personas',
  'gamification': 'Progression',
  
  // Pro
  'institutions': 'TraceOS',
  'latent': 'Zones Latentes',
  'irreversa': 'Irreversa',
  'ovi': 'OVI',
  'b2b': 'Solutions B2B',
  'cases': 'Cas',
  
  // Terrain
  'terrain': 'Réalités Terrain',
  'terrain-realities': 'Réalités Terrain',
  'financial-safety-intel': 'Intel Financière',
  
  // Community
  'experts': 'Experts',
  'community': 'Communauté',
  'partner-services': 'Services Partenaires',
  
  // User
  'usage': 'Consommation',
  'settings': 'Paramètres',
  'notifications': 'Notifications',
  
  // Content
  'about': 'À propos',
  'pricing': 'Tarifs',
  'partners': 'Partenaires',
  'resources': 'Ressources',
  'how-to-read': 'Guide de Lecture',
  'install': 'Installer',
  
  // Admin
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
  
  // Don't show on certain pages
  if (HIDE_BREADCRUMBS_ON.includes(location.pathname)) {
    return null;
  }
  
  // Parse current path into segments
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  // Don't show for single-segment paths (they're top-level)
  if (pathSegments.length < 2) {
    return null;
  }
  
  // Build breadcrumb items
  const breadcrumbs: BreadcrumbItem[] = [
    { label: t('nav.home', 'Accueil'), href: '/' },
  ];
  
  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathSegments.length - 1;
    
    // Check if segment looks like an ID (UUID or country code)
    const isId = segment.length === 36 || segment.length === 2 || /^[a-z]{2,3}$/i.test(segment);
    
    // Get label - use route labels or capitalize segment
    let label = ROUTE_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    
    // For IDs, try to get a better label
    if (isId && pathSegments[index - 1]) {
      const parentSegment = pathSegments[index - 1];
      if (parentSegment === 'country') {
        label = segment.toUpperCase(); // Show country code
      } else {
        label = 'Détail';
      }
    }
    
    breadcrumbs.push({
      label,
      href: isLast ? undefined : currentPath,
    });
  });
  
  return (
    <nav 
      aria-label="Fil d'Ariane" 
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
