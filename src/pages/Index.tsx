import { useNavigate } from 'react-router-dom';
import { countries } from '@/lib/countries-data';
import { PYRAMID_TYPE_INFO } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { CountryCard } from '@/components/CountryCard';
import { ArrowRight, Compass, Shield, Target, Zap } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();

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
              Navigate the Real System
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Understand Your{' '}
              <span className="gold-text">Pyramid</span>
              <br />
              Find Your Path
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-balance">
              Every country has a hidden system. Learn what it really rewards, 
              where you fit, and how to survive intelligently — or escape strategically.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => navigate('/profile-test')}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8"
              >
                Discover Your Profile
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/countries')}
                className="border-border hover:bg-accent gap-2"
              >
                Explore Countries
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A pragmatic framework to understand systems, not to fight them
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard
              icon={<Target className="w-6 h-6" />}
              title="Understand the Pyramid"
              description="Every country rewards something different. Learn what the system actually values — problems, stability, competence, or growth."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Know Your Profile"
              description="Discover your values, risk tolerance, and ambitions. Find which systems align with who you are."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Get Your Playbook"
              description="Concrete strategies to survive where you are and build options toward where you want to be."
            />
          </div>
        </div>
      </section>

      {/* Pyramid Types */}
      <section className="py-24 border-t border-border/50 bg-gradient-to-b from-transparent via-card/50 to-transparent">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold mb-4">The Four Pyramids</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every system falls into one of these categories
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {Object.entries(PYRAMID_TYPE_INFO).map(([key, info]) => (
              <div
                key={key}
                className="glass-card rounded-xl p-6 text-center hover:border-primary/30 transition-colors"
              >
                <div
                  className="w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `hsl(var(--${info.color}) / 0.2)` }}
                >
                  <div
                    className="w-4 h-4 rounded-sm"
                    style={{ backgroundColor: `hsl(var(--${info.color}))` }}
                  />
                </div>
                <h3 className="font-display font-semibold mb-2">{info.label}</h3>
                <p className="text-sm text-muted-foreground">{info.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Countries */}
      <section className="py-24 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-display text-3xl font-bold mb-2">Explore Countries</h2>
              <p className="text-muted-foreground">
                Deep analysis of real systems, not fantasy rankings
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/countries')}
              className="hidden md:flex gap-2"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {countries.map((country) => (
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
              Ready to Navigate?
            </h2>
            <p className="text-muted-foreground mb-8">
              This site doesn't judge. It explains. It helps you survive intelligently 
              where you are and move toward a system that rewards what you are.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/profile-test')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            >
              Start Your Journey
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Pyramid Compass — Navigate the real system</p>
          <p className="mt-2 text-xs">
            Analytical tool only. Not legal or financial advice.
          </p>
        </div>
      </footer>
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
