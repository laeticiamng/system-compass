import { useTranslation } from 'react-i18next';
import { InstallInstructions } from '@/components/pwa/InstallInstructions';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Install() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setCanInstall(false);
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t('common.back', 'Retour')}
          </Button>
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {t('pwa.pageTitle', '📱 Installation de l\'application')}
        </h1>
        <p className="text-muted-foreground">
          {t('pwa.pageDescription', 'Installez Pyramid Compass sur votre appareil pour une expérience optimale')}
        </p>
      </div>

      {/* Native install button if available */}
      {canInstall && (
        <div className="mb-8 flex justify-center">
          <Button onClick={handleInstallClick} size="lg" className="gap-2">
            <Download className="w-5 h-5" />
            {t('pwa.installNow', 'Installer maintenant')}
          </Button>
        </div>
      )}

      {/* Manual instructions */}
      <InstallInstructions />

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>{t('pwa.note', 'L\'application fonctionne sur tous les navigateurs modernes. Pour une installation optimale, utilisez Safari sur iOS ou Chrome sur Android.')}</p>
      </div>
    </div>
  );
}
