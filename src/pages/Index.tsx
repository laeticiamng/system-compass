import { useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCountries } from '@/lib/countries-data';
import { Button } from '@/components/ui/button';
import { CountryCard } from '@/components/CountryCard';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EconomicNews } from '@/components/EconomicNews';
import { LocalExpertFinder } from '@/components/LocalExpertFinder';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  ArrowRight, 
  Compass, 
  Gamepad2, 
  CheckCircle,
  XCircle,
  Route,
  Key,
  AlertTriangle,
  Shield,
  Sparkles,
  Crown,
  Check,
  Globe,
  Eye,
  Brain,
  Unlock,
  Play
} from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { trackHomeOpened, trackFilterClicked, trackExitKeysClicked } = useAnalytics();
  const { countries } = useCountries();
  
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  useEffect(() => {
    trackHomeOpened();
  }, [trackHomeOpened]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* HERO SECTION - Ultra Premium Cinematic Intro */}
      <section ref={heroRef} className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
        {/* Layered premium background effects */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.15)_0%,transparent_50%)]" />
          
          {/* Aurora-like morphing blobs */}
          <motion.div 
            className="absolute -top-[40%] -left-[20%] w-[140%] h-[100%] animate-morph"
            style={{
              background: 'radial-gradient(ellipse at 30% 40%, hsl(45 93% 58% / 0.08) 0%, transparent 50%)',
              filter: 'blur(100px)',
            }}
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 0.98, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Secondary aurora */}
          <motion.div 
            className="absolute -bottom-[30%] -right-[20%] w-[120%] h-[80%] animate-morph"
            style={{
              background: 'radial-gradient(ellipse at 70% 60%, hsl(280 70% 55% / 0.06) 0%, hsl(200 80% 60% / 0.04) 40%, transparent 60%)',
              filter: 'blur(80px)',
            }}
            animate={{
              rotate: [0, -8, 4, 0],
              scale: [1.1, 1, 1.08, 1.1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Spotlight effect */}
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]"
            style={{
              background: 'conic-gradient(from 0deg, transparent, hsl(var(--primary) / 0.03), transparent, hsl(280 70% 55% / 0.02), transparent)',
              filter: 'blur(60px)',
            }}
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-primary/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${100 + Math.random() * 20}%`,
                }}
                animate={{
                  y: [0, -window.innerHeight - 100],
                  x: [0, (Math.random() - 0.5) * 100],
                  opacity: [0, 1, 1, 0],
                  scale: [0, 1.5, 1, 0.5],
                }}
                transition={{
                  duration: 10 + Math.random() * 15,
                  repeat: Infinity,
                  delay: Math.random() * 10,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>

          {/* Grid pattern with fade */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px',
              maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 20%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 20%, transparent 70%)',
            }}
          />

          {/* Noise texture overlay */}
          <div 
            className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <motion.div 
          className="relative z-10 container mx-auto px-4 text-center pt-20"
          style={{ 
            opacity: heroOpacity, 
            scale: heroScale, 
            y: heroY,
          }}
        >
          {/* Floating premium badge */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.8, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            transition={{ delay: 0.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 backdrop-blur-xl mb-12 shadow-[0_0_40px_hsl(var(--primary)/0.15),inset_0_1px_0_hsl(0_0%_100%/0.1)]"
          >
            <motion.div
              animate={{ 
                rotate: [0, 15, -15, 0],
                scale: [1, 1.2, 1, 1]
              }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
            </motion.div>
            <span className="text-sm text-primary font-medium tracking-wide">
              {t('hero.madeBy', "Créé par quelqu'un qui a perdu énormément de temps")}
            </span>
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-primary/60"
            />
          </motion.div>

          {/* Main headline - Cinematic reveal */}
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="font-display font-bold tracking-tight mb-10"
          >
            <motion.span 
              initial={{ opacity: 0, y: 60, filter: 'blur(20px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: 0.5, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              className="block text-[clamp(2.8rem,9vw,9rem)] leading-[0.85] text-foreground font-extrabold"
            >
              {t('hero.appleTitle1', 'Comprends le système.')}
            </motion.span>
            <motion.span 
              initial={{ opacity: 0, y: 60, filter: 'blur(20px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: 0.7, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              className="block text-[clamp(2.8rem,9vw,9rem)] leading-[0.85] bg-gradient-to-r from-primary via-amber-400 via-50% to-orange-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-text font-extrabold"
            >
              {t('hero.appleTitle2', 'Avant de t\'engager.')}
            </motion.span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(1.1rem,2.5vw,1.6rem)] text-muted-foreground max-w-3xl mx-auto mb-16 leading-relaxed font-light"
          >
            {t('hero.appleSubtitle', "L'outil qui analyse les règles réelles des pays et simule les conséquences de tes décisions. Pas de promesses. Pas de conseils. Juste la réalité.")}
          </motion.p>

          {/* Premium CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-6 mb-24"
          >
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                size="lg"
                onClick={() => { trackExitKeysClicked(); navigate('/exit-keys'); }}
                className="h-[4.5rem] px-12 text-lg bg-gradient-to-r from-primary via-primary to-amber-500 text-primary-foreground rounded-full gap-4 group relative overflow-hidden transition-all duration-500 shadow-[0_0_0_1px_hsl(var(--primary)),0_8px_40px_-8px_hsl(var(--primary)/0.6),0_0_80px_-20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_0_1px_hsl(var(--primary)),0_16px_60px_-8px_hsl(var(--primary)/0.7),0_0_100px_-20px_hsl(var(--primary)/0.5)]"
              >
                {/* Shimmer effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                {/* Glow overlay */}
                <span className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Route className="w-6 h-6 relative z-10" />
                <span className="relative z-10 font-semibold">{t('hero.startAnalysis', 'Analyser ma situation')}</span>
                <ArrowRight className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:translate-x-2" />
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/quick-test')}
                className="h-[4.5rem] px-12 text-lg rounded-full gap-4 border-2 border-border/40 bg-background/50 backdrop-blur-xl hover:bg-background/80 hover:border-primary/30 group transition-all duration-500 shadow-[0_8px_30px_-10px_hsl(var(--foreground)/0.1)]"
              >
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Play className="w-5 h-5 text-primary" />
                </motion.div>
                <span className="font-medium">{t('hero.quickTest', 'Test rapide (60s)')}</span>
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats row - Glass morphism */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="inline-flex flex-wrap items-center justify-center gap-1 px-2 py-2 rounded-2xl bg-card/30 backdrop-blur-xl border border-border/20 shadow-[0_8px_32px_-8px_hsl(var(--foreground)/0.05)]"
          >
            <StatItemPremium value="38" label={t('stats.countries', 'pays analysés')} />
            <div className="w-px h-8 bg-border/30 mx-4 hidden md:block" />
            <StatItemPremium value="50+" label={t('stats.keys', 'clés de sortie')} />
            <div className="w-px h-8 bg-border/30 mx-4 hidden md:block" />
            <StatItemPremium value="6" label={t('stats.pyramids', 'types de systèmes')} />
          </motion.div>

          {/* Scroll indicator - Animated */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-3"
            >
              <span className="text-[10px] text-muted-foreground/40 uppercase tracking-[0.3em] font-medium">
                {t('hero.scroll', 'Découvrir')}
              </span>
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-6 h-10 rounded-full border-2 border-muted-foreground/20 flex items-start justify-center p-2"
              >
                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40"
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* VALUE PROPOSITION - Cinematic reveal */}
      <section className="py-40 md:py-56 relative">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="max-w-5xl mx-auto text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <h2 className="font-display text-[clamp(1.8rem,5vw,4.5rem)] font-bold leading-[1.1] mb-10">
                  {t('value.title1', 'Chaque décision de vie majeure')}
                  <br />
                  <span className="text-muted-foreground/70">{t('value.title2', 'mérite une analyse de système.')}</span>
                </h2>
              </motion.div>
              <p className="text-xl md:text-2xl text-muted-foreground/80 max-w-2xl mx-auto font-light leading-relaxed">
                {t('value.description', "Tu ne joues pas contre les gens. Tu joues contre les règles du système. Et ces règles, personne ne te les explique.")}
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* FEATURES - Premium cards with icons */}
      <section className="py-32 md:py-40 relative overflow-hidden">
        {/* Background treatment */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <AnimatedSection>
            <div className="text-center mb-20 md:mb-28">
              <motion.p 
                className="text-primary font-medium mb-5 tracking-[0.2em] uppercase text-sm"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                {t('features.badge', 'Comment ça marche')}
              </motion.p>
              <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-bold">
                {t('features.title', "Trois dimensions d'analyse")}
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            <FeatureCardPremium
              icon={<Eye className="w-7 h-7" />}
              number="01"
              title={t('features.understand.title', 'Comprendre le système')}
              description={t('features.understand.desc', 'Chaque pays fonctionne selon sa propre logique. Nous analysons les règles réelles, pas les apparences.')}
              delay={0}
            />
            <FeatureCardPremium
              icon={<Brain className="w-7 h-7" />}
              number="02"
              title={t('features.simulate.title', 'Simuler les conséquences')}
              description={t('features.simulate.desc', 'Avant de t\'engager, visualise les impacts sur ton temps, ton argent et ton énergie.')}
              delay={0.1}
            />
            <FeatureCardPremium
              icon={<Key className="w-7 h-7" />}
              number="03"
              title={t('features.keys.title', 'Identifier les clés de sortie')}
              description={t('features.keys.desc', 'Chaque situation a des portes de sortie. Nous les cartographions pour toi.')}
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* BIG STATEMENT - Full screen impact */}
      <section className="py-40 md:py-56 relative overflow-hidden">
        {/* Dramatic red glow for danger */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-destructive/5 blur-[120px]" />
        
        <div className="container mx-auto px-4 relative">
          <AnimatedSection>
            <div className="max-w-5xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2 }}
              >
                <p className="text-destructive/80 font-medium mb-8 tracking-[0.2em] uppercase text-sm">
                  {t('statement.badge', 'La vérité')}
                </p>
                <h2 className="font-display text-[clamp(2rem,5vw,4rem)] font-bold leading-[1.1] mb-10">
                  {t('statement.title', "99% des gens découvrent les règles du jeu")}
                  <br />
                  <span className="text-destructive">{t('statement.titleHighlight', "quand il est trop tard.")}</span>
                </h2>
                <p className="text-xl md:text-2xl text-muted-foreground/70 mb-14 max-w-2xl mx-auto font-light">
                  {t('statement.description', "Expatriation, changement de carrière, investissement, retraite... Les vraies contraintes ne sont jamais dans les brochures.")}
                </p>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/errors-illusions')}
                  className="h-14 px-10 text-base rounded-full gap-3 border-destructive/20 text-destructive hover:bg-destructive/5 hover:border-destructive/40 transition-all duration-300"
                >
                  <AlertTriangle className="w-5 h-5" />
                  {t('statement.cta', 'Voir les erreurs courantes')}
                </Button>
              </motion.div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* WHAT WE DO / DON'T - Split screen */}
      <section className="py-32 md:py-40 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-muted/50 to-muted/30" />
        
        <div className="container mx-auto px-4 relative">
          <AnimatedSection>
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 md:gap-20">
                {/* What we DON'T do */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="relative"
                >
                  <div className="absolute -top-4 -left-4 w-24 h-24 bg-destructive/10 rounded-full blur-3xl" />
                  <div className="relative">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10 mb-8">
                      <XCircle className="w-8 h-8 text-destructive" />
                    </div>
                    <h3 className="font-display text-2xl md:text-3xl font-bold mb-8">
                      {t('notDo.title', 'Ce qu\'on ne fait PAS')}
                    </h3>
                    <ul className="space-y-5">
                      <NotDoItem text={t('notDo.1', 'Promettre des résultats garantis')} />
                      <NotDoItem text={t('notDo.2', 'Donner des conseils juridiques ou financiers')} />
                      <NotDoItem text={t('notDo.3', 'Prédire ton avenir')} />
                      <NotDoItem text={t('notDo.4', 'Décider à ta place')} />
                    </ul>
                  </div>
                </motion.div>

                {/* What we DO */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="relative"
                >
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-green-500/10 rounded-full blur-3xl" />
                  <div className="relative">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/10 mb-8">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="font-display text-2xl md:text-3xl font-bold mb-8">
                      {t('do.title', 'Ce qu\'on fait')}
                    </h3>
                    <ul className="space-y-5">
                      <DoItem text={t('do.1', 'Analyser les règles réelles des systèmes')} />
                      <DoItem text={t('do.2', 'Simuler les conséquences de tes choix')} />
                      <DoItem text={t('do.3', 'Cartographier les options disponibles')} />
                      <DoItem text={t('do.4', 'Te montrer ce que personne ne dit')} />
                    </ul>
                  </div>
                </motion.div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* TOOLS - Bento grid style */}
      <section className="py-32 md:py-40">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16 md:mb-24">
              <p className="text-primary font-medium mb-5 tracking-[0.2em] uppercase text-sm">
                {t('tools.badge', 'Boîte à outils')}
              </p>
              <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-bold mb-5">
                {t('tools.title', 'Tout ce dont tu as besoin')}
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                {t('tools.subtitle', 'Des outils puissants pour analyser, simuler et décider.')}
              </p>
            </div>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            <ToolCardPremium
              icon={<Route className="w-6 h-6" />}
              title={t('tools.exitKeys', 'Clés de Sortie')}
              description={t('tools.exitKeysDesc', 'Analyse ta situation et trouve tes options')}
              onClick={() => { trackExitKeysClicked(); navigate('/exit-keys'); }}
              primary
              index={0}
            />
            <ToolCardPremium
              icon={<Shield className="w-6 h-6" />}
              title={t('tools.filter', 'Filtre Décision')}
              description={t('tools.filterDesc', 'Passe une décision au crible')}
              onClick={() => { trackFilterClicked(); navigate('/prevention-filter'); }}
              index={1}
            />
            <ToolCardPremium
              icon={<Globe className="w-6 h-6" />}
              title={t('tools.countries', 'Explorer les pays')}
              description={t('tools.countriesDesc', '38 pays analysés en profondeur')}
              onClick={() => navigate('/countries')}
              index={2}
            />
            <ToolCardPremium
              icon={<Gamepad2 className="w-6 h-6" />}
              title={t('tools.game', 'Mode Éducatif')}
              description={t('tools.gameDesc', 'Apprends avec un personnage fictif')}
              onClick={() => navigate('/life-game')}
              index={3}
            />
          </div>
        </div>
      </section>

      {/* COUNTRIES PREVIEW */}
      <section className="py-32 md:py-40 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-6">
              <div>
                <p className="text-primary font-medium mb-4 tracking-[0.2em] uppercase text-sm">
                  {t('countries.badge', 'Explorer')}
                </p>
                <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-bold">
                  {t('countries.title', '38 pays analysés')}
                </h2>
              </div>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/countries')}
                className="rounded-full gap-2 hover:gap-3 transition-all duration-300"
              >
                {t('countries.viewAll', 'Voir tous les pays')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {countries.slice(0, 4).map((country, index) => (
              <motion.div
                key={country.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <CountryCard country={country} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ECONOMIC NEWS */}
      <EconomicNews />

      {/* PRICING - Clean Apple style */}
      <section className="py-32 md:py-40">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-10"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-amber-500 font-medium">{t('pricing.badge', 'Gratuit pour commencer')}</span>
              </motion.div>
              
              <h2 className="font-display text-[clamp(2rem,5vw,4rem)] font-bold mb-6">
                {t('pricing.title', 'Commence gratuitement.')}
                <br />
                <span className="text-muted-foreground/60">{t('pricing.subtitle', 'Évolue selon tes besoins.')}</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-14 max-w-xl mx-auto">
                {t('pricing.description', 'Accède aux analyses de base gratuitement. Débloques les fonctionnalités avancées quand tu en as besoin.')}
              </p>

              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-14">
                <PricingCard
                  icon={<Unlock className="w-6 h-6" />}
                  title={t('pricing.free', 'Gratuit')}
                  features={[
                    t('pricing.freeFeature1', 'Analyse de base'),
                    t('pricing.freeFeature2', 'Tous les simulateurs'),
                    t('pricing.freeFeature3', '38 pays'),
                  ]}
                />
                <PricingCard
                  icon={<Crown className="w-6 h-6" />}
                  title={t('pricing.pro', 'Pro')}
                  price={t('pricing.from', 'dès') + ' 7,99€'}
                  features={[
                    t('pricing.proFeature1', 'Analyses approfondies'),
                    t('pricing.proFeature2', 'Clés de sortie personnalisées'),
                    t('pricing.proFeature3', 'Export PDF'),
                  ]}
                  highlighted
                />
              </div>

              <Button
                size="lg"
                onClick={() => navigate('/pricing')}
                className="h-14 px-10 text-lg rounded-full gap-3 transition-all duration-300 hover:scale-[1.02]"
              >
                <Sparkles className="w-5 h-5" />
                {t('pricing.cta', 'Voir les plans')}
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* LOCAL EXPERT FINDER */}
      <LocalExpertFinder />

      {/* FINAL CTA - Maximum impact */}
      <section className="py-40 md:py-56 relative overflow-hidden">
        {/* Dramatic background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full bg-primary/8 blur-[150px]" />
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-amber-500/5 blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection>
            <div className="max-w-4xl mx-auto text-center">
              <motion.h2 
                className="font-display text-[clamp(2.5rem,7vw,5.5rem)] font-bold leading-[0.95] mb-10"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
              >
                {t('cta.title', 'Prêt à comprendre')}
                <br />
                <span 
                  className="bg-gradient-to-r from-primary via-amber-300 to-primary bg-clip-text text-transparent bg-[length:200%_auto]"
                  style={{ animation: 'gradient 4s ease-in-out infinite' }}
                >
                  {t('cta.titleHighlight', 'les vraies règles ?')}
                </span>
              </motion.h2>
              <p className="text-xl md:text-2xl text-muted-foreground/70 mb-14 max-w-xl mx-auto font-light">
                {t('cta.description', "Cet outil ne promet rien. Il analyse et simule. À toi de décider.")}
              </p>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="lg"
                  onClick={() => navigate('/exit-keys')}
                  className="h-20 px-16 text-xl bg-primary text-primary-foreground hover:bg-primary/90 rounded-full gap-4 group relative overflow-hidden transition-all duration-500 shadow-[0_0_0_1px_hsl(var(--primary)),0_20px_80px_-20px_hsl(var(--primary)/0.6)]"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  <Compass className="w-7 h-7" />
                  {t('cta.button', 'Commencer l\'analyse')}
                  <ArrowRight className="w-7 h-7 transition-transform duration-300 group-hover:translate-x-2" />
                </Button>
              </motion.div>

              <p className="text-sm text-muted-foreground/40 mt-10 max-w-md mx-auto">
                {t('cta.disclaimer', 'Outil d\'analyse uniquement. Tu restes responsable de tes décisions.')}
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Guest banner */}
      {!user && (
        <section className="py-8 border-t border-border/30">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto p-6 rounded-2xl bg-muted/20 backdrop-blur-sm border border-border/20 text-center"
            >
              <p className="text-sm text-muted-foreground">
                🔓 <strong>{t('guest.title', 'Mode observation')}</strong> — {t('guest.subtitle', 'Explore librement sans compte.')}{' '}
                <Link to="/auth" className="text-primary hover:underline font-medium">
                  {t('guest.cta', 'Créer un compte')}
                </Link> {t('guest.suffix', 'pour sauvegarder.')}
              </p>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}

// Premium stat item component
function StatItemPremium({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-2">
      <motion.span 
        className="text-2xl md:text-3xl font-bold text-foreground font-display"
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {value}
      </motion.span>
      <span className="text-muted-foreground/70 text-sm">{label}</span>
    </div>
  );
}

// Animated section wrapper
function AnimatedSection({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Premium feature card
function FeatureCardPremium({ 
  icon, 
  number, 
  title, 
  description,
  delay = 0
}: { 
  icon: React.ReactNode; 
  number: string; 
  title: string; 
  description: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8 }}
      className="group relative"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative p-8 md:p-10">
        <div className="text-primary/20 font-mono text-sm mb-6 tracking-widest">{number}</div>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-8 group-hover:scale-110 group-hover:bg-primary/15 transition-all duration-500">
          {icon}
        </div>
        <h3 className="font-display text-xl md:text-2xl font-semibold mb-4">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

// Premium tool card
function ToolCardPremium({
  icon,
  title,
  description,
  onClick,
  primary = false,
  index = 0
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  primary?: boolean;
  index?: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      onClick={onClick}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full text-left p-7 rounded-3xl border transition-all duration-500 group ${
        primary 
          ? 'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 hover:border-primary/40 hover:shadow-[0_0_40px_hsl(var(--primary)/0.15)]' 
          : 'bg-card/50 backdrop-blur-sm border-border/30 hover:border-border/50 hover:bg-card/80'
      }`}
    >
      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 transition-all duration-300 ${
        primary ? 'bg-primary text-primary-foreground group-hover:scale-110' : 'bg-muted text-foreground group-hover:bg-muted/80'
      }`}>
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </motion.button>
  );
}

// Pricing card
function PricingCard({
  icon,
  title,
  price,
  features,
  highlighted = false
}: {
  icon: React.ReactNode;
  title: string;
  price?: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`p-8 rounded-3xl text-left transition-all duration-300 ${
        highlighted 
          ? 'bg-gradient-to-br from-primary/10 via-primary/5 to-amber-500/5 border border-primary/20' 
          : 'bg-muted/30 border border-border/30'
      }`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-xl ${highlighted ? 'bg-primary/20 text-primary' : 'bg-muted text-foreground'}`}>
          {icon}
        </div>
        <span className="font-semibold text-lg">{title}</span>
        {price && <span className="text-sm text-muted-foreground ml-auto">{price}</span>}
      </div>
      <ul className="space-y-3 text-sm text-muted-foreground">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

// Not do item
function NotDoItem({ text }: { text: string }) {
  return (
    <motion.div 
      className="flex items-start gap-4 text-muted-foreground"
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
    >
      <XCircle className="w-5 h-5 text-destructive/70 flex-shrink-0 mt-0.5" />
      <span className="leading-relaxed">{text}</span>
    </motion.div>
  );
}

// Do item
function DoItem({ text }: { text: string }) {
  return (
    <motion.div 
      className="flex items-start gap-4"
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
    >
      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
      <span className="leading-relaxed">{text}</span>
    </motion.div>
  );
}
