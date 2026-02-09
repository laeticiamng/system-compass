import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Laptop,
  Users,
  Sun,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  MapPin,
  Globe,
  Wifi,
  DollarSign,
  Clock,
  Building2,
  Shield,
  Heart,
  GraduationCap,
  Stethoscope,
  Home,
  Scale,
  FileText,
  Landmark,
  Thermometer,
  Zap,
  Calculator,
  Eye,
  Target,
  Map,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface ThematicStep {
  number: number;
  title: string;
  description: string;
  link?: string;
}

interface RelatedTool {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface ThematicPath {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  gradientFrom: string;
  description: string;
  countries: string[];
  considerations: { label: string; icon: React.ElementType }[];
  steps: ThematicStep[];
  tools: RelatedTool[];
}

const THEMATIC_PATHS: ThematicPath[] = [
  {
    id: 'digital-nomad',
    title: 'Digital Nomad',
    subtitle: 'Travaillez de partout, vivez autrement',
    icon: Laptop,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    gradientFrom: 'from-cyan-500/20 to-blue-500/20',
    description:
      'Le parcours Digital Nomad est concu pour les travailleurs independants, freelances et entrepreneurs du numerique qui souhaitent conjuguer liberte geographique et optimisation de leur cadre de vie. Ce parcours vous guide a travers les etapes cles pour reussir votre transition vers un mode de vie nomade ou semi-nomade.',
    countries: [
      'Portugal',
      'Thailande',
      'Bali (Indonesie)',
      'Colombie',
      'Mexique',
      'Georgie',
      'Estonie',
      'Malaisie',
    ],
    considerations: [
      { label: 'Exigences de visa', icon: FileText },
      { label: 'Qualite de la connexion internet', icon: Wifi },
      { label: 'Cout de la vie', icon: DollarSign },
      { label: 'Fuseau horaire', icon: Clock },
      { label: 'Espaces de coworking', icon: Building2 },
    ],
    steps: [
      {
        number: 1,
        title: 'Profil fiscal',
        description:
          'Evaluez votre situation fiscale actuelle et identifiez les regimes les plus avantageux pour votre activite a distance.',
        link: '/fiscal-calculator',
      },
      {
        number: 2,
        title: 'Test de compatibilite',
        description:
          'Determinez quels pays correspondent le mieux a votre profil professionnel et personnel grace a notre algorithme de matching.',
        link: '/profile-matcher',
      },
      {
        number: 3,
        title: 'Visa adapte',
        description:
          'Identifiez le visa digital nomad ou le titre de sejour le plus adapte a votre situation et a la duree de votre projet.',
      },
      {
        number: 4,
        title: 'Infrastructure digitale',
        description:
          'Verifiez la qualite de la connexion internet, la disponibilite des espaces de coworking et les outils numeriques locaux.',
      },
      {
        number: 5,
        title: 'Communaute locale',
        description:
          'Rejoignez les communautes d\'expatries et de nomades digitaux sur place pour faciliter votre integration et votre reseau professionnel.',
      },
    ],
    tools: [
      { label: 'Quick Test', href: '/quick-test', icon: Zap },
      { label: 'Country Matcher', href: '/profile-matcher', icon: Target },
      { label: 'Exit Keys', href: '/exit-keys', icon: MapPin },
    ],
  },
  {
    id: 'family',
    title: 'Famille',
    subtitle: 'Offrez le meilleur cadre a vos proches',
    icon: Users,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    gradientFrom: 'from-rose-500/20 to-pink-500/20',
    description:
      'Le parcours Famille s\'adresse aux couples et parents qui envisagent une expatriation avec enfants. Ce parcours met l\'accent sur la securite, la qualite du systeme educatif, l\'acces aux soins de sante et l\'equilibre entre vie professionnelle et vie familiale dans le pays d\'accueil.',
    countries: [
      'Singapour',
      'Suisse',
      'Canada',
      'Allemagne',
      'Pays-Bas',
      'Portugal',
      'Espagne',
      'Nouvelle-Zelande',
    ],
    considerations: [
      { label: 'Systemes scolaires', icon: GraduationCap },
      { label: 'Couverture sante', icon: Stethoscope },
      { label: 'Securite', icon: Shield },
      { label: 'Culture family-friendly', icon: Heart },
      { label: 'Cout de l\'education', icon: DollarSign },
    ],
    steps: [
      {
        number: 1,
        title: 'Evaluation securite',
        description:
          'Analysez les indicateurs de securite, de stabilite politique et de qualite de vie dans les pays envisages pour votre famille.',
      },
      {
        number: 2,
        title: 'Systeme educatif',
        description:
          'Comparez les systemes scolaires, les ecoles internationales, les programmes bilingues et les frais de scolarite selon vos besoins.',
      },
      {
        number: 3,
        title: 'Couverture sante',
        description:
          'Verifiez la qualite du systeme de sante, les accords de securite sociale et les options d\'assurance maladie pour toute la famille.',
      },
      {
        number: 4,
        title: 'Qualite de vie',
        description:
          'Evaluez le cadre de vie quotidien : logement, transports, activites pour enfants, espaces verts et equilibre travail-vie personnelle.',
      },
      {
        number: 5,
        title: 'Integration sociale',
        description:
          'Preparez l\'integration de toute la famille : langue locale, communautes d\'expatries, activites culturelles et sportives.',
      },
    ],
    tools: [
      { label: 'Country Compare', href: '/compare', icon: Scale },
      { label: 'Life Trajectory', href: '/life-trajectory', icon: Map },
      { label: 'Prevention Filter', href: '/prevention-filter', icon: Shield },
    ],
  },
  {
    id: 'retirement',
    title: 'Retraite',
    subtitle: 'Vivez votre retraite au meilleur endroit',
    icon: Sun,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    gradientFrom: 'from-amber-500/20 to-orange-500/20',
    description:
      'Le parcours Retraite est destine a ceux qui souhaitent profiter de leur retraite a l\'etranger en optimisant leur pouvoir d\'achat, leur confort de vie et leur fiscalite. Ce parcours couvre les aspects financiers, administratifs et pratiques pour une expatriation reussie a la retraite.',
    countries: [
      'Portugal',
      'Espagne',
      'Thailande',
      'Costa Rica',
      'Malaisie',
      'Maroc',
      'Grece',
      'Italie',
    ],
    considerations: [
      { label: 'Qualite des soins de sante', icon: Stethoscope },
      { label: 'Cout de la vie', icon: DollarSign },
      { label: 'Conventions fiscales', icon: Landmark },
      { label: 'Exigences de residence', icon: Home },
      { label: 'Climat', icon: Thermometer },
    ],
    steps: [
      {
        number: 1,
        title: 'Budget retraite',
        description:
          'Estimez votre budget mensuel en tenant compte des pensions, des revenus complementaires et du cout de la vie dans le pays cible.',
      },
      {
        number: 2,
        title: 'Regime fiscal',
        description:
          'Analysez les conventions fiscales bilaterales, les regimes speciaux pour retraites et l\'imposition de vos pensions a l\'etranger.',
        link: '/fiscal-calculator',
      },
      {
        number: 3,
        title: 'Couverture sante',
        description:
          'Evaluez les options de sante : accords de securite sociale, assurance maladie locale, hopitaux de qualite et cout des soins.',
      },
      {
        number: 4,
        title: 'Titre de sejour',
        description:
          'Identifiez le visa ou le titre de sejour adapte aux retraites : visa retraite, visa non lucratif, permis de residence longue duree.',
      },
      {
        number: 5,
        title: 'Patrimoine et succession',
        description:
          'Planifiez la gestion de votre patrimoine et anticipez les questions de succession dans un contexte international.',
      },
    ],
    tools: [
      { label: 'Fiscal Calculator', href: '/fiscal-calculator', icon: Calculator },
      { label: 'Exit Keys', href: '/exit-keys', icon: MapPin },
      { label: 'Terrain', href: '/terrain', icon: Eye },
    ],
  },
];

function PathCard({
  path,
  isExpanded,
  onToggle,
}: {
  path: ThematicPath;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const Icon = path.icon;

  return (
    <Card
      className={cn(
        'glass-card-elevated overflow-hidden transition-all duration-500',
        isExpanded && 'ring-2 ring-primary/30',
        path.borderColor
      )}
    >
      {/* Card Header - Always visible */}
      <CardHeader
        className={cn('cursor-pointer bg-gradient-to-r', path.gradientFrom)}
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center',
                path.bgColor
              )}
            >
              <Icon className={cn('w-7 h-7', path.color)} />
            </div>
            <div>
              <CardTitle className="text-xl flex items-center gap-3">
                {t(`thematicPaths.${path.id}.title`, path.title)}
                <Badge variant="secondary" className="text-xs font-normal">
                  {path.countries.length} {t('thematicPaths.countriesLabel', 'pays')}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {t(`thematicPaths.${path.id}.subtitle`, path.subtitle)}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </Button>
        </div>
      </CardHeader>

      {/* Expandable Content */}
      {isExpanded && (
        <CardContent className="p-0 animate-fade-in">
          {/* Description */}
          <div className="p-6 border-b border-border/50">
            <p className="text-muted-foreground leading-relaxed">
              {t(`thematicPaths.${path.id}.description`, path.description)}
            </p>
          </div>

          <Tabs defaultValue="countries" className="w-full">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="countries" className="gap-1.5 text-xs sm:text-sm">
                  <Globe className="w-3.5 h-3.5 hidden sm:block" />
                  {t('thematicPaths.tabs.countries', 'Pays')}
                </TabsTrigger>
                <TabsTrigger value="considerations" className="gap-1.5 text-xs sm:text-sm">
                  <Eye className="w-3.5 h-3.5 hidden sm:block" />
                  {t('thematicPaths.tabs.considerations', 'Criteres')}
                </TabsTrigger>
                <TabsTrigger value="steps" className="gap-1.5 text-xs sm:text-sm">
                  <CheckCircle className="w-3.5 h-3.5 hidden sm:block" />
                  {t('thematicPaths.tabs.steps', 'Etapes')}
                </TabsTrigger>
                <TabsTrigger value="tools" className="gap-1.5 text-xs sm:text-sm">
                  <Zap className="w-3.5 h-3.5 hidden sm:block" />
                  {t('thematicPaths.tabs.tools', 'Outils')}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Countries Tab */}
            <TabsContent value="countries" className="px-6 pb-6">
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  {t('thematicPaths.recommendedCountries', 'Pays recommandes')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {path.countries.map((country) => (
                    <Badge
                      key={country}
                      variant="outline"
                      className={cn(
                        'px-3 py-1.5 text-sm font-medium transition-colors hover:bg-primary/10 hover:border-primary/40',
                        path.borderColor
                      )}
                    >
                      {country}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Considerations Tab */}
            <TabsContent value="considerations" className="px-6 pb-6">
              <div className="mt-4 grid gap-3">
                {path.considerations.map((consideration) => {
                  const ConsiderationIcon = consideration.icon;
                  return (
                    <div
                      key={consideration.label}
                      className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className={cn('p-2 rounded-lg', path.bgColor)}>
                        <ConsiderationIcon className={cn('w-4 h-4', path.color)} />
                      </div>
                      <span className="text-sm font-medium">{consideration.label}</span>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Steps Tab */}
            <TabsContent value="steps" className="px-6 pb-6">
              <div className="mt-4 space-y-4">
                {path.steps.map((step, index) => (
                  <div key={step.number} className="relative flex gap-4">
                    {/* Vertical line connector */}
                    {index < path.steps.length - 1 && (
                      <div className="absolute left-5 top-10 bottom-0 w-px bg-border/50" />
                    )}

                    {/* Step number circle */}
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm border-2',
                        path.borderColor,
                        path.bgColor
                      )}
                    >
                      {step.number}
                    </div>

                    {/* Step content */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold">{step.title}</h5>
                        {step.link && (
                          <Link to={step.link}>
                            <Badge
                              variant="secondary"
                              className="text-xs cursor-pointer hover:bg-primary/20 transition-colors"
                            >
                              <ArrowRight className="w-3 h-3 mr-1" />
                              {t('thematicPaths.goToTool', 'Outil')}
                            </Badge>
                          </Link>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Tools Tab */}
            <TabsContent value="tools" className="px-6 pb-6">
              <div className="mt-4 grid gap-3">
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                  {t('thematicPaths.relatedTools', 'Outils associes a ce parcours')}
                </h4>
                {path.tools.map((tool) => {
                  const ToolIcon = tool.icon;
                  return (
                    <Link key={tool.href} to={tool.href}>
                      <div
                        className={cn(
                          'flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn('p-2.5 rounded-lg', path.bgColor)}>
                            <ToolIcon className={cn('w-5 h-5', path.color)} />
                          </div>
                          <span className="font-medium">{tool.label}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
}

export default function ThematicPaths() {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>('digital-nomad');

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <>
      <Helmet>
        <title>
          {t(
            'thematicPaths.meta.title',
            'Parcours Thematiques - System Compass | Digital Nomad, Famille, Retraite'
          )}
        </title>
        <meta
          name="description"
          content={t(
            'thematicPaths.meta.description',
            'Decouvrez nos parcours thematiques d\'expatriation : Digital Nomad, Famille et Retraite. Pays recommandes, etapes cles et outils pour chaque profil.'
          )}
        />
        <meta
          property="og:title"
          content={t(
            'thematicPaths.meta.ogTitle',
            'Parcours Thematiques - System Compass'
          )}
        />
        <meta
          property="og:description"
          content={t(
            'thematicPaths.meta.ogDescription',
            'Trois parcours d\'expatriation adaptes a votre situation : Digital Nomad, Famille et Retraite.'
          )}
        />
      </Helmet>

      <main className="min-h-screen bg-background pt-24 pb-16 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 max-w-5xl">
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {t('common.back', 'Retour')}
          </Link>

          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-2xl glass-card-elevated border-primary/20 p-8 mb-10 glow-card">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex flex-col md:flex-row items-start gap-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg glow-gold">
                <Globe className="w-10 h-10 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h1 className="font-display text-3xl md:text-5xl font-bold mb-3 gold-text">
                  {t('thematicPaths.title', 'Parcours Thematiques')}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  {t(
                    'thematicPaths.subtitle',
                    'Trois parcours d\'expatriation structures pour vous accompagner selon votre profil : nomade digital, famille ou retraite. Chaque parcours regroupe les pays, criteres et etapes essentiels.'
                  )}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {THEMATIC_PATHS.map((path) => {
                    const PathIcon = path.icon;
                    return (
                      <button
                        key={path.id}
                        onClick={() => {
                          setExpandedId(path.id);
                          document
                            .getElementById(`path-${path.id}`)
                            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className={cn(
                          'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-all hover:scale-105',
                          path.bgColor,
                          path.borderColor,
                          path.color
                        )}
                      >
                        <PathIcon className="w-4 h-4" />
                        {path.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Thematic Path Cards */}
          <div className="space-y-6">
            {THEMATIC_PATHS.map((path) => (
              <div key={path.id} id={`path-${path.id}`} className="scroll-mt-24">
                <PathCard
                  path={path}
                  isExpanded={expandedId === path.id}
                  onToggle={() => handleToggle(path.id)}
                />
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center glass-card rounded-2xl p-8 border border-border/50">
            <h2 className="text-xl font-bold mb-3">
              {t('thematicPaths.cta.title', 'Vous ne savez pas quel parcours choisir ?')}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              {t(
                'thematicPaths.cta.description',
                'Commencez par notre test rapide pour identifier le parcours le plus adapte a votre situation personnelle et professionnelle.'
              )}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/quick-test">
                <Button className="gap-2">
                  <Zap className="w-4 h-4" />
                  {t('thematicPaths.cta.quickTest', 'Test Rapide (2 min)')}
                </Button>
              </Link>
              <Link to="/profile-matcher">
                <Button variant="outline" className="gap-2">
                  <Target className="w-4 h-4" />
                  {t('thematicPaths.cta.profileMatcher', 'Matcher de Pays')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
