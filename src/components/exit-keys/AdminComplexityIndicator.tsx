// Administrative Complexity Indicator for Exit Keys
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FileText, Clock, DollarSign, Users, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ComplexityFactor {
  id: string;
  label: string;
  score: number; // 0-100
  description: string;
  details: string[];
  icon: 'documents' | 'time' | 'cost' | 'network' | 'risk';
}

interface AdminComplexityIndicatorProps {
  countryId: string;
  countryName: string;
  profession?: string;
  strategyType?: string;
}

export function AdminComplexityIndicator({
  countryId,
  countryName,
  profession,
  strategyType
}: AdminComplexityIndicatorProps) {
  const { t } = useTranslation();

  // Complexity factors by country (mock data - would come from country_governance)
  const getComplexityFactors = (): ComplexityFactor[] => {
    // Different complexity profiles based on country
    const countryProfiles: Record<string, ComplexityFactor[]> = {
      fr: [
        {
          id: 'documents',
          label: t('complexity.documents', 'Documents requis'),
          score: 75,
          description: t('complexity.documentsDesc', 'Volume de paperasse administrative'),
          details: [
            'Titre de séjour (12 documents)',
            'Attestations légalisées',
            'Traductions assermentées obligatoires',
          ],
          icon: 'documents',
        },
        {
          id: 'time',
          label: t('complexity.time', 'Délais moyens'),
          score: 60,
          description: t('complexity.timeDesc', 'Temps moyen de traitement'),
          details: [
            'Préfecture: 3-6 mois',
            'Reconnaissance diplômes: 2-4 mois',
            'Visa long séjour: 1-3 mois',
          ],
          icon: 'time',
        },
        {
          id: 'cost',
          label: t('complexity.cost', 'Coûts administratifs'),
          score: 45,
          description: t('complexity.costDesc', 'Frais de dossier et taxes'),
          details: [
            'Timbre fiscal: 225€',
            'Traductions: 50-100€/doc',
            'Frais avocat optionnel: 1500-3000€',
          ],
          icon: 'cost',
        },
        {
          id: 'network',
          label: t('complexity.network', 'Réseau nécessaire'),
          score: 55,
          description: t('complexity.networkDesc', 'Importance des contacts locaux'),
          details: [
            'Garant français recommandé',
            'Employeur sponsor requis',
            'Notaire pour immobilier',
          ],
          icon: 'network',
        },
        {
          id: 'risk',
          label: t('complexity.risk', 'Risque de refus'),
          score: 35,
          description: t('complexity.riskDesc', 'Probabilité de blocage'),
          details: [
            'Taux de refus visa: 15%',
            'Recours possible: Oui',
            'Délai recours: 2 mois',
          ],
          icon: 'risk',
        },
      ],
      ch: [
        {
          id: 'documents',
          label: t('complexity.documents', 'Documents requis'),
          score: 85,
          description: t('complexity.documentsDesc', 'Volume de paperasse administrative'),
          details: [
            'Permis de séjour (15+ documents)',
            'Preuves de moyens financiers',
            'Casier judiciaire multi-pays',
          ],
          icon: 'documents',
        },
        {
          id: 'time',
          label: t('complexity.time', 'Délais moyens'),
          score: 70,
          description: t('complexity.timeDesc', 'Temps moyen de traitement'),
          details: [
            'Permis B: 4-8 mois',
            'MEBEKO (médecins): 6-12 mois',
            'Naturalisation: 10+ ans',
          ],
          icon: 'time',
        },
        {
          id: 'cost',
          label: t('complexity.cost', 'Coûts administratifs'),
          score: 80,
          description: t('complexity.costDesc', 'Frais de dossier et taxes'),
          details: [
            'Permis de travail: 500-1500 CHF',
            'Assurance maladie: 300-600 CHF/mois',
            'Frais notaire: 2000-5000 CHF',
          ],
          icon: 'cost',
        },
        {
          id: 'network',
          label: t('complexity.network', 'Réseau nécessaire'),
          score: 75,
          description: t('complexity.networkDesc', 'Importance des contacts locaux'),
          details: [
            'Employeur suisse obligatoire',
            'Références bancaires',
            'Intégration cantonale évaluée',
          ],
          icon: 'network',
        },
        {
          id: 'risk',
          label: t('complexity.risk', 'Risque de refus'),
          score: 50,
          description: t('complexity.riskDesc', 'Probabilité de blocage'),
          details: [
            'Quotas annuels appliqués',
            'Priorité aux UE/AELE',
            'Recours cantonal possible',
          ],
          icon: 'risk',
        },
      ],
    };

    return countryProfiles[countryId] || countryProfiles.fr;
  };

  const factors = getComplexityFactors();
  const overallScore = Math.round(factors.reduce((sum, f) => sum + f.score, 0) / factors.length);

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-500';
    if (score >= 50) return 'text-orange-500';
    if (score >= 30) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 70) return t('complexity.veryHigh', 'Très élevée');
    if (score >= 50) return t('complexity.high', 'Élevée');
    if (score >= 30) return t('complexity.medium', 'Modérée');
    return t('complexity.low', 'Faible');
  };

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'documents': return <FileText className="h-4 w-4" />;
      case 'time': return <Clock className="h-4 w-4" />;
      case 'cost': return <DollarSign className="h-4 w-4" />;
      case 'network': return <Users className="h-4 w-4" />;
      case 'risk': return <AlertTriangle className="h-4 w-4" />;
      default: return <HelpCircle className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t('complexity.title', 'Complexité Administrative')}</span>
          <Badge 
            variant="outline" 
            className={`${getScoreColor(overallScore)} border-current`}
          >
            {overallScore}/100 - {getScoreLabel(overallScore)}
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {countryName} {profession && `• ${profession}`} {strategyType && `• ${strategyType}`}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t('complexity.overall', 'Score global de complexité')}</span>
            <span className={getScoreColor(overallScore)}>{overallScore}%</span>
          </div>
          <Progress value={overallScore} className="h-3" />
        </div>

        {/* Detailed Factors */}
        <div className="space-y-3 pt-4">
          {factors.map((factor) => (
            <TooltipProvider key={factor.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="space-y-1.5 cursor-help">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getIcon(factor.icon)}
                        <span className="text-sm font-medium">{factor.label}</span>
                      </div>
                      <span className={`text-sm font-medium ${getScoreColor(factor.score)}`}>
                        {factor.score}%
                      </span>
                    </div>
                    <Progress value={factor.score} className="h-2" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  <div className="space-y-2">
                    <p className="font-medium">{factor.description}</p>
                    <ul className="text-sm space-y-1">
                      {factor.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 mt-0.5 shrink-0 text-green-500" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        {/* Summary */}
        <div className="pt-4 border-t text-sm text-muted-foreground">
          <p>
            {overallScore >= 70 
              ? t('complexity.summaryHigh', 'Procédures complexes nécessitant une préparation rigoureuse et potentiellement un accompagnement professionnel.')
              : overallScore >= 50
              ? t('complexity.summaryMedium', 'Complexité modérée. Une bonne organisation et des délais anticipés sont recommandés.')
              : t('complexity.summaryLow', 'Procédures relativement simples. Prévoir quelques semaines de délais.')
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
