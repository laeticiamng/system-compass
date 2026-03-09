/**
 * Navigation Configuration - Single Source of Truth
 * Simplifié v7.0.8 - 6 entrées principales max
 * Used by Header, AppSidebar, Footer, and ToolsHub
 */

import {
  Compass, Map, Globe, Key, Users,
  BarChart3, BookOpen, LayoutDashboard, CreditCard,
  Zap, FileText, Bell, Home, Wrench, Stethoscope,
  Info, Settings, AlertTriangle, Clock, type LucideIcon
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

export interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  labelKey?: string;
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
  titleKey?: string;
  description?: string;
  icon: LucideIcon;
  color?: string;
  borderColor?: string;
  badge?: string;
  items: NavItem[];
}

// ============================================================
// NAVIGATION SIMPLIFIÉE - 6 ENTRÉES MAX
// ============================================================

/** Navigation principale - visible dans Header et Sidebar */
export const MAIN_NAV: NavItem[] = [
  { href: '/', icon: Home, label: 'Accueil', labelKey: 'nav.home' },
  { href: '/countries', icon: Map, label: 'Explorer', labelKey: 'nav.countries', description: 'Pays & carte monde' },
  { href: '/quick-test', icon: Zap, label: 'Test Rapide', labelKey: 'nav.quickTest', description: 'Test rapide 2min' },
  { href: '/tools', icon: Wrench, label: 'Outils', labelKey: 'nav.tools', highlight: true },
  { href: '/pricing', icon: CreditCard, label: 'Tarifs', labelKey: 'nav.pricing' },
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', labelKey: 'nav.dashboard', requiresAuth: true },
];

// ============================================================
// NAVIGATION GROUPS - Pour Sidebar et ToolsHub (détaillé)
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
      { href: '/pricing', icon: CreditCard, label: 'Tarifs', labelKey: 'nav.pricing' },
      { href: '/about', icon: Info, label: 'À propos', labelKey: 'nav.about' },
    ],
  },
  {
    id: 'discover',
    title: 'Découvrir',
    titleKey: 'nav.groups.discover',
    description: 'Explorer les pays et comprendre les différences',
    icon: Compass,
    color: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500/30',
    items: [
      { href: '/countries', icon: Map, label: 'Catalogue Pays', labelKey: 'nav.countries', description: '80+ pays analysés en profondeur' },
      { href: '/exit-keys', icon: Key, label: 'Stratégies', labelKey: 'nav.exitKeys', description: 'Stratégies de sortie' },
      { href: '/quick-test', icon: Zap, label: 'Quick Test', labelKey: 'nav.quickTest', description: 'Test rapide 2min' },
    ],
  },
  {
    id: 'plan',
    title: 'Planifier',
    titleKey: 'nav.groups.plan',
    description: 'Préparer concrètement votre expatriation',
    icon: Clock,
    color: 'from-emerald-500/20 to-green-500/20',
    borderColor: 'border-emerald-500/30',
    items: [
      { href: '/expatriation-timeline', icon: Clock, label: 'Timeline', labelKey: 'nav.timeline', description: 'J-180 à J+90' },
      { href: '/checklist', icon: BookOpen, label: 'Checklist', labelKey: 'nav.checklist', description: 'Admin par pays' },
      { href: '/fiscal-before-after', icon: BarChart3, label: 'Avant/Après', labelKey: 'nav.beforeAfter', description: 'Comparaison fiscale' },
      { href: '/regulatory-alerts', icon: AlertTriangle, label: 'Alertes', labelKey: 'nav.alerts', description: 'Veille réglementaire', badge: 'Live' },
      { href: '/family-workspace', icon: Users, label: 'Famille', labelKey: 'nav.family', description: 'Espace collaboratif' },
    ],
  },
  {
    id: 'healthcare',
    title: 'Santé',
    titleKey: 'nav.groups.healthcare',
    description: 'Parcours professionnel de santé',
    icon: Stethoscope,
    color: 'from-rose-500/20 to-pink-500/20',
    borderColor: 'border-rose-500/30',
    badge: 'New',
    items: [
      { href: '/healthcare', icon: Stethoscope, label: 'Parcours Santé', labelKey: 'nav.healthcare', description: 'Diplômes, autorisations, protection sociale', badge: 'New' },
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
  { href: '/resources', icon: FileText, label: 'Ressources', labelKey: 'nav.resources' },
];

// ============================================================
// ADMIN ITEMS - Requires admin role (fonctionnels uniquement)
// ============================================================

export const ADMIN_ITEMS: NavItem[] = [
  { href: '/admin/country-generator', icon: Globe, label: 'Country Generator', requiresAdmin: true },
  { href: '/admin/analytics', icon: Settings, label: 'Analytics', requiresAdmin: true },
  { href: '/admin/partners', icon: Users, label: 'Partners', requiresAdmin: true },
  { href: '/admin/translations', icon: FileText, label: 'Translations', requiresAdmin: true },
  { href: '/diagnostics', icon: Settings, label: 'Diagnostics', requiresAdmin: true },
];

// ============================================================
// HEADER NAV - Primary 6 items for header (SIMPLIFIÉ)
// ============================================================

export const HEADER_NAV: NavItem[] = MAIN_NAV;

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
  return getItemsByGroupIds(['pro']);
}

// Get items for footer columns
export function getFooterDiscoverItems(): NavItem[] {
  const group = getGroupById('discover');
  return group?.items || [];
}

export function getFooterToolsItems(): NavItem[] {
  return [
    ...getItemsByGroupIds(['plan']).slice(0, 2),
    ...getItemsByGroupIds(['analyze']).slice(0, 3),
  ];
}
