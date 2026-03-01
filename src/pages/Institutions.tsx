import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  Scale,
  AlertTriangle,
  FileText,
  Eye,
  Shield,
  ArrowRight,
  Briefcase,
  TrendingUp,
  GitBranch,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Lightbulb,
  UserCheck,
  History,
  Info,
  Calculator,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { InstitutionalUseCases } from '@/components/institutions/InstitutionalUseCases';
import { CollectiveDecisionMode } from '@/components/institutions/CollectiveDecisionMode';
import { DecisionTraceability } from '@/components/institutions/DecisionTraceability';
import { QuickAccessButtons } from '@/components/institutions/QuickAccessButtons';
import { WhatIfSimulatorAdvanced } from '@/components/traceos/WhatIfSimulatorAdvanced';
import { DecisionAnalyticsDashboard } from '@/components/traceos/DecisionAnalyticsDashboard';

export default function Institutions() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('introduction');

  return (
    <>
      <Helmet>
        <title>Entreprises & Institutions - System Compass</title>
        <meta name="description" content="Solutions System Compass pour entreprises et institutions : analyse de gouvernance, due diligence pays et intelligence systémique pour décisions stratégiques." />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Entreprises & Institutions - System Compass" />
        <meta property="og:description" content="Intelligence systémique pour entreprises : gouvernance, due diligence et stratégie." />
        <meta property="og:image" content="https://system-compass.app/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Entreprises & Institutions - System Compass" />
        <meta name="twitter:description" content="Intelligence systémique pour entreprises : gouvernance, due diligence et stratégie." />
        <meta name="twitter:image" content="https://system-compass.app/og-image.png" />
      </Helmet>
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pt-16 sm:pt-20 md:pt-24">
      {/* Hero Section */}
      <section className="py-8 sm:py-12 md:py-20">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-3 sm:mb-4 px-3 sm:px-4 py-1 sm:py-1.5 border-primary/30 text-primary text-xs sm:text-sm">
              <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 sm:mr-2" />
              {t('institutions.badge', 'Entreprises & Institutions')}
            </Badge>
            
            <h1 className="font-display text-2xl sm:text-3xl md:text-5xl font-bold mb-4 sm:mb-6">
              {t('institutions.title', 'Aide à la décision institutionnelle')}
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
              {t('institutions.subtitle', 'Un outil d\'analyse pour clarifier les arbitrages, identifier les angles morts et prévenir les erreurs coûteuses — sans prescription ni prédiction.')}
            </p>

            {/* Core Positioning */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-10">
              <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium">
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                {t('institutions.illuminate', 'Éclairer')}
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-amber-500/10 text-amber-600 text-xs sm:text-sm font-medium">
                <Scale className="w-3 h-3 sm:w-4 sm:h-4" />
                {t('institutions.structure', 'Structurer')}
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-emerald-500/10 text-emerald-600 text-xs sm:text-sm font-medium">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                {t('institutions.prevent', 'Prévenir')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="pb-8">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-6xl mx-auto">
            <QuickAccessButtons />
          </div>
        </div>
      </section>

      {/* Main Content Tabs */}
      <section className="pb-16 sm:pb-20">
        <div className="container mx-auto px-3 sm:px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-4 sm:grid-cols-7 gap-1 h-auto p-1 mb-6 sm:mb-8">
              <TabsTrigger value="introduction" className="flex items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
                <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t('institutions.tabs.intro', 'Introduction')}</span>
                <span className="sm:hidden">Intro</span>
              </TabsTrigger>
              <TabsTrigger value="use-cases" className="flex items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
                <Briefcase className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t('institutions.tabs.useCases', 'Cas d\'usage')}</span>
                <span className="sm:hidden">Cas</span>
              </TabsTrigger>
              <TabsTrigger value="collective" className="flex items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t('institutions.tabs.collective', 'Décision')}</span>
                <span className="sm:hidden">Groupe</span>
              </TabsTrigger>
              <TabsTrigger value="simulator" className="flex items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
                <Calculator className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t('institutions.tabs.simulator', 'Simulateur')}</span>
                <span className="sm:hidden">Simu</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="hidden sm:flex items-center gap-2 py-3 text-sm">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">{t('institutions.tabs.analytics', 'Analytics')}</span>
              </TabsTrigger>
              <TabsTrigger value="traceability" className="hidden sm:flex items-center gap-2 py-3 text-sm">
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">{t('institutions.tabs.traceability', 'Traçabilité')}</span>
              </TabsTrigger>
              <TabsTrigger value="disclaimer" className="hidden sm:flex items-center gap-2 py-3 text-sm">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">{t('institutions.tabs.disclaimer', 'Limites')}</span>
              </TabsTrigger>
            </TabsList>

            {/* Introduction Tab */}
            <TabsContent value="introduction" className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* What it is */}
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <CheckCircle2 className="w-5 h-5" />
                      {t('institutions.whatItIs.title', 'Ce que fait System Compass')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FeatureItem 
                      icon={Eye}
                      title={t('institutions.whatItIs.illuminate', 'Éclaire les options')}
                      description={t('institutions.whatItIs.illuminateDesc', 'Rend visibles les variables, zones d\'incertitude et coûts cachés')}
                    />
                    <FeatureItem 
                      icon={Scale}
                      title={t('institutions.whatItIs.structure', 'Structure les décisions')}
                      description={t('institutions.whatItIs.structureDesc', 'Aide à clarifier un arbitrage avant qu\'il ne devienne irréversible')}
                    />
                    <FeatureItem 
                      icon={AlertTriangle}
                      title={t('institutions.whatItIs.blindspots', 'Identifie les angles morts')}
                      description={t('institutions.whatItIs.blindspotsDesc', 'Met en évidence ce qui pourrait être négligé ou sous-estimé')}
                    />
                    <FeatureItem 
                      icon={GitBranch}
                      title={t('institutions.whatItIs.scenarios', 'Compare des scénarios')}
                      description={t('institutions.whatItIs.scenariosDesc', 'Permet de visualiser plusieurs trajectoires possibles sans en recommander une')}
                    />
                  </CardContent>
                </Card>

                {/* What it doesn't do */}
                <Card className="border-destructive/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <XCircle className="w-5 h-5" />
                      {t('institutions.whatItDoesNot.title', 'Ce que System Compass ne fait PAS')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <NotFeatureItem 
                      title={t('institutions.whatItDoesNot.noRecommendation', 'Ne recommande pas')}
                      description={t('institutions.whatItDoesNot.noRecommendationDesc', 'Aucune option n\'est présentée comme "la bonne décision"')}
                    />
                    <NotFeatureItem 
                      title={t('institutions.whatItDoesNot.noPrediction', 'Ne prédit pas')}
                      description={t('institutions.whatItDoesNot.noPredictionDesc', 'Simulation ≠ prédiction. Les résultats dépendent du contexte réel.')}
                    />
                    <NotFeatureItem 
                      title={t('institutions.whatItDoesNot.noResponsibility', 'Ne décharge pas')}
                      description={t('institutions.whatItDoesNot.noResponsibilityDesc', 'La responsabilité de la décision reste entièrement humaine.')}
                    />
                    <NotFeatureItem 
                      title={t('institutions.whatItDoesNot.noAdvice', 'Ne conseille pas')}
                      description={t('institutions.whatItDoesNot.noAdviceDesc', 'Pas de conseil juridique, financier, RH ou stratégique.')}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Core Principles */}
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <h3 className="font-display text-2xl font-bold mb-4">
                        {t('institutions.principles.title', 'Principes fondamentaux')}
                      </h3>
                      <div className="space-y-3">
                        <PrincipleItem 
                          text={t('institutions.principles.simulation', 'Simulation ≠ Prédiction')}
                        />
                        <PrincipleItem 
                          text={t('institutions.principles.responsibility', 'Responsabilité ≠ Délégation')}
                        />
                        <PrincipleItem 
                          text={t('institutions.principles.illumination', 'L\'outil éclaire, le décideur tranche')}
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary/10 border-2 border-primary/30">
                        <Lightbulb className="w-16 h-16 text-primary" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CTA */}
              <div className="text-center">
                <Button size="lg" onClick={() => setActiveTab('use-cases')} className="gap-2">
                  {t('institutions.cta.explore', 'Explorer les cas d\'usage')}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </TabsContent>

            {/* Use Cases Tab */}
            <TabsContent value="use-cases">
              <InstitutionalUseCases />
            </TabsContent>

            {/* Collective Decision Tab */}
            <TabsContent value="collective">
              <CollectiveDecisionMode />
            </TabsContent>

            {/* Simulator Tab - What-If Analysis */}
            <TabsContent value="simulator">
              <WhatIfSimulatorAdvanced />
            </TabsContent>

            {/* Analytics Tab - Decision Intelligence */}
            <TabsContent value="analytics">
              <DecisionAnalyticsDashboard />
            </TabsContent>

            {/* Traceability Tab */}
            <TabsContent value="traceability">
              <DecisionTraceability />
            </TabsContent>

            {/* Disclaimer Tab */}
            <TabsContent value="disclaimer" className="space-y-8">
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                    <Shield className="w-8 h-8 text-amber-600" />
                  </div>
                  <CardTitle className="text-2xl">
                    {t('institutions.disclaimer.title', 'Disclaimer institutionnel')}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {t('institutions.disclaimer.subtitle', 'Limites et responsabilités')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-w-3xl mx-auto space-y-6">
                  <DisclaimerBlock 
                    icon={<XCircle className="w-5 h-5" />}
                    title={t('institutions.disclaimer.noReplacement', 'Ne remplace pas une décision humaine')}
                    description={t('institutions.disclaimer.noReplacementDesc', 'System Compass est un outil d\'aide à la réflexion. Il ne prend pas et ne doit pas prendre de décision à la place des responsables.')}
                  />
                  <Separator />
                  <DisclaimerBlock 
                    icon={<TrendingUp className="w-5 h-5" />}
                    title={t('institutions.disclaimer.noPrediction', 'N\'est pas un outil de prédiction')}
                    description={t('institutions.disclaimer.noPredictionDesc', 'Les simulations explorent des scénarios possibles. Elles ne prédisent pas l\'avenir ni ne garantissent un résultat.')}
                  />
                  <Separator />
                  <DisclaimerBlock 
                    icon={<FileText className="w-5 h-5" />}
                    title={t('institutions.disclaimer.noAdvice', 'Ne fournit aucune recommandation')}
                    description={t('institutions.disclaimer.noAdviceDesc', 'Aucune option, aucun scénario n\'est présenté comme "la bonne décision". L\'outil n\'émet pas d\'avis.')}
                  />
                  <Separator />
                  <DisclaimerBlock 
                    icon={<UserCheck className="w-5 h-5" />}
                    title={t('institutions.disclaimer.responsibility', 'Le décideur reste responsable')}
                    description={t('institutions.disclaimer.responsibilityDesc', 'L\'utilisation de System Compass ne transfère aucune responsabilité. Chaque décision engage ceux qui la prennent.')}
                  />
                </CardContent>
              </Card>

              {/* Summary Box */}
              <div className="max-w-2xl mx-auto p-6 rounded-xl bg-muted/50 border text-center">
                <p className="text-lg font-medium mb-2">
                  {t('institutions.disclaimer.summary', 'L\'outil éclaire, le décideur reste responsable.')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('institutions.disclaimer.summaryDesc', 'System Compass est conçu pour accompagner la réflexion, pas pour se substituer au jugement humain.')}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 bg-muted/30 border-t">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-2xl font-bold mb-4">
            {t('institutions.finalCta.title', 'Prêt à structurer vos décisions ?')}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            {t('institutions.finalCta.description', 'Explorez les outils existants de System Compass, déjà adaptés à l\'analyse décisionnelle.')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/prevention-filter">
              <Button variant="default" size="lg" className="gap-2">
                <Shield className="w-4 h-4" />
                {t('institutions.finalCta.filter', 'Filtre de prévention')}
              </Button>
            </Link>
            <Link to="/compare">
              <Button variant="outline" size="lg" className="gap-2">
                <Scale className="w-4 h-4" />
                {t('institutions.finalCta.compare', 'Comparer des scénarios')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}

// Helper Components
function FeatureItem({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function NotFeatureItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
        <XCircle className="w-4 h-4 text-destructive" />
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function PrincipleItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
      <ChevronRight className="w-4 h-4 text-primary" />
      <span className="font-medium">{text}</span>
    </div>
  );
}

function DisclaimerBlock({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold mb-1">{title}</h4>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
