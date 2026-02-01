/**
 * Navigation Configuration - Single Source of Truth
 * Used by Header, AppSidebar, Footer, and ToolsHub
 * Eliminates redundancy and ensures consistency across the platform
 */

import {
  Compass, Map, Globe, Triangle, Key, Scale, Gamepad2,
  User, Users, Play, Shield, BarChart3, BookOpen,
  Building2, Eye, AlertCircle, LayoutDashboard, CreditCard,
  Calculator, Target, Zap, Award, MessageSquare, Briefcase,
  FileText, Bell, TrendingUp, Lightbulb, Home, Wrench,
  Info, Settings, type LucideIcon
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

export interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  labelKey?: string; // i18n key
  description?: string;
  badge?: string;
  highlight?: boolean;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
  isPro?: boolean;
}

export interface NavGroup {
  id: string;
  title: string;
  titleKey?: string; // i18n key
  description?: string;
  icon: LucideIcon;
  color?: string;
  borderColor?: string;
  badge?: string;
  items: NavItem[];
}

// ============================================================
// NAVIGATION GROUPS - ORGANIZED BY USER JOURNEY
// ============================================================

export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'main',
    title: 'Principal',
    titleKey: 'nav.groups.main',
    icon: Home,
    color: 'from-primary/20 to-primary/10',
    borderColor: 'border-primary/30',
    items: [
      { href: '/', icon: Home, label: 'Accueil', labelKey: 'nav.home' },
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', labelKey: 'nav.dashboard', requiresAuth: true },
      { href: '/tools', icon: Wrench, label: 'Hub Outils', labelKey: 'nav.tools', badge: 'New', highlight: true },
    ],
  },
  {
    id: 'discover',
    title: 'Découvrir',
    titleKey: 'nav.groups.discover',
    description: 'Explorer les pays et comprendre les systèmes',
    icon: Compass,
    color: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500/30',
    items: [
      { href: '/countries', icon: Map, label: 'Pays', labelKey: 'nav.countries', description: 'Explorer 195+ pays' },
      { href: '/world-map', icon: Globe, label: 'Carte Monde', labelKey: 'nav.worldMap', description: 'Vue interactive' },
      { href: '/pyramid-types', icon: Triangle, label: 'Pyramides', labelKey: 'nav.pyramids', description: '6 types de systèmes' },
      { href: '/compare', icon: Scale, label: 'Comparer', labelKey: 'nav.compare', description: 'Jusqu\'à 4 pays' },
      { href: '/terrain', icon: Map, label: 'Réalités Terrain', labelKey: 'nav.terrainRealities', description: 'Vécu quotidien' },
    ],
  },
  {
    id: 'analyze',
    title: 'Analyser',
    titleKey: 'nav.groups.analyze',
    description: 'Tests de profil et outils d\'analyse personnalisée',
    icon: Target,
    color: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-500/30',
    items: [
      { href: '/quick-test', icon: Zap, label: 'Test Rapide', labelKey: 'nav.quickTest', description: '2 min', badge: 'Populaire' },
      { href: '/profile-test', icon: User, label: 'Test Complet', labelKey: 'nav.profileTest', description: '15 min' },
      { href: '/profile-matcher', icon: Users, label: 'Matcher Pays', labelKey: 'nav.profileMatcher', description: 'Compatibilité' },
      { href: '/life-trajectory', icon: TrendingUp, label: 'Trajectoire', labelKey: 'nav.lifeTrajectory', description: 'Simulation vie' },
      { href: '/fiscal-calculator', icon: Calculator, label: 'Calculateur Fiscal', labelKey: 'nav.fiscalCalculator', description: 'Net vs Brut' },
    ],
  },
  {
    id: 'plan',
    title: 'Planifier',
    titleKey: 'nav.groups.plan',
    description: 'Stratégies de sortie et prise de décision',
    icon: Key,
    color: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/30',
    items: [
      { href: '/exit-keys', icon: Key, label: 'Exit Keys', labelKey: 'nav.exitKeys', description: 'Stratégies de sortie' },
      { href: '/exit-keys/catalog', icon: FileText, label: 'Catalogue', labelKey: 'nav.exitKeysCatalog', description: '50+ clés' },
      { href: '/exit-keys/compare', icon: Scale, label: 'Comparer Clés', labelKey: 'nav.exitKeysCompare', description: 'Analyse comparative' },
      { href: '/prevention-filter', icon: Shield, label: 'Filtre Décision', labelKey: 'nav.preventionFilter', description: 'Anti-illusions' },
      { href: '/errors-illusions', icon: Lightbulb, label: 'Erreurs', labelKey: 'nav.errorsIllusions', description: 'Pièges à éviter' },
    ],
  },
  {
    id: 'learn',
    title: 'Apprendre',
    titleKey: 'nav.groups.learn',
    description: 'Jeux éducatifs et progression gamifiée',
    icon: Gamepad2,
    color: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-500/30',
    items: [
      { href: '/pyramid-quiz', icon: Gamepad2, label: 'Quiz Pyramides', labelKey: 'nav.pyramidQuiz', description: 'Testez vos connaissances' },
      { href: '/life-game', icon: Play, label: 'Mode Éducatif', labelKey: 'nav.lifeGame', description: 'Simulation interactive' },
      { href: '/gamification', icon: Award, label: 'Progression', labelKey: 'nav.gamification', description: 'XP & badges', badge: 'Nouveau' },
      { href: '/personas', icon: Users, label: 'Parcours Persona', labelKey: 'nav.personas', description: 'Cas d\'usage' },
      { href: '/how-to-read', icon: BookOpen, label: 'Guide', labelKey: 'nav.howToRead', description: 'Mode d\'emploi' },
    ],
  },
  {
    id: 'pro',
    title: 'Pro & Business',
    titleKey: 'nav.groups.pro',
    description: 'Modules avancés pour professionnels',
    icon: Building2,
    color: 'from-slate-500/20 to-zinc-500/20',
    borderColor: 'border-slate-500/30',
    badge: 'Pro',
    items: [
      { href: '/institutions', icon: Building2, label: 'TraceOS', labelKey: 'nav.traceOS', description: 'Audit institutionnel', isPro: true },
      { href: '/latent', icon: Eye, label: 'Zones Latentes', labelKey: 'nav.latent', description: 'Risques cachés', isPro: true },
      { href: '/irreversa', icon: AlertCircle, label: 'Irreversa', labelKey: 'nav.irreversa', description: 'Seuils critiques', isPro: true },
      { href: '/ovi', icon: Eye, label: 'OVI', labelKey: 'nav.ovi', description: 'Observatoire', isPro: true },
      { href: '/financial-safety-intel', icon: Shield, label: 'Intel Financière', labelKey: 'nav.financialIntel', description: 'Sécurité financière', isPro: true },
    ],
  },
  {
    id: 'community',
    title: 'Communauté',
    titleKey: 'nav.groups.community',
    description: 'Experts, partenaires et entraide',
    icon: MessageSquare,
    color: 'from-rose-500/20 to-red-500/20',
    borderColor: 'border-rose-500/30',
    items: [
      { href: '/experts', icon: Briefcase, label: 'Experts', labelKey: 'nav.experts', description: 'Marketplace' },
      { href: '/community', icon: MessageSquare, label: 'Communauté', labelKey: 'nav.community', description: 'Forum & events' },
      { href: '/partner-services', icon: Users, label: 'Partenaires', labelKey: 'nav.partnerServices', description: 'Services vérifiés' },
      { href: '/b2b', icon: Building2, label: 'B2B', labelKey: 'nav.b2b', description: 'Solutions entreprises' },
    ],
  },
];

// ============================================================
// QUICK ACCESS ITEMS - For header/dashboard shortcuts
// ============================================================

export const QUICK_ACCESS: NavItem[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', labelKey: 'nav.dashboard', description: 'Vue d\'ensemble' },
  { href: '/usage', icon: BarChart3, label: 'Consommation', labelKey: 'nav.usage', description: 'Quota & stats' },
  { href: '/settings/notifications', icon: Bell, label: 'Notifications', labelKey: 'nav.notifications', description: 'Alertes' },
  { href: '/pricing', icon: CreditCard, label: 'Tarifs', labelKey: 'nav.pricing', description: 'Plans & pricing' },
];

// ============================================================
// ACCOUNT/INFO ITEMS - For footer and account dropdown
// ============================================================

export const ACCOUNT_ITEMS: NavItem[] = [
  { href: '/about', icon: Info, label: 'À propos', labelKey: 'nav.about' },
  { href: '/how-to-read', icon: BookOpen, label: 'Guide', labelKey: 'nav.howToRead' },
  { href: '/pricing', icon: CreditCard, label: 'Tarifs', labelKey: 'nav.pricing' },
  { href: '/usage', icon: BarChart3, label: 'Consommation', labelKey: 'nav.usage' },
  { href: '/settings/notifications', icon: Bell, label: 'Notifications', labelKey: 'nav.notifications' },
  { href: '/partners', icon: Users, label: 'Partenaires', labelKey: 'nav.partners' },
  { href: '/b2b', icon: Building2, label: 'B2B', labelKey: 'nav.b2b' },
  { href: '/resources', icon: FileText, label: 'Ressources', labelKey: 'nav.resources' },
];

// ============================================================
// ADMIN ITEMS - Requires admin role
// ============================================================

export const ADMIN_ITEMS: NavItem[] = [
  { href: '/admin/country-generator', icon: Globe, label: 'Country Generator', requiresAdmin: true },
  { href: '/admin/analytics', icon: Settings, label: 'Analytics', requiresAdmin: true },
  { href: '/admin/partners', icon: Users, label: 'Partners', requiresAdmin: true },
  { href: '/admin/translations', icon: FileText, label: 'Translations', requiresAdmin: true },
  { href: '/admin/generate-translations', icon: FileText, label: 'Gen Translations', requiresAdmin: true },
  { href: '/admin/database-translations', icon: FileText, label: 'DB Translations', requiresAdmin: true },
  { href: '/admin/translations-sync', icon: FileText, label: 'Sync Translations', requiresAdmin: true },
  { href: '/seed-translations', icon: FileText, label: 'Seed Translations', requiresAdmin: true },
  { href: '/diagnostics', icon: Settings, label: 'Diagnostics', requiresAdmin: true },
];

// ============================================================
// HEADER NAV - Primary navigation items for header
// ============================================================

export const HEADER_NAV: NavItem[] = [
  { href: '/', icon: Compass, label: 'Démarrer', labelKey: 'nav.start' },
  { href: '/countries', icon: Map, label: 'Pays', labelKey: 'nav.countries' },
  { href: '/world-map', icon: Globe, label: 'Carte', labelKey: 'nav.worldMap' },
  { href: '/pyramid-types', icon: Triangle, label: 'Pyramides', labelKey: 'nav.pyramids' },
  { href: '/tools', icon: Wrench, label: 'Outils', labelKey: 'nav.tools', highlight: true },
  { href: '/compare', icon: Scale, label: 'Comparer', labelKey: 'nav.compare' },
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', labelKey: 'nav.dashboard' },
];

// ============================================================
// HELPERS - Filter and transform navigation items
// ============================================================

export function getGroupById(id: string): NavGroup | undefined {
  return NAV_GROUPS.find(group => group.id === id);
}

export function getAllItems(): NavItem[] {
  return NAV_GROUPS.flatMap(group => group.items);
}

export function getItemsByGroupIds(ids: string[]): NavItem[] {
  return NAV_GROUPS
    .filter(group => ids.includes(group.id))
    .flatMap(group => group.items);
}

export function getProItems(): NavItem[] {
  return getAllItems().filter(item => item.isPro);
}

export function getFreeItems(): NavItem[] {
  return getAllItems().filter(item => !item.isPro);
}

// For dropdown menus - get tools items (analyze + plan groups)
export function getToolsDropdownItems(): NavItem[] {
  return getItemsByGroupIds(['analyze', 'plan']);
}

// For dropdown menus - get pro items
export function getProDropdownItems(): NavItem[] {
  return getItemsByGroupIds(['pro', 'community']);
}

// Get items for footer columns
export function getFooterDiscoverItems(): NavItem[] {
  const group = getGroupById('discover');
  return group?.items || [];
}

export function getFooterToolsItems(): NavItem[] {
  // Return a subset of tools for footer
  return [
    ...getItemsByGroupIds(['plan']).slice(0, 2),
    ...getItemsByGroupIds(['analyze']).slice(0, 3),
  ];
}
