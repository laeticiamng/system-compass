import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { countries } from '@/lib/countries-data';
import { Button } from '@/components/ui/button';
import { CountryCard } from '@/components/CountryCard';
import { PyramidTypesShowcase } from '@/components/PyramidTypesShowcase';
import { ArrowRight, Compass, Shield, Target, Zap } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-pyramid-competence/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Compass className="w-4 h-4" />
              {t('hero.badge')}
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
              {t('hero.title1')}{' '}
              <span className="gold-text">{t('hero.titleHighlight')}</span>
              <br />
              {t('hero.title2')}
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-balance">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => navigate('/profile-test')}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8"
              >
                {t('hero.discoverProfile')}
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/countries')}
                className="border-border hover:bg-accent gap-2"
              >
                {t('hero.exploreCountries')}
              </Button>
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
              {t('cta.title')}
            </h2>
            <p className="text-muted-foreground mb-8">
              {t('cta.subtitle')}
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/profile-test')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            >
              {t('cta.button')}
              <ArrowRight className="w-4 h-4" />
            </Button>
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
