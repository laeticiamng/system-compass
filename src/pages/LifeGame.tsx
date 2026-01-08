import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { SimulationDisclaimer } from '@/components/SimulationDisclaimer';
import { Button } from '@/components/ui/button';
import { 
  Gamepad2, 
  Users, 
  Globe, 
  Zap,
  ArrowRight,
  Play,
  Shield,
  Target,
  Skull,
  Heart,
  Coins,
  GraduationCap,
  Plane,
  Clock,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CHARACTER_ARCHETYPES, getDifficultyColor } from '@/lib/character-archetypes';

export default function LifeGame() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Globe,
      title: t('lifeGame.features.systems.title'),
      description: t('lifeGame.features.systems.description'),
      color: 'text-blue-400',
    },
    {
      icon: Users,
      title: t('lifeGame.features.characters.title'),
      description: t('lifeGame.features.characters.description'),
      color: 'text-purple-400',
    },
    {
      icon: Zap,
      title: t('lifeGame.features.choices.title'),
      description: t('lifeGame.features.choices.description'),
      color: 'text-amber-400',
    },
    {
      icon: Skull,
      title: t('lifeGame.features.risks.title'),
      description: t('lifeGame.features.risks.description'),
      color: 'text-rose-400',
    },
  ];

  const resources = [
    { icon: Clock, label: t('resources.time'), color: 'text-cyan-400' },
    { icon: Coins, label: t('resources.money'), color: 'text-amber-400' },
    { icon: Heart, label: t('resources.health'), color: 'text-rose-400' },
    { icon: Users, label: t('resources.network'), color: 'text-purple-400' },
    { icon: GraduationCap, label: t('resources.skills'), color: 'text-emerald-400' },
    { icon: Plane, label: t('resources.mobility'), color: 'text-blue-400' },
  ];

  // Show 4 archetypes as preview
  const previewArchetypes = CHARACTER_ARCHETYPES.slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary/20 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-8 animate-fade-in">
            <Gamepad2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">{t('lifeGame.hero.badge')}</span>
          </div>

          {/* Main Title */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 animate-fade-in">
            <span className="text-foreground">{t('lifeGame.hero.title1')}</span>
            <br />
            <span className="bg-gradient-to-r from-primary via-purple-500 to-rose-500 bg-clip-text text-transparent">
              {t('lifeGame.hero.titleHighlight')}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {t('lifeGame.hero.subtitle')}
          </p>

          {/* Clarification Box */}
          <div className="glass-card rounded-xl p-4 md:p-6 max-w-2xl mx-auto mb-8 border-amber-500/30 bg-amber-500/5 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h3 className="font-semibold text-amber-400 mb-3 text-lg">
              {t('lifeGame.clarification.title')}
            </h3>
            <ul className="text-sm text-muted-foreground space-y-2 text-left">
              <li className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                {t('lifeGame.clarification.point1')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                {t('lifeGame.clarification.point2')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                {t('lifeGame.clarification.point3')}
              </li>
            </ul>
            <div className="mt-4 pt-3 border-t border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Link to="/exit-keys" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                {t('lifeGame.clarification.realLife')}
                <span className="font-medium">{t('lifeGame.clarification.realLifeLink')}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <SimulationDisclaimer variant="inline" />
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Link to="/pyramid-quiz">
              <Button size="lg" className="gap-2 text-lg px-8 py-6 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90">
                <Play className="w-5 h-5" />
                {t('lifeGame.hero.playCta')}
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6" asChild>
              <a href="#features">
                {t('lifeGame.hero.learnCta')}
                <ChevronDown className="w-5 h-5" />
              </a>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">12+</div>
              <div className="text-sm text-muted-foreground">{t('lifeGame.hero.stats.archetypes')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">6</div>
              <div className="text-sm text-muted-foreground">{t('lifeGame.hero.stats.systems')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">∞</div>
              <div className="text-sm text-muted-foreground">{t('lifeGame.hero.stats.possibilities')}</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-muted-foreground" />
        </div>
      </section>

      {/* Tagline Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 text-center">
          <blockquote className="text-2xl md:text-4xl font-display italic text-muted-foreground max-w-4xl mx-auto">
            "{t('lifeGame.tagline.quote')}"
          </blockquote>
          <p className="mt-6 text-primary font-medium">{t('lifeGame.tagline.author')}</p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">{t('lifeGame.features.title')}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t('lifeGame.features.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div 
                key={i}
                className="glass-card rounded-2xl p-6 hover:scale-105 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={cn("p-3 rounded-xl bg-muted/50 w-fit mb-4", feature.color)}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">{t('lifeGame.resources.title')}</h2>
            <p className="text-xl text-muted-foreground">{t('lifeGame.resources.subtitle')}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {resources.map((resource, i) => (
              <div 
                key={i}
                className="glass-card rounded-xl p-4 text-center hover:scale-105 transition-all"
              >
                <div className={cn("flex justify-center mb-2", resource.color)}>
                  <resource.icon className="w-8 h-8" />
                </div>
                <span className="text-sm font-medium">{resource.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Archetypes Preview */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">{t('lifeGame.archetypes.title')}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t('lifeGame.archetypes.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {previewArchetypes.map((archetype, i) => (
              <div 
                key={archetype.archetypeId}
                className="glass-card rounded-2xl p-6 hover:scale-105 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl">{archetype.archetypeIcon}</span>
                  <span className={cn("px-2 py-1 rounded text-xs font-medium border", getDifficultyColor(archetype.difficulty))}>
                    {t(`lifeGame.difficulty.${archetype.difficulty}`)}
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-1">{t(archetype.archetypeLabel)}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t(archetype.archetypeDescription)}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Globe className="w-3 h-3" />
                  <span>{archetype.birthCountry}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/pyramid-quiz">
              <Button variant="outline" className="gap-2">
                {t('lifeGame.archetypes.seeAll')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Warning Section */}
      <section className="py-24 bg-gradient-to-b from-rose-500/5 to-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="glass-card rounded-2xl p-8 md:p-12 border-rose-500/30 bg-rose-500/5">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-rose-500/20">
                <Shield className="w-8 h-8 text-rose-400" />
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-rose-400">
                {t('lifeGame.warning.title')}
              </h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              {t('lifeGame.warning.description')}
            </p>
            <div className="flex flex-wrap gap-3">
              {['migration', 'corruption', 'inequality', 'shortcuts'].map((topic) => (
                <span 
                  key={topic}
                  className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-sm border border-rose-500/30"
                >
                  {t(`lifeGame.warning.topics.${topic}`)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            {t('lifeGame.cta.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            {t('lifeGame.cta.subtitle')}
          </p>
          <Link to="/pyramid-quiz">
            <Button size="lg" className="gap-2 text-lg px-12 py-6 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90">
              <Gamepad2 className="w-6 h-6" />
              {t('lifeGame.cta.button')}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
