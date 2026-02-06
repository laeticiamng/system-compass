import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { 
  Compass, ArrowRight, Key, Target, Shield, TrendingUp, 
  Play, AlertTriangle, Brain, Lightbulb, Scale, Map, Users, Heart,
  BookOpen, ShieldX, Gamepad2, HelpCircle, ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SimulationDisclaimer } from '@/components/SimulationDisclaimer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface ToolCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
  duration: string;
  bestFor: string[];
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
    ]
  }
];

const QUICK_SITUATIONS = [
  { icon: Map, question: 'orientationHub.situations.country', answer: '/exit-keys' },
  { icon: AlertTriangle, question: 'orientationHub.situations.decision', answer: '/prevention-filter' },
  { icon: Brain, question: 'orientationHub.situations.understand', answer: '/pyramid-types' },
  { icon: Target, question: 'orientationHub.situations.fit', answer: '/profile-test' },
  { icon: TrendingUp, question: 'orientationHub.situations.plan', answer: '/life-trajectory' },
  { icon: Scale, question: 'orientationHub.situations.compare', answer: '/compare' }
];

export default function About() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>À propos - Pyramid Compass | Outil de lucidité stratégique</title>
        <meta name="description" content="Découvrez Pyramid Compass : un simulateur de décisions et outil d'analyse des systèmes pays. Aucun conseil juridique, financier ou médical. Vous restez responsable." />
        <meta property="og:title" content="À propos - Pyramid Compass | Outil de lucidité stratégique" />
        <meta property="og:description" content="Simulateur de décisions dans des systèmes réels. Outil d'analyse uniquement. Tu décides, nous éclairons." />
        <meta property="og:url" content="https://world-alignment.lovable.app/about" />
        <link rel="canonical" href="https://world-alignment.lovable.app/about" />
      </Helmet>
      <div className="min-h-screen bg-background pt-16 sm:pt-20">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-6xl">
        {/* Back link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 sm:mb-6 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </Link>

        {/* Hero */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary mb-3 sm:mb-4 text-sm">
            <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium">{t('about.badge', 'Notre mission')}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 px-2">
            {t('about.title', 'Outil de lucidité stratégique')}
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-3 sm:mb-4 px-4">
            {t('about.subtitle', 'Simulateur de décisions dans des systèmes réels. Outil d\'analyse uniquement.')}
          </p>
          <p className="text-primary font-medium text-sm sm:text-base">
            {t('common.positioningLine', 'Tu décides, nous éclairons.')}
          </p>
        </div>

        {/* Central Philosophy Message */}
        <Card className="mb-6 sm:mb-12 border-primary/30 bg-gradient-to-r from-primary/5 via-background to-amber-500/5">
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
                <span className="text-red-500">✕</span> {t('orientationHub.noPromise', 'Pas de promesse')}
              </span>
              <span className="flex items-center gap-1">
                <span className="text-red-500">✕</span> {t('orientationHub.noLegalAdvice', 'Pas de conseil juridique')}
              </span>
              <span className="flex items-center gap-1">
                <span className="text-red-500">✕</span> {t('orientationHub.noDreamSold', 'Pas de rêve vendu')}
              </span>
              <span className="flex items-center gap-1">
                <span className="text-green-500">✓</span> {t('orientationHub.structuredLucidity', 'Lucidité structurée')}
              </span>
            </div>
          </CardContent>
        </Card>

        <SimulationDisclaimer variant="compact" className="mb-8" />

        {/* What we are / What we are NOT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <Card className="border-l-4 border-emerald-500">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Target className="w-5 h-5 text-emerald-500" />
                </div>
                <CardTitle>{t('about.whatWeAre.title', 'Ce que nous sommes')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span>{t('about.whatWeAre.point1', 'Un simulateur pour tester des décisions avant de les vivre')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span>{t('about.whatWeAre.point2', 'Un outil d\'analyse des systèmes (fiscaux, sociaux, migratoires)')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span>{t('about.whatWeAre.point3', 'Une grille de lecture pour comprendre comment fonctionne le monde')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span>{t('about.whatWeAre.point4', 'Un espace de réflexion stratégique, pas de jugement')}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-rose-500">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-500/10">
                  <ShieldX className="w-5 h-5 text-rose-500" />
                </div>
                <CardTitle>{t('about.whatWeAreNot.title', 'Ce que nous ne sommes PAS')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 mt-0.5">✗</span>
                  <span>{t('about.whatWeAreNot.point1', 'Un cabinet de conseil juridique, fiscal ou médical')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 mt-0.5">✗</span>
                  <span>{t('about.whatWeAreNot.point2', 'Un coach de vie ou un service de développement personnel')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 mt-0.5">✗</span>
                  <span>{t('about.whatWeAreNot.point3', 'Une promesse de réussite ou de résultats garantis')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 mt-0.5">✗</span>
                  <span>{t('about.whatWeAreNot.point4', 'Un outil qui te dit quoi faire — tu restes responsable de tes décisions')}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Two modes */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">
            {t('about.modes.title', 'Deux façons d\'utiliser l\'outil')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <Card className="border-2 border-primary/30 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="p-3 rounded-full bg-primary/10 w-fit">
                  <Key className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>{t('about.modes.simulation.title', 'Simulation personnelle')}</CardTitle>
                <CardDescription>
                  {t('about.modes.simulation.description', 'Analyse TA situation réelle, teste TES options, comprends les conséquences de TES choix potentiels.')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full gap-2">
                  <Link to="/exit-keys">
                    {t('nav.exitKeys', 'Stratégies')}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-500/30 hover:border-purple-500/50 transition-colors">
              <CardHeader>
                <div className="p-3 rounded-full bg-purple-500/10 w-fit">
                  <Gamepad2 className="w-6 h-6 text-purple-500" />
                </div>
                <CardTitle>{t('about.modes.game.title', 'Mode éducatif (jeu)')}</CardTitle>
                <CardDescription>
                  {t('about.modes.game.description', 'Incarne un personnage FICTIF au hasard. Découvre les mécanismes du monde sans risque. C\'est un jeu pédagogique.')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full gap-2">
                  <Link to="/life-game">
                    {t('nav.lifeGame', 'Mode Éducatif')}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Situations */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">
            {t('orientationHub.quickTitle', 'Accès rapide selon votre besoin')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
                <Card key={tool.id} className="group hover:border-primary/50 transition-all hover:shadow-lg">
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
                    <CardTitle className="text-lg">{t(tool.title, tool.title)}</CardTitle>
                    <CardDescription>{t(tool.description, tool.description)}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                    <Button asChild className="w-full gap-2">
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

        {/* Origin story */}
        <Card className="mb-12 bg-amber-500/5 border-amber-500/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-amber-500/10">
                <BookOpen className="w-6 h-6 text-amber-500" />
              </div>
              <CardTitle>{t('about.origin.title', 'Pourquoi cet outil existe')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>{t('about.origin.paragraph1', 'Cet outil a été créé par quelqu\'un qui a perdu des années à faire des choix sans comprendre le système dans lequel il évoluait.')}</p>
            <p>{t('about.origin.paragraph2', 'Mauvais pays, mauvaise carrière, mauvais timing — pas par manque d\'intelligence, mais par manque de grille de lecture.')}</p>
            <p>{t('about.origin.paragraph3', 'Pyramid Compass est né de cette frustration : offrir à tous l\'analyse que seuls les privilégiés reçoivent de leur entourage.')}</p>
            <p className="font-medium text-foreground">
              {t('about.origin.conclusion', 'Ce n\'est pas un outil qui te dit quoi faire. C\'est un outil qui t\'aide à VOIR — pour que TU décides en connaissance de cause.')}
            </p>
          </CardContent>
        </Card>

        {/* Alternatives to Destructive Choices */}
        <Card className="mb-12 border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/10">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <CardTitle>{t('orientationHub.alternatives.title', 'Alternatives aux choix destructeurs')}</CardTitle>
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
                { key: 'stay', icon: '🏠' },
                { key: 'later', icon: '⏰' },
                { key: 'differently', icon: '🔄' },
                { key: 'train', icon: '📚' },
                { key: 'changeGoal', icon: '🎯' },
                { key: 'diversify', icon: '💼' }
              ].map((alt) => (
                <div 
                  key={alt.key}
                  className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border/50"
                >
                  <span className="text-2xl">{alt.icon}</span>
                  <span className="text-sm font-medium">{t(`orientationHub.alternatives.list.${alt.key}`)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* For everyone */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">{t('about.forEveryone.title', 'Pour tout le monde')}</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            {t('about.forEveryone.subtitle', 'Quel que soit ton point de départ, tu mérites d\'avoir accès à l\'information.')}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="px-3 py-2 rounded-full bg-muted text-sm">🥖 Boulanger</span>
            <span className="px-3 py-2 rounded-full bg-muted text-sm">🏭 Ouvrier</span>
            <span className="px-3 py-2 rounded-full bg-muted text-sm">🎓 Étudiant</span>
            <span className="px-3 py-2 rounded-full bg-muted text-sm">🌴 Retraité</span>
            <span className="px-3 py-2 rounded-full bg-muted text-sm">🚀 Entrepreneur</span>
            <span className="px-3 py-2 rounded-full bg-muted text-sm">👨‍👩‍👧 Parent diaspora</span>
            <span className="px-3 py-2 rounded-full bg-muted text-sm">🌍 Migrant</span>
            <span className="px-3 py-2 rounded-full bg-muted text-sm">💼 Cadre</span>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <div className="p-3 rounded-lg bg-primary/10">
              <HelpCircle className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">{t('about.faq.title', 'Questions fréquentes')}</h2>
          </div>

          <Accordion type="single" collapsible className="space-y-3 max-w-4xl mx-auto">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <AccordionItem key={i} value={`item-${i}`} className="glass-card rounded-xl px-6 border-none">
                <AccordionTrigger className="text-left hover:no-underline">
                  {t(`about.faq.q${i}.question`)}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {t(`about.faq.q${i}.answer`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* How to read link */}
        <Card className="mb-12 bg-gradient-to-r from-primary/5 to-blue-500/5 border-primary/20">
          <CardContent className="pt-6 flex flex-col md:flex-row items-center gap-6">
            <div className="p-4 rounded-xl bg-primary/10">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-semibold mb-2">
                {t('howToRead.title', 'Comment lire les simulations')}
              </h3>
              <p className="text-muted-foreground">
                {t('howToRead.subtitle', 'Comprendre ce qu\'une simulation montre — et ce qu\'elle ne montre pas')}
              </p>
            </div>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/how-to-read">
                {t('common.learnMore', 'En savoir plus')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
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

        {/* Final Disclaimer */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="glass-card rounded-xl p-6 border-l-4 border-primary text-center">
            <p className="text-sm text-muted-foreground">
              {t('common.disclaimer', 'Pas de conseil juridique, financier ou médical. Tu restes responsable de tes décisions.')}
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
