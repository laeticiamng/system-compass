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
  UserPlus
} from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section - Completely redesigned */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-pyramid-competence/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Creator badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-500 text-sm font-medium mb-4">
              <Heart className="w-4 h-4" />
              {t('hero.madeBy', 'Créé par quelqu\'un qui a perdu énormément de temps dans sa propre vie')}
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Compass className="w-4 h-4" />
              {t('hero.badge')}
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
              {t('hero.title1')}{' '}
              <span className="gold-text">{t('hero.titleHighlight')}</span>
              {t('hero.title2') && (
                <>
                  <br />
                  {t('hero.title2')}
                </>
              )}
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6 text-balance">
              {t('hero.subtitle')}
            </p>

            {/* For everyone badge */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              <span className="px-3 py-1 rounded-full bg-muted text-xs">🥖 Boulanger à Paris</span>
              <span className="px-3 py-1 rounded-full bg-muted text-xs">🏭 Ouvrier en Chine</span>
              <span className="px-3 py-1 rounded-full bg-muted text-xs">🎓 Étudiant indécis</span>
              <span className="px-3 py-1 rounded-full bg-muted text-xs">🌴 Retraité au soleil</span>
              <span className="px-3 py-1 rounded-full bg-muted text-xs">🚀 Entrepreneur</span>
              <span className="px-3 py-1 rounded-full bg-muted text-xs">👨‍👩‍👧 Parent diaspora</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => navigate('/quiz')}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8"
              >
                <Gamepad2 className="w-5 h-5" />
                {t('hero.discoverProfile', 'Teste ta trajectoire')}
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/exit-keys')}
                className="border-border hover:bg-accent gap-2"
              >
                <Key className="w-5 h-5" />
                Trouve ta clé de sortie
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Account CTA - For non-logged users */}
      {!user && (
        <section className="py-8 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto glass-card rounded-2xl p-6 border-2 border-primary/20 bg-primary/5">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="p-4 rounded-full bg-primary/10">
                  <UserPlus className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-display text-xl font-bold mb-2">
                    Crée ton compte pour tout synchroniser
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Ton profil, tes comparaisons, ta progression — tout interconnecté sur tous tes appareils. 
                    Gratuit et sans engagement.
                  </p>
                </div>
                <Link to="/auth">
                  <Button size="lg" className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    Créer mon compte
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Key Value Props - Why this platform */}
      <section className="py-16 border-t border-border/50 bg-gradient-to-b from-transparent via-card/30 to-transparent">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              <ValueCard
                icon={<Clock className="w-6 h-6" />}
                title="Gagne des années"
                description="Évite de passer 3 ans dans une voie qui ne te correspond pas. Teste avant de t'engager."
                color="text-amber-500"
                bgColor="bg-amber-500/10"
              />
              <ValueCard
                icon={<AlertTriangle className="w-6 h-6" />}
                title="Évite les pièges"
                description="Les faux passeurs, les arnaques, les mauvais choix de carrière — mieux vaut les voir venir."
                color="text-rose-500"
                bgColor="bg-rose-500/10"
              />
              <ValueCard
                icon={<CheckCircle className="w-6 h-6" />}
                title="Fais les bons choix"
                description="Chaque décision a des conséquences. Simule-les ici avant de les vivre."
                color="text-emerald-500"
                bgColor="bg-emerald-500/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold mb-4">{t('howItWorks.title')}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {t('howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard
              icon={<Target className="w-6 h-6" />}
              title={t('howItWorks.understand.title')}
              description={t('howItWorks.understand.description')}
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title={t('howItWorks.profile.title')}
              description={t('howItWorks.profile.description')}
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title={t('howItWorks.playbook.title')}
              description={t('howItWorks.playbook.description')}
            />
          </div>
        </div>
      </section>

      {/* Game CTA - The Life Game */}
      <section className="py-16 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto glass-card rounded-2xl p-8 md:p-12 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 border-blue-500/20">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="p-6 rounded-2xl bg-blue-500/10">
                <Gamepad2 className="w-12 h-12 text-blue-500" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
                  Le Jeu de la Vie
                </h2>
                <p className="text-muted-foreground mb-4">
                  Simule ta vie dans différents pays et systèmes. Fais des choix, affronte les conséquences, 
                  apprends les réalités — tout ça sans risquer ta vraie vie.
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">Solo</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-rose-500/20 text-rose-400">Multijoueur</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">Coopératif</span>
                </div>
              </div>
              <Button 
                size="lg" 
                onClick={() => navigate('/quiz')}
                className="bg-blue-500 hover:bg-blue-600 gap-2"
              >
                Jouer maintenant
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pyramid Types - Enhanced Showcase */}
      <section className="py-24 border-t border-border/50 bg-gradient-to-b from-transparent via-card/50 to-transparent">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold mb-4">{t('pyramids.title')}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {t('pyramids.subtitle')}
            </p>
          </div>

          <PyramidTypesShowcase />
        </div>
      </section>

      {/* Featured Countries */}
      <section className="py-24 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-display text-3xl font-bold mb-2">{t('featured.title')}</h2>
              <p className="text-muted-foreground">
                {t('featured.subtitle')}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/countries')}
              className="hidden md:flex gap-2"
            >
              {t('featured.viewAll')}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {countries.slice(0, 4).map((country) => (
              <CountryCard key={country.id} country={country} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center glass-card rounded-2xl p-12 glow-gold">
            <h2 className="font-display text-3xl font-bold mb-4">
              Mieux vaut se tromper ici que dans la vraie vie
            </h2>
            <p className="text-muted-foreground mb-8">
              Teste tes choix, simule ta trajectoire, découvre les pièges avant d'y tomber. 
              Gratuit, sans jugement, pour tout le monde.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => navigate('/exit-keys')}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              >
                <Key className="w-5 h-5" />
                Trouve ta clé de sortie
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/quiz')}
                className="gap-2"
              >
                <Gamepad2 className="w-5 h-5" />
                Jouer au Jeu de la Vie
              </Button>
            </div>
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
    <div className="glass-card rounded-xl p-6 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
        {icon}
      </div>
      <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
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
    <div className="glass-card rounded-xl p-6">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${bgColor} ${color} mb-4`}>
        {icon}
      </div>
      <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
