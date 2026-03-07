import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, MessageSquare, Clock, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Contact() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.message) return;

    setLoading(true);
    try {
      // Send via edge function
      const { error } = await supabase.functions.invoke('send-contact', {
        body: { name: form.name, email: form.email, subject: form.subject, message: form.message },
      });

      if (error) throw error;
      setSent(true);
      toast({
        title: t('contact.successTitle', 'Message envoyé'),
        description: t('contact.successDesc', 'Nous vous répondrons sous 24 à 48h.'),
      });
    } catch {
      // Fallback: open mailto
      const mailtoUrl = `mailto:contact@system-compass.app?subject=${encodeURIComponent(form.subject || 'Contact')}&body=${encodeURIComponent(`De: ${form.name} (${form.email})\n\n${form.message}`)}`;
      window.open(mailtoUrl, '_blank');
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

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
          {/* Contact Form */}
          <Card>
            <CardContent className="p-6">
              {sent ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h2 className="font-semibold text-lg mb-2">{t('contact.sentTitle', 'Message envoyé !')}</h2>
                  <p className="text-muted-foreground text-sm">
                    {t('contact.sentDesc', 'Nous avons bien reçu votre message et vous répondrons sous 24 à 48 heures ouvrées.')}
                  </p>
                  <Button variant="outline" className="mt-4" onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}>
                    {t('contact.sendAnother', 'Envoyer un autre message')}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('contact.nameLabel', 'Nom')}</Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder={t('contact.namePlaceholder', 'Votre nom')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('contact.emailLabel', 'Email')} *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder={t('contact.emailPlaceholder', 'votre@email.com')}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">{t('contact.subjectLabel', 'Sujet')}</Label>
                    <Input
                      id="subject"
                      value={form.subject}
                      onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
                      placeholder={t('contact.subjectPlaceholder', 'De quoi souhaitez-vous parler ?')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">{t('contact.messageLabel', 'Message')} *</Label>
                    <Textarea
                      id="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder={t('contact.messagePlaceholder', 'Décrivez votre question ou votre besoin...')}
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    {loading ? t('contact.sending', 'Envoi en cours...') : t('contact.send', 'Envoyer le message')}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Direct email fallback */}
          <Card>
            <CardContent className="flex items-start gap-4 p-6">
              <div className="p-3 rounded-xl bg-primary/10">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg mb-1">{t('contact.emailTitle', 'Par email direct')}</h2>
                <p className="text-muted-foreground text-sm mb-3">
                  {t('contact.emailDesc', 'Pour toute question générale, support ou proposition de partenariat.')}
                </p>
                <Button variant="outline" asChild>
                  <a href="mailto:contact@system-compass.app">
                    <Mail className="w-4 h-4 mr-2" />
                    contact@system-compass.app
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Response time */}
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
