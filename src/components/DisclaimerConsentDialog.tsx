import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import { useState } from 'react';
import { useDialogCoordinator } from './DialogCoordinator';

export function DisclaimerConsentDialog() {
  const { t } = useTranslation();
  const { shouldShowDisclaimer, completeDisclaimer } = useDialogCoordinator();
  const [hasRead, setHasRead] = useState(false);

  const handleAccept = () => {
    if (hasRead) {
      completeDisclaimer();
    }
  };

  return (
    <Dialog open={shouldShowDisclaimer} onOpenChange={() => {}}>
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
            {t('disclaimerConsent.title', 'Avant de commencer')}
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            {t('disclaimerConsent.subtitle', 'Quelques informations importantes sur cet outil')}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Anti-authority warning */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <p className="text-xs text-muted-foreground">
              <strong className="text-amber-600">⚠️ {t('disclaimerConsent.important', 'Important')} :</strong> {t('disclaimerConsent.warning', "Aucun résultat affiché n'est un diagnostic, une recommandation, ni un avis professionnel. Cet outil ne remplace aucun conseil spécialisé.")}
            </p>
          </div>

          {/* Key points */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">{t('disclaimerConsent.analysisToolTitle', 'Outil d\'analyse et simulation')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('disclaimerConsent.analysisToolDesc', 'Pyramid Compass est un outil éducatif, pas un service de conseil. Simulation ≠ prédiction.')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">{t('disclaimerConsent.noAdviceTitle', 'Pas de conseil professionnel')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('disclaimerConsent.noAdviceDesc', 'Aucun conseil juridique, financier ou médical n\'est fourni. Aucun verdict, aucun score de réussite.')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">{t('disclaimerConsent.responsibleTitle', 'Tu restes responsable')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('disclaimerConsent.responsibleDesc', 'Tes décisions t\'appartiennent. Les résultats dépendent de ton contexte réel.')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 py-2">
          <Checkbox 
            id="disclaimer-read" 
            checked={hasRead}
            onCheckedChange={(checked) => setHasRead(checked === true)}
          />
          <Label 
            htmlFor="disclaimer-read" 
            className="text-sm text-muted-foreground cursor-pointer leading-relaxed"
          >
            {t('disclaimerConsent.checkbox', 'J\'ai compris que cet outil est informatif et que je reste responsable de mes décisions.')}
          </Label>
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Link 
            to="/disclaimer" 
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            onClick={() => completeDisclaimer()}
          >
            {t('disclaimerConsent.seeDetails', 'Voir les détails complets')}
            <ExternalLink className="w-3 h-3" />
          </Link>
          <Button 
            onClick={handleAccept}
            disabled={!hasRead}
            className="gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            {t('disclaimerConsent.accept', 'J\'ai compris, continuer')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
