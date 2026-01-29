import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock, DollarSign, FileText, Users, Globe, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeasibilityFactor {
  id: string;
  label: string;
  score: number;
  icon: React.ReactNode;
  status: 'good' | 'warning' | 'critical';
  detail?: string;
}

interface FeasibilityScoreCardProps {
  countryId: string;
  countryName?: string;
  professionId?: string;
  nationalityIds: string[];
  age: number;
  intention: 'installation' | 'vacation' | 'internship' | 'retirement' | 'digital_nomad';
  hasCapital?: boolean;
  hasCredentials?: boolean;
}

// EU countries for visa-free assessment
const EU_COUNTRIES = ['fr', 'france', 'de', 'germany', 'it', 'italy', 'es', 'spain', 'nl', 'netherlands', 'be', 'belgium', 'at', 'austria', 'pt', 'portugal', 'pl', 'poland', 'cz', 'czechia', 'gr', 'greece', 'ie', 'ireland', 'se', 'sweden', 'dk', 'denmark', 'fi', 'finland', 'hu', 'hungary', 'ro', 'romania', 'bg', 'bulgaria', 'hr', 'croatia', 'sk', 'slovakia', 'si', 'slovenia', 'lt', 'lithuania', 'lv', 'latvia', 'ee', 'estonia', 'cy', 'cyprus', 'mt', 'malta', 'lu', 'luxembourg'];
const SCHENGEN_PLUS = [...EU_COUNTRIES, 'ch', 'switzerland', 'no', 'norway', 'is', 'iceland', 'li', 'liechtenstein'];

// Countries with specific visa programs
const NOMAD_VISA_COUNTRIES = ['pt', 'portugal', 'es', 'spain', 'hr', 'croatia', 'gr', 'greece', 'ae', 'uae', 'th', 'thailand', 'id', 'indonesia', 'my', 'malaysia'];
const POINTS_IMMIGRATION = ['ca', 'canada', 'au', 'australia', 'nz', 'new-zealand'];

export function FeasibilityScoreCard({
  countryId,
  countryName,
  professionId,
  nationalityIds,
  age,
  intention,
  hasCapital = false,
  hasCredentials = false,
}: FeasibilityScoreCardProps) {
  const { t } = useTranslation();

  const factors = useMemo((): FeasibilityFactor[] => {
    const countryLower = countryId.toLowerCase();
    const hasEuNationality = nationalityIds.some(n => EU_COUNTRIES.includes(n.toLowerCase()));
    const targetIsEu = EU_COUNTRIES.includes(countryLower);
    const targetIsSchengen = SCHENGEN_PLUS.includes(countryLower);
    const hasNomadVisa = NOMAD_VISA_COUNTRIES.includes(countryLower);
    const isPointsSystem = POINTS_IMMIGRATION.includes(countryLower);
    
    // 1. VISA COMPLEXITY
    let visaScore = 40;
    let visaDetail = '';
    
    if (hasEuNationality && targetIsSchengen) {
      visaScore = 95;
      visaDetail = 'Libre circulation UE/Schengen';
    } else if (hasEuNationality && targetIsEu) {
      visaScore = 90;
      visaDetail = 'Libre circulation UE';
    } else if (intention === 'digital_nomad' && hasNomadVisa) {
      visaScore = 75;
      visaDetail = 'Visa nomade digital disponible';
    } else if (intention === 'vacation') {
      visaScore = 85;
      visaDetail = 'Visa touriste standard';
    } else if (isPointsSystem) {
      visaScore = 55;
      visaDetail = 'Système à points (6-18 mois)';
    } else {
      visaScore = 45;
      visaDetail = 'Process visa classique';
    }

    // 2. ADMINISTRATIVE COMPLEXITY
    let adminScore = 50;
    let adminDetail = '';
    
    if (hasEuNationality && targetIsEu) {
      adminScore = 85;
      adminDetail = 'Procédures simplifiées UE';
    } else if (hasCredentials) {
      adminScore = 70;
      adminDetail = 'Diplômes = process facilité';
    } else if (isPointsSystem) {
      adminScore = 55;
      adminDetail = 'Documentation extensive requise';
    } else {
      adminScore = 50;
      adminDetail = 'Procédures standard';
    }

    // 3. COST FACTOR (age-adjusted + capital)
    let costScore = 60;
    let costDetail = '';
    
    if (hasCapital) {
      costScore = 85;
      costDetail = 'Capital disponible = flexibilité';
    } else if (age < 30) {
      costScore = 75;
      costDetail = 'Coûts d\'installation modérés';
    } else if (age < 45) {
      costScore = 65;
      costDetail = 'Budget moyen à prévoir';
    } else {
      costScore = 55;
      costDetail = 'Investissement initial conséquent';
    }
    
    // Intention-specific adjustments
    if (intention === 'retirement') {
      costScore = hasCapital ? 80 : 50;
      costDetail = hasCapital ? 'Capital retraite disponible' : 'Revenus passifs nécessaires';
    }

    // 4. TIMELINE FEASIBILITY
    let timeScore = 50;
    let timeDetail = '';
    
    if (intention === 'vacation') {
      timeScore = 95;
      timeDetail = 'Immédiat (visa touriste)';
    } else if (hasEuNationality && targetIsEu) {
      timeScore = 90;
      timeDetail = '1-2 mois pour installation';
    } else if (intention === 'digital_nomad' && hasNomadVisa) {
      timeScore = 75;
      timeDetail = '2-4 mois pour visa nomade';
    } else if (isPointsSystem) {
      timeScore = 45;
      timeDetail = '12-24 mois (process immigration)';
    } else {
      timeScore = 55;
      timeDetail = '3-12 mois selon profil';
    }

    // 5. PROFESSIONAL RECOGNITION
    let profScore = 60;
    let profDetail = '';
    
    if (!professionId || professionId === 'other') {
      profScore = 70;
      profDetail = 'Pas de reconnaissance requise';
    } else if (['doctor', 'nurse', 'dentist', 'pharmacist'].some(p => professionId.includes(p))) {
      profScore = hasEuNationality && targetIsEu ? 70 : 45;
      profDetail = hasEuNationality && targetIsEu ? 'Reconnaissance UE facilitée' : 'Équivalences complexes';
    } else if (['engineer', 'architect', 'lawyer'].some(p => professionId.includes(p))) {
      profScore = 55;
      profDetail = 'Vérifier équivalences';
    } else if (['developer', 'designer', 'marketing'].some(p => professionId.includes(p))) {
      profScore = 85;
      profDetail = 'Pas de reconnaissance spécifique';
    } else {
      profScore = 65;
      profDetail = 'Évaluer cas par cas';
    }

    // 6. SUPPORT/COMMUNITY
    let networkScore = 60;
    let networkDetail = '';
    
    if (targetIsEu || ['us', 'usa', 'ca', 'canada', 'au', 'australia', 'uk'].includes(countryLower)) {
      networkScore = 80;
      networkDetail = 'Communauté francophone active';
    } else if (['ae', 'uae', 'sg', 'singapore', 'jp', 'japan'].includes(countryLower)) {
      networkScore = 70;
      networkDetail = 'Communauté expat présente';
    } else {
      networkScore = 55;
      networkDetail = 'Réseau à construire';
    }

    return [
      {
        id: 'visa',
        label: t('exitKeys.feasibility.visa', 'Complexité visa'),
        score: visaScore,
        icon: <Globe className="w-4 h-4" />,
        status: visaScore >= 70 ? 'good' : visaScore >= 50 ? 'warning' : 'critical',
        detail: visaDetail,
      },
      {
        id: 'admin',
        label: t('exitKeys.feasibility.admin', 'Démarches administratives'),
        score: adminScore,
        icon: <FileText className="w-4 h-4" />,
        status: adminScore >= 70 ? 'good' : adminScore >= 50 ? 'warning' : 'critical',
        detail: adminDetail,
      },
      {
        id: 'cost',
        label: t('exitKeys.feasibility.cost', 'Budget installation'),
        score: costScore,
        icon: <DollarSign className="w-4 h-4" />,
        status: costScore >= 70 ? 'good' : costScore >= 50 ? 'warning' : 'critical',
        detail: costDetail,
      },
      {
        id: 'timeline',
        label: t('exitKeys.feasibility.timeline', 'Délai réaliste'),
        score: timeScore,
        icon: <Clock className="w-4 h-4" />,
        status: timeScore >= 70 ? 'good' : timeScore >= 50 ? 'warning' : 'critical',
        detail: timeDetail,
      },
      {
        id: 'profession',
        label: t('exitKeys.feasibility.profession', 'Reconnaissance métier'),
        score: profScore,
        icon: <Shield className="w-4 h-4" />,
        status: profScore >= 70 ? 'good' : profScore >= 50 ? 'warning' : 'critical',
        detail: profDetail,
      },
      {
        id: 'network',
        label: t('exitKeys.feasibility.network', 'Support local'),
        score: networkScore,
        icon: <Users className="w-4 h-4" />,
        status: networkScore >= 70 ? 'good' : networkScore >= 50 ? 'warning' : 'critical',
        detail: networkDetail,
      },
    ];
  }, [countryId, nationalityIds, age, intention, hasCapital, hasCredentials, professionId, t]);

  const globalScore = Math.round(factors.reduce((acc, f) => acc + f.score, 0) / factors.length);

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-risk-low';
    if (score >= 50) return 'text-risk-medium';
    return 'text-risk-high';
  };

  const getProgressColor = (score: number) => {
    if (score >= 70) return 'bg-risk-low';
    if (score >= 50) return 'bg-risk-medium';
    return 'bg-risk-high';
  };

  const getGlobalVerdict = () => {
    if (globalScore >= 75) return { text: t('exitKeys.feasibility.excellent', 'Excellente faisabilité'), emoji: '🟢' };
    if (globalScore >= 60) return { text: t('exitKeys.feasibility.good', 'Bonne faisabilité'), emoji: '🟡' };
    if (globalScore >= 45) return { text: t('exitKeys.feasibility.moderate', 'Faisabilité modérée'), emoji: '🟠' };
    return { text: t('exitKeys.feasibility.complex', 'Projet complexe'), emoji: '🔴' };
  };

  const verdict = getGlobalVerdict();

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            {t('exitKeys.feasibility.title', 'Score de faisabilité')}
            {countryName && <span className="text-sm text-muted-foreground">— {countryName}</span>}
          </CardTitle>
          <Badge 
            variant="outline" 
            className={cn("text-lg px-3 py-1 font-bold", getScoreColor(globalScore))}
          >
            {verdict.emoji} {globalScore}%
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {verdict.text}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {factors.map((factor) => (
          <div key={factor.id} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {factor.icon}
                <span className="font-medium">{factor.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("font-semibold", getScoreColor(factor.score))}>{factor.score}%</span>
                {factor.status === 'good' && <CheckCircle className="w-3.5 h-3.5 text-risk-low" />}
                {factor.status === 'warning' && <AlertCircle className="w-3.5 h-3.5 text-risk-medium" />}
                {factor.status === 'critical' && <AlertCircle className="w-3.5 h-3.5 text-risk-high" />}
              </div>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn("absolute inset-y-0 left-0 transition-all duration-500", getProgressColor(factor.score))}
                style={{ width: `${factor.score}%` }}
              />
            </div>
            {factor.detail && (
              <p className="text-xs text-muted-foreground pl-6">{factor.detail}</p>
            )}
          </div>
        ))}

        <div className="pt-4 border-t mt-4">
          <div className="text-xs text-muted-foreground space-y-1">
            {globalScore >= 70 && (
              <p>✅ {t('exitKeys.feasibility.goodMsg', 'Cette destination est très accessible pour votre profil.')}</p>
            )}
            {globalScore >= 50 && globalScore < 70 && (
              <p>⚠️ {t('exitKeys.feasibility.warningMsg', 'Quelques obstacles à anticiper, mais projet réalisable avec préparation.')}</p>
            )}
            {globalScore < 50 && (
              <p>🔴 {t('exitKeys.feasibility.criticalMsg', 'Projet complexe nécessitant une préparation approfondie et un accompagnement.')}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
