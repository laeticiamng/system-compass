import { useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCountries } from '@/lib/countries-data';
import { Button } from '@/components/ui/button';
import { CountryCard } from '@/components/CountryCard';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  ArrowRight, 
  Compass, 
  Gamepad2, 
  Heart,
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
  ChevronDown,
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
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 50]);

  useEffect(() => {
    trackHomeOpened();
  }, [trackHomeOpened]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* HERO SECTION - Apple-style fullscreen dramatic intro */}
      <section ref={heroRef} className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
          <motion.div 
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(280 70% 55% / 0.1) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <motion.div 
          className="relative z-10 container mx-auto px-4 text-center"
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        >
          {/* Micro-badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
          >
            <Heart className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">{t('hero.madeBy', "Créé par quelqu'un qui a perdu énormément de temps")}</span>
          </motion.div>

          {/* Main headline - MASSIVE and impactful */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tight mb-6"
          >
            <span className="block text-foreground">{t('hero.appleTitle1', 'Comprends le système.')}</span>
            <span className="block bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_3s_ease-in-out_infinite]">
              {t('hero.appleTitle2', 'Avant de t\'engager.')}
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            {t('hero.appleSubtitle', "L'outil qui analyse les règles réelles des pays et simule les conséquences de tes décisions. Pas de promesses. Pas de conseils. Juste la réalité.")}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button
              size="lg"
              onClick={() => { trackExitKeysClicked(); navigate('/exit-keys'); }}
              className="h-14 px-8 text-lg bg-primary text-primary-foreground hover:bg-primary/90 rounded-full gap-3 group transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_hsl(var(--primary)/0.4)]"
            >
              <Route className="w-5 h-5" />
              {t('hero.startAnalysis', 'Analyser ma situation')}
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/quick-test')}
              className="h-14 px-8 text-lg rounded-full gap-3 border-border/50 hover:bg-muted/50 group"
            >
              <Play className="w-5 h-5" />
              {t('hero.quickTest', 'Test rapide (60s)')}
            </Button>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ChevronDown className="w-8 h-8 text-muted-foreground/50" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* VALUE PROPOSITION - Big bold statements */}
      <section className="py-32 md:py-48 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="max-w-5xl mx-auto">
              <h2 className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-center leading-tight mb-8">
                {t('value.title1', 'Chaque décision de vie majeure')}
                <br />
                <span className="text-muted-foreground">{t('value.title2', 'mérite une analyse de système.')}</span>
              </h2>
              <p className="text-center text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('value.description', "Tu ne joues pas contre les gens. Tu joues contre les règles du système. Et ces règles, personne ne te les explique.")}
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* FEATURES GRID - Minimalist cards */}
      <section className="py-24 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16 md:mb-24">
              <p className="text-primary font-medium mb-4 tracking-wider uppercase text-sm">
                {t('features.badge', 'Comment ça marche')}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold">
                {t('features.title', "Trois dimensions d'analyse")}
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto">
            <FeatureCardApple
              icon={<Eye className="w-8 h-8" />}
              number="01"
              title={t('features.understand.title', 'Comprendre le système')}
              description={t('features.understand.desc', 'Chaque pays fonctionne selon sa propre logique. Nous analysons les règles réelles, pas les apparences.')}
            />
            <FeatureCardApple
              icon={<Brain className="w-8 h-8" />}
              number="02"
              title={t('features.simulate.title', 'Simuler les conséquences')}
              description={t('features.simulate.desc', 'Avant de t\'engager, visualise les impacts sur ton temps, ton argent et ton énergie.')}
            />
            <FeatureCardApple
              icon={<Key className="w-8 h-8" />}
              number="03"
              title={t('features.keys.title', 'Identifier les clés de sortie')}
              description={t('features.keys.desc', 'Chaque situation a des portes de sortie. Nous les cartographions pour toi.')}
            />
          </div>
        </div>
      </section>

      {/* BIG STATEMENT SECTION */}
      <section className="py-32 md:py-48 relative">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-primary font-medium mb-6 tracking-wider uppercase text-sm">
                {t('statement.badge', 'La vérité')}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8">
                {t('statement.title', "99% des gens découvrent les règles du jeu")}
                <br />
                <span className="text-destructive">{t('statement.titleHighlight', "quand il est trop tard.")}</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
                {t('statement.description', "Expatriation, changement de carrière, investissement, retraite... Les vraies contraintes ne sont jamais dans les brochures.")}
              </p>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/errors-illusions')}
                className="h-14 px-8 text-lg rounded-full gap-3 border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <AlertTriangle className="w-5 h-5" />
                {t('statement.cta', 'Voir les erreurs courantes')}
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* WHAT WE DON'T DO - Clean and honest */}
      <section className="py-24 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 md:gap-16">
                <div>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10 mb-6">
                    <XCircle className="w-8 h-8 text-destructive" />
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl font-bold mb-6">
                    {t('notDo.title', 'Ce qu\'on ne fait PAS')}
                  </h3>
                  <ul className="space-y-4">
                    <NotDoItemApple text={t('notDo.1', 'Promettre des résultats garantis')} />
                    <NotDoItemApple text={t('notDo.2', 'Donner des conseils juridiques ou financiers')} />
                    <NotDoItemApple text={t('notDo.3', 'Prédire ton avenir')} />
                    <NotDoItemApple text={t('notDo.4', 'Décider à ta place')} />
                  </ul>
                </div>
                <div>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/10 mb-6">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl font-bold mb-6">
                    {t('do.title', 'Ce qu\'on fait')}
                  </h3>
                  <ul className="space-y-4">
                    <DoItemApple text={t('do.1', 'Analyser les règles réelles des systèmes')} />
                    <DoItemApple text={t('do.2', 'Simuler les conséquences de tes choix')} />
                    <DoItemApple text={t('do.3', 'Cartographier les options disponibles')} />
                    <DoItemApple text={t('do.4', 'Te montrer ce que personne ne dit')} />
                  </ul>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* TOOLS SHOWCASE */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16 md:mb-24">
              <p className="text-primary font-medium mb-4 tracking-wider uppercase text-sm">
                {t('tools.badge', 'Boîte à outils')}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                {t('tools.title', 'Tout ce dont tu as besoin')}
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                {t('tools.subtitle', 'Des outils puissants pour analyser, simuler et décider.')}
              </p>
            </div>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <ToolCard
              icon={<Route className="w-6 h-6" />}
              title={t('tools.exitKeys', 'Clés de Sortie')}
              description={t('tools.exitKeysDesc', 'Analyse ta situation et trouve tes options')}
              onClick={() => { trackExitKeysClicked(); navigate('/exit-keys'); }}
              primary
            />
            <ToolCard
              icon={<Shield className="w-6 h-6" />}
              title={t('tools.filter', 'Filtre Décision')}
              description={t('tools.filterDesc', 'Passe une décision au crible')}
              onClick={() => { trackFilterClicked(); navigate('/prevention-filter'); }}
            />
            <ToolCard
              icon={<Globe className="w-6 h-6" />}
              title={t('tools.countries', 'Explorer les pays')}
              description={t('tools.countriesDesc', '38 pays analysés en profondeur')}
              onClick={() => navigate('/countries')}
            />
            <ToolCard
              icon={<Gamepad2 className="w-6 h-6" />}
              title={t('tools.game', 'Mode Éducatif')}
              description={t('tools.gameDesc', 'Apprends avec un personnage fictif')}
              onClick={() => navigate('/life-game')}
            />
          </div>
        </div>
      </section>

      {/* COUNTRIES PREVIEW */}
      <section className="py-24 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 md:mb-16 gap-6">
              <div>
                <p className="text-primary font-medium mb-4 tracking-wider uppercase text-sm">
                  {t('countries.badge', 'Explorer')}
                </p>
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold">
                  {t('countries.title', '38 pays analysés')}
                </h2>
              </div>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/countries')}
                className="rounded-full gap-2"
              >
                {t('countries.viewAll', 'Voir tous les pays')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {countries.slice(0, 4).map((country, index) => (
              <motion.div
                key={country.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <CountryCard country={country} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING TEASER */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-amber-500 font-medium">{t('pricing.badge', 'Gratuit pour commencer')}</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                {t('pricing.title', 'Commence gratuitement.')}
                <br />
                <span className="text-muted-foreground">{t('pricing.subtitle', 'Évolue selon tes besoins.')}</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-12 max-w-xl mx-auto">
                {t('pricing.description', 'Accède aux analyses de base gratuitement. Débloques les fonctionnalités avancées quand tu en as besoin.')}
              </p>

              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
                <div className="p-6 rounded-2xl bg-muted/50 border border-border/50 text-left">
                  <div className="flex items-center gap-3 mb-4">
                    <Unlock className="w-6 h-6 text-primary" />
                    <span className="font-semibold text-lg">{t('pricing.free', 'Gratuit')}</span>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      {t('pricing.freeFeature1', 'Analyse de base')}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      {t('pricing.freeFeature2', 'Tous les simulateurs')}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      {t('pricing.freeFeature3', '38 pays')}
                    </li>
                  </ul>
                </div>
                <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-amber-500/10 border border-primary/20 text-left">
                  <div className="flex items-center gap-3 mb-4">
                    <Crown className="w-6 h-6 text-primary" />
                    <span className="font-semibold text-lg">{t('pricing.pro', 'Pro')}</span>
                    <span className="text-sm text-muted-foreground">{t('pricing.from', 'dès')} 7,99€</span>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      {t('pricing.proFeature1', 'Analyses approfondies')}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      {t('pricing.proFeature2', 'Clés de sortie personnalisées')}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      {t('pricing.proFeature3', 'Export PDF')}
                    </li>
                  </ul>
                </div>
              </div>

              <Button
                size="lg"
                onClick={() => navigate('/pricing')}
                className="h-14 px-8 text-lg rounded-full gap-3"
              >
                <Sparkles className="w-5 h-5" />
                {t('pricing.cta', 'Voir les plans')}
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* FINAL CTA - Dramatic */}
      <section className="py-32 md:py-48 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection>
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
                {t('cta.title', 'Prêt à comprendre')}
                <br />
                <span className="bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_3s_ease-in-out_infinite]">
                  {t('cta.titleHighlight', 'les vraies règles ?')}
                </span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-xl mx-auto">
                {t('cta.description', "Cet outil ne promet rien. Il analyse et simule. À toi de décider.")}
              </p>
              <Button
                size="lg"
                onClick={() => navigate('/exit-keys')}
                className="h-16 px-12 text-xl bg-primary text-primary-foreground hover:bg-primary/90 rounded-full gap-3 group transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_hsl(var(--primary)/0.5)]"
              >
                <Compass className="w-6 h-6" />
                {t('cta.button', 'Commencer l\'analyse')}
                <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
              </Button>

              <p className="text-sm text-muted-foreground/60 mt-8">
                {t('cta.disclaimer', 'Outil d\'analyse uniquement. Tu restes responsable de tes décisions.')}
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Guest banner */}
      {!user && (
        <section className="py-8 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto p-6 rounded-2xl bg-muted/30 border border-border/30 text-center">
              <p className="text-sm text-muted-foreground">
                🔓 <strong>{t('guest.title', 'Mode observation')}</strong> — {t('guest.subtitle', 'Explore librement sans compte.')}{' '}
                <Link to="/auth" className="text-primary hover:underline">
                  {t('guest.cta', 'Créer un compte')}
                </Link> {t('guest.suffix', 'pour sauvegarder.')}
              </p>
            </div>
          </div>
        </section>
      )}
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
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// Apple-style feature card
function FeatureCardApple({ 
  icon, 
  number, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  number: string; 
  title: string; 
  description: string; 
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6 }}
      className="group"
    >
      <div className="text-primary/30 font-mono text-sm mb-4">{number}</div>
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="font-display text-xl md:text-2xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}

// Tool card
function ToolCard({
  icon,
  title,
  description,
  onClick,
  primary = false
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -5 }}
      className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 group ${
        primary 
          ? 'bg-primary/10 border-primary/30 hover:border-primary/50 hover:shadow-[0_0_30px_hsl(var(--primary)/0.2)]' 
          : 'bg-muted/50 border-border/50 hover:border-border hover:bg-muted'
      }`}
    >
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
        primary ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/10 text-foreground'
      }`}>
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.button>
  );
}

// Not do item
function NotDoItemApple({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 text-muted-foreground">
      <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
      <span>{text}</span>
    </div>
  );
}

// Do item
function DoItemApple({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
      <span>{text}</span>
    </div>
  );
}
