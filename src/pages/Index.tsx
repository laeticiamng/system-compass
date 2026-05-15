/**
 * Index - Landing page simplifiée et optimisée
 * Structure : Hero → Parcours → Comment ça marche → Exemple pays → FAQ → Pricing → CTA final
 * UX: FAQ before pricing (answer objections then offer), TrustBadges near hero CTA, reduced-motion support
 */

import { useEffect } from 'react';
import { AnimatedPromoSection } from '@/components/landing/AnimatedPromoSection';
import { LocalizedLink as Link } from '@/components/i18n';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useCountries, countriesSeed } from '@/lib/countries-data';
import { Button } from '@/components/ui/button';
import { CountryCard } from '@/components/CountryCard';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Compass,
  Sparkles,
  Globe,
  Play,
  CheckCircle,
  Zap,
} from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { TrustBadges } from '@/components/landing/SocialProofBanner';
import { DataSourcesStrip } from '@/components/landing/DataSourcesStrip';
import { FAQPageJsonLd } from '@/components/seo/JsonLd';
import { HeroMiniDemo } from '@/components/landing/HeroMiniDemo';
import { SculptureHero } from '@/components/landing/SculptureHero';
import { UserJourneys } from '@/components/landing/UserJourneys';
import { SITE_CONFIG } from '@/config/site';

export default function Index() {
  const navigate = useLocalizedNavigate();
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
        <title>{t('landing.meta.title', 'Compass — Comparez 80+ pays pour votre expatriation')}</title>
        <meta name="description" content={t('landing.meta.description', 'Comparez 80+ pays avant de vous expatrier : fiscalité, visas, coût de la vie, sécurité. Test de profil gratuit en 2 min.')} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={t('landing.meta.ogTitle', 'Compass — Comparez les pays avant de partir')} />
        <meta property="og:description" content={t('landing.meta.ogDescription', 'Comparez 80+ pays par compatibilité avec votre profil : fiscalité, visas, coût de la vie, sécurité. Test gratuit en 2 min.')} />
        <meta property="og:image" content={SITE_CONFIG.ogImageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t('landing.meta.ogTitle', 'Compass — Comparez les pays avant de partir')} />
        <meta name="twitter:description" content={t('landing.meta.ogDescription', 'Comparez 80+ pays par compatibilité avec votre profil : fiscalité, visas, coût de la vie, sécurité. Test gratuit en 2 min.')} />
        <meta name="twitter:image" content={SITE_CONFIG.ogImageUrl} />
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM information" />
      </Helmet>
      <FAQPageJsonLd faqs={[
        { question: t('landing.faq.jsonld.q1', "Qu'est-ce que Compass ?"), answer: t('landing.faq.jsonld.a1', "Compass est une plateforme qui vous aide à comparer 80+ pays avant de vous expatrier : fiscalité, visas, coût de la vie, sécurité, profils compatibles et stratégies concrètes.") },
        { question: t('landing.faq.jsonld.q2', "Comment fonctionne le test de profil expatrié ?"), answer: t('landing.faq.jsonld.a2', "Le test rapide évalue vos priorités (fiscalité, qualité de vie, sécurité, opportunités) en 2 minutes. Il vous suggère les pays les plus compatibles avec votre profil spécifique.") },
        { question: t('landing.faq.jsonld.q3', "Le service est-il gratuit ?"), answer: t('landing.faq.jsonld.a3', "L'accès de base est gratuit : test rapide, exploration des 80+ pays, comparaison basique. Le plan Premium à 9,90€/mois donne accès aux stratégies personnalisées, simulateur fiscal et analyses avancées.") },
        { question: t('landing.faq.jsonld.q4', "D'où viennent les données ?"), answer: t('landing.faq.jsonld.a4', "Les données proviennent de la Banque Mondiale, OCDE, FMI, Transparency International, Numbeo et sources gouvernementales, mises à jour régulièrement.") },
        { question: t('landing.faq.jsonld.q5', "Puis-je comparer plusieurs pays ?"), answer: t('landing.faq.jsonld.a5', "Oui, l'outil de comparaison permet de comparer jusqu'à 4 pays simultanément sur fiscalité, coût de la vie, qualité de vie, visas, sécurité et plus, avec des graphiques et exports PDF.") },
        { question: t('landing.faq.jsonld.q6', "En quoi Compass est différent des guides d'expatriation classiques ?"), answer: t('landing.faq.jsonld.a6', "Compass identifie les profils qui réussissent ou échouent dans chaque pays et propose des stratégies personnalisées plutôt que des classements génériques.") },
        { question: t('landing.faq.jsonld.q7', "Quels pays sont couverts ?"), answer: t('landing.faq.jsonld.a7', "Compass couvre 80+ pays : Europe (France, Suisse, Portugal, Allemagne...), Amérique (USA, Canada, Mexique...), Asie (Thaïlande, Japon, Singapour...), Moyen-Orient (Émirats, Qatar...) et Afrique.") },
        { question: t('landing.faq.jsonld.q8', "Comment fonctionne le simulateur fiscal ?"), answer: t('landing.faq.jsonld.a8', "Le simulateur fiscal calcule votre impôt sur le revenu dans le pays de destination et le compare à votre situation actuelle. Il intègre les régimes spéciaux, conventions de double imposition et optimisations légales.") },
      ]} />
      <div className="min-h-screen bg-background overflow-x-hidden">
        {/* ========== HERO SCULPTURE ========== */}
        <SculptureHero />

        {/* Interactive Mini Demo (kept under the sculpture) */}
        <div className="container mx-auto px-4 -mt-8 mb-16">
          <HeroMiniDemo />
        </div>

      {/* ========== SOURCES DE DONNÉES (crédibilité immédiate) ========== */}
      <DataSourcesStrip />

      {/* ========== PARCOURS UTILISATEUR ========== */}
      <UserJourneys />

      {/* ========== VIDEO PROMO ========== */}
      <section className="py-16 md:py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-primary font-medium mb-3 tracking-widest uppercase text-sm">
              {t('landing.video.label', 'Découvrez Compass')}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              {t('landing.video.title', 'Votre expatriation, simplifiée')}
            </h2>
          </div>
          <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-border/30">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto"
            >
              <source src="/compass-promo.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      {/* ========== ANIMATED STATS ========== */}
      <AnimatedPromoSection />

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
                className="flex md:flex-col items-start md:items-center gap-6 md:gap-0 md:text-center"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary/10 border-4 border-background flex items-center justify-center md:mb-6">
                  <Play className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <div className="text-xs font-mono text-primary/40 tracking-widest mb-1 md:mb-2">01</div>
                  <h3 className="text-lg font-bold mb-2">{t('landing.howItWorks.step1Title', 'Faites le test')}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('landing.howItWorks.step1Description', '2 minutes pour découvrir votre profil et vos priorités de vie.')}
                  </p>
                </div>
              </motion.div>

              {/* Étape 2 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="flex md:flex-col items-start md:items-center gap-6 md:gap-0 md:text-center"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-amber-500/10 border-4 border-background flex items-center justify-center md:mb-6">
                  <Compass className="w-7 h-7 text-amber-500" />
                </div>
                <div>
                  <div className="text-xs font-mono text-primary/40 tracking-widest mb-1 md:mb-2">02</div>
                  <h3 className="text-lg font-bold mb-2">{t('landing.howItWorks.step2Title', 'Comparez les pays')}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('landing.howItWorks.step2Description', 'Découvrez comment fonctionne le système économique et fiscal de chaque pays.')}
                  </p>
                </div>
              </motion.div>

              {/* Étape 3 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex md:flex-col items-start md:items-center gap-6 md:gap-0 md:text-center"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-green-500/10 border-4 border-background flex items-center justify-center md:mb-6">
                  <CheckCircle className="w-7 h-7 text-green-500" />
                </div>
                <div>
                  <div className="text-xs font-mono text-primary/40 tracking-widest mb-1 md:mb-2">03</div>
                  <h3 className="text-lg font-bold mb-2">{t('landing.howItWorks.step3Title', 'Obtenez votre plan d\'action')}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('landing.howItWorks.step3Description', 'Recevez des stratégies concrètes adaptées à votre situation et vos objectifs.')}
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

      {/* ConflictZonesMap and TestimonialsSection removed — stats already in hero, conflict map too anxiogenic for landing */}

      {/* ========== FAQ — before pricing (answer objections, then offer) ========== */}
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
                  {t('landing.faq.a1', 'Oui. Le test de profil, l\'exploration des 80+ pays et les fiches de base sont 100% gratuits. Les fonctionnalités avancées (export PDF, recommandations IA, modules Pro) sont réservées aux plans payants.')}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <AccordionItem value="faq-2" className="glass-card rounded-xl px-6 border-none">
                <AccordionTrigger className="text-base font-semibold hover:no-underline">
                  {t('landing.faq.q2', 'Est-ce un conseil juridique ou fiscal ?')}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                  {t('landing.faq.a2', 'Non. Compass est un outil de simulation et de comparaison. Il ne remplace pas un avocat, un fiscaliste ou un conseiller en immigration. Consultez toujours un professionnel avant de prendre une décision.')}
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
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
              <AccordionItem value="faq-4" className="glass-card rounded-xl px-6 border-none">
                <AccordionTrigger className="text-base font-semibold hover:no-underline">
                  {t('landing.faq.q4', 'Compass est-il adapté aux professionnels de santé ?')}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                  {t('landing.faq.a4', 'Oui. Compass propose un parcours dédié aux professionnels de santé : reconnaissance de diplôme (MEBEKO, CNOM), autorisations d\'exercer par canton ou département, simulateur fiscal transfrontalier (LAMal vs Sécurité sociale, pilier 2 vs retraite française), communauté de pairs et checklist documents personnalisée par spécialité.')}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
              <AccordionItem value="faq-5" className="glass-card rounded-xl px-6 border-none">
                <AccordionTrigger className="text-base font-semibold hover:no-underline">
                  {t('landing.faq.q5', 'Puis-je supprimer mon compte et mes données ?')}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                  {t('landing.faq.a5', 'Oui. Vous pouvez supprimer votre compte et toutes les données associées à tout moment depuis les paramètres de votre tableau de bord. La suppression est immédiate et irréversible, conformément au RGPD.')}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }}>
              <AccordionItem value="faq-6" className="glass-card rounded-xl px-6 border-none">
                <AccordionTrigger className="text-base font-semibold hover:no-underline">
                  {t('landing.faq.q6', 'Puis-je exporter mes données ?')}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                  {t('landing.faq.a6', 'Oui. Vous pouvez exporter vos résultats de comparaison et analyses pays en PDF. Toutes vos données personnelles sont téléchargeables depuis les paramètres de votre compte.')}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          </Accordion>
        </div>
      </section>

      {/* ========== PRICING TEASER COMPACT ========== */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
              {t('landing.pricingTeaser.title', 'Gratuit pour commencer, Premium pour aller plus loin')}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              {t('landing.pricingTeaser.subtitle', 'Explorez 80+ pays gratuitement. Passez au Premium à 9,90€/mois pour les analyses avancées et le simulateur fiscal.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Button onClick={() => navigate('/pricing')} className="gap-2">
                {t('landing.pricingTeaser.cta', 'Voir les tarifs')}
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={() => navigate('/auth')} className="gap-2">
                {t('landing.pricingTeaser.freeCta', 'Commencer gratuitement')}
              </Button>
            </div>
          </motion.div>
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
              {t('landing.cta.subtitle', 'Comparez, simulez, décidez. En toute autonomie.')}
            </p>
            <button
              onClick={() => navigate('/quick-test')}
              className="btn-cta-premium h-14 sm:h-16 px-8 sm:px-12 text-base sm:text-lg gap-2 sm:gap-3 flex items-center justify-center text-primary-foreground font-semibold"
            >
              <Compass className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              {t('landing.cta.button', 'Faire le test gratuit')}
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
            </button>
            <p className="text-sm text-muted-foreground mt-4">{t('landing.cta.freeNotice', 'Gratuit, sans carte bancaire')}</p>
          </motion.div>
        </div>
      </section>

      {/* Guest banner */}
      {!user && (
        <section className="py-6 border-t border-border/30">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground">
              ✨ <strong>{t('landing.guest.mode', 'Explorez librement')}</strong> — {t('landing.guest.description', 'Aucun compte requis pour découvrir.')}{' '}
              <Link to="/auth" className="text-primary hover:underline font-medium">
                {t('landing.guest.cta', 'Créez un compte')}
              </Link> {t('landing.guest.suffix', 'pour sauvegarder vos recherches.')}
            </p>
          </div>
        </section>
      )}
      </div>
    </>
  );
}
