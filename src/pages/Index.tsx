import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { countries } from '@/lib/countries-data';
import { Button } from '@/components/ui/button';
import { CountryCard } from '@/components/CountryCard';
import { useAuth } from '@/hooks/useAuth';
import { 
  ArrowRight, 
  Compass, 
  Target, 
  Gamepad2, 
  Heart,
  CheckCircle,
  XCircle,
  Route,
  Settings,
  BarChart3,
  Key,
  BookOpen
} from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section - SINGLE CLEAR PATH */}
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

            {/* Positioning tagline */}
            <p className="text-sm md:text-base font-medium text-primary/80 mb-3">
              {t('common.positioningLine', 'Outil d\'analyse et de simulation. Tu décides, nous éclairons.')}
            </p>
            
            <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 md:mb-8 text-balance px-4">
              {t('hero.subtitle')}
            </p>

            {/* SINGLE DOMINANT CTA */}
            <div className="max-w-md mx-auto px-4 mb-8">
              <Button
                size="lg"
                onClick={() => navigate('/exit-keys')}
                className="w-full h-14 md:h-16 text-base md:text-lg bg-primary text-primary-foreground hover:bg-primary/90 gap-3 glow-gold"
              >
                <Route className="w-5 h-5 md:w-6 md:h-6" />
                Simuler ma trajectoire
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            {/* 3 STEP MINI EXPLANATION - Factual */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto px-4 mb-6">
              <StepIndicator 
                number={1}
                icon={<Settings className="w-4 h-4" />}
                title="Ton profil"
                description="Situation, nationalité, ressources"
              />
              <StepIndicator 
                number={2}
                icon={<BarChart3 className="w-4 h-4" />}
                title="Analyse"
                description="Systèmes, contraintes, options"
              />
              <StepIndicator 
                number={3}
                icon={<Key className="w-4 h-4" />}
                title="Conséquences"
                description="Risques, coûts, conditions"
              />
            </div>

            {/* RESPONSIBILITY STATEMENT - Clear and prominent */}
            <div className="max-w-xl mx-auto px-4 mb-6">
              <p className="text-sm text-center text-muted-foreground bg-muted/30 rounded-lg px-4 py-2 border border-border/30">
                <strong className="text-foreground">Tu restes responsable de tes décisions.</strong>{' '}
                Cet outil t'aide à comprendre le système — pas à décider à ta place.
              </p>
            </div>

            {/* For everyone badge */}
            <div className="flex flex-wrap justify-center gap-2 mb-6 px-4">
              <span className="px-2 py-1 rounded-full bg-muted text-xs">🥖 Boulanger</span>
              <span className="px-2 py-1 rounded-full bg-muted text-xs">🏭 Ouvrier</span>
              <span className="px-2 py-1 rounded-full bg-muted text-xs">🎓 Étudiant</span>
              <span className="px-2 py-1 rounded-full bg-muted text-xs">🌴 Retraité</span>
              <span className="px-2 py-1 rounded-full bg-muted text-xs">🚀 Entrepreneur</span>
              <span className="px-2 py-1 rounded-full bg-muted text-xs">👨‍👩‍👧 Parent diaspora</span>
            </div>

            {/* Secondary CTAs */}
            <div className="flex flex-wrap justify-center gap-3 px-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/exit-keys/catalog')}
                className="text-muted-foreground hover:text-foreground gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Voir toutes les clés de sortie
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/life-game')}
                className="text-muted-foreground hover:text-foreground gap-2"
              >
                <Gamepad2 className="w-4 h-4" />
                Mode éducatif (personnage fictif)
              </Button>
            </div>

            {/* Micro-disclaimer */}
            <p className="text-xs text-muted-foreground/70 mt-6 max-w-lg mx-auto">
              {t('common.disclaimer', 'Pas de conseil juridique, financier ou médical. Tu restes responsable de tes décisions.')}
            </p>
          </div>
        </div>
      </section>

      {/* Guest Mode Banner - Non-aggressive, informative */}
      {!user && (
        <section className="py-6 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto p-4 md:p-5 rounded-xl bg-muted/30 border border-border/30 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                🔓 <strong>Mode observation</strong> — Explorez librement sans compte
              </p>
              <p className="text-xs text-muted-foreground/80">
                Toutes les simulations fonctionnent sans inscription. 
                <Link to="/auth" className="text-primary hover:underline ml-1">
                  Créez un compte
                </Link> uniquement pour sauvegarder et synchroniser.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* What this tool does NOT do */}
      <section className="py-10 md:py-14 border-t border-border/50 bg-destructive/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-destructive/10">
                <XCircle className="w-5 h-5 text-destructive" />
              </div>
              <h2 className="font-display text-xl md:text-2xl font-bold">
                {t('notDoes.title', 'Ce que cet outil ne fait PAS')}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NotDoItem text={t('notDoes.noGuaranteedResults', 'Ne promet aucun résultat personnel garanti')} />
              <NotDoItem text={t('notDoes.noLegalAdvice', 'Ne donne pas de conseils juridiques, financiers ou médicaux')} />
              <NotDoItem text={t('notDoes.noPredictions', "Ne prédit pas l'avenir ni ta réussite")} />
              <NotDoItem text={t('notDoes.noReplacement', 'Ne remplace pas un avocat, comptable ou médecin')} />
              <NotDoItem text={t('notDoes.noAccuracyGuarantee', "Ne garantit pas l'exactitude des données affichées")} />
              <NotDoItem text={t('notDoes.noDecisions', 'Ne prend pas les décisions à ta place')} />
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              {t('notDoes.footer', 'Cet outil analyse les systèmes et simule les conséquences. La responsabilité des décisions reste la tienne.')}
            </p>
          </div>
        </div>
      </section>

      {/* How It Works - Value Props */}
      <section className="py-16 md:py-24 border-t border-border/50 bg-gradient-to-b from-transparent via-card/30 to-transparent">
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
              icon={<BarChart3 className="w-5 h-5 md:w-6 md:h-6" />}
              title={t('howItWorks.profile.title')}
              description={t('howItWorks.profile.description')}
            />
            <FeatureCard
              icon={<CheckCircle className="w-5 h-5 md:w-6 md:h-6" />}
              title={t('howItWorks.playbook.title')}
              description={t('howItWorks.playbook.description')}
            />
          </div>
        </div>
      </section>

      {/* Featured Countries - Secondary Exploration */}
      <section className="py-16 md:py-24 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 md:mb-12 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Explorer</p>
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

      {/* Final CTA */}
      <section className="py-16 md:py-24 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center glass-card rounded-2xl p-8 md:p-12 glow-gold">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-3 md:mb-4">
              Prêt à éviter des erreurs coûteuses ?
            </h2>
            <p className="text-muted-foreground mb-6 md:mb-8 text-sm md:text-base">
              Cet outil ne promet rien. Il analyse les systèmes et simule les conséquences pour que tu comprennes les règles réelles avant de t'engager.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/exit-keys')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 w-full sm:w-auto"
            >
              <Route className="w-5 h-5" />
              Analyser ma situation
              <ArrowRight className="w-4 h-4" />
            </Button>

            {/* Final disclaimer */}
            <p className="text-xs text-muted-foreground/60 mt-6">
              Outil d'analyse uniquement. Tu restes responsable de tes décisions.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function StepIndicator({
  number,
  icon,
  title,
  description,
}: {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 text-left">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
        {number}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          {icon}
          <span>{title}</span>
        </div>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
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

function NotDoItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
      <span>{text}</span>
    </div>
  );
}
