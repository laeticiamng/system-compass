import { useTranslation } from 'react-i18next';
import { Mail, MessageSquare, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Helmet } from 'react-helmet-async';

export default function Contact() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('contact.metaTitle', 'Contact — System Compass')}</title>
        <meta name="description" content={t('contact.metaDesc', 'Contactez l\'équipe System Compass pour toute question.')} />
      </Helmet>
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
            {t('contact.title', 'Contactez-nous')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('contact.subtitle', 'Une question, un partenariat ou un retour ? Nous sommes à votre écoute.')}
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardContent className="flex items-start gap-4 p-6">
              <div className="p-3 rounded-xl bg-primary/10">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg mb-1">{t('contact.emailTitle', 'Par email')}</h2>
                <p className="text-muted-foreground text-sm mb-3">
                  {t('contact.emailDesc', 'Pour toute question générale, support ou proposition de partenariat.')}
                </p>
                <Button asChild>
                  <a href="mailto:contact@system-compass.app">
                    <Mail className="w-4 h-4 mr-2" />
                    contact@system-compass.app
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start gap-4 p-6">
              <div className="p-3 rounded-xl bg-muted">
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-lg mb-1">{t('contact.responseTitle', 'Délai de réponse')}</h2>
                <p className="text-muted-foreground text-sm">
                  {t('contact.responseDesc', 'Nous répondons généralement sous 24 à 48 heures ouvrées.')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
