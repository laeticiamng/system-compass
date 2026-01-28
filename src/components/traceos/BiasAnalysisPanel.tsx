// Cognitive Bias Analysis Panel for TraceOS
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Eye,
  Lightbulb,
  Target,
  Scale,
  
  Users
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BiasDetection {
  id: string;
  biasType: string;
  biasName: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  description: string;
  indicators: string[];
  mitigations: string[];
  detectedIn: string;
}

interface BiasAnalysisPanelProps {
  decisionContext?: string;
  hypotheses?: string[];
  alternatives?: string[];
  onMitigationApply?: (biasId: string, mitigation: string) => void;
}

export function BiasAnalysisPanel({
  decisionContext,
  hypotheses = [],
  alternatives = [],
  onMitigationApply
}: BiasAnalysisPanelProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('detected');

  // Bias library with detection logic
  const biasLibrary = useMemo(() => [
    {
      id: 'confirmation',
      name: t('biases.confirmation.name', 'Biais de confirmation'),
      icon: <Target className="h-4 w-4" />,
      description: t('biases.confirmation.desc', 'Tendance à privilégier les informations qui confirment nos croyances.'),
      indicators: [
        'Sources d\'information homogènes',
        'Peu de contre-arguments documentés',
        'Hypothèse principale non remise en question',
      ],
      mitigations: [
        'Chercher activement des preuves contraires',
        'Consulter des sources opposées',
        'Faire une revue par un contradicteur',
      ],
    },
    {
      id: 'anchoring',
      name: t('biases.anchoring.name', 'Biais d\'ancrage'),
      icon: <Scale className="h-4 w-4" />,
      description: t('biases.anchoring.desc', 'Dépendance excessive à la première information reçue.'),
      indicators: [
        'Première option fortement favorisée',
        'Alternatives évaluées par rapport à l\'ancre',
        'Chiffres initiaux peu questionnés',
      ],
      mitigations: [
        'Générer des estimations indépendantes',
        'Considérer les extrêmes (min/max)',
        'Reformuler le problème différemment',
      ],
    },
    {
      id: 'sunk_cost',
      name: t('biases.sunkCost.name', 'Biais des coûts irrécupérables'),
      icon: <TrendingUp className="h-4 w-4" />,
      description: t('biases.sunkCost.desc', 'Continuer un projet à cause des investissements passés.'),
      indicators: [
        'Justification par investissements passés',
        'Résistance à abandonner malgré signaux négatifs',
        'Escalade d\'engagement',
      ],
      mitigations: [
        'Évaluer uniquement les coûts/bénéfices futurs',
        'Définir des critères d\'arrêt à l\'avance',
        'Faire évaluer par un externe',
      ],
    },
    {
      id: 'groupthink',
      name: t('biases.groupthink.name', 'Pensée de groupe'),
      icon: <Users className="h-4 w-4" />,
      description: t('biases.groupthink.desc', 'Conformité excessive au consensus du groupe.'),
      indicators: [
        'Absence de désaccord documenté',
        'Décision unanime rapide',
        'Pas de devil\'s advocate identifié',
      ],
      mitigations: [
        'Nommer un contradicteur officiel',
        'Vote anonyme avant discussion',
        'Consulter des externes',
      ],
    },
    {
      id: 'availability',
      name: t('biases.availability.name', 'Biais de disponibilité'),
      icon: <Eye className="h-4 w-4" />,
      description: t('biases.availability.desc', 'Surestimer ce qui vient facilement à l\'esprit.'),
      indicators: [
        'Exemples récents surpondérés',
        'Données marquantes priorisées',
        'Statistiques de base ignorées',
      ],
      mitigations: [
        'Consulter des données historiques',
        'Utiliser des taux de base',
        'Élargir la recherche d\'information',
      ],
    },
    {
      id: 'overconfidence',
      name: t('biases.overconfidence.name', 'Excès de confiance'),
      icon: <Lightbulb className="h-4 w-4" />,
      description: t('biases.overconfidence.desc', 'Surestimer ses propres capacités de prédiction.'),
      indicators: [
        'Plages d\'estimation étroites',
        'Peu de scénarios alternatifs',
        'Risques sous-estimés',
      ],
      mitigations: [
        'Élargir les intervalles de confiance',
        'Lister les incertitudes explicitement',
        'Faire une pré-mortem',
      ],
    },
  ], [t]);

  // Simulate bias detection based on decision context
  const detectedBiases: BiasDetection[] = useMemo(() => {
    const detected: BiasDetection[] = [];

    // Confirmation bias: detected if few alternatives
    if (alternatives.length < 3) {
      const bias = biasLibrary.find(b => b.id === 'confirmation')!;
      detected.push({
        id: '1',
        biasType: 'confirmation',
        biasName: bias.name,
        severity: alternatives.length === 0 ? 'high' : 'medium',
        confidence: 85,
        description: bias.description,
        indicators: bias.indicators,
        mitigations: bias.mitigations,
        detectedIn: 'Analyse des alternatives',
      });
    }

    // Anchoring: detected if first hypothesis has high weight
    if (hypotheses.length > 0) {
      const bias = biasLibrary.find(b => b.id === 'anchoring')!;
      detected.push({
        id: '2',
        biasType: 'anchoring',
        biasName: bias.name,
        severity: 'medium',
        confidence: 70,
        description: bias.description,
        indicators: bias.indicators,
        mitigations: bias.mitigations,
        detectedIn: 'Analyse des hypothèses',
      });
    }

    // Overconfidence: always check
    if (decisionContext && decisionContext.length > 0) {
      const bias = biasLibrary.find(b => b.id === 'overconfidence')!;
      detected.push({
        id: '3',
        biasType: 'overconfidence',
        biasName: bias.name,
        severity: 'low',
        confidence: 60,
        description: bias.description,
        indicators: bias.indicators,
        mitigations: bias.mitigations,
        detectedIn: 'Contexte décisionnel',
      });
    }

    return detected;
  }, [alternatives, hypotheses, decisionContext, biasLibrary]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-orange-500 text-white';
      default: return 'bg-yellow-500 text-black';
    }
  };

  const overallRisk = useMemo(() => {
    if (detectedBiases.length === 0) return 0;
    const weights = { high: 3, medium: 2, low: 1 };
    const total = detectedBiases.reduce((sum, b) => sum + weights[b.severity], 0);
    return Math.min(100, (total / (detectedBiases.length * 3)) * 100);
  }, [detectedBiases]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          {t('traceos.biasAnalysis.title', 'Analyse des Biais Cognitifs')}
          {detectedBiases.length > 0 && (
            <Badge variant="destructive">{detectedBiases.length} détectés</Badge>
          )}
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {t('traceos.biasAnalysis.riskLevel', 'Niveau de risque')}:
          </span>
          <Progress value={overallRisk} className="w-24 h-2" />
          <span className="text-sm font-medium">{Math.round(overallRisk)}%</span>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="detected" className="flex-1">
              {t('traceos.biasAnalysis.detected', 'Détectés')} ({detectedBiases.length})
            </TabsTrigger>
            <TabsTrigger value="library" className="flex-1">
              {t('traceos.biasAnalysis.library', 'Bibliothèque')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="detected" className="mt-4">
            {detectedBiases.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p>{t('traceos.biasAnalysis.noBias', 'Aucun biais majeur détecté')}</p>
                <p className="text-sm">{t('traceos.biasAnalysis.noMeansCareful', 'Continuez à être vigilant!')}</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {detectedBiases.map((bias) => (
                    <div key={bias.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                          <span className="font-medium">{bias.biasName}</span>
                          <Badge className={getSeverityColor(bias.severity)}>
                            {bias.severity}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            ({bias.confidence}% confiance)
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{bias.description}</p>
                      
                      <div className="text-xs text-muted-foreground">
                        Détecté dans: {bias.detectedIn}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 pt-2">
                        <div>
                          <h5 className="text-sm font-medium mb-2 text-red-600">
                            {t('traceos.biasAnalysis.indicators', 'Indicateurs')}
                          </h5>
                          <ul className="text-sm space-y-1">
                            {bias.indicators.map((indicator, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <AlertTriangle className="h-3 w-3 mt-0.5 text-orange-500 shrink-0" />
                                {indicator}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium mb-2 text-green-600">
                            {t('traceos.biasAnalysis.mitigations', 'Mitigations')}
                          </h5>
                          <ul className="text-sm space-y-1">
                            {bias.mitigations.map((mitigation, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle className="h-3 w-3 mt-0.5 text-green-500 shrink-0" />
                                <button 
                                  className="text-left hover:underline"
                                  onClick={() => onMitigationApply?.(bias.id, mitigation)}
                                >
                                  {mitigation}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="library" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid gap-3">
                {biasLibrary.map((bias) => (
                  <div key={bias.id} className="border rounded-lg p-3 hover:bg-accent transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      {bias.icon}
                      <span className="font-medium">{bias.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{bias.description}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
