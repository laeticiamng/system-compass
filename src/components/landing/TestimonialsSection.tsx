import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, Shield, Compass, TrendingUp, Users, MapPin } from 'lucide-react';

interface FeatureHighlight {
  icon: React.ElementType;
  stat: string;
  label: string;
  description: string;
}

export function TestimonialsSection() {
  const { t } = useTranslation();

  const highlights: FeatureHighlight[] = [
    {
      icon: Globe,
      stat: '80+',
      label: t('socialProof.countries', 'Pays analysés'),
      description: t('socialProof.countriesDesc', 'Analyses détaillées de chaque pays'),
    },
    {
      icon: Compass,
      stat: '50+',
      label: t('socialProof.exitKeys', 'Stratégies'),
      description: t('socialProof.exitKeysDesc', 'Stratégies de sortie personnalisées'),
    },
    {
      icon: Shield,
      stat: '13',
      label: t('socialProof.languages', 'Langues'),
      description: t('socialProof.languagesDesc', 'Interface multilingue complète'),
    },
    {
      icon: TrendingUp,
      stat: '200+',
      label: t('socialProof.indicators', 'Indicateurs'),
      description: t('socialProof.indicatorsDesc', 'Données vérifiables par pays'),
    },
  ];

  return (
    <section className="py-20 md:py-32 lg:py-40 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-20"
        >
          <p className="text-primary font-medium mb-3 md:mb-5 tracking-[0.15em] md:tracking-[0.2em] uppercase text-xs md:text-sm">
            {t('socialProof.badge', 'En chiffres')}
          </p>
          <h2 className="font-display text-[clamp(1.6rem,3.5vw,3.5rem)] font-bold">
            {t('socialProof.title', 'Une plateforme pensée pour la décision')}
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            {t('socialProof.subtitle', 'Des données vérifiables, des analyses détaillées, des stratégies concrètes.')}
          </p>
        </motion.div>

        {/* Highlights Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {highlights.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <Card className="h-full glass-card border-primary/10 hover:border-primary/20 transition-all duration-300 text-center">
                <CardContent className="p-6">
                  <item.icon className="w-8 h-8 text-primary mx-auto mb-4" />
                  <p className="text-3xl md:text-4xl font-bold gold-text mb-1">{item.stat}</p>
                  <p className="font-medium text-sm mb-2">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA Beta */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <Card className="max-w-2xl mx-auto glass-card border-primary/20">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Users className="w-5 h-5 text-primary" />
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">
                {t('socialProof.betaTitle', 'Commencez votre analyse gratuite')}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {t('socialProof.betaDescription', 'Explorez 80+ pays gratuitement, découvrez votre profil d\'expatrié et comparez les opportunités en toute autonomie.')}
              </p>
              <a
                href="/quick-test"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                <Compass className="w-4 h-4" />
                {t('socialProof.betaCta', 'Faire le test gratuit')}
              </a>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
