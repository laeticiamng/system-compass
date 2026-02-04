import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function UpdateNotification() {
  const { t } = useTranslation();
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) return;

    // Listen for service worker updates
    const handleControllerChange = () => {
      setShowUpdate(true);
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    // Check for waiting service worker on load
    navigator.serviceWorker.ready.then((reg) => {
      setRegistration(reg);
      
      if (reg.waiting) {
        setShowUpdate(true);
      }

      // Listen for new service worker installations
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setShowUpdate(true);
            }
          });
        }
      });
    });

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
    setShowUpdate(false);
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  return (
    <AnimatePresence>
      {showUpdate && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50"
        >
          <Card className="glass-card border-primary/20 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm mb-1">
                    {t('pwa.updateAvailable', 'Mise à jour disponible')}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    {t('pwa.updateDescription', 'Une nouvelle version de l\'application est disponible. Rechargez pour en profiter.')}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleUpdate}
                      className="gap-1.5 h-8 text-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      {t('pwa.reload', 'Recharger')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDismiss}
                      className="h-8 text-xs text-muted-foreground"
                    >
                      {t('pwa.later', 'Plus tard')}
                    </Button>
                  </div>
                </div>
                <button
                  onClick={handleDismiss}
                  className="p-1 rounded-md hover:bg-muted/50 transition-colors shrink-0"
                  aria-label={t('common.close', 'Close')}
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
