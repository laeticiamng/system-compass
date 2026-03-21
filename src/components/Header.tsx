import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';
import { LocalizedLink as Link } from '@/components/i18n';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Compass, Map, FileText, Scale, LogIn, LogOut, User, LayoutDashboard, Menu, Info, AlertCircle, X, Shield, BookOpen, CreditCard, Globe, Settings, Building2, Users, ChevronDown, Wrench, BarChart3, Mail, Stethoscope } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { GlobalSearch } from './GlobalSearch';
import { ThemeToggle } from './ThemeToggle';
import { GamificationProgressBar } from './GamificationProgressBar';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Button } from './ui/button';
import { SubscriptionBadge } from './SubscriptionBadge';
import { UserHistoryPanel } from './UserHistoryPanel';
import { NotificationBell } from './dashboard/NotificationBell';
import { SidebarTrigger } from './ui/sidebar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

// Pages that show simulation features and need the anti-illusion reminder
const SIMULATION_SEGMENTS = [
  '/exit-keys', '/life-game', '/compare', '/life-trajectory', 
  '/country/', '/systemic-mistakes', '/match', '/profile-test', '/pyramid-quiz'
];
const DISCLAIMER_DISMISSED_KEY = 'compass-disclaimer-dismissed';

export function Header() {
  const location = useLocation();
  const navigate = useLocalizedNavigate();
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRoles();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [disclaimerDismissed, setDisclaimerDismissed] = useState(() => {
    return localStorage.getItem(DISCLAIMER_DISMISSED_KEY) === 'true';
  });

  // Navigation principale SIMPLIFIÉE - 6 entrées max
  const navItems = [
    { href: '/', label: t('nav.home', 'Accueil'), icon: Compass },
    { href: '/countries', label: t('nav.countries', 'Explorer'), icon: Map },
    { href: '/quick-test', label: t('nav.quickTest', 'Test Rapide'), icon: User },
    
    { href: '/pricing', label: t('nav.pricing', 'Tarifs'), icon: CreditCard },
  ];
  
  // Ajouter Dashboard si connecté
  const allNavItems = user 
    ? [...navItems, { href: '/dashboard', label: t('nav.dashboard', 'Dashboard'), icon: LayoutDashboard }]
    : navItems;
  
  // Outils d'analyse (dropdown Outils) - 5 essentiels + lien vers hub
  const toolsItems = [
    { href: '/tools/matcher', label: t('nav.matcher', 'Trouver mon pays'), icon: Users },
    { href: '/tools/fiscal-simulator', label: t('nav.fiscalSimulator', 'Simulateur Fiscal'), icon: BarChart3 },
    { href: '/compare', label: t('nav.compare', 'Comparer'), icon: Scale },
    { href: '/prevention-filter', label: t('nav.preventionFilter', 'Aide à la décision'), icon: Shield },
    { href: '/healthcare', label: t('nav.healthcare', 'Parcours Santé'), icon: Stethoscope },
  ];

  // Pages info/compte — essentielles uniquement (Guide, Experts, Ressources restent accessibles via footer)
  const accountItems = [
    { href: '/about', label: t('nav.about', 'À propos'), icon: Info },
    { href: '/b2b', label: t('nav.b2b', 'Solutions B2B'), icon: Building2 },
    { href: '/contact', label: t('nav.contact', 'Contact'), icon: Mail },
  ];

  // Admin navigation items - fonctionnels uniquement
  const adminItems = [
    { href: '/admin/country-generator', label: 'Country Generator', icon: Globe },
    { href: '/admin/analytics', label: 'Analytics', icon: Settings },
    { href: '/admin/partners', label: 'Partners', icon: Users },
    { href: '/admin/translations', label: 'Translations', icon: FileText },
    { href: '/diagnostics', label: 'Diagnostics', icon: Settings },
  ];

  const { localizedPath } = useLocalizedPath();
  
  const handleSignOut = async () => {
    await signOut();
    navigate(localizedPath('/'));
    setMobileMenuOpen(false);
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  const handleDismissDisclaimer = () => {
    setDisclaimerDismissed(true);
    localStorage.setItem(DISCLAIMER_DISMISSED_KEY, 'true');
  };

  // Strip language prefix for route matching
  const pathForCheck = location.pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/';
  const isSimulationPage = SIMULATION_SEGMENTS.some(page => pathForCheck.startsWith(page));
  const showDisclaimer = isSimulationPage && !disclaimerDismissed;

  const isRouteActive = (href: string) => {
    if (href === '/') return pathForCheck === '/';
    if (href === '/countries') {
      return pathForCheck === '/countries' || pathForCheck === '/world-map' || pathForCheck.startsWith('/country/');
    }
    return pathForCheck === href || pathForCheck.startsWith(`${href}/`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Compact disclaimer banner for simulation pages */}
      {showDisclaimer && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-3 py-1.5">
          <div className="container mx-auto flex items-center justify-center gap-2 text-xs text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            <span className="text-center">
              {t('header.simulationDisclaimer', 'Simulation uniquement • Pas de conseil juridique, financier ou médical')}
            </span>
            <button 
              onClick={handleDismissDisclaimer}
              className="ml-2 p-0.5 rounded hover:bg-amber-500/20 transition-colors"
              aria-label={t('common.close', 'Fermer')}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
      <div className="glass-card border-b border-border/50 safe-area-inset">
        <div className="container mx-auto px-2 sm:px-3 md:px-4 h-12 sm:h-14 md:h-16 flex items-center justify-between gap-1 sm:gap-2">
        {/* Sidebar Toggle - only for authenticated users */}
        <div className="flex items-center gap-1 sm:gap-2">
          {user && <SidebarTrigger className="h-8 w-8 flex-shrink-0" />}
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 min-w-0">
            <div className="p-1 sm:p-1.5 md:p-2 rounded-lg bg-primary/10 flex-shrink-0">
              <Compass className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </div>
            <span className="font-display font-bold text-sm sm:text-base md:text-lg truncate">
              <span className="gold-text">Compass</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 min-w-0 flex-1 justify-end">
          {/* Desktop Nav - hide on smaller screens */}
          <nav className="hidden xl:flex items-center gap-0.5 overflow-hidden">
            {/* Main nav items */}
            {allNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = isRouteActive(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
            
            {/* Tools dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 h-8 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                  <Wrench className="w-3.5 h-3.5" />
                  {t('nav.tools', 'Analyser')}
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>{t('nav.tools', 'Analyser')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {toolsItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link to={item.href} className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/tools" className="flex items-center gap-2 font-medium text-primary">
                    <Wrench className="w-4 h-4" />
                    {t('nav.allTools', 'Tous les outils →')}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>


            {/* Account & Pro dropdown (merged) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 h-8 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                  <Info className="w-3.5 h-3.5" />
                  {t('nav.info', 'En savoir plus')}
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>{t('nav.info', 'En savoir plus')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {accountItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link to={item.href} className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Admin links for desktop - only show for admin users */}
            {isAdmin && (
              <>
                <div className="w-px h-4 bg-border mx-1" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-1 h-8 px-2.5 text-xs font-medium text-orange-600 hover:text-orange-700">
                      <Settings className="w-3.5 h-3.5" />
                      Admin
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Administration</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {adminItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link to={item.href} className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {item.label}
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </nav>

          <GlobalSearch />
          {user && <NotificationBell />}
          {user && <span className="hidden sm:inline"><UserHistoryPanel /></span>}
          {user && <GamificationProgressBar className="hidden md:flex" />}
          <ThemeToggle />
          <div className="hidden xl:block">
            <LanguageSwitcher />
          </div>

          {/* Auth button - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {user && <SubscriptionBadge />}
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground max-w-[100px] truncate">
                  <User className="w-3 h-3 inline mr-1" />
                  {user.user_metadata?.display_name || user.email?.split('@')[0]}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="gap-1 h-8 px-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline text-xs">{t('auth.logout')}</span>
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm" className="gap-1 h-8 px-2">
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline text-xs">{t('auth.login')}</span>
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu - only visible on mobile (sidebar handles desktop) */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="xl:hidden h-9 w-9 sm:h-8 sm:w-8 flex-shrink-0">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-80 p-4 sm:p-6 overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-primary" />
                  Compass
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 mt-6">
                {/* Navigation principale */}
                <div className="px-4 py-1 text-xs text-muted-foreground uppercase tracking-wider">{t('nav.explore', 'Explorer')}</div>
                {allNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isRouteActive(item.href);
                  const isHighlight = 'highlight' in item && item.highlight;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={handleNavClick}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : isHighlight
                            ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
                
                {/* Outils */}
                <div className="border-t border-border my-3" />
                <div className="px-4 py-1 text-xs text-muted-foreground uppercase tracking-wider">{t('nav.tools', 'Analyser')}</div>
                {toolsItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isRouteActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={handleNavClick}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}


                {/* Compte & Info (includes Pro modules) */}
                <div className="border-t border-border my-3" />
                <div className="px-4 py-1 text-xs text-muted-foreground uppercase tracking-wider">{t('nav.info', 'En savoir plus')}</div>
                {accountItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isRouteActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={handleNavClick}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
                
                {/* Mobile Language Switcher */}
                <div className="border-t border-border my-3" />
                <div className="px-4 py-1 text-xs text-muted-foreground uppercase tracking-wider">{t('nav.language', 'Langue')}</div>
                <div className="px-4 py-2">
                  <LanguageSwitcher className="w-full justify-start" />
                </div>
                
                <div className="border-t border-border my-3" />
                
{user ? (
                  <>
                    <div className="px-4 py-2 flex items-center gap-2">
                      <SubscriptionBadge />
                    </div>
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4 inline mr-2" />
                      {user.user_metadata?.display_name || user.email?.split('@')[0]}
                    </div>
                    
                    {/* Admin Links - only for admins */}
                    {isAdmin && (
                      <>
                        <div className="border-t border-border my-4" />
                        <div className="px-4 py-1 text-xs text-muted-foreground uppercase tracking-wider">Admin</div>
                        {adminItems.map((item) => {
                          const Icon = item.icon;
                          const isActive = isRouteActive(item.href);
                          return (
                            <Link
                              key={item.href}
                              to={item.href}
                              onClick={handleNavClick}
                              className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                                isActive
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                              )}
                            >
                              <Icon className="w-5 h-5" />
                              {item.label}
                            </Link>
                          );
                        })}
                      </>
                    )}
                    
                    <div className="border-t border-border my-4" />
                    <Button 
                      variant="outline" 
                      onClick={handleSignOut}
                      className="mx-4 gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('auth.logout')}
                    </Button>
                  </>
                ) : (
                  <Link to="/auth" onClick={handleNavClick} className="mx-4">
                    <Button variant="default" className="w-full gap-2">
                      <LogIn className="w-4 h-4" />
                      {t('auth.login')}
                    </Button>
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        </div>
      </div>
    </header>
  );
}
