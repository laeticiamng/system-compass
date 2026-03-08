import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG } from '@/config/site';
import { LocalizedLink as Link } from '@/components/i18n';
import { useTranslation } from 'react-i18next';
import { 
  Building2, 
  Eye, 
  ArrowRight, 
  Lightbulb,
  Scale,
  Users,
  Brain,
  Grid3X3,
  Shield,
  Sparkles,
  History
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TraceOS } from '@/components/institutions/TraceOS';

export default function B2BSolutions() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>Solutions B2B - System Compass</title>
        <meta name="description" content="Solutions d'intelligence pays pour entreprises et institutions. Analyse systémique, due diligence géopolitique et accompagnement stratégique." />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Solutions B2B - System Compass" />
        <meta property="og:description" content="Intelligence pays pour entreprises : analyse systémique et due diligence géopolitique." />
        <meta property="og:image" content={SITE_CONFIG.ogImageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Solutions B2B - System Compass" />
        <meta name="twitter:description" content="Intelligence pays pour entreprises : analyse systémique et due diligence géopolitique." />
        <meta name="twitter:image" content={SITE_CONFIG.ogImageUrl} />
      </Helmet>
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pt-20 md:pt-24">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 px-4 py-1.5 bg-gradient-to-r from-primary/20 to-amber-500/20 border-primary/30">
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              {t('b2b.badge')}
            </Badge>

            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              {t('b2b.title')}
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('b2b.subtitle')}
            </p>

            <p className="text-muted-foreground max-w-3xl mx-auto">
              {t('b2b.intro')}
            </p>
          </div>
        </div>
      </section>

      {/* Tabs for B2B Modules */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="modules" className="space-y-8">
              <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3">
                <TabsTrigger value="modules" className="gap-2">
                  <Building2 className="w-4 h-4" />
                  {t('b2b.tabs.modules')}
                </TabsTrigger>
                <TabsTrigger value="latent" className="gap-2">
                  <Lightbulb className="w-4 h-4" />
                  LATENT
                </TabsTrigger>
                <TabsTrigger value="traceos" className="gap-2">
                  <Brain className="w-4 h-4" />
                  TraceOS
                </TabsTrigger>
              </TabsList>

              <TabsContent value="modules">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Institutions Module */}
                  <Card className="border-2 hover:border-primary/30 transition-all group">
                    <CardHeader>
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        <Building2 className="w-7 h-7 text-primary" />
                      </div>
                      <CardTitle className="text-2xl">
                        {t('b2b.modules.institutions.title')}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {t('b2b.modules.institutions.desc')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-3">
                        <FeatureItem icon={Users} text={t('b2b.modules.institutions.features.0')} />
                        <FeatureItem icon={Scale} text={t('b2b.modules.institutions.features.1')} />
                        <FeatureItem icon={Shield} text={t('b2b.modules.institutions.features.2')} />
                      </ul>
                      <Separator />
                      <Link to="/institutions">
                        <Button className="w-full gap-2 group-hover:bg-primary transition-colors">
                          {t('b2b.cta.institutions')}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  {/* OVI Module */}
                  <Card className="border-2 hover:border-amber-500/30 transition-all group">
                    <CardHeader>
                      <div className="w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
                        <Eye className="w-7 h-7 text-amber-600" />
                      </div>
                      <Badge variant="outline" className="w-fit mb-2 border-amber-500/30 text-amber-600">
                        Premium
                      </Badge>
                      <CardTitle className="text-2xl">
                        {t('b2b.modules.ovi.title')}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {t('b2b.modules.ovi.desc')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-3">
                        <FeatureItem icon={Brain} text={t('b2b.modules.ovi.features.0')} />
                        <FeatureItem icon={Lightbulb} text={t('b2b.modules.ovi.features.1')} />
                        <FeatureItem icon={Grid3X3} text={t('b2b.modules.ovi.features.2')} />
                      </ul>
                      <Separator />
                      <Link to="/ovi">
                        <Button variant="outline" className="w-full gap-2 border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-600">
                          {t('b2b.cta.ovi')}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="latent">
                <Card className="border-2 hover:border-purple-500/30 transition-all">
                  <CardHeader className="text-center">
                    <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                      <Lightbulb className="w-7 h-7 text-purple-600" />
                    </div>
                    <Badge variant="outline" className="w-fit mx-auto mb-2 border-purple-500/30 text-purple-600">
                      {t('b2b.modules.latent.badge')}
                    </Badge>
                    <CardTitle className="text-2xl">LATENT</CardTitle>
                    <CardDescription className="text-base max-w-xl mx-auto">
                      {t('b2b.modules.latent.desc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 max-w-md mx-auto">
                    <ul className="space-y-3">
                      <FeatureItem icon={Lightbulb} text={t('b2b.modules.latent.features.0')} />
                      <FeatureItem icon={Shield} text={t('b2b.modules.latent.features.1')} />
                      <FeatureItem icon={History} text={t('b2b.modules.latent.features.2')} />
                    </ul>
                    <Separator />
                    <Link to="/latent">
                      <Button className="w-full gap-2">
                        {t('b2b.cta.latent')}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="traceos">
                <TraceOS />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Principles Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-12">
              {t('b2b.principles.title')}
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <PrincipleCard 
                icon={<Lightbulb className="w-6 h-6" />}
                title={t('b2b.principles.p1.title')}
                description={t('b2b.principles.p1.desc')}
              />
              <PrincipleCard 
                icon={<Scale className="w-6 h-6" />}
                title={t('b2b.principles.p2.title')}
                description={t('b2b.principles.p2.desc')}
              />
              <PrincipleCard 
                icon={<Shield className="w-6 h-6" />}
                title={t('b2b.principles.p3.title')}
                description={t('b2b.principles.p3.desc')}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-amber-500/5 border-t">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-2xl font-bold mb-4">
            {t('b2b.cta.ready')}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            {t('b2b.cta.desc')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/institutions">
              <Button size="lg" className="gap-2">
                <Building2 className="w-4 h-4" />
                {t('b2b.cta.institutions')}
              </Button>
            </Link>
            <Link to="/ovi">
              <Button size="lg" variant="outline" className="gap-2">
                <Eye className="w-4 h-4" />
                {t('b2b.cta.ovi')}
              </Button>
            </Link>
            <Link to="/partners">
              <Button size="lg" variant="outline" className="gap-2 border-amber-500/30 hover:bg-amber-500/10">
                <Users className="w-4 h-4" />
                {t('b2b.cta.partners')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}

function FeatureItem({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <li className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <span>{text}</span>
    </li>
  );
}


const PrincipleCard = React.forwardRef<HTMLDivElement, { icon: React.ReactNode; title: string; description: string }>(
  ({ icon, title, description }, ref) => {
    return (
      <div ref={ref} className="text-center p-6">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
          {icon}
        </div>
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    );
  }
);
PrincipleCard.displayName = 'PrincipleCard';
