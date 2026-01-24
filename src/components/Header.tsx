import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Compass, Map, FileText, Scale, Triangle, Gamepad2, LogIn, LogOut, User, Key, LayoutDashboard, Menu, Play, Info, AlertCircle, X, Shield, BookOpen, CreditCard, Globe, Settings, Building2, Eye, Users, ChevronDown, Wrench, Bell, BarChart3 } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { GlobalSearch } from './GlobalSearch';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Button } from './ui/button';
import { SubscriptionBadge } from './SubscriptionBadge';
import { UserHistoryPanel } from './UserHistoryPanel';
import { NotificationBell } from './dashboard/NotificationBell';
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
const SIMULATION_PAGES = [
  '/exit-keys', 
  '/life-game', 
  '/compare', 
  '/life-trajectory', 
  '/country/', 
  '/systemic-mistakes',
  '/match',
  '/profile-test',
  '/pyramid-quiz'
];
const DISCLAIMER_DISMISSED_KEY = 'pyramid-disclaimer-dismissed';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRoles();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [disclaimerDismissed, setDisclaimerDismissed] = useState(() => {
    return localStorage.getItem(DISCLAIMER_DISMISSED_KEY) === 'true';
  });

  // Navigation principale - pages essentielles uniquement
  const navItems = [
    { href: '/', label: t('nav.start'), icon: Compass },
    { href: '/countries', label: t('nav.countries'), icon: Map },
    { href: '/world-map', label: t('nav.worldMap', 'Carte'), icon: Globe },
    { href: '/pyramid-types', label: t('nav.pyramids'), icon: Triangle },
    { href: '/exit-keys', label: t('nav.exitKeys'), icon: Key },
    { href: '/compare', label: t('nav.compare'), icon: Scale },
    { href: '/pyramid-quiz', label: t('nav.pyramidQuiz', 'Jeu'), icon: Gamepad2 },
    { href: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
  ];
  
  // Outils d'analyse et simulation
  const toolsItems = [
    { href: '/quick-test', label: t('nav.quickTest', 'Test Rapide'), icon: Gamepad2 },
    { href: '/profile-test', label: t('nav.profileTest', 'Test Complet'), icon: User },
    { href: '/profile-matcher', label: t('nav.profileMatcher', 'Matcher Pays'), icon: Users },
    { href: '/life-trajectory', label: t('nav.lifeTrajectory', 'Trajectoire'), icon: Map },
    { href: '/life-game', label: t('nav.lifeGame', 'Mode Éducatif'), icon: Play },
    { href: '/prevention-filter', label: t('nav.preventionFilter', 'Filtre Décision'), icon: Shield },
    { href: '/financial-safety-intel', label: t('nav.financialIntel', 'Intel Financière'), icon: Shield },
    { href: '/terrain', label: t('nav.terrainRealities', 'Réalités Terrain'), icon: Map },
    { href: '/errors-illusions', label: t('nav.errorsIllusions', 'Erreurs & Illusions'), icon: BookOpen },
    { href: '/exit-keys/catalog', label: t('nav.exitKeysCatalog', 'Catalogue Clés'), icon: Key },
    { href: '/compare-exit-keys', label: t('nav.exitKeysCompare', 'Comparer Clés'), icon: Scale },
  ];

  // Modules avancés (B2B / Pro)
  const advancedItems = [
    { href: '/institutions', label: t('nav.institutions', 'TraceOS'), icon: Building2 },
    { href: '/latent', label: t('nav.latent', 'Zones Latentes'), icon: Eye },
    { href: '/irreversa', label: t('nav.irreversa', 'Irreversa'), icon: AlertCircle },
    { href: '/ovi', label: t('nav.ovi', 'OVI'), icon: Eye },
  ];

  // Pages info/compte
  const accountItems = [
    { href: '/about', label: t('nav.about', 'À propos'), icon: Info },
    { href: '/how-to-read', label: t('nav.howToRead', 'Guide'), icon: BookOpen },
    { href: '/pricing', label: t('nav.pricing', 'Tarifs'), icon: CreditCard },
    { href: '/usage', label: t('nav.usage', 'Consommation'), icon: BarChart3 },
    { href: '/settings/notifications', label: t('nav.notifications', 'Notifications'), icon: Bell },
    { href: '/partners', label: t('nav.partners', 'Partenaires'), icon: Users },
    { href: '/b2b', label: t('nav.b2b', 'B2B'), icon: Building2 },
    { href: '/resources', label: t('nav.resources'), icon: FileText },
  ];

  // Admin navigation items - requires admin role check via useUserRoles
  const adminItems = [
    { href: '/admin/country-generator', label: 'Country Generator', icon: Globe },
    { href: '/admin/analytics', label: 'Analytics', icon: Settings },
    { href: '/admin/partners', label: 'Partners', icon: Users },
    { href: '/admin/translations', label: 'Translations', icon: FileText },
    { href: '/admin/generate-translations', label: 'Gen Translations', icon: FileText },
    { href: '/admin/database-translations', label: 'DB Translations', icon: FileText },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  const handleDismissDisclaimer = () => {
    setDisclaimerDismissed(true);
    localStorage.setItem(DISCLAIMER_DISMISSED_KEY, 'true');
  };

  // Check if current page is a simulation page
  const isSimulationPage = SIMULATION_PAGES.some(page => location.pathname.startsWith(page));
  const showDisclaimer = isSimulationPage && !disclaimerDismissed;

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
              aria-label="Fermer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
      <div className="glass-card border-b border-border/50 safe-area-inset">
        <div className="container mx-auto px-2 sm:px-3 md:px-4 h-12 sm:h-14 md:h-16 flex items-center justify-between gap-1 sm:gap-2">
        <Link to="/" className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 min-w-0">
          <div className="p-1 sm:p-1.5 md:p-2 rounded-lg bg-primary/10 flex-shrink-0">
            <Compass className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          </div>
          <span className="font-display font-bold text-sm sm:text-base md:text-lg truncate">
            <span className="hidden xs:inline">Pyramid </span>
            <span className="gold-text">Compass</span>
          </span>
        </Link>

        <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 min-w-0 flex-1 justify-end">
          {/* Desktop Nav - hide on smaller screens */}
          <nav className="hidden xl:flex items-center gap-0.5">
            {/* Main nav items */}
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
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
                  {t('nav.tools', 'Outils')}
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>{t('nav.tools', 'Outils')}</DropdownMenuLabel>
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
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Modules Pro dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 h-8 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                  <Building2 className="w-3.5 h-3.5" />
                  {t('nav.advanced', 'Pro')}
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>{t('nav.advanced', 'Modules Pro')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {advancedItems.map((item) => {
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

            {/* Account dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 h-8 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                  <Info className="w-3.5 h-3.5" />
                  {t('nav.info', 'Info')}
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>{t('nav.account', 'Compte & Info')}</DropdownMenuLabel>
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

          <div className="hidden sm:block">
            <GlobalSearch />
          </div>
          {user && <NotificationBell />}
          {user && <span className="hidden sm:inline"><UserHistoryPanel /></span>}
          <LanguageSwitcher />

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
                  <span className="hidden lg:inline text-xs">{t('auth.logout')}</span>
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm" className="gap-1 h-8 px-2">
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline text-xs">{t('auth.login')}</span>
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu */}
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
                  Pyramid Compass
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 mt-6">
                {/* Navigation principale */}
                <div className="px-4 py-1 text-xs text-muted-foreground uppercase tracking-wider">{t('nav.explore', 'Explorer')}</div>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
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
                <div className="px-4 py-1 text-xs text-muted-foreground uppercase tracking-wider">{t('nav.tools', 'Outils')}</div>
                {toolsItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
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

                {/* Modules Avancés */}
                <div className="border-t border-border my-3" />
                <div className="px-4 py-1 text-xs text-muted-foreground uppercase tracking-wider">{t('nav.advanced', 'Modules Pro')}</div>
                {advancedItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
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

                {/* Compte & Info */}
                <div className="border-t border-border my-3" />
                <div className="px-4 py-1 text-xs text-muted-foreground uppercase tracking-wider">{t('nav.account', 'Compte & Info')}</div>
                {accountItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
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
                          const isActive = location.pathname === item.href;
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
