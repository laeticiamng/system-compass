import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass, Heart, RotateCcw, RefreshCw } from 'lucide-react';
import { CountryIndicator } from './CountryIndicator';
import { useResetOnboarding } from './DialogCoordinator';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';

const DISCLAIMER_DISMISSED_KEY = 'pyramid-disclaimer-dismissed';

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const resetOnboarding = useResetOnboarding();

  const resetDisclaimerBanner = () => {
    localStorage.removeItem(DISCLAIMER_DISMISSED_KEY);
    toast.success(t('footer.disclaimerReset', 'Bandeau disclaimer réinitialisé'));
  };

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
            <h4 className="font-semibold mb-4">{t('footer.explore')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/countries" className="hover:text-foreground transition-colors">{t('nav.countries')}</Link></li>
              <li><Link to="/pyramid-types" className="hover:text-foreground transition-colors">{t('nav.pyramids')}</Link></li>
              <li><Link to="/compare" className="hover:text-foreground transition-colors">{t('nav.compare')}</Link></li>
              <li><Link to="/multi-compare" className="hover:text-foreground transition-colors">{t('nav.multiCompare')}</Link></li>
              <li><Link to="/resources" className="hover:text-foreground transition-colors">{t('nav.resources')}</Link></li>
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.tools')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/exit-keys" className="hover:text-foreground transition-colors">{t('nav.exitKeys')}</Link></li>
              <li><Link to="/exit-keys/catalog" className="hover:text-foreground transition-colors">{t('footer.exitKeysCatalog')}</Link></li>
              <li><Link to="/prevention-filter" className="hover:text-foreground transition-colors">{t('nav.preventionFilter')}</Link></li>
              <li><Link to="/life-game" className="hover:text-foreground transition-colors">{t('nav.lifeGame')}</Link></li>
              <li><Link to="/latent" className="hover:text-foreground transition-colors">🔍 {t('footer.potentialZones')}</Link></li>
              <li><Link to="/irreversa" className="hover:text-foreground transition-colors">🔒 {t('footer.thresholdProtocol')}</Link></li>
              <li><Link to="/institutions" className="hover:text-foreground transition-colors">🏛️ {t('footer.businessInstitutions')}</Link></li>
              <li><Link to="/usage" className="hover:text-foreground transition-colors">📊 {t('nav.usage', 'Consommation')}</Link></li>
            </ul>
          </div>

          {/* Account & Legal */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.account')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/dashboard" className="hover:text-foreground transition-colors">{t('nav.dashboard')}</Link></li>
              <li><Link to="/pricing" className="hover:text-foreground transition-colors font-medium text-primary">💎 {t('nav.pricing')}</Link></li>
              <li><Link to="/auth" className="hover:text-foreground transition-colors">{t('auth.login')}</Link></li>
              <li><Link to="/about" className="hover:text-foreground transition-colors">{t('footer.about')}</Link></li>
              <li><Link to="/how-to-read" className="hover:text-foreground transition-colors">📖 {t('footer.howToRead')}</Link></li>
              <li><Link to="/disclaimer" className="hover:text-foreground transition-colors text-amber-500/80 hover:text-amber-500">⚠️ {t('footer.warnings')}</Link></li>
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
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={resetDisclaimerBanner}
                  className="text-muted-foreground/60 hover:text-foreground h-auto py-1.5 text-xs"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  <span>{t('footer.resetDisclaimer', 'Réafficher avertissements')}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('footer.resetDisclaimerTooltip', 'Réafficher le bandeau disclaimer sur les pages de simulation')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground">
                © {currentYear} {t('common.appName')}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                {t('footer.disclaimer')}
                <Link to="/disclaimer" className="text-primary hover:underline ml-1">{t('footer.learnMore')}</Link>
              </p>
            </div>
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