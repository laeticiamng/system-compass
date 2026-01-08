import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Compass, Map, FileText, Target, Scale, Route, Triangle, Gamepad2, LogIn, LogOut, User, Key, LayoutDashboard } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './ui/button';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, signOut } = useAuth();

  const navItems = [
    { href: '/', label: t('nav.start'), icon: Compass },
    { href: '/countries', label: t('nav.countries'), icon: Map },
    { href: '/pyramid-types', label: t('nav.pyramids'), icon: Triangle },
    { href: '/pyramid-quiz', label: t('nav.quiz'), icon: Gamepad2 },
    { href: '/life-trajectory', label: t('nav.trajectory'), icon: Route },
    { href: '/match', label: t('nav.match'), icon: Target },
    { href: '/compare', label: t('nav.compare'), icon: Scale },
    { href: '/multi-compare', label: t('nav.multiCompare', 'Multi-Compare'), icon: Scale },
    { href: '/exit-keys', label: t('nav.exitKeys'), icon: Key },
    { href: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: '/resources', label: t('nav.resources'), icon: FileText },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Compass className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display font-bold text-lg">
            Pyramid <span className="gold-text">Compass</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
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
          </nav>

          <LanguageSwitcher />

          {/* Auth button */}
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden md:block text-sm text-muted-foreground">
                <User className="w-4 h-4 inline mr-1" />
                {user.user_metadata?.display_name || user.email?.split('@')[0]}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="gap-1"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">{t('auth.logout')}</span>
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm" className="gap-1">
                <LogIn className="w-4 h-4" />
                <span className="hidden md:inline">{t('auth.login')}</span>
              </Button>
            </Link>
          )}

          {/* Mobile nav */}
          <nav className="lg:hidden flex items-center gap-1 overflow-x-auto">
            {navItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'p-2 rounded-lg transition-colors flex-shrink-0',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
