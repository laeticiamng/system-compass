import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass, Heart, RotateCcw } from 'lucide-react';
import { CountryIndicator } from './CountryIndicator';
import { useResetOnboarding } from './OnboardingDialog';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const resetOnboarding = useResetOnboarding();

  return (
    <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Compass className="w-5 h-5 text-primary" />
              </div>
              <span className="font-display font-bold text-lg">
                Pyramid <span className="gold-text">Compass</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {t('common.tagline')}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.explore', 'Explore')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/countries" className="hover:text-foreground transition-colors">{t('nav.countries')}</Link></li>
              <li><Link to="/pyramid-types" className="hover:text-foreground transition-colors">{t('nav.pyramids')}</Link></li>
              <li><Link to="/compare" className="hover:text-foreground transition-colors">{t('nav.compare')}</Link></li>
              <li><Link to="/resources" className="hover:text-foreground transition-colors">{t('nav.resources')}</Link></li>
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.tools', 'Tools')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/profile-test" className="hover:text-foreground transition-colors">{t('footer.profileTest', 'Profile Test')}</Link></li>
              <li><Link to="/life-trajectory" className="hover:text-foreground transition-colors">{t('nav.trajectory')}</Link></li>
              <li><Link to="/exit-keys" className="hover:text-foreground transition-colors">{t('nav.exitKeys')}</Link></li>
              <li><Link to="/pyramid-quiz" className="hover:text-foreground transition-colors">{t('nav.quiz')}</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.account', 'Account')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/dashboard" className="hover:text-foreground transition-colors">{t('nav.dashboard')}</Link></li>
              <li><Link to="/auth" className="hover:text-foreground transition-colors">{t('auth.login')}</Link></li>
              <li><Link to="/about" className="hover:text-foreground transition-colors">{t('footer.about', 'À propos')}</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border/50 flex flex-col gap-4">
          {/* Country indicator and tutorial reset */}
          <div className="flex flex-wrap justify-center items-center gap-4">
            <CountryIndicator />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={resetOnboarding}
                  className="text-muted-foreground hover:text-foreground h-auto py-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  <span className="text-sm">{t('footer.restartTutorial', 'Revoir le tutoriel')}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('footer.restartTutorialTooltip', 'Relancer le tutoriel de bienvenue')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {currentYear} {t('common.appName')}. {t('common.disclaimer')}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                {t('footer.madeWith', 'Made with')} <Heart className="w-4 h-4 text-primary fill-primary" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}