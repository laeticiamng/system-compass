/**
 * Cookie Consent Component (GDPR compliant)
 * 
 * Displays a cookie consent banner and manages user preferences.
 */

import { useState, useEffect } from 'react';
import { Cookie, X, Settings2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const CONSENT_KEY = 'pyramid-compass-cookie-consent';

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
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    // Check if user has already consented
    const stored = getStoredConsent();
    if (!stored) {
      // Small delay to not show immediately on page load
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
    setPreferences(stored);
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    const toSave = { ...prefs, consentDate: new Date().toISOString() };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(toSave));
    setPreferences(toSave);
    setShowBanner(false);
    setShowDetails(false);
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

  if (!showBanner) return null;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[60] p-4",
        "animate-in slide-in-from-bottom duration-500"
      )}
    >
      <Card className="max-w-2xl mx-auto shadow-2xl border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Cookie className="w-5 h-5 text-primary" />
              Paramètres de confidentialité
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={rejectAll}
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Nous utilisons des cookies pour améliorer votre expérience. 
            Vous pouvez personnaliser vos préférences ci-dessous.
          </p>

          {showDetails ? (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Cookies nécessaires</Label>
                  <p className="text-xs text-muted-foreground">
                    Essentiels au fonctionnement du site
                  </p>
                </div>
                <Switch checked disabled />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Analytiques</Label>
                  <p className="text-xs text-muted-foreground">
                    Comprendre comment vous utilisez le site
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
                  <Label className="font-medium">Préférences</Label>
                  <p className="text-xs text-muted-foreground">
                    Mémoriser vos choix et paramètres
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
                  <Label className="font-medium">Marketing</Label>
                  <p className="text-xs text-muted-foreground">
                    Personnaliser les contenus et publicités
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
                Personnaliser
              </Button>
            )}
            
            {showDetails ? (
              <Button size="sm" onClick={acceptSelected}>
                <Check className="w-4 h-4 mr-2" />
                Enregistrer mes choix
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={rejectAll}>
                  Refuser tout
                </Button>
                <Button size="sm" onClick={acceptAll}>
                  <Check className="w-4 h-4 mr-2" />
                  Tout accepter
                </Button>
              </>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground">
            En savoir plus dans notre{' '}
            <a href="/disclaimer" className="text-primary hover:underline">
              politique de confidentialité
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
