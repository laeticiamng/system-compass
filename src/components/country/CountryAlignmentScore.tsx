import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  DollarSign,
  Heart,
  Briefcase,
  Shield,
  Users
} from 'lucide-react';

interface UserProfile {
  age: number;
  profession: string;
  nationality: string;
  priorities: string[];
  budget: 'low' | 'medium' | 'high';
  familyStatus: 'single' | 'couple' | 'family';
}

interface CountryData {
  id: string;
  name: string;
  pyramidType: string;
  costOfLiving: { score: number };
  qualityOfLife: { score: number };
  healthcare: { score: number };
  visa: { difficulty: string };
}

interface AlignmentFactor {
  id: string;
  label: string;
  score: number;
  weight: number;
  icon: React.ReactNode;
  insight: string;
}

interface CountryAlignmentScoreProps {
  country: CountryData;
  userProfile: UserProfile;
}

export function CountryAlignmentScore({ country, userProfile }: CountryAlignmentScoreProps) {
  const { t } = useTranslation();

  const alignmentFactors = useMemo((): AlignmentFactor[] => {
    const factors: AlignmentFactor[] = [];

    // Cost of living alignment
    const costScore = country.costOfLiving?.score || 50;
    let costAlignment = 50;
    if (userProfile.budget === 'high') {
      costAlignment = 90; // High budget = compatible with any cost
    } else if (userProfile.budget === 'medium') {
      costAlignment = costScore > 60 ? 85 : costScore > 40 ? 70 : 50;
    } else {
      costAlignment = costScore > 70 ? 90 : costScore > 50 ? 60 : 30;
    }
    
    factors.push({
      id: 'cost',
      label: t('country.alignment.cost', 'Coût de la vie'),
      score: costAlignment,
      weight: userProfile.priorities.includes('money') ? 1.5 : 1,
      icon: <DollarSign className="w-4 h-4" />,
      insight: costAlignment > 70 
        ? t('country.alignment.costGood', 'Compatible avec votre budget')
        : t('country.alignment.costWarning', 'Budget à surveiller'),
    });

    // Quality of life alignment
    const qolScore = country.qualityOfLife?.score || 50;
    factors.push({
      id: 'qol',
      label: t('country.alignment.qol', 'Qualité de vie'),
      score: qolScore,
      weight: userProfile.priorities.includes('freedom') ? 1.5 : 1,
      icon: <Heart className="w-4 h-4" />,
      insight: qolScore > 70 
        ? t('country.alignment.qolGood', 'Excellente qualité de vie')
        : t('country.alignment.qolMedium', 'Qualité de vie correcte'),
    });

    // Professional opportunities
    const profScore = ['engineer', 'developer', 'doctor', 'nurse'].some(p => 
      userProfile.profession.toLowerCase().includes(p)
    ) ? 80 : 60;
    
    factors.push({
      id: 'professional',
      label: t('country.alignment.professional', 'Opportunités pro'),
      score: profScore,
      weight: 1.2,
      icon: <Briefcase className="w-4 h-4" />,
      insight: profScore > 70 
        ? t('country.alignment.profGood', 'Forte demande pour votre profil')
        : t('country.alignment.profMedium', 'Marché accessible'),
    });

    // Healthcare alignment
    const healthScore = country.healthcare?.score || 50;
    factors.push({
      id: 'health',
      label: t('country.alignment.health', 'Système de santé'),
      score: healthScore,
      weight: userProfile.familyStatus === 'family' ? 1.5 : 1,
      icon: <Shield className="w-4 h-4" />,
      insight: healthScore > 70 
        ? t('country.alignment.healthGood', 'Couverture santé excellente')
        : t('country.alignment.healthMedium', 'Couverture correcte'),
    });

    // Family/Community alignment
    const communityScore = userProfile.familyStatus === 'family' ? 
      (country.qualityOfLife?.score || 50) : 70;
    
    factors.push({
      id: 'community',
      label: t('country.alignment.community', 'Vie sociale'),
      score: communityScore,
      weight: userProfile.familyStatus === 'single' ? 0.8 : 1.2,
      icon: <Users className="w-4 h-4" />,
      insight: communityScore > 70 
        ? t('country.alignment.communityGood', 'Communauté active')
        : t('country.alignment.communityMedium', 'Adaptation nécessaire'),
    });

    return factors;
  }, [country, userProfile, t]);

  // Calculate weighted global score
  const globalScore = useMemo(() => {
    const totalWeight = alignmentFactors.reduce((acc, f) => acc + f.weight, 0);
    const weightedSum = alignmentFactors.reduce((acc, f) => acc + (f.score * f.weight), 0);
    return Math.round(weightedSum / totalWeight);
  }, [alignmentFactors]);

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 75) return 'bg-green-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getGlobalBadge = () => {
    if (globalScore >= 80) {
      return (
        <Badge className="bg-green-500/10 text-green-700 border-green-500/30">
          <CheckCircle className="w-3 h-3 mr-1" />
          {t('country.alignment.excellent', 'Excellent match')}
        </Badge>
      );
    }
    if (globalScore >= 60) {
      return (
        <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/30">
          <TrendingUp className="w-3 h-3 mr-1" />
          {t('country.alignment.good', 'Bon potentiel')}
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-500/10 text-red-700 border-red-500/30">
        <AlertTriangle className="w-3 h-3 mr-1" />
        {t('country.alignment.challenging', 'Défis à anticiper')}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-primary" />
            {t('country.alignment.title', 'Score d\'alignement')}
          </CardTitle>
          {getGlobalBadge()}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className={`text-4xl font-bold ${getScoreColor(globalScore)}`}>
            {globalScore}%
          </div>
          <div className="text-sm text-muted-foreground">
            {t('country.alignment.forProfile', 'pour votre profil')}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {alignmentFactors.map((factor) => (
          <div key={factor.id} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {factor.icon}
                <span>{factor.label}</span>
                {factor.weight > 1 && (
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    ×{factor.weight.toFixed(1)}
                  </Badge>
                )}
              </div>
              <span className={getScoreColor(factor.score)}>{factor.score}%</span>
            </div>
            
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`absolute inset-y-0 left-0 ${getProgressColor(factor.score)} transition-all`}
                style={{ width: `${factor.score}%` }}
              />
            </div>
            
            <div className="text-xs text-muted-foreground">
              {factor.insight}
            </div>
          </div>
        ))}

        <div className="pt-4 border-t">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              {t('country.alignment.methodology', 'Score calculé selon vos priorités, budget et situation familiale.')}
            </p>
            <p>
              {t('country.alignment.weights', 'Les facteurs marqués ×1.5 sont pondérés selon votre profil.')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
