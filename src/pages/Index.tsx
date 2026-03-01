/**
 * Index - Landing page simplifiée et optimisée
 * Structure : Hero → Comment ça marche → Exemple pays → Témoignages → Pricing → Footer
 */

import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useCountries, countriesSeed } from '@/lib/countries-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CountryCard } from '@/components/CountryCard';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Compass, 
  Sparkles,
  Globe,
  Unlock,
  Crown,
  Play,
  CheckCircle,
  Zap,
} from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { FAQPageJsonLd } from '@/components/seo/JsonLd';

export default function Index() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { trackHomeOpened } = useAnalytics();
  const { countries } = useCountries();

  useEffect(() => {
    trackHomeOpened();
  }, [trackHomeOpened]);

  // Récupérer un pays exemple (Suisse, ou le premier disponible)
  const exampleCountry = countries.find(c => c.iso2 === 'CH') || countries[0];

  return (
    <>
      <Helmet>
        <title>{t('landing.meta.title', 'System Compass - Compare 44 pays pour ton expatriation')}</title>
        <meta name="description" content={t('landing.meta.description', 'Plateforme d\'intelligence décisionnelle pour l\'expatriation. Analyse systémique de 44+ pays : fiscalité, visas, coût de la vie, structures de pouvoir. Test de profil gratuit en 2 min.')} />
        <link rel="canonical" href="https://system-compass.app/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={t('landing.meta.ogTitle', 'System Compass - Intelligence décisionnelle pour l\'expatriation')} />
        <meta property="og:description" content={t('landing.meta.ogDescription', 'Comparez 44+ pays par compatibilité avec votre profil : fiscalité, visas, coût de la vie, sécurité. Approche systémique unique. Test gratuit.')} />
        <meta property="og:url" content="https://system-compass.app/" />
        <meta property="og:image" content="https://system-compass.app/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t('landing.meta.ogTitle', 'System Compass - Intelligence décisionnelle pour l\'expatriation')} />
        <meta name="twitter:description" content={t('landing.meta.ogDescription', 'Comparez 44+ pays par compatibilité avec votre profil : fiscalité, visas, coût de la vie, sécurité. Approche systémique unique. Test gratuit.')} />
        <meta name="twitter:image" content="https://system-compass.app/og-image.png" />
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM information" />
      </Helmet>
      <FAQPageJsonLd faqs={[
        { question: "Qu'est-ce que System Compass ?", answer: "System Compass est la première plateforme d'intelligence décisionnelle pour la relocalisation internationale. Elle analyse les systèmes de 44+ pays avec une approche systémique unique : structures de pouvoir, profils compatibles, règles non-écrites." },
        { question: "Comment fonctionne le test de profil expatrié ?", answer: "Le test rapide évalue vos priorités (fiscalité, qualité de vie, sécurité, opportunités) en 2 minutes. Il vous suggère les pays les plus compatibles avec votre profil spécifique, contrairement aux classements génériques." },
        { question: "Le service est-il gratuit ?", answer: "L'accès de base est gratuit : test rapide, exploration des 44+ pays, comparaison basique. Le plan Premium à 9,90€/mois donne accès aux clés de sortie, simulateur fiscal et intelligence live." },
        { question: "D'où viennent les données de System Compass ?", answer: "Les données proviennent de la Banque Mondiale, OCDE, FMI, Transparency International, Numbeo et sources gouvernementales. L'intelligence live est actualisée via Perplexity AI et vérification terrain." },
        { question: "Puis-je comparer plusieurs pays pour mon expatriation ?", answer: "Oui, l'outil de comparaison permet de comparer jusqu'à 4 pays simultanément sur fiscalité, coût de la vie, qualité de vie, visas, sécurité et plus, avec des radar charts et exports PDF." },
        { question: "En quoi System Compass est différent des guides d'expatriation classiques ?", answer: "System Compass analyse les structures de pouvoir (méritocratique, réseau, État-fort, hybride), identifie les profils qui réussissent ou échouent dans chaque pays, et propose des stratégies personnalisées plutôt que des classements génériques." },
        { question: "Quels pays sont couverts par System Compass ?", answer: "System Compass couvre 44+ pays : Europe (France, Suisse, Portugal, Allemagne...), Amérique (USA, Canada, Mexique...), Asie (Thaïlande, Japon, Singapour...), Moyen-Orient (Émirats, Qatar...) et Afrique." },
        { question: "Comment fonctionne le simulateur fiscal ?", answer: "Le simulateur fiscal calcule votre impôt sur le revenu dans le pays de destination et le compare à votre situation actuelle. Il intègre les régimes spéciaux, conventions de double imposition et optimisations légales." },
      ]} />
      <div className="min-h-screen bg-background overflow-x-hidden">
        {/* ========== HERO SECTION ========== */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.15)_0%,transparent_50%)]" />
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          >
            <Globe className="w-full h-full text-primary/5" />
          </motion.div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">{t('landing.hero.badge', '100% gratuit pour commencer')}</span>
          </motion.div>

          {/* Titre accrocheur */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-display font-bold text-[clamp(2rem,6vw,5rem)] leading-[1.1] mb-6"
          >
            {t('landing.hero.titleLine1', 'Tu veux t\'expatrier ?')}
            <br />
            <span className="bg-gradient-to-r from-primary via-amber-400 to-orange-500 bg-clip-text text-transparent">
              {t('landing.hero.titleLine2', 'Compare les pays avant de partir.')}
            </span>
          </motion.h1>

          {/* Sous-titre 1 ligne */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            {t('landing.hero.subtitle', 'Fiscalité, coût de la vie, visas, qualité de vie : compare 44 pays en 2 minutes et trouve celui qui te correspond.')}
          </motion.p>

          {/* CTA principal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              size="lg"
              onClick={() => navigate('/quick-test')}
              className="h-14 px-8 text-lg rounded-full gap-3 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
            >
              <Zap className="w-5 h-5" />
              {t('landing.hero.ctaPrimary', 'Trouver mon pays idéal — gratuit')}
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/countries')}
              className="h-14 px-8 text-lg rounded-full gap-3"
            >
              <Globe className="w-5 h-5" />
              {t('landing.hero.ctaSecondary', 'Explorer les pays')}
            </Button>
          </motion.div>

          {/* Stats rapides */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-8 mt-16 text-muted-foreground"
          >
            <div className="text-center">
              <span className="block text-3xl font-bold text-foreground">44</span>
              <span className="text-sm">{t('landing.hero.statsCountries', 'pays analysés')}</span>
            </div>
            <div className="text-center">
              <span className="block text-3xl font-bold text-foreground">13</span>
              <span className="text-sm">{t('landing.hero.statsLanguages', 'langues')}</span>
            </div>
            <div className="text-center">
              <span className="block text-3xl font-bold text-foreground">6</span>
              <span className="text-sm">{t('landing.hero.statsSystems', 'profils d\'expatrié')}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== COMMENT ÇA MARCHE - 3 ÉTAPES ========== */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-primary font-medium mb-3 tracking-widest uppercase text-sm">
              {t('landing.howItWorks.label', 'Comment ça marche')}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              {t('landing.howItWorks.title', '3 étapes simples')}
            </h2>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Timeline connector - vertical on mobile, horizontal on desktop */}
            <div className="hidden md:block absolute top-10 left-[16.67%] right-[16.67%] h-0.5 bg-border z-0" />
            <div className="md:hidden absolute top-0 bottom-0 left-8 w-0.5 bg-border z-0" />

            <div className="grid md:grid-cols-3 gap-10 md:gap-8 relative z-10">
              {/* Étape 1 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0, duration: 0.6 }}
                className="pointer-events-none flex md:flex-col items-start md:items-center gap-6 md:gap-0 md:text-center"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary/10 border-4 border-background flex items-center justify-center md:mb-6">
                  <Play className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <div className="text-xs font-mono text-primary/40 tracking-widest mb-1 md:mb-2">01</div>
                  <h3 className="text-lg font-bold mb-2">{t('landing.howItWorks.step1Title', 'Fais le test')}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('landing.howItWorks.step1Description', '2 minutes pour découvrir ton profil et tes priorités de vie.')}
                  </p>
                </div>
              </motion.div>

              {/* Étape 2 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="pointer-events-none flex md:flex-col items-start md:items-center gap-6 md:gap-0 md:text-center"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-amber-500/10 border-4 border-background flex items-center justify-center md:mb-6">
                  <Compass className="w-7 h-7 text-amber-500" />
                </div>
                <div>
                  <div className="text-xs font-mono text-primary/40 tracking-widest mb-1 md:mb-2">02</div>
                  <h3 className="text-lg font-bold mb-2">{t('landing.howItWorks.step2Title', 'Compare les pays')}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('landing.howItWorks.step2Description', 'Découvre comment fonctionne le système économique et fiscal de chaque pays.')}
                  </p>
                </div>
              </motion.div>

              {/* Étape 3 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="pointer-events-none flex md:flex-col items-start md:items-center gap-6 md:gap-0 md:text-center"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-green-500/10 border-4 border-background flex items-center justify-center md:mb-6">
                  <CheckCircle className="w-7 h-7 text-green-500" />
                </div>
                <div>
                  <div className="text-xs font-mono text-primary/40 tracking-widest mb-1 md:mb-2">03</div>
                  <h3 className="text-lg font-bold mb-2">{t('landing.howItWorks.step3Title', 'Obtiens ton plan d\'action')}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('landing.howItWorks.step3Description', 'Reçois des stratégies concrètes adaptées à ta situation et tes objectifs.')}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== EXEMPLE FICHE PAYS ========== */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-primary font-medium mb-3 tracking-widest uppercase text-sm">
              {t('landing.example.label', 'Exemple concret')}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              {t('landing.example.title', 'Une fiche pays en aperçu')}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {t('landing.example.description', 'Chaque pays est analysé en profondeur : économie, risques, opportunités et stratégies.')}
            </p>
          </div>

          <div className="max-w-md mx-auto">
            {exampleCountry && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <CountryCard country={exampleCountry} />
              </motion.div>
            )}
          </div>

          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={() => navigate('/countries')}
              className="gap-2"
            >
              {t('landing.example.cta', 'Voir les {{count}} pays analysés', { count: countries.length || countriesSeed.length })}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ========== EN CHIFFRES ========== */}
      <TestimonialsSection />

      {/* ========== PRICING RAPIDE ========== */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-amber-500 font-medium">{t('landing.pricing.badge', 'Gratuit pour commencer')}</span>
            </motion.div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              {t('landing.pricing.title', 'Choisis ton plan')}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {t('landing.pricing.subtitle', 'Commence gratuitement. Évolue selon tes besoins.')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Plan Free */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full">
                <CardContent className="pt-8 pb-8 px-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                      <Unlock className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{t('landing.pricing.freeName', 'Gratuit')}</h3>
                      <p className="text-muted-foreground text-sm">{t('landing.pricing.freeTag', 'Pour découvrir')}</p>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {t('landing.pricing.freeFeature1', 'Test de profil complet')}
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {t('landing.pricing.freeFeature2', 'Détails complets par pays')}
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {t('landing.pricing.freeFeature3', '44 pays disponibles')}
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {t('landing.pricing.freeFeature4', 'Profils qui réussissent')}
                    </li>
                  </ul>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/auth')}
                  >
                    {t('landing.pricing.freeCta', 'Commencer gratuitement')}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Plan Pro */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-primary/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
                  {t('landing.pricing.popular', 'Populaire')}
                </div>
                <CardContent className="pt-8 pb-8 px-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Crown className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{t('landing.pricing.premiumName', 'Premium')}</h3>
                      <p className="text-muted-foreground text-sm">{t('landing.pricing.premiumPrice', 'dès 9,90€/mois')}</p>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {t('landing.pricing.premiumFeature1', 'Tout le plan gratuit')}
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {t('landing.pricing.premiumFeature2', 'Analyse système avancée')}
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {t('landing.pricing.premiumFeature3', 'Export PDF illimité')}
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {t('landing.pricing.premiumFeature4', 'Gouvernance & Terrain')}
                    </li>
                  </ul>
                  <Button 
                    className="w-full"
                    onClick={() => navigate('/pricing')}
                  >
                    {t('landing.pricing.premiumCta', 'Voir les plans')}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Plan Pro / B2B */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full border-muted-foreground/20">
                <CardContent className="pt-8 pb-8 px-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                      <Globe className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{t('landing.pricing.proName', 'Pro / B2B')}</h3>
                      <p className="text-muted-foreground text-sm">{t('landing.pricing.proPrice', 'Sur devis')}</p>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {t('landing.pricing.proFeature1', 'Tout le plan Premium')}
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {t('landing.pricing.proFeature2', 'Analyse projet personnalisée')}
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {t('landing.pricing.proFeature3', 'Support dédié & multi-utilisateurs')}
                    </li>
                  </ul>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/pricing')}
                  >
                    {t('landing.pricing.proCta', 'Nous contacter')}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== FAQ MINI ========== */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-primary font-medium mb-3 tracking-widest uppercase text-sm">
              {t('landing.faq.label', 'Questions fréquentes')}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              {t('landing.faq.title', 'On répond à vos questions')}
            </h2>
          </div>

          <Accordion type="single" collapsible className="max-w-3xl mx-auto space-y-4">
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <AccordionItem value="faq-1" className="glass-card rounded-xl px-6 border-none">
                <AccordionTrigger className="text-base font-semibold hover:no-underline">
                  {t('landing.faq.q1', 'Est-ce vraiment gratuit ?')}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                  {t('landing.faq.a1', 'Oui. Le test de profil, l\'exploration des 44 pays et les fiches de base sont 100% gratuits. Les fonctionnalités avancées (export PDF, recommandations IA, modules Pro) sont réservées aux plans payants.')}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <AccordionItem value="faq-2" className="glass-card rounded-xl px-6 border-none">
                <AccordionTrigger className="text-base font-semibold hover:no-underline">
                  {t('landing.faq.q2', 'Est-ce un conseil juridique ou fiscal ?')}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                  {t('landing.faq.a2', 'Non. System Compass est un outil de simulation et de comparaison. Il ne remplace pas un avocat, un fiscaliste ou un conseiller en immigration. Consultez toujours un professionnel avant de prendre une décision.')}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <AccordionItem value="faq-3" className="glass-card rounded-xl px-6 border-none">
                <AccordionTrigger className="text-base font-semibold hover:no-underline">
                  {t('landing.faq.q3', 'Comment sont calculées les données ?')}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                  {t('landing.faq.a3', 'Nos données proviennent de sources publiques (Banque Mondiale, ONU, Transparency International, etc.) et sont mises à jour régulièrement. Chaque fiche pays indique ses sources.')}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          </Accordion>
        </div>
      </section>

      {/* ========== CTA FINAL ========== */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
              {t('landing.cta.titleLine1', 'Prêt à comparer')}
              <br />
              <span className="text-primary">{t('landing.cta.titleLine2', 'les pays ?')}</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              {t('landing.cta.subtitle', 'Compare, simule, décide. En toute autonomie.')}
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/quick-test')}
              className="h-16 px-12 text-lg rounded-full gap-3"
            >
              <Compass className="w-6 h-6" />
              {t('landing.cta.button', 'Commencer maintenant')}
              <ArrowRight className="w-6 h-6" />
            </Button>
            <p className="text-sm text-muted-foreground mt-4">{t('landing.cta.freeNotice', 'Gratuit, sans carte bancaire')}</p>
          </motion.div>
        </div>
      </section>

      {/* Guest banner */}
      {!user && (
        <section className="py-6 border-t border-border/30">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground">
              🔓 <strong>{t('landing.guest.mode', 'Mode observation')}</strong> — {t('landing.guest.description', 'Explore librement sans compte.')}{' '}
              <Link to="/auth" className="text-primary hover:underline font-medium">
                {t('landing.guest.cta', 'Créer un compte')}
              </Link> {t('landing.guest.suffix', 'pour sauvegarder.')}
            </p>
          </div>
        </section>
      )}
      </div>
    </>
  );
}
