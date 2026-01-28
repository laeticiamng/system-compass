// Latent Zone Predictive Analysis - AI-powered proactive detection
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb,
  Target,
  Clock,
  Zap,
  Activity,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Prediction {
  id: string;
  type: 'escalation' | 'resolution' | 'emergence' | 'connection';
  zoneId?: string;
  zoneName?: string;
  confidence: number;
  timeframe: string;
  description: string;
  factors: string[];
  suggestedActions: string[];
  priority: 'high' | 'medium' | 'low';
}

interface TrendData {
  period: string;
  newZones: number;
  resolved: number;
  escalated: number;
}

interface PredictiveAnalysisProps {
  predictions: Prediction[];
  trends: TrendData[];
  onActionClick?: (prediction: Prediction, action: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function PredictiveAnalysis({
  predictions,
  trends,
  onActionClick,
  onRefresh,
  isLoading = false
}: PredictiveAnalysisProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('predictions');

  const groupedPredictions = useMemo(() => {
    return {
      escalations: predictions.filter(p => p.type === 'escalation'),
      resolutions: predictions.filter(p => p.type === 'resolution'),
      emergences: predictions.filter(p => p.type === 'emergence'),
      connections: predictions.filter(p => p.type === 'connection')
    };
  }, [predictions]);

  const riskScore = useMemo(() => {
    if (predictions.length === 0) return 0;
    const highWeight = groupedPredictions.escalations.filter(p => p.priority === 'high').length * 3;
    const mediumWeight = groupedPredictions.escalations.filter(p => p.priority === 'medium').length * 2;
    const lowWeight = groupedPredictions.escalations.filter(p => p.priority === 'low').length;
    return Math.min(100, Math.round((highWeight + mediumWeight + lowWeight) * 10));
  }, [predictions, groupedPredictions]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'escalation':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'resolution':
        return <Target className="h-4 w-4 text-green-500" />;
      case 'emergence':
        return <Lightbulb className="h-4 w-4 text-amber-500" />;
      case 'connection':
        return <Zap className="h-4 w-4 text-blue-500" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'escalation':
        return t('latent.prediction.escalation', 'Escalade probable');
      case 'resolution':
        return t('latent.prediction.resolution', 'Résolution possible');
      case 'emergence':
        return t('latent.prediction.emergence', 'Émergence détectée');
      case 'connection':
        return t('latent.prediction.connection', 'Connexion potentielle');
      default:
        return type;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'low':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-500';
    if (score >= 40) return 'text-amber-500';
    return 'text-green-500';
  };

  return (
    <div className="space-y-4">
      {/* Header with Risk Score */}
      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                {t('latent.predictive.title', 'Analyse prédictive')}
              </CardTitle>
              <CardDescription>
                {t('latent.predictive.subtitle', 'Détection proactive basée sur les patterns')}
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4 mr-1", isLoading && "animate-spin")} />
              {t('common.refresh', 'Actualiser')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className={cn("text-2xl font-bold", getRiskScoreColor(riskScore))}>
                {riskScore}%
              </div>
              <p className="text-xs text-muted-foreground">
                {t('latent.predictive.riskScore', 'Score de risque')}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-red-500/10">
              <div className="text-2xl font-bold text-red-500">
                {groupedPredictions.escalations.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('latent.predictive.escalations', 'Escalades')}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-500/10">
              <div className="text-2xl font-bold text-green-500">
                {groupedPredictions.resolutions.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('latent.predictive.resolutions', 'Résolutions')}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-amber-500/10">
              <div className="text-2xl font-bold text-amber-500">
                {groupedPredictions.emergences.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('latent.predictive.emergences', 'Émergences')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="predictions">
            {t('latent.predictive.predictions', 'Prédictions')}
          </TabsTrigger>
          <TabsTrigger value="trends">
            {t('latent.predictive.trends', 'Tendances')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="mt-4">
          {predictions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Brain className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-center">
                  {t('latent.predictive.noPredictions', 'Aucune prédiction disponible')}
                </p>
                <p className="text-sm text-muted-foreground text-center mt-1">
                  {t('latent.predictive.addZones', 'Ajoutez des zones latentes pour activer l\'analyse')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {predictions.map((prediction) => (
                <Card 
                  key={prediction.id}
                  className={cn(
                    "transition-all hover:shadow-md",
                    prediction.priority === 'high' && "border-red-500/30"
                  )}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getTypeIcon(prediction.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-medium">{getTypeLabel(prediction.type)}</span>
                          <Badge variant="outline" className={getPriorityColor(prediction.priority)}>
                            {t(`common.priority.${prediction.priority}`, prediction.priority)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {prediction.timeframe}
                          </Badge>
                        </div>
                        
                        {prediction.zoneName && (
                          <p className="text-sm text-muted-foreground mb-2">
                            Zone: <span className="font-medium">{prediction.zoneName}</span>
                          </p>
                        )}

                        <p className="text-sm mb-3">{prediction.description}</p>

                        {/* Confidence Bar */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs text-muted-foreground">
                            {t('latent.predictive.confidence', 'Confiance')}:
                          </span>
                          <Progress value={prediction.confidence} className="flex-1 h-1.5" />
                          <span className="text-xs font-medium">{prediction.confidence}%</span>
                        </div>

                        {/* Factors */}
                        {prediction.factors.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-muted-foreground mb-1">
                              {t('latent.predictive.factors', 'Facteurs contribuants')}:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {prediction.factors.map((factor, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {factor}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Suggested Actions */}
                        {prediction.suggestedActions.length > 0 && (
                          <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground mb-2">
                              {t('latent.predictive.suggestedActions', 'Actions suggérées')}:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {prediction.suggestedActions.map((action, i) => (
                                <Button
                                  key={i}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-7"
                                  onClick={() => onActionClick?.(prediction, action)}
                                >
                                  {action}
                                  <ChevronRight className="h-3 w-3 ml-1" />
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="trends" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4" />
                {t('latent.predictive.trendHistory', 'Historique des tendances')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trends.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  {t('latent.predictive.noTrends', 'Pas assez de données pour les tendances')}
                </p>
              ) : (
                <div className="space-y-4">
                  {trends.map((trend, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <span className="text-sm font-medium">{trend.period}</span>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-green-500">
                          <TrendingUp className="h-3 w-3" />
                          +{trend.newZones}
                        </span>
                        <span className="flex items-center gap-1 text-blue-500">
                          <Target className="h-3 w-3" />
                          {trend.resolved}
                        </span>
                        <span className="flex items-center gap-1 text-red-500">
                          <AlertTriangle className="h-3 w-3" />
                          {trend.escalated}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
