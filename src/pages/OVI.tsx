import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Eye, 
  Brain, 
  Grid3X3, 
  Compass,
  BookOpen,
  Lock,
  Sparkles,
  ArrowRight,
  Shield,
  Clock,
  Scale,
  Lightbulb,
  AlertTriangle,
  User,
  Layers,
  FileCheck
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useSubscription } from '@/hooks/useSubscription';
import { PremiumPaywall } from '@/components/PremiumPaywall';
import { ReflectionFrameworks } from '@/components/ovi/ReflectionFrameworks';
import { ReadingGrids } from '@/components/ovi/ReadingGrids';
import { OVIArticle } from '@/components/ovi/OVIArticle';
import { EvidenceCollector } from '@/components/ovi/EvidenceCollector';

export default function OVI() {
  const { t } = useTranslation();
  const { canAccessPro } = useSubscription();
  const [activeTab, setActiveTab] = useState('introduction');
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  // Show article detail if selected
  if (selectedArticle) {
    return (
      <OVIArticle 
        articleId={selectedArticle} 
        onBack={() => setSelectedArticle(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pt-16 sm:pt-20 md:pt-24">
      {/* Hero Section */}
      <section className="py-8 sm:py-12 md:py-20">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Premium Badge */}
            <Badge className="mb-3 sm:mb-4 px-3 sm:px-4 py-1 sm:py-1.5 bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-600 border-amber-500/30 text-xs sm:text-sm">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 sm:mr-2" />
              {t('ovi.badge', 'Premium • Think Tank')}
            </Badge>

            {/* Logo/Title */}
            <div className="flex items-center justify-center gap-3 mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
            </div>
            
            <h1 className="font-display text-2xl sm:text-3xl md:text-5xl font-bold mb-2 sm:mb-3">
              <span className="text-primary">OVI</span>
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-muted-foreground mb-1 sm:mb-2">
              {t('ovi.fullName', 'Observatoire des Variables Invisibles')}
            </p>
            
            <p className="text-sm sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
              {t('ovi.subtitle', 'Un espace de recul, un laboratoire de pensée. Pas un outil de plus — un cadre pour mieux décider.')}
            </p>

            {/* Core Values */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-10 px-2">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm font-medium">
                <Brain className="w-4 h-4 text-primary" />
                {t('ovi.value1', 'Cadres de pensée')}
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm font-medium">
                <Grid3X3 className="w-4 h-4 text-amber-500" />
                {t('ovi.value2', 'Grilles de lecture')}
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm font-medium">
                <Shield className="w-4 h-4 text-emerald-500" />
                {t('ovi.value3', 'Responsabilisation')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ethical Positioning Banner */}
      <section className="py-6 bg-muted/30 border-y">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <EthicalPillar 
                icon={<AlertTriangle className="w-5 h-5" />}
                text={t('ovi.ethics.noPromise', 'Pas de promesse')}
              />
              <EthicalPillar 
                icon={<Sparkles className="w-5 h-5" />}
                text={t('ovi.ethics.noMiracle', 'Pas de solution miracle')}
              />
              <EthicalPillar 
                icon={<BookOpen className="w-5 h-5" />}
                text={t('ovi.ethics.noRecipe', 'Pas de recette')}
              />
              <EthicalPillar 
                icon={<User className="w-5 h-5" />}
                text={t('ovi.ethics.responsibility', 'Responsabilisation maximale')}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {!canAccessPro ? (
            <div className="max-w-2xl mx-auto">
              <PremiumPaywall 
                title={t('ovi.paywall.feature', 'OVI - Observatoire des Variables Invisibles')}
                description={t('ovi.paywall.description', 'Accédez aux cadres de réflexion, grilles de lecture et contenus premium pour enrichir votre prise de décision.')}
                tier="pro"
              />
              
              {/* Preview of what's inside */}
              <div className="mt-8 space-y-4">
                <h3 className="font-semibold text-center text-muted-foreground">
                  {t('ovi.preview.title', 'Aperçu du contenu')}
                </h3>
                <div className="grid md:grid-cols-2 gap-4 opacity-60">
                  <PreviewCard 
                    icon={Brain}
                    title={t('ovi.frameworks.title', 'Cadres de réflexion')}
                    items={[
                      t('ovi.frameworks.bias.title', 'Biais cognitifs'),
                      t('ovi.frameworks.irreversible.title', 'Décisions irréversibles'),
                      t('ovi.frameworks.control.title', 'Illusion de contrôle')
                    ]}
                  />
                  <PreviewCard 
                    icon={Grid3X3}
                    title={t('ovi.grids.title', 'Grilles de lecture')}
                    items={[
                      t('ovi.grids.reversibility.title', 'Réversible / Irréversible'),
                      t('ovi.grids.agency.title', 'Moi / Système'),
                      t('ovi.grids.visibility.title', 'Visible / Invisible')
                    ]}
                  />
                </div>
              </div>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-1 h-auto p-1 mb-8">
                <TabsTrigger value="introduction" className="flex items-center gap-2 py-3">
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('ovi.tabs.intro', 'Introduction')}</span>
                </TabsTrigger>
                <TabsTrigger value="frameworks" className="flex items-center gap-2 py-3">
                  <Brain className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('ovi.tabs.frameworks', 'Cadres')}</span>
                </TabsTrigger>
                <TabsTrigger value="grids" className="flex items-center gap-2 py-3">
                  <Grid3X3 className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('ovi.tabs.grids', 'Grilles')}</span>
                </TabsTrigger>
                <TabsTrigger value="evidence" className="flex items-center gap-2 py-3">
                  <FileCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('ovi.tabs.evidence', 'Preuves')}</span>
                </TabsTrigger>
                <TabsTrigger value="connection" className="flex items-center gap-2 py-3">
                  <Compass className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('ovi.tabs.connection', 'Connexions')}</span>
                </TabsTrigger>
              </TabsList>

              {/* Introduction Tab */}
              <TabsContent value="introduction" className="space-y-8">
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-2xl">
                      {t('ovi.intro.title', 'Qu\'est-ce que l\'OVI ?')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-lg text-muted-foreground">
                      {t('ovi.intro.p1', 'L\'Observatoire des Variables Invisibles n\'est pas un outil supplémentaire. C\'est un espace de recul — un laboratoire de pensée intégré à Pyramid Compass.')}
                    </p>
                    
                    <div className="grid md:grid-cols-3 gap-6">
                      <IntroCard 
                        icon={Eye}
                        title={t('ovi.intro.observe.title', 'Observer')}
                        description={t('ovi.intro.observe.desc', 'Identifier ce qui échappe au regard immédiat : biais, hypothèses implicites, angles morts.')}
                      />
                      <IntroCard 
                        icon={Layers}
                        title={t('ovi.intro.structure.title', 'Structurer')}
                        description={t('ovi.intro.structure.desc', 'Proposer des cadres de pensée, pas des réponses. Des grilles, pas des recettes.')}
                      />
                      <IntroCard 
                        icon={Scale}
                        title={t('ovi.intro.decide.title', 'Décider')}
                        description={t('ovi.intro.decide.desc', 'Nourrir la réflexion pour que vous décidiez mieux — sans jamais décider à votre place.')}
                      />
                    </div>

                    <Separator />

                    <div className="bg-muted/30 rounded-xl p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-amber-500" />
                        {t('ovi.intro.philosophy.title', 'Philosophie')}
                      </h3>
                      <div className="space-y-3 text-muted-foreground">
                        <p>{t('ovi.intro.philosophy.p1', 'Les décisions importantes se prennent souvent sans cadre explicite. On agit vite, on réagit, on suit l\'intuition — parfois à raison, parfois à tort.')}</p>
                        <p>{t('ovi.intro.philosophy.p2', 'L\'OVI propose de ralentir. Non pas pour hésiter, mais pour voir ce qui n\'était pas visible. Pour nommer ce qui restait implicite. Pour distinguer ce qui dépend de vous de ce qui dépend du système.')}</p>
                        <p className="font-medium text-foreground">{t('ovi.intro.philosophy.p3', 'Ce n\'est pas un oracle. C\'est un miroir.')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="text-center">
                  <Button size="lg" onClick={() => setActiveTab('frameworks')} className="gap-2">
                    {t('ovi.intro.cta', 'Explorer les cadres de réflexion')}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </TabsContent>

              {/* Frameworks Tab */}
              <TabsContent value="frameworks">
                <ReflectionFrameworks onSelectArticle={setSelectedArticle} />
              </TabsContent>

              {/* Grids Tab */}
              <TabsContent value="grids">
                <ReadingGrids />
              </TabsContent>

              {/* Evidence Tab */}
              <TabsContent value="evidence">
                <EvidenceCollector />
              </TabsContent>

              {/* Connection Tab */}
              <TabsContent value="connection" className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Compass className="w-5 h-5 text-primary" />
                      {t('ovi.connection.title', 'Connexion avec Pyramid Compass')}
                    </CardTitle>
                    <CardDescription>
                      {t('ovi.connection.subtitle', 'L\'OVI enrichit vos simulations sans les influencer')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-muted-foreground">
                      {t('ovi.connection.intro', 'Lorsque vous effectuez une simulation dans Pyramid Compass, l\'OVI peut suggérer des lectures pertinentes. L\'objectif : nourrir votre réflexion, pas orienter votre décision.')}
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                      <ConnectionExample 
                        simulation={t('ovi.connection.ex1.sim', 'Simulation de trajectoire professionnelle')}
                        suggestions={[
                          t('ovi.connection.ex1.sug1', 'Cadre : Décisions irréversibles'),
                          t('ovi.connection.ex1.sug2', 'Grille : Ce qui dépend de moi / du système')
                        ]}
                      />
                      <ConnectionExample 
                        simulation={t('ovi.connection.ex2.sim', 'Comparaison de pays')}
                        suggestions={[
                          t('ovi.connection.ex2.sug1', 'Cadre : Illusion de contrôle'),
                          t('ovi.connection.ex2.sug2', 'Grille : Visible / Invisible aujourd\'hui')
                        ]}
                      />
                    </div>

                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-6">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                        <div>
                          <h4 className="font-semibold mb-1">
                            {t('ovi.connection.warning.title', 'Principe de non-influence')}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {t('ovi.connection.warning.desc', 'Les suggestions OVI sont toujours optionnelles. Elles apparaissent après la simulation, jamais pendant. L\'objectif est d\'enrichir votre réflexion post-décision, pas de biaiser le processus.')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Link to="/prevention-filter">
                    <Card className="h-full hover:border-primary/30 transition-colors cursor-pointer">
                      <CardContent className="p-6 flex items-center gap-4">
                        <Shield className="w-8 h-8 text-primary" />
                        <div>
                          <h4 className="font-medium">{t('ovi.quickLinks.filter', 'Filtre de prévention')}</h4>
                          <p className="text-sm text-muted-foreground">{t('ovi.quickLinks.filterDesc', 'Analyser une décision')}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link to="/compare">
                    <Card className="h-full hover:border-primary/30 transition-colors cursor-pointer">
                      <CardContent className="p-6 flex items-center gap-4">
                        <Scale className="w-8 h-8 text-amber-500" />
                        <div>
                          <h4 className="font-medium">{t('ovi.quickLinks.compare', 'Comparer')}</h4>
                          <p className="text-sm text-muted-foreground">{t('ovi.quickLinks.compareDesc', 'Explorer des scénarios')}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link to="/institutions">
                    <Card className="h-full hover:border-primary/30 transition-colors cursor-pointer">
                      <CardContent className="p-6 flex items-center gap-4">
                        <Layers className="w-8 h-8 text-emerald-500" />
                        <div>
                          <h4 className="font-medium">{t('ovi.quickLinks.institutions', 'Institutions')}</h4>
                          <p className="text-sm text-muted-foreground">{t('ovi.quickLinks.institutionsDesc', 'Décisions collectives')}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>

      {/* Footer Quote */}
      <section className="py-12 bg-muted/20 border-t">
        <div className="container mx-auto px-4 text-center">
          <blockquote className="max-w-2xl mx-auto">
            <p className="text-xl italic text-muted-foreground mb-4">
              {t('ovi.quote', '"La clarté ne vient pas de ce qu\'on sait, mais de ce qu\'on accepte de regarder."')}
            </p>
            <footer className="text-sm text-muted-foreground">
              — {t('ovi.quoteAuthor', 'Principe OVI')}
            </footer>
          </blockquote>
        </div>
      </section>
    </div>
  );
}

// Helper Components
function EthicalPillar({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 p-3">
      <div className="text-muted-foreground">{icon}</div>
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}

function PreviewCard({ icon: Icon, title, items }: { icon: any; title: string; items: string[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="w-4 h-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1">
          {items.map((item, i) => (
            <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
              <Lock className="w-3 h-3" />
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function IntroCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="text-center p-6 rounded-xl bg-muted/30">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function ConnectionExample({ simulation, suggestions }: { simulation: string; suggestions: string[] }) {
  return (
    <div className="p-4 rounded-xl border bg-muted/20">
      <div className="flex items-center gap-2 mb-3">
        <Compass className="w-4 h-4 text-primary" />
        <span className="font-medium text-sm">{simulation}</span>
      </div>
      <div className="space-y-2">
        {suggestions.map((sug, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowRight className="w-3 h-3" />
            {sug}
          </div>
        ))}
      </div>
    </div>
  );
}
