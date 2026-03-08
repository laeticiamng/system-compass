/**
 * Disclaimer Consent Banner - Non-blocking, auto-dismissing banner
 * Auto-dismisses after 6 seconds, or on user click
 */
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Scale, CheckCircle } from 'lucide-react';
import { useDialogCoordinator } from './DialogCoordinator';
import { motion, AnimatePresence } from 'framer-motion';

export function DisclaimerConsentDialog() {
  const { t } = useTranslation();
  const { shouldShowDisclaimer, completeDisclaimer } = useDialogCoordinator();

  // Auto-dismiss after 6 seconds
  useEffect(() => {
    if (!shouldShowDisclaimer) return;
    const timer = setTimeout(completeDisclaimer, 6000);
    return () => clearTimeout(timer);
  }, [shouldShowDisclaimer, completeDisclaimer]);

  return (
    <AnimatePresence>
      {shouldShowDisclaimer && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-40 p-2 pb-[env(safe-area-inset-bottom,8px)] sm:p-4 sm:bottom-4 pointer-events-none"
        >
          <div className="max-w-lg mx-auto bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg px-4 py-2.5 pointer-events-auto">
            <div className="flex items-center gap-3">
              <Scale className="w-4 h-4 text-muted-foreground shrink-0" />
              <p className="text-xs text-muted-foreground flex-1">
                {t('disclaimerConsent.bannerText', 'Outil d\'analyse éducatif — pas de conseil professionnel.')}
              </p>
              <Button 
                onClick={completeDisclaimer}
                variant="ghost"
                size="sm"
                className="gap-1 h-7 px-2 text-xs shrink-0"
                aria-label={t('disclaimerConsent.dismiss', 'Fermer le bandeau')}
              >
                <CheckCircle className="w-3 h-3" />
                {t('disclaimerConsent.acceptShort', 'OK')}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
