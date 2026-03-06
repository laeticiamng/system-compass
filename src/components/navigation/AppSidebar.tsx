/**
 * AppSidebar - Global navigation sidebar with quick access to all modules
 * Consumes centralized navigation config from @/config/navigation
 * Collapsible, keyboard-accessible (Ctrl+B), with contextual highlights and favorites
 * ARIA-enhanced for screen reader support
 */

import { useLocation } from 'react-router-dom';
import { LocalizedLink as Link } from '@/components/i18n';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
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
import { NAV_GROUPS, type NavGroup, type NavItem } from '@/config/navigation';
import { Compass } from 'lucide-react';

export function AppSidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  // Hide sidebar entirely for non-authenticated users
  if (!user) return null;

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
              System <span className="text-primary">Compass</span>
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Favorites section at top */}
        <FavoritesSidebar />
        
        {/* Navigation groups from centralized config */}
        {NAV_GROUPS.map((group: NavGroup) => (
          <SidebarGroup key={group.id}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu role="menu">
                {group.items.map((item: NavItem) => {
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
                          {item.badge && !isCollapsed && (
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
