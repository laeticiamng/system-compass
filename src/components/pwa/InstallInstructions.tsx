import { useTranslation } from 'react-i18next';
import { Smartphone, Apple, Chrome, Share2, PlusSquare, CheckCircle2, Menu } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface InstallStep {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function InstallInstructions() {
  const { t } = useTranslation();

  const iosSteps: InstallStep[] = [
    {
      icon: <Share2 className="w-6 h-6 text-blue-500" />,
      title: t('pwa.ios.step1.title', 'Appuyez sur Partager'),
      description: t('pwa.ios.step1.description', 'Appuyez sur le bouton Partager (icône carré avec flèche vers le haut) dans la barre de navigation Safari'),
    },
    {
      icon: <PlusSquare className="w-6 h-6 text-blue-500" />,
      title: t('pwa.ios.step2.title', 'Sur l\'écran d\'accueil'),
      description: t('pwa.ios.step2.description', 'Faites défiler et sélectionnez "Sur l\'écran d\'accueil"'),
    },
    {
      icon: <CheckCircle2 className="w-6 h-6 text-green-500" />,
      title: t('pwa.ios.step3.title', 'Ajouter'),
      description: t('pwa.ios.step3.description', 'Appuyez sur "Ajouter" en haut à droite pour confirmer'),
    },
  ];

  const androidSteps: InstallStep[] = [
    {
      icon: <Menu className="w-6 h-6 text-green-600" />,
      title: t('pwa.android.step1.title', 'Ouvrez le menu'),
      description: t('pwa.android.step1.description', 'Appuyez sur le menu Chrome (⋮) en haut à droite'),
    },
    {
      icon: <Smartphone className="w-6 h-6 text-green-600" />,
      title: t('pwa.android.step2.title', 'Installer l\'application'),
      description: t('pwa.android.step2.description', 'Sélectionnez "Installer l\'application" ou "Ajouter à l\'écran d\'accueil"'),
    },
    {
      icon: <CheckCircle2 className="w-6 h-6 text-green-500" />,
      title: t('pwa.android.step3.title', 'Confirmer'),
      description: t('pwa.android.step3.description', 'Appuyez sur "Installer" pour confirmer l\'installation'),
    },
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-xl">
          <Smartphone className="w-6 h-6 text-primary" />
          {t('pwa.title', 'Installer l\'application')}
        </CardTitle>
        <CardDescription>
          {t('pwa.subtitle', 'Accédez à Pyramid Compass depuis votre écran d\'accueil comme une application native')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ios" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="ios" className="gap-2">
              <Apple className="w-4 h-4" />
              iPhone / iPad
            </TabsTrigger>
            <TabsTrigger value="android" className="gap-2">
              <Chrome className="w-4 h-4" />
              Android
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ios" className="space-y-4">
            <div className="flex items-center gap-2 mb-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Apple className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {t('pwa.ios.requirement', 'Ouvrez cette page dans Safari')}
              </span>
            </div>
            {iosSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-background flex items-center justify-center border">
                  <span className="text-sm font-bold text-muted-foreground">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {step.icon}
                    <h4 className="font-semibold">{step.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="android" className="space-y-4">
            <div className="flex items-center gap-2 mb-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <Chrome className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                {t('pwa.android.requirement', 'Ouvrez cette page dans Chrome')}
              </span>
            </div>
            {androidSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-background flex items-center justify-center border">
                  <span className="text-sm font-bold text-muted-foreground">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {step.icon}
                    <h4 className="font-semibold">{step.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            {t('pwa.benefits.title', 'Avantages')}
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• {t('pwa.benefits.offline', 'Accès hors ligne')}</li>
            <li>• {t('pwa.benefits.fast', 'Chargement rapide')}</li>
            <li>• {t('pwa.benefits.fullscreen', 'Mode plein écran')}</li>
            <li>• {t('pwa.benefits.homescreen', 'Icône sur l\'écran d\'accueil')}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
