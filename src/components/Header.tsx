import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Compass, Map, FileText, Scale, Triangle, Gamepad2, LogIn, LogOut, User, Key, LayoutDashboard, Menu, Play, Info, AlertCircle, X, Shield, BookOpen, CreditCard, Globe, Settings, Building2, Eye, Users } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { GlobalSearch } from './GlobalSearch';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './ui/button';
import { SubscriptionBadge } from './SubscriptionBadge';
import { UserHistoryPanel } from './UserHistoryPanel';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [disclaimerDismissed, setDisclaimerDismissed] = useState(() => {
    return localStorage.getItem(DISCLAIMER_DISMISSED_KEY) === 'true';
  });

  // Navigation simplifiée et claire
  const navItems = [
    { href: '/', label: t('nav.start'), icon: Compass },
    { href: '/orientation-hub', label: t('nav.orientationHub', 'Orientation'), icon: Compass, highlight: true },
    { href: '/prevention-filter', label: t('nav.preventionFilter', 'Filtre'), icon: Shield },
    { href: '/world-map', label: t('nav.worldMap', 'Carte'), icon: Globe },
    { href: '/errors-illusions', label: t('nav.errorsIllusions', 'Erreurs'), icon: BookOpen },
    { href: '/countries', label: t('nav.countries'), icon: Map },
    { href: '/pyramid-types', label: t('nav.pyramids'), icon: Triangle },
    { href: '/life-game', label: t('nav.lifeGame'), icon: Play },
    { href: '/exit-keys', label: t('nav.exitKeys'), icon: Key },
    { href: '/compare', label: t('nav.compare'), icon: Scale },
    { href: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: '/pricing', label: t('nav.pricing', 'Tarifs'), icon: CreditCard },
    { href: '/partners', label: t('nav.partners', 'Partenaires'), icon: Users, highlight: true },
    { href: '/b2b', label: t('nav.b2b', 'B2B'), icon: Building2 },
    { href: '/resources', label: t('nav.resources'), icon: FileText },
    { href: '/about', label: t('footer.about'), icon: Info },
  ];

  // Admin navigation items (only show for authenticated users)
  const adminItems = [
    { href: '/admin/country-generator', label: 'Country Generator', icon: Globe },
    { href: '/admin/analytics', label: 'Analytics', icon: Settings },
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
      <div className="glass-card border-b border-border/50">
        <div className="container mx-auto px-3 md:px-4 h-14 md:h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="p-1.5 md:p-2 rounded-lg bg-primary/10">
            <Compass className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          </div>
          <span className="font-display font-bold text-base md:text-lg">
            <span className="hidden sm:inline">Pyramid </span>
            <span className="gold-text">Compass</span>
          </span>
        </Link>

        <div className="flex items-center gap-1 md:gap-2">
          {/* Desktop Nav - hide on smaller screens */}
          <nav className="hidden xl:flex items-center gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              const isHighlight = 'highlight' in item && item.highlight;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : isHighlight
                        ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/30'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
            
            {/* Admin links for desktop - only show for authenticated users */}
            {user && (
              <>
                <div className="w-px h-4 bg-border mx-1" />
                {adminItems.map((item) => {
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
                          : 'text-orange-600 hover:text-orange-700 hover:bg-orange-500/10'
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {item.label}
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          <GlobalSearch />
          <UserHistoryPanel />
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
              <Button variant="ghost" size="icon" className="xl:hidden h-8 w-8">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 sm:w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-primary" />
                  Pyramid Compass
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 mt-6">
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
                        'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : isHighlight
                            ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
                
                <div className="border-t border-border my-4" />
                
{user ? (
                  <>
                    <div className="px-4 py-2 flex items-center gap-2">
                      <SubscriptionBadge />
                    </div>
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4 inline mr-2" />
                      {user.user_metadata?.display_name || user.email?.split('@')[0]}
                    </div>
                    
                    {/* Admin Links */}
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
