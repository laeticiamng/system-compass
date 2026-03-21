import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Users,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  Briefcase,
  GraduationCap,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Quote,
  FileText,
  Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

// Types for case study system
interface CaseStudyProfile {
  name: string;
  age: number;
  nationality: string;
  profession: string;
  familySituation: string;
  currentLocation: string;
  income: string;
  patrimony: string;
  motivation: string;
}

interface CaseStudyChallenge {
  category: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

interface CaseStudyDecision {
  phase: string;
  decision: string;
  rationale: string;
  outcome: 'success' | 'partial' | 'failure';
  lesson: string;
}

interface CaseStudyMetrics {
  timeToSettle: string;
  totalCost: string;
  satisfactionScore: number;
  unexpectedChallenges: number;
  keySuccessFactors: string[];
}

interface CaseStudy {
  id: string;
  title: string;
  subtitle: string;
  category: 'relocation' | 'business' | 'investment' | 'retirement';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: string;
  destinations: string[];
  profile: CaseStudyProfile;
  context: string;
  objectives: string[];
  constraints: string[];
  challenges: CaseStudyChallenge[];
  decisions: CaseStudyDecision[];
  metrics: CaseStudyMetrics;
  recommendations: string[];
  expertInsights: string[];
  sources?: string[];
}

// PLACEHOLDER: Replace with real data from Supabase when case study system is implemented
const mockCaseStudies: CaseStudy[] = [
  {
    id: 'case-1',
    title: 'Expatriation Tech vers Lisbonne',
    subtitle: 'Optimisation fiscale NHR et qualité de vie',
    category: 'relocation',
    difficulty: 'intermediate',
    duration: '45 min',
    destinations: ['Portugal', 'Lisbonne'],
    profile: {
      name: 'Profil type (exemple académique)',
      age: 38,
      nationality: 'Française',
      profession: 'CTO Startup / Product Designer',
      familySituation: 'Mariés, 2 enfants (5 et 8 ans)',
      currentLocation: 'Paris, France',
      income: '180k€/an combinés',
      patrimony: '~450k€ (appartement Paris + épargne)',
      motivation: 'Qualité de vie, coût du logement, climat, fiscalité'
    },
    context: `Après 12 ans de carrière dans la tech parisienne, Thomas (CTO) et Marie (Product Designer freelance) 
    ressentent une lassitude face au coût de la vie parisien et à la pression professionnelle. La vente de leur 
    appartement parisien et le passage au télétravail intégral ouvrent de nouvelles perspectives. Le Portugal, 
    avec son régime NHR (Non-Habitual Resident), apparaît comme une option attractive.`,
    objectives: [
      'Réduire la pression fiscale globale de 30%+',
      'Améliorer la qualité de vie familiale (espace, climat, rythme)',
      'Maintenir les revenus actuels en télétravail',
      'Scolariser les enfants dans un système international',
      'Conserver la flexibilité pour voyager (clients français)'
    ],
    constraints: [
      'Budget installation: 50k€ maximum',
      'Besoin de revenus stables dès M+3',
      'Scolarisation en septembre impératif',
      'Marie doit conserver sa clientèle française',
      'Thomas a une clause de non-concurrence de 12 mois'
    ],
    challenges: [
      { category: 'Fiscal', description: 'Complexité du dossier NHR et timing d\'application', severity: 'high' },
      { category: 'Logement', description: 'Marché locatif tendu à Lisbonne, peu d\'offres pour familles', severity: 'high' },
      { category: 'Admin', description: 'Obtention NIF et ouverture compte bancaire à distance', severity: 'medium' },
      { category: 'Éducation', description: 'Places limitées dans les écoles internationales', severity: 'medium' },
      { category: 'Social', description: 'Intégration et construction d\'un réseau local', severity: 'low' }
    ],
    decisions: [
      {
        phase: 'Préparation (M-6)',
        decision: 'Engagement d\'un avocat fiscaliste franco-portugais',
        rationale: 'Sécuriser le dossier NHR avant le déménagement pour éviter les erreurs coûteuses',
        outcome: 'success',
        lesson: 'L\'investissement initial en conseil spécialisé (3.5k€) a évité des erreurs potentiellement coûteuses de 20k€+'
      },
      {
        phase: 'Préparation (M-4)',
        decision: 'Voyage de reconnaissance de 10 jours en famille',
        rationale: 'Valider le choix du quartier, visiter les écoles, rencontrer la communauté expat',
        outcome: 'success',
        lesson: 'Le scouting terrain a permis d\'identifier Cascais (banlieue) plutôt que Lisbonne centre, plus adapté aux familles'
      },
      {
        phase: 'Transition (M-2)',
        decision: 'Location Airbnb 3 mois avant location longue durée',
        rationale: 'Éviter l\'engagement long terme sans connaissance du terrain',
        outcome: 'partial',
        lesson: 'Surcoût de 40% mais flexibilité précieuse. Recommandation: négocier un bail avec période d\'essai'
      },
      {
        phase: 'Installation (M+1)',
        decision: 'Création de société portugaise pour Marie (Unipessoal Lda)',
        rationale: 'Optimiser le statut NHR pour les revenus de freelance',
        outcome: 'success',
        lesson: 'La structure juridique adaptée a permis un taux effectif de 20% vs 45% en France'
      },
      {
        phase: 'Stabilisation (M+6)',
        decision: 'Achat d\'un bien immobilier à Cascais',
        rationale: 'Prix attractifs, stabilité familiale, Golden Visa non nécessaire (UE)',
        outcome: 'success',
        lesson: 'Attendre 6 mois d\'observation avant d\'acheter : connaissance du marché et des quartiers'
      }
    ],
    metrics: {
      timeToSettle: '8 mois',
      totalCost: '42,000€',
      satisfactionScore: 8.5,
      unexpectedChallenges: 3,
      keySuccessFactors: [
        'Préparation fiscale anticipée',
        'Voyage de scouting en famille',
        'Flexibilité sur le quartier initial',
        'Réseau expat actif',
        'Patience sur l\'immobilier'
      ]
    },
    recommendations: [
      'Engager un fiscaliste spécialisé NHR dès M-6',
      'Prévoir un budget "tampon" de 30% pour les imprévus',
      'Inscription scolaire à lancer dès M-8 (listes d\'attente)',
      'Considérer la banlieue plutôt que le centre pour les familles',
      'Rejoindre les communautés expat avant le déménagement'
    ],
    expertInsights: [
      '"Le régime NHR reste attractif mais les conditions se sont durcies depuis 2023. Anticipez les évolutions réglementaires." — Me. Silva, avocat fiscaliste',
      '"L\'erreur classique est de se précipiter sur le centre de Lisbonne. Cascais, Estoril et Sintra offrent souvent un meilleur rapport qualité/prix pour les familles." — Agence Relocate Portugal',
      '"La scolarisation est le vrai goulot d\'étranglement. Les meilleures écoles internationales ont des listes d\'attente de 12-18 mois." — International School Cascais'
    ],
    sources: [
      'Entretiens anonymisés (famille L., 2024)',
      'Données fiscales NHR (Tax Authority Portugal)',
      'Rapport Expat Insider 2024 (InterNations)'
    ]
  },
  {
    id: 'case-2',
    title: 'Création de filiale à Singapour',
    subtitle: 'Hub régional APAC pour scale-up B2B SaaS',
    category: 'business',
    difficulty: 'advanced',
    duration: '60 min',
    destinations: ['Singapour'],
    profile: {
      name: 'Scale-up TechVision (anonymisé)',
      age: 0,
      nationality: 'Française',
      profession: 'B2B SaaS - Cybersécurité',
      familySituation: 'Équipe de 45 personnes (Paris)',
      currentLocation: 'Paris, France',
      income: 'ARR 8M€, croissance +80% YoY',
      patrimony: 'Série A (12M€, 2023)',
      motivation: 'Expansion APAC, proximité clients, hub régional'
    },
    context: `TechVision, scale-up française spécialisée en cybersécurité B2B, a levé 12M€ en Série A avec 
    pour objectif d'accélérer son expansion internationale. Le marché APAC représente 35% des leads 
    entrants mais 0% du CA actuel faute de présence locale. Les clients entreprises exigent une entité 
    locale pour des questions de conformité et de support.`,
    objectives: [
      'Établir une présence commerciale opérationnelle en 6 mois',
      'Recruter une équipe locale de 5-8 personnes (Sales, CS, Legal)',
      'Générer 500k€ de CA APAC en Year 1',
      'Structurer fiscalement les opérations inter-régions',
      'Préparer l\'expansion vers l\'Australie et le Japon (Year 2)'
    ],
    constraints: [
      'Budget année 1: 800k€ (incluant pertes opérationnelles)',
      'Pas de relocation du management français',
      'Conformité PDPA (Singapore) et GDPR (clients EU)',
      'Time-to-market critique (concurrence US agressive)',
      'Culture remote-first à maintenir'
    ],
    challenges: [
      { category: 'Recrutement', description: 'Marché du talent tech très compétitif, salaires élevés', severity: 'high' },
      { category: 'Structure', description: 'Choix entre Branch Office et Pte Ltd (implications fiscales)', severity: 'high' },
      { category: 'Pricing', description: 'Adaptation du modèle tarifaire aux standards APAC', severity: 'medium' },
      { category: 'Culture', description: 'Management remote cross-timezone (8h de décalage)', severity: 'medium' },
      { category: 'Compliance', description: 'Double conformité GDPR + PDPA pour le produit', severity: 'medium' }
    ],
    decisions: [
      {
        phase: 'Structuration (M-3)',
        decision: 'Création d\'une Private Limited Company (Pte Ltd) plutôt que Branch',
        rationale: 'Autonomie juridique, éligibilité aux incentives startup, meilleure perception par les clients locaux',
        outcome: 'success',
        lesson: 'La Pte Ltd a permis d\'accéder au programme Startup SG Founder (jusqu\'à 50k SGD de matching)'
      },
      {
        phase: 'Recrutement (M-2)',
        decision: 'Engagement d\'un Country Manager senior via chasseur de têtes spécialisé',
        rationale: 'Besoin d\'un leader local avec réseau et crédibilité immédiate',
        outcome: 'success',
        lesson: 'Le coût du recrutement (30k€) a été amorti en 3 mois via le réseau du CM qui a apporté 2 deals signés'
      },
      {
        phase: 'Go-to-Market (M+1)',
        decision: 'Participation au Singapore Fintech Festival comme exposant',
        rationale: 'Visibilité immédiate auprès de la cible (banques, assurances APAC)',
        outcome: 'partial',
        lesson: 'ROI direct limité mais excellent pour la notoriété. Combiner avec campagne ABM ciblée pour maximiser'
      },
      {
        phase: 'Opérations (M+3)',
        decision: 'Outsourcing du back-office (accounting, payroll) à un cabinet local',
        rationale: 'Focus sur le core business, expertise locale sur les spécificités singapouriennes',
        outcome: 'success',
        lesson: 'Économie de 40% vs recrutement interne, flexibilité maintenue'
      }
    ],
    metrics: {
      timeToSettle: '5 mois',
      totalCost: '650,000€ (Year 1)',
      satisfactionScore: 8.0,
      unexpectedChallenges: 4,
      keySuccessFactors: [
        'Country Manager de qualité recruté tôt',
        'Structure Pte Ltd avec incentives locaux',
        'Partenariat avec cabinet local',
        'Focus initial sur 2-3 vertical clients',
        'Communication régulière avec le board'
      ]
    },
    recommendations: [
      'Structurer en Pte Ltd dès le départ pour maximiser les incentives',
      'Investir dans un CM senior local (ne pas économiser sur ce poste)',
      'Prévoir un trip mensuel d\'un executive pour les 6 premiers mois',
      'Adapter le pricing (généralement -20% vs Europe pour des deals volume)',
      'Anticiper les coûts de compliance data (PDPA audit obligatoire)'
    ],
    expertInsights: [
      '"Singapour n\'est pas cher en soi, mais le coût du talent tech est comparable à la Bay Area. Budget en conséquence." — DG, EDB France',
      '"Le vrai avantage de Singapour n\'est pas fiscal (17% IS) mais l\'écosystème, les accords de libre-échange et la stabilité." — Partner, EY Singapore',
      '"Les entreprises européennes sous-estiment systématiquement le temps d\'adaptation culturelle. Prévoyez 12 mois, pas 6." — MD, Roland Berger APAC'
    ],
    sources: [
      'Entretiens dirigeants TechVision (anonymisés)',
      'EDB Singapore - Startup Guide 2024',
      'KPMG - Doing Business in Singapore 2024'
    ]
  }
];

export function CaseStudySystem() {
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getDifficultyColor = (difficulty: CaseStudy['difficulty']): string => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/10 text-green-600';
      case 'intermediate': return 'bg-blue-500/10 text-blue-600';
      case 'advanced': return 'bg-purple-500/10 text-purple-600';
      case 'expert': return 'bg-red-500/10 text-red-600';
    }
  };

  const getCategoryIcon = (category: CaseStudy['category']) => {
    switch (category) {
      case 'relocation': return MapPin;
      case 'business': return Briefcase;
      case 'investment': return DollarSign;
      case 'retirement': return Users;
    }
  };

  if (selectedCase) {
    return (
      <CaseStudyDetail 
        caseStudy={selectedCase} 
        onBack={() => setSelectedCase(null)}
        expandedSections={expandedSections}
        toggleSection={toggleSection}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-xl p-6 border-l-4 border-primary">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-2xl font-bold mb-2">
              Études de Cas HEC / INSEAD
            </h2>
            <p className="text-muted-foreground">
              Cas pratiques anonymisés basés sur des situations réelles. Méthodologie case study 
              des grandes écoles de commerce pour l'apprentissage par l'expérience.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline" className="gap-1">
                <BookOpen className="w-3 h-3" />
                {mockCaseStudies.length} cas disponibles
              </Badge>
              <Badge variant="outline">Relocation</Badge>
              <Badge variant="outline">Business</Badge>
              <Badge variant="outline">Investment</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Case Study Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {mockCaseStudies.map((cs) => {
          const CategoryIcon = getCategoryIcon(cs.category);
          
          return (
            <motion.div
              key={cs.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              className="cursor-pointer"
              onClick={() => setSelectedCase(cs)}
            >
              <Card className="h-full hover:border-primary/50 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CategoryIcon className="w-5 h-5 text-primary" />
                      <Badge variant="outline" className="capitalize">{cs.category}</Badge>
                    </div>
                    <Badge className={getDifficultyColor(cs.difficulty)}>
                      {cs.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{cs.title}</CardTitle>
                  <CardDescription>{cs.subtitle}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {cs.destinations.map((dest) => (
                        <Badge key={dest} variant="secondary" className="text-xs">
                          <MapPin className="w-3 h-3 mr-1" />
                          {dest}
                        </Badge>
                      ))}
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {cs.context}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {cs.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {cs.objectives.length} objectifs
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-1">
                        Étudier <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Case Study Detail Component
function CaseStudyDetail({ 
  caseStudy, 
  onBack,
  expandedSections,
  toggleSection
}: { 
  caseStudy: CaseStudy; 
  onBack: () => void;
  expandedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
}) {
  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high': return 'bg-red-500/10 text-red-600 border-red-200';
      case 'medium': return 'bg-amber-500/10 text-amber-600 border-amber-200';
      case 'low': return 'bg-green-500/10 text-green-600 border-green-200';
    }
  };

  const getOutcomeIcon = (outcome: 'success' | 'partial' | 'failure') => {
    switch (outcome) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'partial': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'failure': return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>← Retour aux cas</Button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold">{caseStudy.title}</h1>
          <p className="text-muted-foreground">{caseStudy.subtitle}</p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Clock className="w-3 h-3" />
          {caseStudy.duration}
        </Badge>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Profil du Cas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Protagoniste</p>
              <p className="font-semibold">{caseStudy.profile.name}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Profession</p>
              <p className="font-semibold">{caseStudy.profile.profession}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Revenus</p>
              <p className="font-semibold">{caseStudy.profile.income}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Patrimoine</p>
              <p className="font-semibold">{caseStudy.profile.patrimony}</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-primary/5 rounded-lg">
            <p className="text-sm font-medium mb-1">Motivation principale</p>
            <p className="text-sm text-muted-foreground">{caseStudy.profile.motivation}</p>
          </div>
        </CardContent>
      </Card>

      {/* Context */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Contexte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{caseStudy.context}</p>
        </CardContent>
      </Card>

      {/* Objectives & Constraints */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Target className="w-5 h-5" />
              Objectifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {caseStudy.objectives.map((obj, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Contraintes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {caseStudy.constraints.map((constraint, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <span>{constraint}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Challenges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Défis Rencontrés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {caseStudy.challenges.map((challenge, idx) => (
              <div 
                key={idx} 
                className={cn("p-4 rounded-lg border", getSeverityColor(challenge.severity))}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{challenge.category}</Badge>
                  <Badge className={getSeverityColor(challenge.severity)}>
                    {challenge.severity}
                  </Badge>
                </div>
                <p className="text-sm">{challenge.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Decision Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Chronologie des Décisions Clés
          </CardTitle>
          <CardDescription>
            Analyse des choix stratégiques et de leurs impacts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {caseStudy.decisions.map((decision, idx) => (
              <Collapsible 
                key={idx}
                open={expandedSections[`decision-${idx}`]}
                onOpenChange={() => toggleSection(`decision-${idx}`)}
              >
                <div className="glass-card rounded-lg p-4 border">
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getOutcomeIcon(decision.outcome)}
                        <div className="text-left">
                          <Badge variant="outline" className="mb-1">{decision.phase}</Badge>
                          <p className="font-semibold">{decision.decision}</p>
                        </div>
                      </div>
                      {expandedSections[`decision-${idx}`] 
                        ? <ChevronUp className="w-5 h-5" />
                        : <ChevronDown className="w-5 h-5" />
                      }
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Raisonnement</p>
                        <p className="text-sm">{decision.rationale}</p>
                      </div>
                      <div className="p-3 bg-primary/5 rounded-lg">
                        <p className="text-xs font-medium text-primary mb-1 flex items-center gap-1">
                          <Lightbulb className="w-3 h-3" />
                          Leçon retenue
                        </p>
                        <p className="text-sm">{decision.lesson}</p>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Résultats & Métriques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Durée totale</p>
              <p className="text-2xl font-bold text-primary">{caseStudy.metrics.timeToSettle}</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Coût total</p>
              <p className="text-2xl font-bold text-primary">{caseStudy.metrics.totalCost}</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Satisfaction</p>
              <p className="text-2xl font-bold text-primary">{caseStudy.metrics.satisfactionScore}/10</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Imprévus</p>
              <p className="text-2xl font-bold text-amber-500">{caseStudy.metrics.unexpectedChallenges}</p>
            </div>
          </div>
          
          <div>
            <p className="font-medium mb-3">Facteurs clés de succès</p>
            <div className="flex flex-wrap gap-2">
              {caseStudy.metrics.keySuccessFactors.map((factor, idx) => (
                <Badge key={idx} variant="secondary" className="text-sm">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {factor}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expert Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Quote className="w-5 h-5" />
            Éclairages d'Experts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {caseStudy.expertInsights.map((insight, idx) => (
              <div key={idx} className="p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
                <p className="text-sm italic">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Lightbulb className="w-5 h-5" />
            Recommandations Clés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {caseStudy.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                  {idx + 1}
                </span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Sources */}
      {caseStudy.sources && (
        <div className="text-xs text-muted-foreground p-4 bg-muted/30 rounded-lg">
          <p className="font-medium mb-2">Sources</p>
          <ul className="space-y-1">
            {caseStudy.sources.map((source, idx) => (
              <li key={idx}>• {source}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CaseStudySystem;
