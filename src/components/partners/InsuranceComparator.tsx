/**
 * Insurance Comparator - Compare expat insurance plans
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Shield, 
  Heart, 
  Plane, 
  Baby, 
  CheckCircle2, 
  XCircle, 
  Star, 
  ExternalLink,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface InsurancePlan {
  id: string;
  provider: string;
  planName: string;
  type: 'health' | 'travel' | 'comprehensive';
  monthlyPremium: { min: number; max: number };
  coverage: {
    hospitalization: boolean;
    outpatient: boolean;
    dental: boolean;
    maternity: boolean;
    mentalHealth: boolean;
    evacuation: boolean;
    repatriation: boolean;
  };
  deductible: number;
  maxCoverage: number | 'unlimited';
  regions: string[];
  minAge: number;
  maxAge: number;
  rating: number;
  affiliateLink: string;
  highlights: string[];
  discount?: string;
}

const INSURANCE_PLANS: InsurancePlan[] = [
  {
    id: 'safetywing-nomad',
    provider: 'SafetyWing',
    planName: 'Nomad Insurance',
    type: 'travel',
    monthlyPremium: { min: 42, max: 73 },
    coverage: {
      hospitalization: true,
      outpatient: true,
      dental: false,
      maternity: false,
      mentalHealth: false,
      evacuation: true,
      repatriation: true,
    },
    deductible: 250,
    maxCoverage: 250000,
    regions: ['Monde (hors pays origine)'],
    minAge: 18,
    maxAge: 69,
    rating: 4.5,
    affiliateLink: 'https://safetywing.com',
    highlights: ['Paiement mensuel', 'Pas d\'engagement', 'COVID inclus'],
    discount: '-10% via notre lien',
  },
  {
    id: 'safetywing-remote',
    provider: 'SafetyWing',
    planName: 'Remote Health',
    type: 'health',
    monthlyPremium: { min: 180, max: 320 },
    coverage: {
      hospitalization: true,
      outpatient: true,
      dental: true,
      maternity: true,
      mentalHealth: true,
      evacuation: true,
      repatriation: true,
    },
    deductible: 0,
    maxCoverage: 'unlimited',
    regions: ['Monde entier'],
    minAge: 18,
    maxAge: 64,
    rating: 4.7,
    affiliateLink: 'https://safetywing.com/remote-health',
    highlights: ['Couverture complète', 'Télémédecine 24/7', 'Réseau mondial'],
  },
  {
    id: 'allianz-expat',
    provider: 'Allianz Care',
    planName: 'Allianz Care Premium',
    type: 'comprehensive',
    monthlyPremium: { min: 250, max: 500 },
    coverage: {
      hospitalization: true,
      outpatient: true,
      dental: true,
      maternity: true,
      mentalHealth: true,
      evacuation: true,
      repatriation: true,
    },
    deductible: 0,
    maxCoverage: 'unlimited',
    regions: ['Monde entier'],
    minAge: 0,
    maxAge: 74,
    rating: 4.6,
    affiliateLink: 'https://allianzcare.com',
    highlights: ['Réseau 100k+ médecins', 'App mobile', 'Service VIP'],
  },
  {
    id: 'april-expat',
    provider: 'APRIL International',
    planName: 'MyHealth International',
    type: 'health',
    monthlyPremium: { min: 150, max: 350 },
    coverage: {
      hospitalization: true,
      outpatient: true,
      dental: true,
      maternity: true,
      mentalHealth: false,
      evacuation: true,
      repatriation: true,
    },
    deductible: 150,
    maxCoverage: 2000000,
    regions: ['Monde entier'],
    minAge: 0,
    maxAge: 70,
    rating: 4.3,
    affiliateLink: 'https://april-international.com',
    highlights: ['Compatible CFE', 'Service français', 'Gestion en ligne'],
  },
  {
    id: 'cigna-global',
    provider: 'Cigna Global',
    planName: 'Cigna Global Health',
    type: 'comprehensive',
    monthlyPremium: { min: 300, max: 600 },
    coverage: {
      hospitalization: true,
      outpatient: true,
      dental: true,
      maternity: true,
      mentalHealth: true,
      evacuation: true,
      repatriation: true,
    },
    deductible: 0,
    maxCoverage: 'unlimited',
    regions: ['Monde entier'],
    minAge: 0,
    maxAge: 74,
    rating: 4.8,
    affiliateLink: 'https://cigna.com/global',
    highlights: ['#1 mondial', 'Réseau premium', 'Multi-pays'],
  },
];

export function InsuranceComparator() {
  const { t } = useTranslation();
  const [age, setAge] = useState([35]);
  const [coverageType, setCoverageType] = useState<string>('all');
  const [budget, setBudget] = useState([500]);

  const filteredPlans = INSURANCE_PLANS.filter(plan => {
    const matchesAge = age[0] >= plan.minAge && age[0] <= plan.maxAge;
    const matchesType = coverageType === 'all' || plan.type === coverageType;
    const matchesBudget = plan.monthlyPremium.min <= budget[0];
    return matchesAge && matchesType && matchesBudget;
  }).sort((a, b) => b.rating - a.rating);

  const handlePlanClick = (plan: InsurancePlan) => {
    toast.success(`Redirection vers ${plan.provider}`, {
      description: plan.discount || `Plan ${plan.planName}`,
    });
    window.open(plan.affiliateLink, '_blank', 'noopener,noreferrer');
  };

  const CoverageIcon = ({ covered }: { covered: boolean }) => (
    covered 
      ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      : <XCircle className="h-4 w-4 text-muted-foreground" />
  );

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          {t('partners.insurance.title', 'Comparateur Assurances Expat')}
        </CardTitle>
        <CardDescription>
          {t('partners.insurance.description', 'Trouvez l\'assurance adaptée à votre profil')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <Label>Votre âge : {age[0]} ans</Label>
            <Slider
              value={age}
              onValueChange={setAge}
              min={18}
              max={70}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <Label>Type de couverture</Label>
            <Select value={coverageType} onValueChange={setCoverageType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="travel">Voyage / Nomade</SelectItem>
                <SelectItem value="health">Santé longue durée</SelectItem>
                <SelectItem value="comprehensive">Complète Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <Label>Budget max : {budget[0]}€/mois</Label>
            <Slider
              value={budget}
              onValueChange={setBudget}
              min={50}
              max={600}
              step={25}
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {filteredPlans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Aucun plan ne correspond à vos critères</p>
              <p className="text-sm">Essayez d'ajuster votre budget ou votre âge</p>
            </div>
          ) : (
            filteredPlans.map((plan, index) => (
              <Card
                key={plan.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  index === 0 ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => handlePlanClick(plan)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Provider Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-lg">{plan.provider}</span>
                        {index === 0 && (
                          <Badge className="bg-primary text-primary-foreground">
                            Recommandé
                          </Badge>
                        )}
                        {plan.discount && (
                          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">
                            {plan.discount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">{plan.planName}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        <span className="text-sm">{plan.rating}</span>
                      </div>
                    </div>

                    {/* Coverage Grid */}
                    <TooltipProvider>
                      <div className="flex gap-3">
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="flex flex-col items-center gap-1">
                              <Heart className="h-4 w-4" />
                              <CoverageIcon covered={plan.coverage.hospitalization} />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Hospitalisation</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="flex flex-col items-center gap-1">
                              <Info className="h-4 w-4" />
                              <CoverageIcon covered={plan.coverage.dental} />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Dentaire</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="flex flex-col items-center gap-1">
                              <Baby className="h-4 w-4" />
                              <CoverageIcon covered={plan.coverage.maternity} />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Maternité</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="flex flex-col items-center gap-1">
                              <Plane className="h-4 w-4" />
                              <CoverageIcon covered={plan.coverage.evacuation} />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Évacuation</TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>

                    {/* Price */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {plan.monthlyPremium.min}-{plan.monthlyPremium.max}€
                      </div>
                      <p className="text-xs text-muted-foreground">par mois</p>
                      <p className="text-xs mt-1">
                        Franchise: {plan.deductible === 0 ? 'Aucune' : `${plan.deductible}€`}
                      </p>
                    </div>

                    <Button variant="outline" className="md:ml-4">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Voir
                    </Button>
                  </div>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {plan.highlights.map((highlight, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          * Les prix sont indicatifs et varient selon votre profil et destination. Demandez un devis personnalisé.
        </p>
      </CardContent>
    </Card>
  );
}
