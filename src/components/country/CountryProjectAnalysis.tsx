import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { PremiumPaywall } from '@/components/PremiumPaywall';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SimulationDisclaimer } from '@/components/SimulationDisclaimer';
import {
  Target,
  Clock,
  Zap,
  Users,
  Award,
  Lock,
  DollarSign,
  Battery,
  GraduationCap,
  Briefcase,
  Building2,
  Globe,
  Heart,
  TrendingUp,
  HelpCircle,
  ArrowRight,
  Eye,
  AlertTriangle,
  Key,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ProjectType = 'studies' | 'career' | 'business' | 'expatriation' | 'family' | 'investment' | 'other';
type Horizon = '3months' | '1year' | '3years' | '10years';
type RiskTolerance = 'low' | 'medium' | 'high';
type Constraint = 'money' | 'time' | 'energy' | 'family' | 'status' | 'security';

interface FormData {
  projectType: ProjectType | null;
  constraints: Constraint[];
  riskTolerance: RiskTolerance | null;
  horizon: Horizon | null;
}

interface AnalysisResult {
  blindSpots: string[];
  frequentRisks: string[];
  exitKeys: { label: string; href: string }[];
  alternativeScenario: { label: string; params: Record<string, string> };
}

const PROJECT_TYPES: { value: ProjectType; label: string; icon: React.ReactNode }[] = [
  { value: 'studies', label: 'Études', icon: <GraduationCap className="w-4 h-4" /> },
  { value: 'career', label: 'Carrière', icon: <Briefcase className="w-4 h-4" /> },
  { value: 'business', label: 'Business', icon: <Building2 className="w-4 h-4" /> },
  { value: 'expatriation', label: 'Expatriation', icon: <Globe className="w-4 h-4" /> },
  { value: 'family', label: 'Famille', icon: <Heart className="w-4 h-4" /> },
  { value: 'investment', label: 'Investissement', icon: <TrendingUp className="w-4 h-4" /> },
  { value: 'other', label: 'Autre', icon: <HelpCircle className="w-4 h-4" /> },
];

const HORIZONS: { value: Horizon; label: string }[] = [
  { value: '3months', label: '3 mois' },
  { value: '1year', label: '1 an' },
  { value: '3years', label: '3 ans' },
  { value: '10years', label: '10 ans' },
];

const RISK_TOLERANCES: { value: RiskTolerance; label: string; color: string }[] = [
  { value: 'low', label: 'Faible', color: 'bg-green-500/20 text-green-600 border-green-500/30' },
  { value: 'medium', label: 'Moyenne', color: 'bg-amber-500/20 text-amber-600 border-amber-500/30' },
  { value: 'high', label: 'Élevée', color: 'bg-red-500/20 text-red-600 border-red-500/30' },
];

const CONSTRAINTS: { value: Constraint; label: string; icon: React.ReactNode }[] = [
  { value: 'money', label: 'Argent', icon: <DollarSign className="w-4 h-4" /> },
  { value: 'time', label: 'Temps', icon: <Clock className="w-4 h-4" /> },
  { value: 'energy', label: 'Énergie', icon: <Battery className="w-4 h-4" /> },
  { value: 'family', label: 'Famille', icon: <Users className="w-4 h-4" /> },
  { value: 'status', label: 'Statut', icon: <Award className="w-4 h-4" /> },
  { value: 'security', label: 'Sécurité', icon: <Lock className="w-4 h-4" /> },
];

// Generate analysis based on project type, country context, etc.
function generateAnalysis(formData: FormData, countryId: string): AnalysisResult {
  const blindSpots: string[] = [];
  const frequentRisks: string[] = [];
  const exitKeys: { label: string; href: string }[] = [];

  // Project type specific blind spots
  switch (formData.projectType) {
    case 'expatriation':
      blindSpots.push(
        'Coût réel de l\'installation souvent sous-estimé de 40-60%',
        'Temps d\'adaptation avant productivité normale (12-24 mois)',
        'Impact sur les relations familiales à distance'
      );
      frequentRisks.push(
        'Décalage entre attentes et réalité du système local',
        'Isolement social dans les premiers mois'
      );
      exitKeys.push({ label: 'Comparer avec d\'autres pays', href: '/compare' });
      break;
    case 'studies':
      blindSpots.push(
        'Évolution du marché du travail pendant la formation',
        'Différence entre compétences académiques et demande réelle',
        'Reconnaissance des diplômes dans ce pays'
      );
      frequentRisks.push(
        'Surqualification sans débouchés proportionnels',
        'Coût d\'opportunité vs entrée directe sur le marché'
      );
      break;
    case 'career':
      blindSpots.push(
        'Poids du réseau local vs compétences dans ce marché',
        'Équivalences de diplômes/expériences requises',
        'Dynamique sectorielle spécifique au pays'
      );
      frequentRisks.push(
        'Déclassement professionnel temporaire ou permanent',
        'Barrières linguistiques sous-estimées'
      );
      break;
    case 'business':
      blindSpots.push(
        'Temps avant rentabilité dans ce contexte (souvent 2-3x prévu)',
        'Charges et taxes locales spécifiques',
        'Barrières administratives à l\'entrée'
      );
      frequentRisks.push(
        'Échec statistique plus élevé pour les étrangers',
        'Dépendance aux réseaux locaux'
      );
      exitKeys.push({ label: 'Erreurs systémiques à éviter', href: '/errors-illusions' });
      break;
    case 'investment':
      blindSpots.push(
        'Fiscalité locale complexe et changeante',
        'Restrictions sur la propriété étrangère',
        'Liquidité des actifs dans ce marché'
      );
      frequentRisks.push(
        'Volatilité politique affectant les investissements',
        'Frais cachés et barrières de sortie'
      );
      break;
    case 'family':
      blindSpots.push(
        'Système éducatif local et options pour les enfants',
        'Couverture santé familiale et coûts',
        'Qualité de vie quotidienne vs perception'
      );
      frequentRisks.push(
        'Adaptation difficile des autres membres de la famille',
        'Éloignement du réseau de soutien familial'
      );
      break;
    default:
      blindSpots.push('Tendance à sous-estimer les difficultés');
  }

  // Constraint-specific additions
  if (formData.constraints.includes('money')) {
    blindSpots.push('Les solutions "économiques" ont souvent un coût caché (temps, qualité)');
  }
  if (formData.constraints.includes('time')) {
    blindSpots.push('Optimisme temporel : on sous-estime toujours la durée réelle');
    frequentRisks.push('Précipitation = erreurs évitables');
  }
  if (formData.constraints.includes('energy')) {
    frequentRisks.push('Risque de burnout si ressources énergétiques ignorées');
  }

  // Risk tolerance additions
  if (formData.riskTolerance === 'low') {
    frequentRisks.push('Risque de paralysie décisionnelle ou de stagnation');
  } else if (formData.riskTolerance === 'high') {
    frequentRisks.push('Besoin d\'un filet de sécurité en cas d\'échec');
  }

  // Horizon additions
  if (formData.horizon === '3months') {
    frequentRisks.push('Manque de temps pour une préparation adéquate');
  } else if (formData.horizon === '10years') {
    blindSpots.push('Le monde change — ton plan devra s\'adapter');
  }

  // Always add these
  exitKeys.push(
    { label: 'Explorer les clés de sortie', href: '/exit-keys' },
    { label: 'Tester un scénario alternatif', href: '/prevention-filter' }
  );

  return {
    blindSpots: [...new Set(blindSpots)].slice(0, 5),
    frequentRisks: [...new Set(frequentRisks)].slice(0, 4),
    exitKeys: exitKeys.slice(0, 3),
    alternativeScenario: {
      label: 'Tester avec un horizon différent',
      params: {
        country: countryId,
        project: formData.projectType || '',
      }
    }
  };
}

interface CountryProjectAnalysisProps {
  countryId: string;
  countryName: string;
}

export function CountryProjectAnalysis({ countryId, countryName }: CountryProjectAnalysisProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { canAccessPro, loading: subscriptionLoading } = useSubscription();
  
  const [formData, setFormData] = useState<FormData>({
    projectType: null,
    constraints: [],
    riskTolerance: null,
    horizon: null,
  });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Show paywall if not Pro
  if (!canAccessPro) {
    return (
      <PremiumPaywall
        title={t('countryDetail.project.paywallTitle', 'Analyse Projet Personnalisée')}
        description={t('countryDetail.project.paywallDesc', `Obtenez une analyse adaptée à votre projet spécifique pour ${countryName} : points aveugles, risques fréquents et clés de sortie personnalisées.`)}
        tier="pro"
      />
    );
  }

  if (subscriptionLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isFormComplete = formData.projectType && formData.riskTolerance && formData.horizon && formData.constraints.length > 0;

  const handleAnalyze = () => {
    if (!isFormComplete) return;
    setAnalyzing(true);
    
    // Simulate analysis delay
    setTimeout(() => {
      const analysis = generateAnalysis(formData, countryId);
      setResult(analysis);
      setAnalyzing(false);
    }, 1000);
  };

  const handleReset = () => {
    setFormData({
      projectType: null,
      constraints: [],
      riskTolerance: null,
      horizon: null,
    });
    setResult(null);
  };

  const toggleConstraint = (constraint: Constraint) => {
    setFormData(prev => ({
      ...prev,
      constraints: prev.constraints.includes(constraint)
        ? prev.constraints.filter(c => c !== constraint)
        : [...prev.constraints, constraint].slice(0, 3)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Pro Badge */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 text-primary text-sm font-medium border border-primary/20">
          👑 {t('countryDetail.project.badge', 'Analyse Projet — Pro')}
        </span>
      </div>

      {!result ? (
        // Form
        <div className="space-y-6">
          {/* Project Type */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                {t('countryDetail.project.projectType', 'Type de projet')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PROJECT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setFormData({ ...formData, projectType: type.value })}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all",
                      formData.projectType === type.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card hover:bg-accent border-border"
                    )}
                  >
                    {type.icon}
                    {type.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Horizon */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                {t('countryDetail.project.horizon', 'Horizon temporel')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {HORIZONS.map((h) => (
                  <button
                    key={h.value}
                    onClick={() => setFormData({ ...formData, horizon: h.value })}
                    className={cn(
                      "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                      formData.horizon === h.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card hover:bg-accent border-border"
                    )}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risk Tolerance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                {t('countryDetail.project.riskTolerance', 'Tolérance au risque')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {RISK_TOLERANCES.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setFormData({ ...formData, riskTolerance: r.value })}
                    className={cn(
                      "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                      formData.riskTolerance === r.value
                        ? r.color
                        : "bg-card hover:bg-accent border-border"
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Constraints */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                {t('countryDetail.project.constraints', 'Contraintes principales (max 3)')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CONSTRAINTS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => toggleConstraint(c.value)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all",
                      formData.constraints.includes(c.value)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card hover:bg-accent border-border"
                    )}
                  >
                    {c.icon}
                    {c.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Button
            size="lg"
            onClick={handleAnalyze}
            disabled={!isFormComplete || analyzing}
            className="w-full gap-2"
          >
            {analyzing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Target className="w-5 h-5" />
            )}
            {t('countryDetail.project.analyze', 'Analyser mon projet')}
          </Button>

          <SimulationDisclaimer variant="compact" />
        </div>
      ) : (
        // Results
        <div className="space-y-6">
          {/* Blind Spots */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-500" />
                {t('countryDetail.project.blindSpots', 'Points aveugles probables pour ton projet')}
                <span className="text-[10px] text-muted-foreground ml-auto font-normal">(fréquents, pas certains)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.blindSpots.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-blue-500 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Frequent Risks */}
          <Card className="border-amber-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                {t('countryDetail.project.risks', 'Risques fréquents à surveiller')}
                <span className="text-[10px] text-muted-foreground ml-auto font-normal">(tendances, pas prédictions)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.frequentRisks.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-amber-500 mt-0.5">⚠</span>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Exit Keys */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="w-4 h-4 text-primary" />
                {t('countryDetail.project.exitKeys', 'Pistes d\'exploration pertinentes')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {result.exitKeys.map((key, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(key.href)}
                    className="gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    {key.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <p className="text-xs text-muted-foreground">
              ⚠️ <strong>Simulation ≠ prédiction.</strong> Ces résultats illustrent des tendances fréquentes, pas ton avenir. Aucun résultat n'est un diagnostic ni une recommandation. Tu restes responsable de tes décisions.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleReset} className="flex-1 gap-2">
              <RefreshCw className="w-4 h-4" />
              Nouvelle analyse
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/prevention-filter')}
              className="flex-1 gap-2"
            >
              <Target className="w-4 h-4" />
              Tester un scénario alternatif
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
