/**
 * AppSidebar - Global navigation sidebar with quick access to all modules
 * Collapsible, keyboard-accessible (Ctrl+B), with contextual highlights and favorites
 * ARIA-enhanced for screen reader support
 */

import { useLocation, Link } from 'react-router-dom';
import {
  Compass, Map, Globe, Triangle, Key, Scale, Gamepad2,
  User, Users, Play, Shield, BarChart3, BookOpen,
  Building2, Eye, AlertCircle, LayoutDashboard,
  Calculator, Target, Zap, Award, MessageSquare,
  Wrench, Home, ChevronRight
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { FavoritesSidebar } from './FavoritesSidebar';

const NAV_GROUPS = [
  {
    id: 'main',
    label: 'Principal',
    items: [
      { href: '/', icon: Home, label: 'Accueil' },
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/tools', icon: Wrench, label: 'Hub Outils', badge: 'New' },
    ],
  },
  {
    id: 'discover',
    label: 'Découvrir',
    items: [
      { href: '/countries', icon: Map, label: 'Pays' },
      { href: '/world-map', icon: Globe, label: 'Carte Monde' },
      { href: '/pyramid-types', icon: Triangle, label: 'Pyramides' },
      { href: '/compare', icon: Scale, label: 'Comparer' },
      { href: '/terrain', icon: Map, label: 'Réalités Terrain' },
    ],
  },
  {
    id: 'analyze',
    label: 'Analyser',
    items: [
      { href: '/quick-test', icon: Zap, label: 'Test Rapide' },
      { href: '/profile-test', icon: User, label: 'Test Complet' },
      { href: '/profile-matcher', icon: Target, label: 'Matcher' },
      { href: '/fiscal-calculator', icon: Calculator, label: 'Calculateur Fiscal' },
      { href: '/life-trajectory', icon: BarChart3, label: 'Trajectoire' },
    ],
  },
  {
    id: 'plan',
    label: 'Planifier',
    items: [
      { href: '/exit-keys', icon: Key, label: 'Exit Keys' },
      { href: '/exit-keys/catalog', icon: Key, label: 'Catalogue' },
      { href: '/prevention-filter', icon: Shield, label: 'Filtre Décision' },
      { href: '/errors-illusions', icon: BookOpen, label: 'Erreurs' },
    ],
  },
  {
    id: 'learn',
    label: 'Apprendre',
    items: [
      { href: '/pyramid-quiz', icon: Gamepad2, label: 'Quiz' },
      { href: '/life-game', icon: Play, label: 'Mode Éducatif' },
      { href: '/gamification', icon: Award, label: 'Progression' },
      { href: '/personas', icon: Users, label: 'Personas' },
    ],
  },
  {
    id: 'pro',
    label: 'Pro',
    items: [
      { href: '/institutions', icon: Building2, label: 'TraceOS' },
      { href: '/latent', icon: Eye, label: 'Zones Latentes' },
      { href: '/irreversa', icon: AlertCircle, label: 'Irreversa' },
      { href: '/ovi', icon: Eye, label: 'OVI' },
    ],
  },
  {
    id: 'community',
    label: 'Communauté',
    items: [
      { href: '/experts', icon: Users, label: 'Experts' },
      { href: '/community', icon: MessageSquare, label: 'Forum' },
      { href: '/partner-services', icon: Building2, label: 'Partenaires' },
    ],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <Sidebar 
      collapsible="icon" 
      className="border-r border-border/50 hidden md:flex"
      aria-label="Navigation principale"
    >
      <SidebarHeader className="border-b border-border/50">
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Compass className="w-5 h-5 text-primary" aria-hidden="true" />
          </div>
          {!isCollapsed && (
            <span className="font-display font-bold text-sm">
              Pyramid <span className="text-primary">Compass</span>
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Favorites section at top */}
        <FavoritesSidebar />
        
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.id}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu role="menu">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <SidebarMenuItem key={item.href} role="none">
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.label}
                      >
                        <Link 
                          to={item.href} 
                          role="menuitem"
                          aria-current={active ? 'page' : undefined}
                          className={cn(
                            "flex items-center gap-2",
                            "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                            "focus-visible:outline-none rounded-md"
                          )}
                        >
                          <Icon 
                            className={cn(
                              "w-4 h-4",
                              active ? "text-primary" : "text-muted-foreground"
                            )} 
                            aria-hidden="true"
                          />
                          <span className="flex-1">{item.label}</span>
                          {'badge' in item && item.badge && !isCollapsed && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {item.badge}
                            </Badge>
                          )}
                          {active && !isCollapsed && (
                            <ChevronRight className="w-3 h-3 text-primary" aria-hidden="true" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50">
        <div className="flex items-center justify-between px-2 py-1">
          {!isCollapsed && (
            <span className="text-xs text-muted-foreground">
              Ctrl+B pour basculer
            </span>
          )}
          <SidebarTrigger className="ml-auto" aria-label="Basculer la sidebar" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
