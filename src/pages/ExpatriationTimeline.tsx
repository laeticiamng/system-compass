/**
 * Expatriation Timeline - Standalone interactive page
 * Visual "J-180 → Jour J → J+90" expatriation journey
 */
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { ExpatTimeline } from '@/components/irreversa/ExpatTimeline';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ExpatriationTimeline() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('timeline.seoTitle', 'Timeline d\'expatriation interactive | System Compass')}</title>
        <meta name="description" content={t('timeline.seoDesc', 'Planifiez chaque étape de votre expatriation avec notre timeline interactive. De J-180 au Jour J et au-delà.')} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative py-16 sm:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <Badge variant="outline" className="mb-4 gap-2">
                <Clock className="w-3.5 h-3.5" />
                {t('timeline.badge', '5 phases • 20+ jalons • Réversibilité trackée')}
              </Badge>

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
                <span className="block text-foreground">{t('timeline.heroTitle1', 'Votre parcours')}</span>
                <span className="block bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_3s_ease-in-out_infinite]">
                  {t('timeline.heroTitle2', 'd\'expatriation, étape par étape.')}
                </span>
              </h1>

              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                {t('timeline.heroSubtitle', 'De la préparation (J-180) à l\'installation (J+90), suivez chaque jalon critique et évaluez la réversibilité de vos décisions.')}
              </p>

              <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  {t('timeline.phasePrep', 'Préparation')}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
                <span className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                  {t('timeline.phaseTrans', 'Transition')}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
                <span className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  {t('timeline.phaseInstall', 'Installation')}
                </span>
                <ArrowRight className="w-3.5 h-3.5 hidden sm:block" />
                <span className="hidden sm:flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  {t('timeline.phaseInteg', 'Intégration')}
                </span>
                <ArrowRight className="w-3.5 h-3.5 hidden sm:block" />
                <span className="hidden sm:flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  {t('timeline.phaseEstab', 'Établissement')}
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Timeline Component */}
        <section className="container mx-auto px-4 pb-20">
          <ExpatTimeline />

          {/* Bottom info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-4 rounded-xl bg-muted/50 border border-border/50 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              {t('timeline.disclaimer', 'Votre progression est sauvegardée localement. Aucune donnée n\'est envoyée à nos serveurs.')}
            </div>
          </motion.div>
        </section>
      </div>
    </>
  );
}
