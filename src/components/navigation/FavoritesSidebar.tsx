/**
 * FavoritesSidebar - Favorites section in sidebar with star toggle
 * Shows user's pinned favorite pages for quick access
 */

import { Link, useLocation } from 'react-router-dom';
import { Star, Compass, Map, Globe, Triangle, Key, Scale, Gamepad2,
  User, Users, Play, Shield, BarChart3, BookOpen,
  Building2, Eye, AlertCircle, LayoutDashboard,
  Calculator, Target, Zap, Award, MessageSquare,
  Wrench, Home } from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';

// Icon mapping for serialization
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Home, Compass, Map, Globe, Triangle, Key, Scale, Gamepad2,
  User, Users, Play, Shield, BarChart3, BookOpen,
  Building2, Eye, AlertCircle, LayoutDashboard,
  Calculator, Target, Zap, Award, MessageSquare, Wrench, Star,
};

interface FavoritesSidebarProps {
  className?: string;
}

export function FavoritesSidebar({ className }: FavoritesSidebarProps) {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const { favorites, removeFavorite } = useFavorites();

  if (favorites.length === 0) return null;

  return (
    <SidebarGroup className={className}>
      <SidebarGroupLabel className="flex items-center gap-1">
        <Star className="w-3 h-3 text-primary fill-primary" />
        {!isCollapsed && <span>Favoris</span>}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {favorites.map((item) => {
            const Icon = ICON_MAP[item.icon] || Star;
            const isActive = location.pathname === item.href;
            
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
                >
                  <Link to={item.href} className="flex items-center gap-2 group">
                    <Icon className={cn(
                      "w-4 h-4",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {!isCollapsed && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeFavorite(item.href);
                        }}
                      >
                        <Star className="w-3 h-3 text-primary fill-primary" />
                      </Button>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

/** Star button to add/remove from favorites */
interface FavoriteToggleProps {
  href: string;
  label: string;
  iconName: string;
  className?: string;
}

export function FavoriteToggle({ href, label, iconName, className }: FavoriteToggleProps) {
  const { isFavorite, toggleFavorite, canAddMore } = useFavorites();
  const isStarred = isFavorite(href);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite({ href, label, icon: iconName });
  };

  // Don't show if at max and not already a favorite
  if (!isStarred && !canAddMore) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "h-5 w-5 transition-all",
        isStarred ? "opacity-100" : "opacity-0 group-hover:opacity-60",
        className
      )}
      onClick={handleToggle}
      title={isStarred ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <Star className={cn(
        "w-3 h-3 transition-colors",
        isStarred ? "text-primary fill-primary" : "text-muted-foreground"
      )} />
    </Button>
  );
}
