/**
 * Cookie Consent Component (GDPR compliant)
 * 
 * Integrated with DialogCoordinator to show AFTER disclaimer and onboarding.
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Cookie, X, Settings2, Check } from 'lucide-react';
import { LocalizedLink } from '@/components/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useDialogCoordinator } from '@/components/DialogCoordinator';

const CONSENT_KEY = 'compass-cookie-consent';

interface CookiePreferences {
  necessary: boolean; // Always true
  analytics: boolean;
  preferences: boolean;
  marketing: boolean;
  consentDate: string;
}

const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  preferences: false,
  marketing: false,
  consentDate: '',
};

export function getStoredConsent(): CookiePreferences | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Invalid stored data
  }
  return null;
}

export function hasConsentedToAnalytics(): boolean {
  const consent = getStoredConsent();
  return consent?.analytics ?? false;
}

export function CookieConsent() {
  const { t } = useTranslation();
  const { shouldShowCookieConsent, completeCookieConsent } = useDialogCoordinator();
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay for smooth animation after onboarding closes
    if (shouldShowCookieConsent) {
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [shouldShowCookieConsent]);

  useEffect(() => {
    // Load existing preferences if any
    const stored = getStoredConsent();
    if (stored) {
      setPreferences(stored);
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    const toSave = { ...prefs, consentDate: new Date().toISOString() };
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.warn('Failed to save cookie consent:', e);
    }
    setPreferences(toSave);
    setIsVisible(false);
    completeCookieConsent();
  };

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      preferences: true,
      marketing: true,
      consentDate: '',
    });
  };

  const acceptSelected = () => {
    saveConsent(preferences);
  };

  const rejectAll = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      preferences: false,
      marketing: false,
      consentDate: '',
    });
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[45] p-2 sm:p-4 pb-safe",
        "animate-in slide-in-from-bottom duration-500",
        "mb-0 sm:mb-0"
      )}
      style={{ marginBottom: 0 }}
    >
      <Card className="max-w-2xl mx-auto shadow-2xl border-border/50 bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Cookie className="w-5 h-5 text-primary" />
              {t('cookies.title', 'Paramètres de confidentialité')}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={rejectAll}
              aria-label={t('cookies.close', 'Fermer')}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('cookies.description', 'Nous utilisons des cookies pour améliorer votre expérience. Vous pouvez personnaliser vos préférences ci-dessous.')}
          </p>

          {showDetails ? (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">{t('cookies.necessary', 'Cookies nécessaires')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('cookies.necessaryDesc', 'Essentiels au fonctionnement du site')}
                  </p>
                </div>
                <Switch checked disabled />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">{t('cookies.analytics', 'Analytiques')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('cookies.analyticsDesc', 'Comprendre comment vous utilisez le site')}
                  </p>
                </div>
                <Switch
                  checked={preferences.analytics}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, analytics: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">{t('cookies.preferences', 'Préférences')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('cookies.preferencesDesc', 'Mémoriser vos choix et paramètres')}
                  </p>
                </div>
                <Switch
                  checked={preferences.preferences}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, preferences: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">{t('cookies.marketing', 'Marketing')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('cookies.marketingDesc', 'Personnaliser les contenus et publicités')}
                  </p>
                </div>
                <Switch
                  checked={preferences.marketing}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, marketing: checked })
                  }
                />
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {!showDetails && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(true)}
              >
                <Settings2 className="w-4 h-4 mr-2" />
                {t('cookies.customize', 'Personnaliser')}
              </Button>
            )}
            
            {showDetails ? (
              <Button size="sm" onClick={acceptSelected}>
                <Check className="w-4 h-4 mr-2" />
                {t('cookies.saveChoices', 'Enregistrer mes choix')}
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={rejectAll}>
                  {t('cookies.rejectAll', 'Refuser tout')}
                </Button>
                <Button size="sm" onClick={acceptAll}>
                  <Check className="w-4 h-4 mr-2" />
                  {t('cookies.acceptAll', 'Tout accepter')}
                </Button>
              </>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground">
            {t('cookies.learnMore', 'En savoir plus dans notre')}{' '}
            <LocalizedLink to="/privacy" className="text-primary hover:underline">
              {t('cookies.privacyPolicy', 'politique de confidentialité')}
            </LocalizedLink>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
