import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass, Heart, RotateCcw } from 'lucide-react';
import { CountryIndicator } from './CountryIndicator';
import { useResetOnboarding } from './DialogCoordinator';
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
    <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm pb-safe">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <span className="font-display font-bold text-base sm:text-lg">
                Pyramid <span className="gold-text">Compass</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3">
              {t('common.tagline')}
            </p>
            <Link 
              to="/tools" 
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              🧭 {t('footer.allTools', 'Voir tous les outils')} →
            </Link>
          </div>

          {/* Discover */}
          <div>
            <h4 className="font-semibold text-sm sm:text-base mb-2 sm:mb-4">{t('footer.explore')}</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li><Link to="/countries" className="hover:text-foreground transition-colors block py-0.5">{t('nav.countries')}</Link></li>
              <li><Link to="/world-map" className="hover:text-foreground transition-colors block py-0.5">{t('nav.worldMap', 'Carte monde')}</Link></li>
              <li><Link to="/pyramid-types" className="hover:text-foreground transition-colors block py-0.5">{t('nav.pyramids')}</Link></li>
              <li><Link to="/compare" className="hover:text-foreground transition-colors block py-0.5">{t('nav.compare')}</Link></li>
              <li><Link to="/terrain" className="hover:text-foreground transition-colors block py-0.5">{t('nav.terrainRealities', 'Réalités Terrain')}</Link></li>
            </ul>
          </div>

          {/* Tools - Simplified */}
          <div>
            <h4 className="font-semibold text-sm sm:text-base mb-2 sm:mb-4">{t('footer.tools')}</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li><Link to="/exit-keys" className="hover:text-foreground transition-colors block py-0.5">{t('nav.exitKeys')}</Link></li>
              <li><Link to="/quick-test" className="hover:text-foreground transition-colors block py-0.5">{t('nav.quickTest', 'Test Rapide')}</Link></li>
              <li><Link to="/profile-matcher" className="hover:text-foreground transition-colors block py-0.5">{t('nav.profileMatcher', 'Matcher Pays')}</Link></li>
              <li><Link to="/fiscal-calculator" className="hover:text-foreground transition-colors block py-0.5">{t('nav.fiscalCalculator', 'Calculateur Fiscal')}</Link></li>
              <li><Link to="/pyramid-quiz" className="hover:text-foreground transition-colors block py-0.5">{t('nav.pyramidQuiz', 'Jeu Pyramides')}</Link></li>
              <li><Link to="/gamification" className="hover:text-foreground transition-colors block py-0.5">{t('nav.gamification', 'Progression')}</Link></li>
              <li>
                <Link to="/tools" className="hover:text-foreground transition-colors block py-0.5 text-primary font-medium">
                  + {t('footer.seeAll', 'Voir tout')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Account & Legal */}
          <div className="col-span-2 sm:col-span-1">
            <h4 className="font-semibold text-sm sm:text-base mb-2 sm:mb-4">{t('footer.account')}</h4>
            <ul className="grid grid-cols-2 sm:grid-cols-1 gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
              <li><Link to="/dashboard" className="hover:text-foreground transition-colors block py-0.5">{t('nav.dashboard')}</Link></li>
              <li><Link to="/pricing" className="hover:text-foreground transition-colors font-medium text-primary block py-0.5">{t('nav.pricing')}</Link></li>
              <li><Link to="/auth" className="hover:text-foreground transition-colors block py-0.5">{t('auth.login')}</Link></li>
              <li><Link to="/about" className="hover:text-foreground transition-colors block py-0.5">{t('footer.about')}</Link></li>
              <li><Link to="/how-to-read" className="hover:text-foreground transition-colors block py-0.5">{t('nav.howToRead', 'Guide')}</Link></li>
              <li><Link to="/b2b" className="hover:text-foreground transition-colors block py-0.5">{t('nav.b2b', 'B2B')}</Link></li>
              <li><Link to="/disclaimer" className="hover:text-foreground transition-colors text-warning block py-0.5">{t('footer.warnings')}</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 sm:pt-8 border-t border-border/50 flex flex-col gap-3 sm:gap-4">
          {/* Country indicator and tutorial reset */}
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4">
            <CountryIndicator />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={resetOnboarding}
                  className="text-muted-foreground hover:text-foreground h-auto py-1 sm:py-1.5 text-xs sm:text-sm"
                >
                  <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
                  <span>{t('footer.restartTutorial', 'Revoir le tutoriel')}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('footer.restartTutorialTooltip', 'Relancer le tutoriel de bienvenue')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">
              © {currentYear} {t('common.appName')} — {t('footer.company', 'EmotionsCare SASU')}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground/70 max-w-md">
              {t('footer.legalInfo', 'SASU au capital de 100€ — SIRET 944 505 445 00014 — RCS Amiens — TVA FR71944505445')}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground/70 max-w-md">
              {t('footer.disclaimer')}
              <Link to="/disclaimer" className="text-primary hover:underline ml-1">{t('footer.learnMore')}</Link>
            </p>
            <span className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
              {t('footer.madeWith', 'Made with')} <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-primary fill-primary" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
