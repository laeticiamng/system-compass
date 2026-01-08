import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Scale, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  ExternalLink
} from 'lucide-react';

const CONSENT_KEY = 'pyramid-compass-disclaimer-accepted';

export function DisclaimerConsentDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasRead, setHasRead] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem(CONSENT_KEY);
    if (!hasAccepted) {
      // Small delay for better UX after page load
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    if (hasRead) {
      localStorage.setItem(CONSENT_KEY, 'true');
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-lg"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-amber-500/10">
              <Scale className="w-10 h-10 text-amber-500" />
            </div>
          </div>
          <DialogTitle className="text-xl">
            Avant de commencer
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            Quelques informations importantes sur cet outil
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Key points */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Outil d'analyse et simulation</p>
                <p className="text-xs text-muted-foreground">
                  Pyramid Compass est un outil éducatif, pas un service de conseil.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Pas de conseil professionnel</p>
                <p className="text-xs text-muted-foreground">
                  Aucun conseil juridique, financier ou médical n'est fourni.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Vous restez responsable</p>
                <p className="text-xs text-muted-foreground">
                  Vos décisions vous appartiennent. Vérifiez toute information.
                </p>
              </div>
            </div>
          </div>

          {/* Checkbox */}
          <div className="flex items-start gap-3 pt-2 border-t">
            <Checkbox 
              id="consent" 
              checked={hasRead}
              onCheckedChange={(checked) => setHasRead(checked === true)}
            />
            <Label 
              htmlFor="consent" 
              className="text-sm leading-relaxed cursor-pointer"
            >
              J'ai compris que cet outil est informatif et que je reste responsable de mes décisions.
            </Label>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Link 
            to="/disclaimer" 
            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 sm:mr-auto"
            onClick={() => {
              localStorage.setItem(CONSENT_KEY, 'true');
              setIsOpen(false);
            }}
          >
            Voir les détails complets
            <ExternalLink className="w-3 h-3" />
          </Link>
          
          <Button 
            onClick={handleAccept} 
            disabled={!hasRead}
            className="gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            J'ai compris, continuer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hook to check if consent was given
export function useDisclaimerConsent() {
  return localStorage.getItem(CONSENT_KEY) === 'true';
}

// Hook to reset consent (for testing)
export function useResetDisclaimerConsent() {
  return () => {
    localStorage.removeItem(CONSENT_KEY);
    window.location.reload();
  };
}
