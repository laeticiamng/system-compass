import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';
import { 
  Laptop, 
  Palmtree, 
  GraduationCap, 
  TrendingUp, 
  ArrowRight, 
  MapPin,
  DollarSign,
  Shield,
  Heart,
  Clock,
  CheckCircle,
  Globe
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface PersonaType {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  description: string;
  targetAudience: string[];
  priorities: { label: string; icon: React.ElementType; value: number }[];
  topCountries: { id: string; name: string; flag: string; score: number; highlight: string }[];
  keyFeatures: string[];
  timeline: string;
  budgetRange: string;
}

const PERSONAS: PersonaType[] = [
  {
    id: 'digital-nomad',
    title: 'Digital Nomad',
    subtitle: 'Travaillez de n\'importe où',
    icon: Laptop,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    description: 'Pour les travailleurs à distance cherchant liberté géographique et optimisation fiscale.',
    targetAudience: [
      'Développeurs et designers freelance',
      'Créateurs de contenu',
      'Consultants en remote',
      'Entrepreneurs digitaux',
    ],
    priorities: [
      { label: 'Visa Nomad', icon: Globe, value: 95 },
      { label: 'Coût de vie', icon: DollarSign, value: 85 },
      { label: 'Internet rapide', icon: Laptop, value: 90 },
      { label: 'Communauté expat', icon: Heart, value: 75 },
    ],
    topCountries: [
      { id: 'portugal', name: 'Portugal', flag: '🇵🇹', score: 95, highlight: 'Visa D7 + NHR 20%' },
      { id: 'spain', name: 'Espagne', flag: '🇪🇸', score: 90, highlight: 'Visa Nomad + Beckham' },
      { id: 'uae', name: 'Dubaï', flag: '🇦🇪', score: 88, highlight: '0% impôt revenu' },
      { id: 'thailand', name: 'Thaïlande', flag: '🇹🇭', score: 85, highlight: 'Coût bas + LTV visa' },
      { id: 'mexico', name: 'Mexique', flag: '🇲🇽', score: 82, highlight: 'Timezone US + coût bas' },
    ],
    keyFeatures: [
      'Visa digital nomad ou remote work',
      'Fiscalité avantageuse (0-20%)',
      'Bonne connexion internet (>100 Mbps)',
      'Coworking et communauté active',
      'Coût de vie raisonnable',
    ],
    timeline: '3-6 mois',
    budgetRange: '1,500 - 4,000€/mois',
  },
  {
    id: 'retiree',
    title: 'Retraité',
    subtitle: 'Profitez de votre retraite au soleil',
    icon: Palmtree,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    description: 'Pour les retraités cherchant qualité de vie, climat agréable et optimisation fiscale des pensions.',
    targetAudience: [
      'Retraités français/européens',
      'Préretraités en transition',
      'Pensionnés cherchant meilleur pouvoir d\'achat',
      'Couples retraités aventuriers',
    ],
    priorities: [
      { label: 'Santé accessible', icon: Heart, value: 95 },
      { label: 'Coût de vie', icon: DollarSign, value: 90 },
      { label: 'Sécurité', icon: Shield, value: 88 },
      { label: 'Climat', icon: Palmtree, value: 85 },
    ],
    topCountries: [
      { id: 'portugal', name: 'Portugal', flag: '🇵🇹', score: 95, highlight: 'NHR pension + santé EU' },
      { id: 'spain', name: 'Espagne', flag: '🇪🇸', score: 92, highlight: 'Accord sécu FR + soleil' },
      { id: 'morocco', name: 'Maroc', flag: '🇲🇦', score: 88, highlight: 'Proximité + coût bas' },
      { id: 'thailand', name: 'Thaïlande', flag: '🇹🇭', score: 85, highlight: 'Visa retraité + santé qualité' },
      { id: 'greece', name: 'Grèce', flag: '🇬🇷', score: 82, highlight: '7% flat tax pensions' },
    ],
    keyFeatures: [
      'Accords sécurité sociale',
      'Système de santé accessible',
      'Fiscalité pensions avantageuse',
      'Climat agréable toute l\'année',
      'Coût de vie < France',
    ],
    timeline: '6-12 mois',
    budgetRange: '1,200 - 3,000€/mois',
  },
  {
    id: 'student',
    title: 'Étudiant',
    subtitle: 'Étudiez à l\'international',
    icon: GraduationCap,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    description: 'Pour les étudiants cherchant des études de qualité, bourses et opportunités de carrière internationale.',
    targetAudience: [
      'Étudiants post-bac',
      'Masters et doctorants',
      'Étudiants en échange',
      'Reconversion professionnelle',
    ],
    priorities: [
      { label: 'Qualité études', icon: GraduationCap, value: 95 },
      { label: 'Bourses dispo', icon: DollarSign, value: 88 },
      { label: 'Emploi après', icon: TrendingUp, value: 85 },
      { label: 'Coût études', icon: DollarSign, value: 80 },
    ],
    topCountries: [
      { id: 'germany', name: 'Allemagne', flag: '🇩🇪', score: 95, highlight: 'Études gratuites + stage' },
      { id: 'canada', name: 'Canada', flag: '🇨🇦', score: 92, highlight: 'Post-study work permit' },
      { id: 'netherlands', name: 'Pays-Bas', flag: '🇳🇱', score: 90, highlight: 'Masters anglais + EU' },
      { id: 'sweden', name: 'Suède', flag: '🇸🇪', score: 88, highlight: 'Gratuit EU + bourses' },
      { id: 'australia', name: 'Australie', flag: '🇦🇺', score: 85, highlight: 'Work & study visa' },
    ],
    keyFeatures: [
      'Reconnaissance internationale diplômes',
      'Programmes en anglais',
      'Bourses et aides disponibles',
      'Possibilité de travail étudiant',
      'Pathway vers emploi/résidence',
    ],
    timeline: '1-4 ans',
    budgetRange: '500 - 2,000€/mois',
  },
  {
    id: 'investor',
    title: 'Investisseur',
    subtitle: 'Résidence par investissement',
    icon: TrendingUp,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    description: 'Pour les investisseurs cherchant résidence ou citoyenneté via Golden Visa ou programmes CBI.',
    targetAudience: [
      'Entrepreneurs fortunés',
      'Investisseurs immobiliers',
      'Family offices',
      'HNWI cherchant Plan B',
    ],
    priorities: [
      { label: 'ROI investissement', icon: TrendingUp, value: 90 },
      { label: 'Temps résidence', icon: Clock, value: 85 },
      { label: 'Qualité passeport', icon: Globe, value: 88 },
      { label: 'Fiscalité', icon: DollarSign, value: 80 },
    ],
    topCountries: [
      { id: 'portugal', name: 'Portugal', flag: '🇵🇹', score: 92, highlight: 'Golden Visa 500k€ + EU' },
      { id: 'spain', name: 'Espagne', flag: '🇪🇸', score: 88, highlight: 'Golden Visa 500k€ immo' },
      { id: 'malta', name: 'Malte', flag: '🇲🇹', score: 85, highlight: 'CBI rapide + EU' },
      { id: 'uae', name: 'EAU', flag: '🇦🇪', score: 82, highlight: 'Golden Visa 2M AED' },
      { id: 'caribbean', name: 'Caraïbes', flag: '🏝️', score: 80, highlight: 'CBI 100-200k$ rapide' },
    ],
    keyFeatures: [
      'Golden Visa ou CBI',
      'Investissement minimum défini',
      'Délai d\'obtention connu',
      'Inclusion famille possible',
      'Qualité du passeport obtenu',
    ],
    timeline: '3-24 mois',
    budgetRange: '100k€ - 2M€+',
  },
];

function PersonaCard({ persona, isSelected, onClick }: { 
  persona: PersonaType; 
  isSelected: boolean;
  onClick: () => void;
}) {
  const Icon = persona.icon;
  
  return (
    <Card 
      className={cn(
        "glass-card cursor-pointer transition-all duration-300 hover:scale-[1.02]",
        isSelected && "ring-2 ring-primary border-primary"
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", persona.bgColor)}>
          <Icon className={cn("w-6 h-6", persona.color)} />
        </div>
        <h3 className="font-semibold text-lg mb-1">{persona.title}</h3>
        <p className="text-sm text-muted-foreground mb-3">{persona.subtitle}</p>
        <div className="flex flex-wrap gap-1.5">
          {persona.targetAudience.slice(0, 2).map((audience, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {audience}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PersonaDetail({ persona }: { persona: PersonaType }) {
  const navigate = useNavigate();
  const Icon = persona.icon;
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={cn("w-16 h-16 rounded-xl flex items-center justify-center", persona.bgColor)}>
          <Icon className={cn("w-8 h-8", persona.color)} />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{persona.title}</h2>
          <p className="text-muted-foreground">{persona.description}</p>
        </div>
      </div>
      
      {/* Quick Info */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <div className="text-sm text-muted-foreground">Timeline</div>
              <div className="font-medium">{persona.timeline}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-primary" />
            <div>
              <div className="text-sm text-muted-foreground">Budget mensuel</div>
              <div className="font-medium">{persona.budgetRange}</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Priorities */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Priorités clés</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {persona.priorities.map((priority, idx) => {
            const PriorityIcon = priority.icon;
            return (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PriorityIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{priority.label}</span>
                  </div>
                  <span className="text-sm font-medium">{priority.value}%</span>
                </div>
                <Progress value={priority.value} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>
      
      {/* Top Countries */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Destinations recommandées
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {persona.topCountries.map((country) => (
            <div 
              key={country.id}
              className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition-colors cursor-pointer"
              onClick={() => navigate(`/country/${country.id}`)}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{country.flag}</span>
                <div>
                  <div className="font-medium">{country.name}</div>
                  <div className="text-sm text-muted-foreground">{country.highlight}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={cn(
                  "font-medium",
                  country.score >= 90 ? "bg-emerald-500/20 text-emerald-400" :
                  country.score >= 80 ? "bg-amber-500/20 text-amber-400" :
                  "bg-secondary"
                )}>
                  {country.score}%
                </Badge>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      
      {/* Key Features */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Critères essentiels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {persona.keyFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* CTA */}
      <Button 
        className="w-full gap-2" 
        size="lg"
        onClick={() => navigate('/exit-keys')}
      >
        Trouver mes recommandations
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default function PersonaJourneys() {
  const { t } = useTranslation();
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>(PERSONAS[0]);
  
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
          {t('personaJourneys.title', 'Parcours personnalisés')}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t('personaJourneys.description', 'Choisissez votre profil pour découvrir les meilleures destinations et stratégies adaptées à votre situation.')}
        </p>
      </div>
      
      {/* Persona Selection */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {PERSONAS.map((persona) => (
          <PersonaCard
            key={persona.id}
            persona={persona}
            isSelected={selectedPersona.id === persona.id}
            onClick={() => setSelectedPersona(persona)}
          />
        ))}
      </div>
      
      {/* Selected Persona Detail */}
      <PersonaDetail persona={selectedPersona} />
    </div>
  );
}
