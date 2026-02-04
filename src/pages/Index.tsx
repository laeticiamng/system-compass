/**
 * Index - Landing page with premium UX optimized for desktop and mobile
 * Refactored for performance and maintainability
 */

import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCountries } from '@/lib/countries-data';
import { Button } from '@/components/ui/button';
import { CountryCard } from '@/components/CountryCard';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EconomicNews } from '@/components/EconomicNews';
import { LocalExpertFinder } from '@/components/LocalExpertFinder';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Compass, 
  Gamepad2, 
  Route,
  Key,
  AlertTriangle,
  Shield,
  Sparkles,
  Globe,
  Eye,
  Brain,
  Unlock,
  Crown
} from 'lucide-react';

// Import landing components
import { 
  HeroSection, 
  AnimatedSection, 
  FeatureCardPremium, 
  ToolCardPremium, 
  PricingCard,
  NotDoItem,
  DoItem
} from '@/components/landing';

export default function Index() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { trackHomeOpened, trackFilterClicked, trackExitKeysClicked } = useAnalytics();
  const { countries } = useCountries();

  useEffect(() => {
    trackHomeOpened();
  }, [trackHomeOpened]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* HERO SECTION */}
      <HeroSection onExitKeysClick={trackExitKeysClicked} />

      {/* VALUE PROPOSITION - Cinematic reveal */}
      <section className="py-24 md:py-40 lg:py-56 relative">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="max-w-5xl mx-auto text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <h2 className="font-display text-[clamp(1.5rem,4.5vw,4.5rem)] font-bold leading-[1.1] mb-6 md:mb-10">
                  {t('value.title1', 'Chaque décision de vie majeure')}
                  <br />
                  <span className="text-muted-foreground/70">{t('value.title2', 'mérite une analyse de système.')}</span>
                </h2>
              </motion.div>
              <p className="text-base md:text-xl lg:text-2xl text-muted-foreground/80 max-w-2xl mx-auto font-light leading-relaxed px-2">
                {t('value.description', "Tu ne joues pas contre les gens. Tu joues contre les règles du système. Et ces règles, personne ne te les explique.")}
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* FEATURES - Premium cards with icons */}
      <section className="py-20 md:py-32 lg:py-40 relative overflow-hidden">
        {/* Background treatment */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <AnimatedSection>
            <div className="text-center mb-12 md:mb-20 lg:mb-28">
              <motion.p 
                className="text-primary font-medium mb-3 md:mb-5 tracking-[0.15em] md:tracking-[0.2em] uppercase text-xs md:text-sm"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                {t('features.badge', 'Comment ça marche')}
              </motion.p>
              <h2 className="font-display text-[clamp(1.6rem,3.5vw,3.5rem)] font-bold">
                {t('features.title', "Trois dimensions d'analyse")}
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 max-w-6xl mx-auto">
            <FeatureCardPremium
              icon={<Eye className="w-5 h-5 md:w-7 md:h-7" />}
              number="01"
              title={t('features.understand.title', 'Comprendre le système')}
              description={t('features.understand.desc', 'Chaque pays fonctionne selon sa propre logique. Nous analysons les règles réelles, pas les apparences.')}
              delay={0}
            />
            <FeatureCardPremium
              icon={<Brain className="w-5 h-5 md:w-7 md:h-7" />}
              number="02"
              title={t('features.simulate.title', 'Simuler les conséquences')}
              description={t('features.simulate.desc', 'Avant de t\'engager, visualise les impacts sur ton temps, ton argent et ton énergie.')}
              delay={0.1}
            />
            <FeatureCardPremium
              icon={<Key className="w-5 h-5 md:w-7 md:h-7" />}
              number="03"
              title={t('features.keys.title', 'Identifier les clés de sortie')}
              description={t('features.keys.desc', 'Chaque situation a des portes de sortie. Nous les cartographions pour toi.')}
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* BIG STATEMENT - Full screen impact */}
      <section className="py-24 md:py-40 lg:py-56 relative overflow-hidden">
        {/* Dramatic red glow for danger */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[600px] h-[400px] md:h-[600px] rounded-full bg-destructive/5 blur-[100px] md:blur-[120px]" />
        
        <div className="container mx-auto px-4 relative">
          <AnimatedSection>
            <div className="max-w-5xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2 }}
              >
                <p className="text-destructive/80 font-medium mb-4 md:mb-8 tracking-[0.15em] md:tracking-[0.2em] uppercase text-xs md:text-sm">
                  {t('statement.badge', 'La vérité')}
                </p>
                <h2 className="font-display text-[clamp(1.5rem,4.5vw,4rem)] font-bold leading-[1.1] mb-6 md:mb-10 px-2">
                  {t('statement.title', "99% des gens découvrent les règles du jeu")}
                  <br />
                  <span className="text-destructive">{t('statement.titleHighlight', "quand il est trop tard.")}</span>
                </h2>
                <p className="text-base md:text-xl lg:text-2xl text-muted-foreground/70 mb-8 md:mb-14 max-w-2xl mx-auto font-light px-2">
                  {t('statement.description', "Expatriation, changement de carrière, investissement, retraite... Les vraies contraintes ne sont jamais dans les brochures.")}
                </p>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/errors-illusions')}
                  className="h-12 md:h-14 px-6 md:px-10 text-sm md:text-base rounded-full gap-2 md:gap-3 border-destructive/20 text-destructive hover:bg-destructive/5 hover:border-destructive/40 transition-all duration-300"
                >
                  <AlertTriangle className="w-4 h-4 md:w-5 md:h-5" />
                  {t('statement.cta', 'Voir les erreurs courantes')}
                </Button>
              </motion.div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* WHAT WE DO / DON'T - Split screen */}
      <section className="py-20 md:py-32 lg:py-40 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-muted/50 to-muted/30" />
        
        <div className="container mx-auto px-4 relative">
          <AnimatedSection>
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-10 md:gap-12 lg:gap-20">
                {/* What we DON'T do */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="relative"
                >
                  <div className="absolute -top-4 -left-4 w-20 md:w-24 h-20 md:h-24 bg-destructive/10 rounded-full blur-3xl" />
                  <div className="relative">
                    <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-destructive/10 mb-6 md:mb-8">
                      <span className="text-destructive text-xl md:text-2xl">✕</span>
                    </div>
                    <h3 className="font-display text-xl md:text-2xl lg:text-3xl font-bold mb-5 md:mb-8">
                      {t('notDo.title', 'Ce qu\'on ne fait PAS')}
                    </h3>
                    <ul className="space-y-3 md:space-y-5">
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
                  <div className="absolute -top-4 -right-4 w-20 md:w-24 h-20 md:h-24 bg-green-500/10 rounded-full blur-3xl" />
                  <div className="relative">
                    <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-green-500/10 mb-6 md:mb-8">
                      <span className="text-green-500 text-xl md:text-2xl">✓</span>
                    </div>
                    <h3 className="font-display text-xl md:text-2xl lg:text-3xl font-bold mb-5 md:mb-8">
                      {t('do.title', 'Ce qu\'on fait')}
                    </h3>
                    <ul className="space-y-3 md:space-y-5">
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
      <section className="py-20 md:py-32 lg:py-40">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-10 md:mb-16 lg:mb-24">
              <p className="text-primary font-medium mb-3 md:mb-5 tracking-[0.15em] md:tracking-[0.2em] uppercase text-xs md:text-sm">
                {t('tools.badge', 'Boîte à outils')}
              </p>
              <h2 className="font-display text-[clamp(1.6rem,3.5vw,3.5rem)] font-bold mb-3 md:mb-5">
                {t('tools.title', 'Tout ce dont tu as besoin')}
              </h2>
              <p className="text-muted-foreground text-sm md:text-lg max-w-xl mx-auto px-2">
                {t('tools.subtitle', 'Des outils puissants pour analyser, simuler et décider.')}
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 max-w-6xl mx-auto">
            <ToolCardPremium
              icon={<Route className="w-5 h-5 md:w-6 md:h-6" />}
              title={t('tools.exitKeys', 'Clés de Sortie')}
              description={t('tools.exitKeysDesc', 'Analyse ta situation et trouve tes options')}
              onClick={() => { trackExitKeysClicked(); navigate('/exit-keys'); }}
              primary
              index={0}
            />
            <ToolCardPremium
              icon={<Shield className="w-5 h-5 md:w-6 md:h-6" />}
              title={t('tools.filter', 'Filtre Décision')}
              description={t('tools.filterDesc', 'Passe une décision au crible')}
              onClick={() => { trackFilterClicked(); navigate('/prevention-filter'); }}
              index={1}
            />
            <ToolCardPremium
              icon={<Globe className="w-5 h-5 md:w-6 md:h-6" />}
              title={t('tools.countries', 'Explorer les pays')}
              description={t('tools.countriesDesc', '38 pays analysés en profondeur')}
              onClick={() => navigate('/countries')}
              index={2}
            />
            <ToolCardPremium
              icon={<Gamepad2 className="w-5 h-5 md:w-6 md:h-6" />}
              title={t('tools.game', 'Mode Éducatif')}
              description={t('tools.gameDesc', 'Apprends avec un personnage fictif')}
              onClick={() => navigate('/life-game')}
              index={3}
            />
          </div>
        </div>
      </section>

      {/* COUNTRIES PREVIEW */}
      <section className="py-20 md:py-32 lg:py-40 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 md:mb-16 gap-4 md:gap-6">
              <div>
                <p className="text-primary font-medium mb-2 md:mb-4 tracking-[0.15em] md:tracking-[0.2em] uppercase text-xs md:text-sm">
                  {t('countries.badge', 'Explorer')}
                </p>
                <h2 className="font-display text-[clamp(1.6rem,3.5vw,3.5rem)] font-bold">
                  {t('countries.title', '38 pays analysés')}
                </h2>
              </div>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/countries')}
                className="rounded-full gap-2 hover:gap-3 transition-all duration-300 text-sm md:text-base h-10 md:h-12"
              >
                {t('countries.viewAll', 'Voir tous les pays')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
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
      <section className="py-20 md:py-32 lg:py-40">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="inline-flex items-center gap-2 md:gap-2.5 px-4 md:px-5 py-2 md:py-2.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6 md:mb-10"
              >
                <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500" />
                <span className="text-xs md:text-sm text-amber-500 font-medium">{t('pricing.badge', 'Gratuit pour commencer')}</span>
              </motion.div>
              
              <h2 className="font-display text-[clamp(1.6rem,4.5vw,4rem)] font-bold mb-4 md:mb-6">
                {t('pricing.title', 'Commence gratuitement.')}
                <br />
                <span className="text-muted-foreground/60">{t('pricing.subtitle', 'Évolue selon tes besoins.')}</span>
              </h2>
              <p className="text-sm md:text-lg text-muted-foreground mb-8 md:mb-14 max-w-xl mx-auto px-2">
                {t('pricing.description', 'Accède aux analyses de base gratuitement. Débloques les fonctionnalités avancées quand tu en as besoin.')}
              </p>

              <div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-2xl mx-auto mb-8 md:mb-14">
                <PricingCard
                  icon={<Unlock className="w-5 h-5 md:w-6 md:h-6" />}
                  title={t('pricing.free', 'Gratuit')}
                  features={[
                    t('pricing.freeFeature1', 'Analyse de base'),
                    t('pricing.freeFeature2', 'Tous les simulateurs'),
                    t('pricing.freeFeature3', '38 pays'),
                  ]}
                />
                <PricingCard
                  icon={<Crown className="w-5 h-5 md:w-6 md:h-6" />}
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
                className="h-12 md:h-14 px-8 md:px-10 text-sm md:text-lg rounded-full gap-2 md:gap-3 transition-all duration-300 hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                {t('pricing.cta', 'Voir les plans')}
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* LOCAL EXPERT FINDER */}
      <LocalExpertFinder />

      {/* FINAL CTA - Maximum impact */}
      <section className="py-24 md:py-40 lg:py-56 relative overflow-hidden">
        {/* Dramatic background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[1000px] h-[600px] md:h-[1000px] rounded-full bg-primary/8 blur-[120px] md:blur-[150px]" />
          <div className="absolute top-1/4 left-1/4 w-[300px] md:w-[400px] h-[300px] md:h-[400px] rounded-full bg-amber-500/5 blur-[80px] md:blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection>
            <div className="max-w-4xl mx-auto text-center">
              <motion.h2 
                className="font-display text-[clamp(2rem,6vw,5.5rem)] font-bold leading-[0.95] mb-6 md:mb-10"
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
              <p className="text-base md:text-xl lg:text-2xl text-muted-foreground/70 mb-8 md:mb-14 max-w-xl mx-auto font-light px-2">
                {t('cta.description', "Cet outil ne promet rien. Il analyse et simule. À toi de décider.")}
              </p>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="lg"
                  onClick={() => navigate('/exit-keys')}
                  className="h-16 md:h-20 px-10 md:px-16 text-base md:text-xl bg-primary text-primary-foreground hover:bg-primary/90 rounded-full gap-3 md:gap-4 group relative overflow-hidden transition-all duration-500 shadow-[0_0_0_1px_hsl(var(--primary)),0_20px_80px_-20px_hsl(var(--primary)/0.6)]"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  <Compass className="w-5 h-5 md:w-7 md:h-7" />
                  {t('cta.button', 'Commencer l\'analyse')}
                  <ArrowRight className="w-5 h-5 md:w-7 md:h-7 transition-transform duration-300 group-hover:translate-x-2" />
                </Button>
              </motion.div>

              <p className="text-xs md:text-sm text-muted-foreground/40 mt-6 md:mt-10 max-w-md mx-auto px-2">
                {t('cta.disclaimer', 'Outil d\'analyse uniquement. Tu restes responsable de tes décisions.')}
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Guest banner */}
      {!user && (
        <section className="py-6 md:py-8 border-t border-border/30">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto p-4 md:p-6 rounded-xl md:rounded-2xl bg-muted/20 backdrop-blur-sm border border-border/20 text-center"
            >
              <p className="text-xs md:text-sm text-muted-foreground">
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
