/**
 * AnimatedPromoSection - Section animée interactive multilingue
 * Remplace la vidéo MP4 statique par des animations Framer Motion traduisibles
 */
import { useTranslation } from 'react-i18next';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Globe, Shield, TrendingUp, Users, MapPin, Zap, CheckCircle } from 'lucide-react';

function AnimatedCounter({ target, suffix = '', duration = 2 }: { target: number; suffix?: string; duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, v => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(count, target, { duration, ease: 'easeOut' });
    const unsub = rounded.on('change', v => setDisplay(v));
    return () => { controls.stop(); unsub(); };
  }, [target, duration, count, rounded]);

  return <span>{display}{suffix}</span>;
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }),
};

export function AnimatedPromoSection() {
  const { t } = useTranslation();
  const [inView, setInView] = useState(false);

  const features = [
    {
      icon: Globe,
      stat: 80,
      suffix: '+',
      label: t('landing.promo.countries', 'pays analysés'),
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      icon: Shield,
      stat: 15,
      suffix: '+',
      label: t('landing.promo.riskCategories', 'catégories de risques'),
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      icon: TrendingUp,
      stat: 95,
      suffix: '%',
      label: t('landing.promo.accuracy', 'de précision des données'),
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      icon: Users,
      stat: 5000,
      suffix: '+',
      label: t('landing.promo.users', 'expatriés accompagnés'),
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
  ];

  const steps = [
    { icon: MapPin, text: t('landing.promo.step1', 'Choisissez votre pays cible') },
    { icon: Zap, text: t('landing.promo.step2', 'Analyse IA instantanée') },
    { icon: CheckCircle, text: t('landing.promo.step3', 'Plan d\'action personnalisé') },
  ];

  return (
    <section className="py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary font-medium mb-3 tracking-widest uppercase text-sm"
          >
            {t('landing.video.label', 'Découvrez Compass')}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl md:text-4xl font-bold"
          >
            {t('landing.video.title', 'Votre expatriation, simplifiée')}
          </motion.h2>
        </div>

        {/* Animated stats cards */}
        <motion.div
          className="max-w-4xl mx-auto"
          onViewportEnter={() => setInView(true)}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {features.map((f, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
                className="rounded-xl border border-border/40 bg-card p-5 text-center shadow-lg"
              >
                <div className={`${f.bg} ${f.color} w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <div className="text-2xl md:text-3xl font-bold font-display">
                  {inView ? <AnimatedCounter target={f.stat} suffix={f.suffix} /> : '0'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{f.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Animated flow steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="rounded-2xl border border-border/30 bg-card/50 backdrop-blur-sm p-6 md:p-8 shadow-xl"
          >
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 + i * 0.2, type: 'spring', stiffness: 200 }}
                    className="bg-primary/10 text-primary w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  >
                    <step.icon className="w-5 h-5" />
                  </motion.div>
                  <span className="text-sm font-medium">{step.text}</span>
                  {i < steps.length - 1 && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 1 + i * 0.2, duration: 0.4 }}
                      className="hidden md:block w-12 h-px bg-border origin-left"
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
