import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SimulationDisclaimer } from '@/components/SimulationDisclaimer';
import { UNIVERSAL_ERRORS } from '@/lib/universal-errors-data';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function UniversalErrors() {
  const { t } = useTranslation();
  const { trackUniversalErrorsClicked } = useAnalytics();

  const handleErrorClick = (errorId: string) => {
    trackUniversalErrorsClicked();
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
      orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
      amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
      purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
      slate: { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400' },
      pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400' },
      green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
      blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
      gray: { bg: 'bg-gray-500/10', border: 'border-gray-500/30', text: 'text-gray-400' },
      cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.backToHome', 'Retour')}
          </Link>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {t('universalErrors.title', 'Bibliothèque des erreurs universelles')}
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-3xl">
            {t('universalErrors.subtitle', 'Les 10 erreurs de décision les plus coûteuses. Pas de morale, juste des faits et des outils pour les éviter.')}
          </p>
        </div>

        <SimulationDisclaimer />

        {/* Intro */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              {t('universalErrors.intro', 'Ces erreurs ne sont pas des fautes morales. Ce sont des patterns récurrents qui coûtent du temps, de l\'argent et de l\'énergie. Les reconnaître permet de les anticiper.')}
            </p>
          </CardContent>
        </Card>

        {/* Errors Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {UNIVERSAL_ERRORS.map((error, index) => {
            const Icon = error.icon;
            const colors = getColorClasses(error.color);
            
            return (
              <Card 
                key={error.id}
                className={`${colors.border} ${colors.bg} hover:border-primary/50 transition-all group`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${colors.bg} border ${colors.border}`}>
                        <Icon className={`w-5 h-5 ${colors.text}`} />
                      </div>
                      <div>
                        <Badge variant="outline" className="mb-2 text-xs">
                          #{index + 1}
                        </Badge>
                        <CardTitle className="text-lg">
                          {t(`universalErrors.errors.${error.translationKey}.name`)}
                        </CardTitle>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {t(`universalErrors.errors.${error.translationKey}.shortDescription`)}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {error.relatedPyramids.slice(0, 2).map(pyramid => (
                      <Badge key={pyramid} variant="secondary" className="text-xs">
                        {t(`pyramidTypes.${pyramid}`, pyramid)}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button asChild variant="outline" size="sm" className="flex-1" onClick={() => handleErrorClick(error.id)}>
                      <Link to={`/universal-errors/${error.id}`}>
                        {t('universalErrors.learnMore', 'En savoir plus')}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="flex-1 gap-2">
                      <Link 
                        to={`/prevention-filter?type=${error.defaultDecisionType}&horizon=${error.defaultHorizon}`}
                      >
                        <Filter className="w-4 h-4" />
                        {t('universalErrors.simulate', 'Simuler')}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <Card className="mt-12 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-semibold mb-3">
              {t('universalErrors.ctaTitle', 'Vous reconnaissez une de ces erreurs ?')}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              {t('universalErrors.ctaDescription', 'Passez votre décision au filtre de prévention pour identifier les risques avant qu\'il ne soit trop tard.')}
            </p>
            <Button asChild size="lg">
              <Link to="/prevention-filter" className="gap-2">
                <Filter className="w-5 h-5" />
                {t('preventionFilter.cta', 'Passer une décision au filtre')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
