import { useParams, Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Filter, Clock, Banknote, Zap, Link as LinkIcon, Lightbulb, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SimulationDisclaimer } from '@/components/SimulationDisclaimer';
import { getErrorById, UNIVERSAL_ERRORS } from '@/lib/universal-errors-data';

export default function UniversalErrorDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const error = id ? getErrorById(id) : undefined;

  if (!error) {
    return <Navigate to="/universal-errors" replace />;
  }

  const Icon = error.icon;

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; gradient: string }> = {
      red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', gradient: 'from-red-500/20 to-red-600/10' },
      orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', gradient: 'from-orange-500/20 to-orange-600/10' },
      amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', gradient: 'from-amber-500/20 to-amber-600/10' },
      purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', gradient: 'from-purple-500/20 to-purple-600/10' },
      slate: { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400', gradient: 'from-slate-500/20 to-slate-600/10' },
      pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400', gradient: 'from-pink-500/20 to-pink-600/10' },
      green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', gradient: 'from-green-500/20 to-green-600/10' },
      blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', gradient: 'from-blue-500/20 to-blue-600/10' },
      gray: { bg: 'bg-gray-500/10', border: 'border-gray-500/30', text: 'text-gray-400', gradient: 'from-gray-500/20 to-gray-600/10' },
      cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', gradient: 'from-cyan-500/20 to-cyan-600/10' },
    };
    return colors[color] || colors.gray;
  };

  const colors = getColorClasses(error.color);
  const currentIndex = UNIVERSAL_ERRORS.findIndex(e => e.id === error.id);
  const prevError = currentIndex > 0 ? UNIVERSAL_ERRORS[currentIndex - 1] : null;
  const nextError = currentIndex < UNIVERSAL_ERRORS.length - 1 ? UNIVERSAL_ERRORS[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/universal-errors" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('universalErrors.backToLibrary', 'Retour à la bibliothèque')}
          </Link>

          <div className={`p-6 rounded-xl bg-gradient-to-br ${colors.gradient} border ${colors.border} mb-6`}>
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-xl ${colors.bg} border ${colors.border}`}>
                <Icon className={`w-8 h-8 ${colors.text}`} />
              </div>
              <div>
                <Badge variant="outline" className="mb-2">
                  {t('universalErrors.errorNumber', 'Erreur')} #{currentIndex + 1}
                </Badge>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {t(`universalErrors.errors.${error.translationKey}.name`)}
                </h1>
              </div>
            </div>
          </div>
        </div>

        <SimulationDisclaimer />

        {/* Definition */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              {t('universalErrors.definition', 'Définition')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              {t(`universalErrors.errors.${error.translationKey}.definition`)}
            </p>
          </CardContent>
        </Card>

        {/* Why it happens */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              {t('universalErrors.whyItHappens', 'Pourquoi ça arrive')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t(`universalErrors.errors.${error.translationKey}.whyItHappens`)}
            </p>
          </CardContent>
        </Card>

        {/* Consequences */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {t('universalErrors.consequences', 'Conséquences fréquentes')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <Clock className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <div className="font-medium text-red-400 mb-1">
                    {t('universalErrors.timeCost', 'Temps')}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t(`universalErrors.errors.${error.translationKey}.timeCost`)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Banknote className="w-5 h-5 text-amber-400 mt-0.5" />
                <div>
                  <div className="font-medium text-amber-400 mb-1">
                    {t('universalErrors.moneyCost', 'Argent')}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t(`universalErrors.errors.${error.translationKey}.moneyCost`)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <Zap className="w-5 h-5 text-purple-400 mt-0.5" />
                <div>
                  <div className="font-medium text-purple-400 mb-1">
                    {t('universalErrors.energyCost', 'Énergie')}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t(`universalErrors.errors.${error.translationKey}.energyCost`)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Pyramids */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-blue-400" />
              {t('universalErrors.relatedPyramids', 'Pyramides concernées')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {error.relatedPyramids.map(pyramid => (
                <Button key={pyramid} asChild variant="outline" size="sm">
                  <Link to={`/pyramid-types#${pyramid}`}>
                    {t(`pyramidTypes.${pyramid}`, pyramid)}
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Exit Keys */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
              </svg>
              {t('universalErrors.exitKeys', 'Clés de sortie possibles')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {error.relatedExitKeys.map(key => (
                <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                  <span>{t(`exitKeys.${key}`, key.replace(/-/g, ' '))}</span>
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/exit-keys/catalog">
                      {t('common.explore', 'Explorer')}
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className={`bg-gradient-to-br ${colors.gradient} border ${colors.border}`}>
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-semibold mb-3">
              {t('universalErrors.simulateCta', 'Simuler un cas concret')}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              {t('universalErrors.simulateDescription', 'Testez une décision liée à cette erreur pour identifier les risques avant de vous engager.')}
            </p>
            <Button asChild size="lg">
              <Link 
                to={`/prevention-filter?type=${error.defaultDecisionType}&horizon=${error.defaultHorizon}`}
                className="gap-2"
              >
                <Filter className="w-5 h-5" />
                {t('universalErrors.simulateCase', 'Simuler un cas')}
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          {prevError ? (
            <Button asChild variant="outline">
              <Link to={`/universal-errors/${prevError.id}`} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                {t(`universalErrors.errors.${prevError.translationKey}.name`)}
              </Link>
            </Button>
          ) : (
            <div />
          )}
          {nextError && (
            <Button asChild variant="outline">
              <Link to={`/universal-errors/${nextError.id}`} className="gap-2">
                {t(`universalErrors.errors.${nextError.translationKey}.name`)}
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
