/**
 * Disclaimer Consent Banner - Non-blocking banner at bottom of screen
 * Replaces the previous modal dialog that blocked content access
 */
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Scale, CheckCircle } from 'lucide-react';
import { useDialogCoordinator } from './DialogCoordinator';
import { motion, AnimatePresence } from 'framer-motion';

export function DisclaimerConsentDialog() {
  const { t } = useTranslation();
  const { shouldShowDisclaimer, completeDisclaimer } = useDialogCoordinator();

  return (
    <AnimatePresence>
      {shouldShowDisclaimer && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
        >
          <div className="max-w-2xl mx-auto bg-background border border-border rounded-xl shadow-2xl p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/10 shrink-0">
                <Scale className="w-5 h-5 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium mb-1">
                  {t('disclaimerConsent.bannerTitle', 'Outil éducatif uniquement')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('disclaimerConsent.bannerText', 'Pyramid Compass est un outil d\'analyse, pas un service de conseil. Aucun résultat ne constitue un avis professionnel. Vos décisions vous appartiennent.')}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button 
                  onClick={completeDisclaimer}
                  size="sm"
                  className="gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {t('disclaimerConsent.acceptShort', 'Compris')}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
