/**
 * Index - Landing page simplifiée et optimisée
 * Structure : Hero → Comment ça marche → Exemple pays → Témoignages → Pricing → Footer
 */

import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useCountries } from '@/lib/countries-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CountryCard } from '@/components/CountryCard';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Compass, 
  Key,
  Sparkles,
  Globe,
  Unlock,
  Crown,
  Play,
  Triangle,
  CheckCircle,
  Quote,
  Zap
} from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const { t: _t } = useTranslation(); // eslint-disable-line @typescript-eslint/no-unused-vars -- Reserved for i18n migration
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
        <title>Pyramid Compass - Analyse les systèmes des pays et trouve tes stratégies</title>
        <meta name="description" content="Pyramid Compass - Analyse les systèmes des pays et trouve tes stratégies de sortie personnalisées. Découvre les règles réelles de 38+ pays, fais le test de profil gratuit et obtiens tes Exit Keys." />
        <meta property="og:title" content="Pyramid Compass - Analyse les systèmes des pays" />
        <meta property="og:description" content="Analyse les systèmes des pays et trouve tes stratégies de sortie personnalisées. Test de profil gratuit inclus." />
      </Helmet>
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
            <span className="text-sm text-primary font-medium">100% gratuit pour commencer</span>
          </motion.div>

          {/* Titre accrocheur */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-display font-bold text-[clamp(2rem,6vw,5rem)] leading-[1.1] mb-6"
          >
            Comprends le système
            <br />
            <span className="bg-gradient-to-r from-primary via-amber-400 to-orange-500 bg-clip-text text-transparent">
              avant de t'engager.
            </span>
          </motion.h1>

          {/* Sous-titre 1 ligne */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Analyse les règles réelles des pays et obtiens tes stratégies de sortie personnalisées.
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
              Découvrir mon profil gratuitement
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/countries')}
              className="h-14 px-8 text-lg rounded-full gap-3"
            >
              <Globe className="w-5 h-5" />
              Explorer les pays
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
              <span className="block text-3xl font-bold text-foreground">38+</span>
              <span className="text-sm">pays analysés</span>
            </div>
            <div className="text-center">
              <span className="block text-3xl font-bold text-foreground">50+</span>
              <span className="text-sm">clés de sortie</span>
            </div>
            <div className="text-center">
              <span className="block text-3xl font-bold text-foreground">6</span>
              <span className="text-sm">types de systèmes</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== COMMENT ÇA MARCHE - 3 ÉTAPES ========== */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-primary font-medium mb-3 tracking-widest uppercase text-sm">
              Comment ça marche
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              3 étapes simples
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Étape 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0, duration: 0.6 }}
            >
              <Card className="h-full text-center p-8 border-2 hover:border-primary/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <Play className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-4xl font-bold text-primary/20 mb-4">01</div>
                  <h3 className="text-xl font-bold mb-3">Fais le test</h3>
                  <p className="text-muted-foreground">
                    2 minutes pour découvrir ton profil et tes priorités de vie.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Étape 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <Card className="h-full text-center p-8 border-2 hover:border-primary/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
                    <Triangle className="w-8 h-8 text-amber-500" />
                  </div>
                  <div className="text-4xl font-bold text-primary/20 mb-4">02</div>
                  <h3 className="text-xl font-bold mb-3">Découvre ta pyramide</h3>
                  <p className="text-muted-foreground">
                    Comprends quel type de système te correspond le mieux.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Étape 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Card className="h-full text-center p-8 border-2 hover:border-primary/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                    <Key className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="text-4xl font-bold text-primary/20 mb-4">03</div>
                  <h3 className="text-xl font-bold mb-3">Obtiens tes Exit Keys</h3>
                  <p className="text-muted-foreground">
                    Stratégies personnalisées pour tes décisions de vie.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== EXEMPLE FICHE PAYS ========== */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-primary font-medium mb-3 tracking-widest uppercase text-sm">
              Exemple concret
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Une fiche pays en aperçu
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Chaque pays est analysé en profondeur : système, risques, opportunités et stratégies.
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
              Voir les {countries.length} pays analysés
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ========== TÉMOIGNAGES ========== */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-primary font-medium mb-3 tracking-widest uppercase text-sm">
              Témoignages
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Ce qu'ils en disent
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Témoignage 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0, duration: 0.5 }}
            >
              <Card className="h-full">
                <CardContent className="pt-6">
                  <Quote className="w-8 h-8 text-primary/20 mb-4" />
                  <p className="text-foreground mb-6 italic">
                    "Grâce à Pyramid Compass, j'ai compris le système suisse en 10 minutes. Les vraies règles, pas les clichés."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-bold text-primary">M</span>
                    </div>
                    <div>
                      <p className="font-medium">Marie L.</p>
                      <p className="text-sm text-muted-foreground">Expatriée en Suisse</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Témoignage 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Card className="h-full">
                <CardContent className="pt-6">
                  <Quote className="w-8 h-8 text-primary/20 mb-4" />
                  <p className="text-foreground mb-6 italic">
                    "Le test de profil m'a ouvert les yeux. Je visais le mauvais pays pour mes objectifs."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <span className="font-bold text-amber-500">T</span>
                    </div>
                    <div>
                      <p className="font-medium">Thomas R.</p>
                      <p className="text-sm text-muted-foreground">Entrepreneur digital</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Témoignage 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Card className="h-full">
                <CardContent className="pt-6">
                  <Quote className="w-8 h-8 text-primary/20 mb-4" />
                  <p className="text-foreground mb-6 italic">
                    "Les Exit Keys m'ont permis de planifier ma transition en 3 mois au lieu de 2 ans."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <span className="font-bold text-green-500">S</span>
                    </div>
                    <div>
                      <p className="font-medium">Sophie D.</p>
                      <p className="text-sm text-muted-foreground">Cadre en reconversion</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

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
              <span className="text-sm text-amber-500 font-medium">Gratuit pour commencer</span>
            </motion.div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Choisis ton plan
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Commence gratuitement. Évolue selon tes besoins.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
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
                      <h3 className="text-xl font-bold">Gratuit</h3>
                      <p className="text-muted-foreground text-sm">Pour découvrir</p>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Test de profil complet
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Analyse de base des pays
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      38 pays disponibles
                    </li>
                  </ul>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/auth')}
                  >
                    Commencer gratuitement
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
                  Populaire
                </div>
                <CardContent className="pt-8 pb-8 px-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Crown className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Premium</h3>
                      <p className="text-muted-foreground text-sm">dès 7,99€/mois</p>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Tout le plan gratuit
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Exit Keys personnalisées
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Export PDF illimité
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Analyses approfondies
                    </li>
                  </ul>
                  <Button 
                    className="w-full"
                    onClick={() => navigate('/pricing')}
                  >
                    Voir les plans
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
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
              Prêt à comprendre
              <br />
              <span className="text-primary">les vraies règles ?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Cet outil analyse et simule. À toi de décider.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/quick-test')}
              className="h-16 px-12 text-lg rounded-full gap-3"
            >
              <Compass className="w-6 h-6" />
              Commencer maintenant
              <ArrowRight className="w-6 h-6" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Guest banner */}
      {!user && (
        <section className="py-6 border-t border-border/30">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground">
              🔓 <strong>Mode observation</strong> — Explore librement sans compte.{' '}
              <Link to="/auth" className="text-primary hover:underline font-medium">
                Créer un compte
              </Link> pour sauvegarder.
            </p>
          </div>
        </section>
      )}
      </div>
    </>
  );
}
