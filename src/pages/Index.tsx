import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { countries } from '@/lib/countries-data';
import { Button } from '@/components/ui/button';
import { CountryCard } from '@/components/CountryCard';
import { PyramidTypesShowcase } from '@/components/PyramidTypesShowcase';
import { useAuth } from '@/hooks/useAuth';
import { 
  ArrowRight, 
  Compass, 
  Shield, 
  Target, 
  Zap, 
  Users, 
  Gamepad2, 
  Key,
  Heart,
  Clock,
  Globe,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  UserPlus,
  User,
  Dice5,
  Route
} from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-pyramid-competence/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Creator badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-500 text-xs md:text-sm font-medium mb-4">
              <Heart className="w-3 h-3 md:w-4 md:h-4" />
              <span className="line-clamp-1">{t('hero.madeBy', "Créé par quelqu'un qui a perdu énormément de temps dans sa propre vie")}</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs md:text-sm font-medium mb-6 md:mb-8">
              <Compass className="w-3 h-3 md:w-4 md:h-4" />
              {t('hero.badge')}
            </div>
            
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight">
              {t('hero.title1')}{' '}
              <span className="gold-text">{t('hero.titleHighlight')}</span>
              {t('hero.title2') && (
                <>
                  <br />
                  {t('hero.title2')}
                </>
              )}
            </h1>

            {/* Positioning tagline - Premium & Clear */}
            <p className="text-sm md:text-base font-medium text-primary/80 mb-3">
              {t('common.positioningLine', 'Outil d\'analyse et de simulation. Tu décides, nous éclairons.')}
            </p>
            
            <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto mb-4 md:mb-6 text-balance px-4">
              {t('hero.subtitle')}
            </p>

            {/* For everyone badge */}
            <div className="flex flex-wrap justify-center gap-2 mb-8 md:mb-10 px-4">
              <span className="px-2 py-1 rounded-full bg-muted text-xs">🥖 Boulanger</span>
              <span className="px-2 py-1 rounded-full bg-muted text-xs">🏭 Ouvrier</span>
              <span className="px-2 py-1 rounded-full bg-muted text-xs">🎓 Étudiant</span>
              <span className="px-2 py-1 rounded-full bg-muted text-xs">🌴 Retraité</span>
              <span className="px-2 py-1 rounded-full bg-muted text-xs">🚀 Entrepreneur</span>
              <span className="px-2 py-1 rounded-full bg-muted text-xs">👨‍👩‍👧 Parent diaspora</span>
            </div>

            {/* CLEAR ACTION BUTTONS - Two distinct paths */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto px-4">
              {/* Path 1: Personal Simulation */}
              <div className="glass-card rounded-xl p-6 border-2 border-primary/30 hover:border-primary/50 transition-colors">
                <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">Simuler ma vraie vie</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Analyse TA trajectoire personnelle, teste TES options
                </p>
                <Button
                  size="lg"
                  onClick={() => navigate('/exit-keys')}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                >
                  <Key className="w-5 h-5" />
                  Ma simulation
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Path 2: Game Mode - ONLY place for "jeu" */}
              <div className="glass-card rounded-xl p-6 border-2 border-blue-500/30 hover:border-blue-500/50 transition-colors">
                <div className="p-3 rounded-full bg-blue-500/10 w-fit mx-auto mb-4">
                  <Dice5 className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">Mode Éducatif</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Personnage fictif aléatoire, découvre les mécanismes
                </p>
                <Button
                  size="lg"
                  onClick={() => navigate('/life-game')}
                  className="w-full bg-blue-500 hover:bg-blue-600 gap-2"
                >
                  <Gamepad2 className="w-5 h-5" />
                  Explorer le jeu
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Micro-disclaimer */}
            <p className="text-xs text-muted-foreground/70 mt-6 max-w-lg mx-auto">
              {t('common.disclaimer', 'Pas de conseil juridique, financier ou médical. Tu restes responsable de tes décisions.')}
            </p>
          </div>
        </div>
      </section>

      {/* Account CTA - For non-logged users */}
      {!user && (
        <section className="py-8 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto glass-card rounded-2xl p-4 md:p-6 border-2 border-primary/20 bg-primary/5">
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                <div className="p-3 md:p-4 rounded-full bg-primary/10 flex-shrink-0">
                  <UserPlus className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-display text-lg md:text-xl font-bold mb-1 md:mb-2">
                    Crée ton compte pour tout synchroniser
                  </h3>
                  <p className="text-muted-foreground text-xs md:text-sm">
                    Ton profil, tes comparaisons, ta progression — tout interconnecté.
                  </p>
                </div>
                <Link to="/auth" className="w-full md:w-auto">
                  <Button size="lg" className="gap-2 w-full md:w-auto">
                    <Sparkles className="w-4 h-4" />
                    Créer mon compte
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Key Value Props */}
      <section className="py-12 md:py-16 border-t border-border/50 bg-gradient-to-b from-transparent via-card/30 to-transparent">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <ValueCard
                icon={<Clock className="w-5 h-5 md:w-6 md:h-6" />}
                title="Simule avant de t'engager"
                description="Teste différents scénarios. Comprends les systèmes avant d'y entrer."
                color="text-amber-500"
                bgColor="bg-amber-500/10"
              />
              <ValueCard
                icon={<AlertTriangle className="w-5 h-5 md:w-6 md:h-6" />}
                title="Analyse les risques"
                description="Identifie les pièges potentiels, les contraintes de chaque système."
                color="text-rose-500"
                bgColor="bg-rose-500/10"
              />
              <ValueCard
                icon={<CheckCircle className="w-5 h-5 md:w-6 md:h-6" />}
                title="Comprends les conséquences"
                description="Chaque décision a un impact. Visualise-le avant de le vivre."
                color="text-emerald-500"
                bgColor="bg-emerald-500/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-3 md:mb-4">{t('howItWorks.title')}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
              {t('howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            <FeatureCard
              icon={<Target className="w-5 h-5 md:w-6 md:h-6" />}
              title={t('howItWorks.understand.title')}
              description={t('howItWorks.understand.description')}
            />
            <FeatureCard
              icon={<Shield className="w-5 h-5 md:w-6 md:h-6" />}
              title={t('howItWorks.profile.title')}
              description={t('howItWorks.profile.description')}
            />
            <FeatureCard
              icon={<Zap className="w-5 h-5 md:w-6 md:h-6" />}
              title={t('howItWorks.playbook.title')}
              description={t('howItWorks.playbook.description')}
            />
          </div>
        </div>
      </section>

      {/* Pyramid Types Showcase */}
      <section className="py-16 md:py-24 border-t border-border/50 bg-gradient-to-b from-transparent via-card/50 to-transparent">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-3 md:mb-4">{t('pyramids.title')}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
              {t('pyramids.subtitle')}
            </p>
          </div>

          <PyramidTypesShowcase />
        </div>
      </section>

      {/* Featured Countries */}
      <section className="py-16 md:py-24 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 md:mb-12 gap-4">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">{t('featured.title')}</h2>
              <p className="text-muted-foreground text-sm md:text-base">
                {t('featured.subtitle')}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/countries')}
              className="gap-2 w-full sm:w-auto"
            >
              {t('featured.viewAll')}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {countries.slice(0, 4).map((country) => (
              <CountryCard key={country.id} country={country} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center glass-card rounded-2xl p-8 md:p-12 glow-gold">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-3 md:mb-4">
              {t('cta.title', 'Prêt à analyser tes options ?')}
            </h2>
            <p className="text-muted-foreground mb-6 md:mb-8 text-sm md:text-base">
              {t('cta.subtitle', 'Cet outil ne juge pas et ne conseille pas. Il analyse, simule et t\'aide à comprendre les systèmes pour que TU décides en connaissance de cause.')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
              <Button
                size="lg"
                onClick={() => navigate('/exit-keys')}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 w-full sm:w-auto"
              >
                <Key className="w-5 h-5" />
                Simuler ma trajectoire
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/life-game')}
                className="gap-2 w-full sm:w-auto"
              >
                <Gamepad2 className="w-5 h-5" />
                Mode éducatif
              </Button>
            </div>

            {/* Final disclaimer */}
            <p className="text-xs text-muted-foreground/60 mt-6">
              {t('common.disclaimer')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="glass-card rounded-xl p-5 md:p-6 text-center">
      <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 text-primary mb-3 md:mb-4">
        {icon}
      </div>
      <h3 className="font-display font-semibold text-base md:text-lg mb-2">{title}</h3>
      <p className="text-xs md:text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function ValueCard({
  icon,
  title,
  description,
  color,
  bgColor,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="glass-card rounded-xl p-5 md:p-6">
      <div className={`inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg ${bgColor} ${color} mb-3 md:mb-4`}>
        {icon}
      </div>
      <h3 className="font-display font-semibold text-base md:text-lg mb-2">{title}</h3>
      <p className="text-xs md:text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
