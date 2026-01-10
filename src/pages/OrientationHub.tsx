import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Compass, ArrowRight, Key, Target, Shield, TrendingUp, 
  Play, AlertTriangle, Brain, Lightbulb, Scale, Map, Users, Heart
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SimulationDisclaimer } from '@/components/SimulationDisclaimer';

interface ToolCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
  duration: string;
  bestFor: string[];
  notFor: string[];
}

const ORIENTATION_TOOLS: ToolCard[] = [
  {
    id: 'prevention-filter',
    title: 'orientationHub.tools.preventionFilter.title',
    description: 'orientationHub.tools.preventionFilter.description',
    icon: Shield,
    href: '/prevention-filter',
    color: 'primary',
    duration: '< 2 min',
    bestFor: [
      'orientationHub.tools.preventionFilter.bestFor.0',
      'orientationHub.tools.preventionFilter.bestFor.1'
    ],
    notFor: [
      'orientationHub.tools.preventionFilter.notFor.0'
    ]
  },
  {
    id: 'exit-keys',
    title: 'orientationHub.tools.exitKeys.title',
    description: 'orientationHub.tools.exitKeys.description',
    icon: Key,
    href: '/exit-keys',
    color: 'amber-500',
    duration: '5-10 min',
    bestFor: [
      'orientationHub.tools.exitKeys.bestFor.0',
      'orientationHub.tools.exitKeys.bestFor.1'
    ],
    notFor: [
      'orientationHub.tools.exitKeys.notFor.0'
    ]
  },
  {
    id: 'life-trajectory',
    title: 'orientationHub.tools.lifeTrajectory.title',
    description: 'orientationHub.tools.lifeTrajectory.description',
    icon: TrendingUp,
    href: '/life-trajectory',
    color: 'green-500',
    duration: '5-8 min',
    bestFor: [
      'orientationHub.tools.lifeTrajectory.bestFor.0',
      'orientationHub.tools.lifeTrajectory.bestFor.1'
    ],
    notFor: [
      'orientationHub.tools.lifeTrajectory.notFor.0'
    ]
  },
  {
    id: 'profile-test',
    title: 'orientationHub.tools.profileTest.title',
    description: 'orientationHub.tools.profileTest.description',
    icon: Target,
    href: '/profile-test',
    color: 'blue-500',
    duration: '3-5 min',
    bestFor: [
      'orientationHub.tools.profileTest.bestFor.0',
      'orientationHub.tools.profileTest.bestFor.1'
    ],
    notFor: [
      'orientationHub.tools.profileTest.notFor.0'
    ]
  },
  {
    id: 'life-game',
    title: 'orientationHub.tools.lifeGame.title',
    description: 'orientationHub.tools.lifeGame.description',
    icon: Play,
    href: '/life-game',
    color: 'purple-500',
    duration: '15-30 min',
    bestFor: [
      'orientationHub.tools.lifeGame.bestFor.0',
      'orientationHub.tools.lifeGame.bestFor.1'
    ],
    notFor: [
      'orientationHub.tools.lifeGame.notFor.0'
    ]
  },
  {
    id: 'errors-illusions',
    title: 'orientationHub.tools.errorsIllusions.title',
    description: 'orientationHub.tools.errorsIllusions.description',
    icon: AlertTriangle,
    href: '/errors-illusions',
    color: 'red-500',
    duration: '10-15 min',
    bestFor: [
      'orientationHub.tools.errorsIllusions.bestFor.0',
      'orientationHub.tools.errorsIllusions.bestFor.1'
    ],
    notFor: [
      'orientationHub.tools.errorsIllusions.notFor.0'
    ]
  }
];

const QUICK_SITUATIONS = [
  {
    icon: Map,
    question: 'orientationHub.situations.country',
    answer: '/exit-keys'
  },
  {
    icon: AlertTriangle,
    question: 'orientationHub.situations.decision',
    answer: '/prevention-filter'
  },
  {
    icon: Brain,
    question: 'orientationHub.situations.understand',
    answer: '/pyramid-types'
  },
  {
    icon: Target,
    question: 'orientationHub.situations.fit',
    answer: '/profile-test'
  },
  {
    icon: TrendingUp,
    question: 'orientationHub.situations.plan',
    answer: '/life-trajectory'
  },
  {
    icon: Scale,
    question: 'orientationHub.situations.compare',
    answer: '/compare'
  }
];

export default function OrientationHub() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Compass className="w-5 h-5" />
            <span className="font-medium">{t('orientationHub.badge', 'Hub d\'orientation')}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('orientationHub.title', 'Quel outil pour votre situation ?')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            {t('orientationHub.subtitle', 'Chaque outil répond à un besoin différent. Trouvez celui qui vous convient.')}
          </p>
          
          <SimulationDisclaimer variant="compact" />
        </div>

        {/* Central Philosophy Message */}
        <Card className="mb-12 border-primary/30 bg-gradient-to-r from-primary/5 via-background to-amber-500/5">
          <CardContent className="pt-8 pb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Lightbulb className="w-10 h-10 text-primary" />
              <Heart className="w-6 h-6 text-amber-500" />
            </div>
            <blockquote className="text-center max-w-3xl mx-auto">
              <p className="text-xl font-medium mb-4">
                {t('orientationHub.philosophy', 'Pyramid Compass est une plateforme d\'orientation avant décision.')}
              </p>
              <p className="text-muted-foreground">
                {t('orientationHub.philosophyDesc', 'Permettre à chaque personne de comprendre clairement ses options réelles, leurs risques, leurs coûts et leurs alternatives, avant d\'engager son argent, sa vie ou son avenir.')}
              </p>
            </blockquote>
            <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="text-red-500">✕</span> Pas de promesse
              </span>
              <span className="flex items-center gap-1">
                <span className="text-red-500">✕</span> Pas de conseil juridique
              </span>
              <span className="flex items-center gap-1">
                <span className="text-red-500">✕</span> Pas de rêve vendu
              </span>
              <span className="flex items-center gap-1">
                <span className="text-green-500">✓</span> Lucidité structurée
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Situations */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {t('orientationHub.quickTitle', 'Accès rapide selon votre besoin')}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {QUICK_SITUATIONS.map((situation, index) => {
              const Icon = situation.icon;
              return (
                <Link
                  key={index}
                  to={situation.answer}
                  className="group flex items-center gap-3 p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                    <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <span className="flex-1 text-sm font-medium">
                    {t(situation.question)}
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Tools Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {t('orientationHub.toolsTitle', 'Tous les outils d\'orientation')}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ORIENTATION_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Card 
                  key={tool.id}
                  className="group hover:border-primary/50 transition-all hover:shadow-lg"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div 
                        className="p-3 rounded-xl transition-colors"
                        style={{ backgroundColor: `hsl(var(--${tool.color}) / 0.1)` }}
                      >
                        <Icon 
                          className="w-6 h-6" 
                          style={{ color: `hsl(var(--${tool.color}))` }}
                        />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {tool.duration}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">
                      {t(tool.title, tool.title)}
                    </CardTitle>
                    <CardDescription>
                      {t(tool.description, tool.description)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Best For */}
                    <div>
                      <p className="text-xs font-semibold text-green-600 mb-2">
                        ✓ {t('orientationHub.bestFor', 'Idéal pour')}
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {tool.bestFor.map((item, i) => (
                          <li key={i}>• {t(item, item)}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Not For */}
                    <div>
                      <p className="text-xs font-semibold text-red-500 mb-2">
                        ✕ {t('orientationHub.notFor', 'Pas adapté si')}
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {tool.notFor.map((item, i) => (
                          <li key={i}>• {t(item, item)}</li>
                        ))}
                      </ul>
                    </div>

                    <Button asChild className="w-full mt-4 gap-2">
                      <Link to={tool.href}>
                        {t('orientationHub.startTool', 'Commencer')}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Alternatives to Destructive Choices */}
        <Card className="mb-12 border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/10">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <CardTitle>
                  {t('orientationHub.alternatives.title', 'Alternatives aux choix destructeurs')}
                </CardTitle>
                <CardDescription>
                  {t('orientationHub.alternatives.subtitle', 'Parfois, la meilleure trajectoire n\'est pas celle qu\'on imaginait')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              {t('orientationHub.alternatives.description', 'Pyramid Compass peut révéler que l\'option envisagée est trop risquée, irréaliste ou destructrice. Dans ce cas, la plateforme aide à explorer des alternatives :')}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Rester et entreprendre localement', icon: '🏠' },
                { label: 'Migrer plus tard, mieux préparé', icon: '⏰' },
                { label: 'Migrer autrement (autre pays, autre voie)', icon: '🔄' },
                { label: 'Se former d\'abord', icon: '📚' },
                { label: 'Changer d\'objectif initial', icon: '🎯' },
                { label: 'Diversifier les sources de revenus', icon: '💼' }
              ].map((alt, i) => (
                <div 
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border/50"
                >
                  <span className="text-2xl">{alt.icon}</span>
                  <span className="text-sm font-medium">{t(`orientationHub.alternatives.options.${i}`, alt.label)}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button asChild variant="outline">
                <Link to="/exit-keys" className="gap-2">
                  {t('orientationHub.alternatives.cta', 'Explorer les clés de sortie')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Partners Link */}
        <Card className="bg-gradient-to-r from-primary/5 to-amber-500/5 border-primary/20">
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-semibold mb-3">
              {t('orientationHub.partners.title', 'Vous voulez diffuser Pyramid Compass ?')}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              {t('orientationHub.partners.description', 'Rejoignez le programme Compass Partners pour une diffusion responsable basée sur l\'usage réel et la compréhension.')}
            </p>
            <Button asChild>
              <Link to="/partners" className="gap-2">
                {t('orientationHub.partners.cta', 'Découvrir le programme')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
