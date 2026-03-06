import { useLocation } from 'react-router-dom';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Key, 
  Globe, 
  LayoutDashboard, 
  Menu 
} from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';

interface NavItem {
  id: string;
  labelKey: string;
  icon: React.ReactNode;
  route: string;
}

const navItems: NavItem[] = [
  {
    id: 'home',
    labelKey: 'nav.home',
    icon: <Home className="w-5 h-5" />,
    route: '/',
  },
  {
    id: 'exit-keys',
    labelKey: 'nav.exitKeys',
    icon: <Key className="w-5 h-5" />,
    route: '/exit-keys',
  },
  {
    id: 'countries',
    labelKey: 'nav.countries',
    icon: <Globe className="w-5 h-5" />,
    route: '/countries',
  },
  {
    id: 'dashboard',
    labelKey: 'nav.dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    route: '/dashboard',
  },
];

export function MobileBottomNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useLocalizedNavigate();
  const { toggleSidebar } = useSidebar();

  const isActive = (route: string) => {
    if (route === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(route);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-lg border-t border-border/50 safe-area-bottom"
      role="navigation"
      aria-label={t('nav.mobileNavigation', 'Mobile navigation')}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.route)}
            className={cn(
              'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[60px]',
              isActive(item.route)
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
            aria-current={isActive(item.route) ? 'page' : undefined}
          >
            {item.icon}
            <span className="text-[10px] font-medium leading-tight">
              {t(item.labelKey, item.id)}
            </span>
          </button>
        ))}
        
        {/* Menu button */}
        <button
          onClick={toggleSidebar}
          className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 min-w-[60px]"
          aria-label={t('nav.openMenu', 'Open menu')}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-medium leading-tight">
            {t('nav.more', 'Plus')}
          </span>
        </button>
      </div>
    </nav>
  );
}
