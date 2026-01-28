import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock, DollarSign, FileText, Users } from 'lucide-react';

interface FeasibilityFactor {
  id: string;
  label: string;
  score: number; // 0-100
  icon: React.ReactNode;
  status: 'good' | 'warning' | 'critical';
}

interface FeasibilityScoreCardProps {
  country: string;
  profession: string;
  nationality: string;
  age: number;
}

export function FeasibilityScoreCard({
  country,
  profession,
  nationality,
  age,
}: FeasibilityScoreCardProps) {
  const { t } = useTranslation();

  // Calculate feasibility factors based on inputs
  const calculateFactors = (): FeasibilityFactor[] => {
    const isEU = ['fr', 'de', 'it', 'es', 'nl', 'be', 'at', 'pt'].includes(nationality.toLowerCase());
    const targetIsEU = ['fr', 'de', 'it', 'es', 'nl', 'be', 'at', 'pt', 'ch'].includes(country.toLowerCase());
    
    // Administrative complexity
    const adminScore = isEU && targetIsEU ? 85 : isEU ? 60 : 40;
    
    // Cost factor
    const costScore = age < 35 ? 75 : age < 50 ? 65 : 50;
    
    // Timeline feasibility
    const timeScore = isEU && targetIsEU ? 90 : 55;
    
    // Document requirements
    const docScore = profession.toLowerCase().includes('engineer') || 
                     profession.toLowerCase().includes('doctor') ? 70 : 80;
    
    // Network/support availability
    const networkScore = targetIsEU ? 80 : 60;

    return [
      {
        id: 'admin',
        label: t('exitKeys.feasibility.admin', 'Complexité administrative'),
        score: adminScore,
        icon: <FileText className="w-4 h-4" />,
        status: adminScore >= 70 ? 'good' : adminScore >= 50 ? 'warning' : 'critical',
      },
      {
        id: 'cost',
        label: t('exitKeys.feasibility.cost', 'Coût estimé'),
        score: costScore,
        icon: <DollarSign className="w-4 h-4" />,
        status: costScore >= 70 ? 'good' : costScore >= 50 ? 'warning' : 'critical',
      },
      {
        id: 'timeline',
        label: t('exitKeys.feasibility.timeline', 'Délai réaliste'),
        score: timeScore,
        icon: <Clock className="w-4 h-4" />,
        status: timeScore >= 70 ? 'good' : timeScore >= 50 ? 'warning' : 'critical',
      },
      {
        id: 'documents',
        label: t('exitKeys.feasibility.documents', 'Exigences documentaires'),
        score: docScore,
        icon: <FileText className="w-4 h-4" />,
        status: docScore >= 70 ? 'good' : docScore >= 50 ? 'warning' : 'critical',
      },
      {
        id: 'network',
        label: t('exitKeys.feasibility.network', 'Support local disponible'),
        score: networkScore,
        icon: <Users className="w-4 h-4" />,
        status: networkScore >= 70 ? 'good' : networkScore >= 50 ? 'warning' : 'critical',
      },
    ];
  };

  const factors = calculateFactors();
  const globalScore = Math.round(factors.reduce((acc, f) => acc + f.score, 0) / factors.length);

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            {t('exitKeys.feasibility.title', 'Score de faisabilité')}
          </CardTitle>
          <Badge 
            variant="outline" 
            className={`text-lg px-3 py-1 ${getScoreColor(globalScore)}`}
          >
            {globalScore}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          {t('exitKeys.feasibility.subtitle', 'Évaluation en temps réel basée sur votre profil et la stratégie sélectionnée.')}
        </div>

        {factors.map((factor) => (
          <div key={factor.id} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {factor.icon}
                <span>{factor.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={getScoreColor(factor.score)}>{factor.score}%</span>
                {factor.status === 'good' && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                {factor.status === 'warning' && <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                {factor.status === 'critical' && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
              </div>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`absolute inset-y-0 left-0 ${getProgressColor(factor.score)} transition-all`}
                style={{ width: `${factor.score}%` }}
              />
            </div>
          </div>
        ))}

        <div className="pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            {globalScore >= 70 && t('exitKeys.feasibility.goodMsg', 'Cette stratégie est très réalisable pour votre profil.')}
            {globalScore >= 50 && globalScore < 70 && t('exitKeys.feasibility.warningMsg', 'Quelques obstacles à anticiper, mais stratégie réalisable.')}
            {globalScore < 50 && t('exitKeys.feasibility.criticalMsg', 'Stratégie complexe nécessitant une préparation approfondie.')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
