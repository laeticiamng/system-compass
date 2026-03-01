import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  ArrowRight, 
  Clock, 
  Target, 
  AlertTriangle,
  Eye,
  Lightbulb,
  Key,
  Save,
  RefreshCw,
  GraduationCap,
  Briefcase,
  Building2,
  TrendingUp,
  Heart,
  Globe,
  HelpCircle,
  Zap,
  DollarSign,
  Battery,
  Users,
  Award,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { OVISuggestions } from '@/components/ovi/OVISuggestions';

type DecisionType = 'country' | 'studies' | 'career' | 'business' | 'investment' | 'relationship' | 'other';
type Horizon = '3months' | '1year' | '3years' | '10years';
type RiskTolerance = 'low' | 'medium' | 'high';
type Constraint = 'money' | 'time' | 'energy' | 'family' | 'status' | 'security';
type Reversibility = 'reversible' | 'semi' | 'irreversible';

interface FilterFormData {
  decisionType: DecisionType | null;
  horizon: Horizon | null;
  riskTolerance: RiskTolerance | null;
  constraint: Constraint | null;
}

interface FilterResult {
  implications: string[];
  blindSpots: string[];
  risks: string[];
  exitKeys: { label: string; href: string }[];
  reversibility: Reversibility;
}

// Calculate reversibility based on decision type and horizon
function calculateReversibility(decisionType: DecisionType, horizon: Horizon): Reversibility {
  // Base reversibility by decision type
  const baseReversibility: Record<DecisionType, Reversibility> = {
    'country': 'semi',
    'studies': 'semi',
    'career': 'reversible',
    'business': 'semi',
    'investment': 'semi',
    'relationship': 'reversible',
    'other': 'reversible',
  };

  // Decisions that become irreversible with long horizons
  const becomesIrreversible: DecisionType[] = ['country', 'business', 'investment', 'relationship'];
  
  // Short horizons make things more reversible
  if (horizon === '3months') {
    return 'reversible';
  }
  
  // Long horizons can make decisions irreversible
  if (horizon === '10years' && becomesIrreversible.includes(decisionType)) {
    return 'irreversible';
  }
  
  if (horizon === '3years' && ['country', 'business'].includes(decisionType)) {
    return 'irreversible';
  }

  return baseReversibility[decisionType];
}

const REVERSIBILITY_CONFIG: Record<Reversibility, { labelKey: string; color: string; icon: string }> = {
  'reversible': { 
    labelKey: 'preventionFilter.reversibility.reversible', 
    color: 'bg-green-500/20 text-green-700 border-green-500/40',
    icon: '↩️'
  },
  'semi': { 
    labelKey: 'preventionFilter.reversibility.semi', 
    color: 'bg-amber-500/20 text-amber-700 border-amber-500/40',
    icon: '⚠️'
  },
  'irreversible': { 
    labelKey: 'preventionFilter.reversibility.irreversible', 
    color: 'bg-red-500/20 text-red-700 border-red-500/40',
    icon: '🔒'
  },
};

const DECISION_TYPES: { value: DecisionType; labelKey: string; icon: React.ReactNode }[] = [
  { value: 'country', labelKey: 'preventionFilter.types.country', icon: <Globe className="w-4 h-4" /> },
  { value: 'studies', labelKey: 'preventionFilter.types.studies', icon: <GraduationCap className="w-4 h-4" /> },
  { value: 'career', labelKey: 'preventionFilter.types.career', icon: <Briefcase className="w-4 h-4" /> },
  { value: 'business', labelKey: 'preventionFilter.types.business', icon: <Building2 className="w-4 h-4" /> },
  { value: 'investment', labelKey: 'preventionFilter.types.investment', icon: <TrendingUp className="w-4 h-4" /> },
  { value: 'relationship', labelKey: 'preventionFilter.types.relationship', icon: <Heart className="w-4 h-4" /> },
  { value: 'other', labelKey: 'preventionFilter.types.other', icon: <HelpCircle className="w-4 h-4" /> },
];

const HORIZONS: { value: Horizon; labelKey: string }[] = [
  { value: '3months', labelKey: 'preventionFilter.horizons.3months' },
  { value: '1year', labelKey: 'preventionFilter.horizons.1year' },
  { value: '3years', labelKey: 'preventionFilter.horizons.3years' },
  { value: '10years', labelKey: 'preventionFilter.horizons.10years' },
];

const RISK_TOLERANCES: { value: RiskTolerance; labelKey: string; color: string }[] = [
  { value: 'low', labelKey: 'preventionFilter.risks.low', color: 'bg-green-500/20 text-green-600 border-green-500/30' },
  { value: 'medium', labelKey: 'preventionFilter.risks.medium', color: 'bg-amber-500/20 text-amber-600 border-amber-500/30' },
  { value: 'high', labelKey: 'preventionFilter.risks.high', color: 'bg-red-500/20 text-red-600 border-red-500/30' },
];

const CONSTRAINTS: { value: Constraint; labelKey: string; icon: React.ReactNode }[] = [
  { value: 'money', labelKey: 'preventionFilter.constraints.money', icon: <DollarSign className="w-4 h-4" /> },
  { value: 'time', labelKey: 'preventionFilter.constraints.time', icon: <Clock className="w-4 h-4" /> },
  { value: 'energy', labelKey: 'preventionFilter.constraints.energy', icon: <Battery className="w-4 h-4" /> },
  { value: 'family', labelKey: 'preventionFilter.constraints.family', icon: <Users className="w-4 h-4" /> },
  { value: 'status', labelKey: 'preventionFilter.constraints.status', icon: <Award className="w-4 h-4" /> },
  { value: 'security', labelKey: 'preventionFilter.constraints.security', icon: <Lock className="w-4 h-4" /> },
];

// Generate contextual results based on form inputs
function generateResults(formData: FilterFormData): FilterResult {
  const { decisionType, horizon, riskTolerance, constraint } = formData;
  
  const implications: string[] = [];
  const blindSpots: string[] = [];
  const risks: string[] = [];
  const exitKeys: { label: string; href: string }[] = [];
  
  // Calculate reversibility
  const reversibility = calculateReversibility(decisionType!, horizon!);

  // Decision type specific content
  switch (decisionType) {
    case 'country':
      implications.push(
        "Changement de système fiscal, social et administratif",
        "Reconstruction du réseau professionnel et social",
        "Adaptation culturelle et linguistique nécessaire"
      );
      blindSpots.push(
        "Coût réel de l'installation (souvent sous-estimé de 40-60%)",
        "Temps d'adaptation avant productivité normale (12-24 mois)",
        "Impact sur les relations familiales à distance"
      );
      exitKeys.push(
        { label: "Comparer les pays", href: "/compare" },
        { label: "Explorer les stratégies", href: "/exit-keys" }
      );
      break;
    case 'studies':
      implications.push(
        "Investissement temps/argent avec retour différé",
        "Spécialisation qui peut limiter les options futures",
        "Construction d'un réseau dans un domaine spécifique"
      );
      blindSpots.push(
        "Évolution du marché du travail pendant la formation",
        "Différence entre compétences académiques et demande réelle",
        "Coût d'opportunité vs entrée directe sur le marché"
      );
      exitKeys.push(
        { label: "Analyser les trajectoires", href: "/life-trajectory" },
        { label: "Erreurs systémiques", href: "/errors-illusions" }
      );
      break;
    case 'career':
      implications.push(
        "Changement d'identité professionnelle",
        "Période de transition avec revenus potentiellement réduits",
        "Besoin de nouvelles compétences ou certifications"
      );
      blindSpots.push(
        "Syndrome de l'herbe plus verte (idéalisation du nouveau métier)",
        "Compétences transférables souvent sous-évaluées",
        "Réalité quotidienne vs image du métier"
      );
      exitKeys.push(
        { label: "Stratégies métier", href: "/exit-keys" },
        { label: "Comprendre les pyramides", href: "/pyramid-types" }
      );
      break;
    case 'business':
      implications.push(
        "Responsabilité financière et légale personnelle",
        "Revenus variables et incertains au début",
        "Temps et énergie considérables nécessaires"
      );
      blindSpots.push(
        "Sous-estimation du temps avant rentabilité (souvent 2-3x prévu)",
        "Coûts cachés (administratif, juridique, marketing)",
        "Solitude de l'entrepreneur, impact sur la vie personnelle"
      );
      risks.push(
        "Échec statistique élevé (60-80% des entreprises dans les 5 ans)",
        "Endettement personnel en cas de difficultés"
      );
      exitKeys.push(
        { label: "Stratégies entrepreneuriales", href: "/exit-keys" },
        { label: "Éviter les erreurs courantes", href: "/errors-illusions" }
      );
      break;
    case 'investment':
      implications.push(
        "Immobilisation de capital sur durée variable",
        "Rendement lié au risque accepté",
        "Besoin de suivi et de gestion active ou passive"
      );
      blindSpots.push(
        "Frais cachés et impact sur le rendement réel",
        "Fiscalité complexe selon le type d'investissement",
        "Biais cognitifs (excès de confiance, aversion à la perte)"
      );
      risks.push(
        "Perte partielle ou totale du capital possible",
        "Liquidité variable selon les actifs"
      );
      exitKeys.push(
        { label: "Comprendre les systèmes fiscaux", href: "/countries" },
        { label: "Trajectoire financière", href: "/life-trajectory" }
      );
      break;
    case 'relationship':
      implications.push(
        "Interdépendance émotionnelle et parfois financière",
        "Compromis sur projets de vie individuels",
        "Impact sur le réseau social existant"
      );
      blindSpots.push(
        "Différences de valeurs qui émergent avec le temps",
        "Projection de ses attentes sur l'autre",
        "Coût de sortie sous-estimé (émotionnel, logistique, financier)"
      );
      exitKeys.push(
        { label: "Prévention des risques", href: "/errors-illusions" }
      );
      break;
    default:
      implications.push(
        "Tout changement majeur implique une période d'adaptation",
        "Les ressources (temps, argent, énergie) sont limitées",
        "Chaque choix ferme certaines portes et en ouvre d'autres"
      );
      blindSpots.push(
        "Tendance à sous-estimer les difficultés",
        "Surestimation de sa capacité d'adaptation",
        "Effet de mode ou pression sociale sur la décision"
      );
  }

  // Horizon specific additions
  switch (horizon) {
    case '3months':
      implications.push("Urgence = moins de marge de manœuvre et de négociation");
      blindSpots.push("Décisions précipitées souvent regrettées");
      risks.push("Manque de temps pour une préparation adéquate");
      break;
    case '1year':
      implications.push("Fenêtre réaliste pour un changement bien préparé");
      break;
    case '3years':
      implications.push("Possibilité de transition progressive et testée");
      break;
    case '10years':
      implications.push("Vision long terme permet des pivots stratégiques");
      blindSpots.push("Le monde change — ton plan devra s'adapter");
      break;
  }

  // Risk tolerance additions
  switch (riskTolerance) {
    case 'low':
      implications.push("Privilégier la sécurité = accepter des rendements/opportunités moindres");
      risks.push("Risque de paralysie décisionnelle ou de stagnation");
      break;
    case 'high':
      risks.push(
        "Plus gros potentiel de gain mais aussi de perte",
        "Besoin d'un filet de sécurité en cas d'échec"
      );
      break;
  }

  // Constraint specific additions
  switch (constraint) {
    case 'money':
      blindSpots.push("Les solutions 'gratuites' ont souvent un coût caché (temps, qualité)");
      risks.push("Sous-financement = stress et compromis forcés");
      break;
    case 'time':
      blindSpots.push("Optimisme temporel : on sous-estime toujours la durée réelle");
      risks.push("Précipitation = erreurs évitables");
      break;
    case 'energy':
      blindSpots.push("L'épuisement affecte la qualité des décisions");
      risks.push("Burnout possible si ressources énergétiques ignorées");
      break;
    case 'family':
      blindSpots.push("Les contraintes familiales évoluent avec le temps");
      implications.push("Décisions souvent négociées, pas individuelles");
      break;
    case 'status':
      blindSpots.push("Le statut perçu vs la réalité quotidienne du rôle");
      risks.push("Sacrifier le bien-être pour l'image");
      break;
    case 'security':
      blindSpots.push("La sécurité absolue n'existe pas");
      implications.push("Priorité à la stabilité = moins de prise de risque");
      break;
  }

  // Always add general exit keys
  exitKeys.push(
    { label: "Analyser ma situation", href: "/exit-keys" },
    { label: "Jouer une simulation", href: "/life-game" }
  );

  // Remove duplicates
  const uniqueExitKeys = exitKeys.filter((key, index, self) => 
    index === self.findIndex(k => k.href === key.href)
  );

  return {
    implications: [...new Set(implications)],
    blindSpots: [...new Set(blindSpots)],
    risks: [...new Set(risks)],
    exitKeys: uniqueExitKeys.slice(0, 4),
    reversibility,
  };
}

export default function PreventionFilter() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trackSimulationCompleted, trackSimulationDropped } = useAnalytics();
  
  const [formData, setFormData] = useState<FilterFormData>({
    decisionType: null,
    horizon: null,
    riskTolerance: null,
    constraint: null,
  });
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<FilterResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [startTime] = useState(Date.now());

  const isFormComplete = formData.decisionType && formData.horizon && formData.riskTolerance && formData.constraint;

  const handleSubmit = () => {
    if (isFormComplete) {
      const generatedResults = generateResults(formData);
      setResults(generatedResults);
      setShowResults(true);
      const duration = Math.round((Date.now() - startTime) / 1000);
      trackSimulationCompleted('prevention_filter', duration);
    }
  };

  const handleReset = () => {
    if (showResults) {
      trackSimulationDropped('prevention_filter', 'reset_after_results');
    } else if (formData.decisionType || formData.horizon || formData.riskTolerance || formData.constraint) {
      trackSimulationDropped('prevention_filter', 'reset_during_form');
    }
    setFormData({
      decisionType: null,
      horizon: null,
      riskTolerance: null,
      constraint: null,
    });
    setShowResults(false);
    setResults(null);
  };

  const handleSave = async () => {
    if (!user || !results || !formData.decisionType || !formData.horizon || !formData.riskTolerance || !formData.constraint) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('saved_analyses')
        .insert([{
          user_id: user.id,
          decision_type: formData.decisionType,
          horizon: formData.horizon,
          risk_tolerance: formData.riskTolerance,
          constraint_type: formData.constraint,
          results: JSON.parse(JSON.stringify(results)),
        }]);

      if (error) throw error;
      toast.success(t('preventionFilter.saved', 'Analyse sauvegardée !'));
    } catch (error) {
      console.error('Error saving analysis:', error);
      toast.error(t('preventionFilter.saveError', 'Erreur lors de la sauvegarde'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Filtre de Prévention - System Compass</title>
        <meta name="description" content="Identifiez les risques et pièges avant votre expatriation. Filtre de prévention personnalisé selon votre profil, situation et destination." />
        <link rel="canonical" href="https://system-compass.app/prevention-filter" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Filtre de Prévention - System Compass" />
        <meta property="og:description" content="Identifiez les risques avant votre expatriation. Filtre personnalisé." />
        <meta property="og:url" content="https://system-compass.app/prevention-filter" />
        <meta property="og:image" content="https://system-compass.app/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Filtre de Prévention - System Compass" />
        <meta name="twitter:description" content="Identifiez les risques avant votre expatriation. Filtre personnalisé." />
        <meta name="twitter:image" content="https://system-compass.app/og-image.png" />
      </Helmet>
    <div className="min-h-screen pt-16 sm:pt-20 pb-12 sm:pb-16">
      <div className="container mx-auto px-3 sm:px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
            {t('preventionFilter.badge', 'Filtre de prévention')}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">
            {t('preventionFilter.title', 'Passer une décision au filtre')}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
            {t('preventionFilter.subtitle', 'Avant une décision importante, révèle les risques, points aveugles et conséquences probables en moins de 60 secondes.')}
          </p>
        </div>

        {!showResults ? (
          /* Form */
          <div className="space-y-6">
            {/* Decision Type */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  {t('preventionFilter.decisionType', 'Type de décision')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {DECISION_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setFormData({ ...formData, decisionType: type.value })}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all",
                        formData.decisionType === type.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card hover:bg-accent border-border"
                      )}
                    >
                      {type.icon}
                      {t(type.labelKey)}
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
                  {t('preventionFilter.horizon', 'Horizon temporel')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {HORIZONS.map((horizon) => (
                    <button
                      key={horizon.value}
                      onClick={() => setFormData({ ...formData, horizon: horizon.value })}
                      className={cn(
                        "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                        formData.horizon === horizon.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card hover:bg-accent border-border"
                      )}
                    >
                      {t(horizon.labelKey)}
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
                  {t('preventionFilter.riskTolerance', 'Tolérance au risque')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {RISK_TOLERANCES.map((risk) => (
                    <button
                      key={risk.value}
                      onClick={() => setFormData({ ...formData, riskTolerance: risk.value })}
                      className={cn(
                        "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                        formData.riskTolerance === risk.value
                          ? risk.color + " border-2"
                          : "bg-card hover:bg-accent border-border"
                      )}
                    >
                      {t(risk.labelKey)}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Constraint */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-primary" />
                  {t('preventionFilter.constraint', 'Contrainte dominante')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CONSTRAINTS.map((constraint) => (
                    <button
                      key={constraint.value}
                      onClick={() => setFormData({ ...formData, constraint: constraint.value })}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all",
                        formData.constraint === constraint.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card hover:bg-accent border-border"
                      )}
                    >
                      {constraint.icon}
                      {t(constraint.labelKey)}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={!isFormComplete}
                className="w-full h-14 text-lg gap-2"
              >
                <Shield className="w-5 h-5" />
                {t('preventionFilter.analyze', 'Analyser cette décision')}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-center text-muted-foreground">
              {t('preventionFilter.disclaimer', "Simulation ≠ prédiction. Outil d'analyse uniquement. Tu restes responsable de ta décision.")}
            </p>
          </div>
        ) : (
          /* Results */
          <div className="space-y-6">
            {/* Reversibility Badge - Prominent display */}
            {results && (
              <div className="flex justify-center">
                <div className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 font-medium",
                  REVERSIBILITY_CONFIG[results.reversibility].color
                )}>
                  <span>{REVERSIBILITY_CONFIG[results.reversibility].icon}</span>
                  <span>{t(REVERSIBILITY_CONFIG[results.reversibility].labelKey)}</span>
                </div>
              </div>
            )}

            {/* Summary badges */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <Badge variant="outline" className="gap-1">
                {DECISION_TYPES.find(d => d.value === formData.decisionType)?.icon}
                {t(DECISION_TYPES.find(d => d.value === formData.decisionType)?.labelKey || '')}
              </Badge>
              <Badge variant="outline">
                <Clock className="w-3 h-3 mr-1" />
                {t(HORIZONS.find(h => h.value === formData.horizon)?.labelKey || '')}
              </Badge>
              <Badge variant="outline" className={RISK_TOLERANCES.find(r => r.value === formData.riskTolerance)?.color}>
                {t(RISK_TOLERANCES.find(r => r.value === formData.riskTolerance)?.labelKey || '')}
              </Badge>
              <Badge variant="outline">
                {CONSTRAINTS.find(c => c.value === formData.constraint)?.icon}
                <span className="ml-1">{t(CONSTRAINTS.find(c => c.value === formData.constraint)?.labelKey || '')}</span>
              </Badge>
            </div>

            {/* Irreversible Warning & Alternative Scenario CTA */}
            {results?.reversibility === 'irreversible' && (
              <Card className="border-red-500/40 bg-red-500/5">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">
                        {t('preventionFilter.irreversibleWarning.title', 'Décision à fort engagement')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t('preventionFilter.irreversibleWarning.message', 'Pour les décisions irréversibles, on recommande de tester au moins 2 scénarios différents.')}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Pre-fill with alternative parameters
                        const alternativeHorizon = formData.horizon === '10years' ? '3years' : 
                                                   formData.horizon === '3years' ? '1year' : '3months';
                        setFormData({ ...formData, horizon: alternativeHorizon as Horizon });
                        setShowResults(false);
                        setResults(null);
                      }}
                      className="gap-2 border-red-500/40 hover:bg-red-500/10"
                    >
                      <RefreshCw className="w-4 h-4" />
                      {t('preventionFilter.irreversibleWarning.testAlternative', 'Tester un scénario alternatif')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {results && (
              <>
                {/* Implications */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      {t('preventionFilter.results.implications', 'Ce que ce choix tend à impliquer')}
                      <span className="text-[10px] text-muted-foreground/60 ml-auto font-normal">(souvent, pas toujours)</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {results.implications.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-amber-500 mt-1">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Blind Spots */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Eye className="w-4 h-4 text-blue-500" />
                      {t('preventionFilter.results.blindSpots', 'Points aveugles fréquents')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {results.blindSpots.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-blue-500 mt-1">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Risks */}
                {results.risks.length > 0 && (
                  <Card className="border-destructive/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        {t('preventionFilter.results.risks', 'Risques fréquents dans ce type de situation')}
                        <span className="text-[10px] text-muted-foreground/60 ml-auto font-normal">(pas certains)</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {results.risks.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-destructive mt-1">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Exit Keys */}
                <Card className="border-primary/30 bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Key className="w-4 h-4 text-primary" />
                      {t('preventionFilter.results.exitKeys', 'Pistes d\'exploration possibles')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {results.exitKeys.map((key, i) => (
                        <Link
                          key={i}
                          to={key.href}
                          className="flex items-center gap-2 px-4 py-3 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors text-sm font-medium"
                        >
                          <ArrowRight className="w-4 h-4 text-primary" />
                          {key.label}
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* OVI Suggestions */}
                <OVISuggestions context="prevention-filter" decisionType={formData.decisionType || undefined} />
              </>
            )}

            {/* Disclaimer prominent */}
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center">
              <p className="text-sm font-medium text-foreground mb-1">
                ⚠️ {t('simulationDisclaimer.notPrediction')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('simulationDisclaimer.antiAuthority.noDiagnosis', "Aucun résultat n'est un diagnostic, une recommandation, ni un avis professionnel. Cela ne remplace aucun conseil spécialisé.")}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1 gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {t('preventionFilter.newAnalysis', 'Nouvelle analyse')}
              </Button>
              
              {user ? (
                <Button
                  variant="secondary"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSaving 
                    ? t('common.loading', 'Chargement...')
                    : t('preventionFilter.saveSimulation', 'Sauvegarder cette simulation')
                  }
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => navigate('/auth')}
                  className="flex-1 gap-2"
                >
                  <Save className="w-4 h-4" />
                  {t('preventionFilter.saveSimulation', 'Sauvegarder cette simulation')}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
