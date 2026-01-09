import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Brain,
  Plus,
  Search,
  Filter,
  Download,
  Shield,
  Lock,
  Users,
  GitBranch,
  History,
  Eye,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DecisionTree } from './DecisionTree';
import { CreateDecisionForm } from './CreateDecisionForm';
import { DecisionNode, DecisionNodeData } from './DecisionNode';
import { useSubscription } from '@/hooks/useSubscription';
import { PremiumPaywall } from '@/components/PremiumPaywall';

// Demo data for the decision tree
const DEMO_DECISIONS: DecisionNodeData[] = [
  {
    id: 'dec-001',
    title: 'Expansion internationale - Choix du marché',
    context: "L'entreprise a atteint une maturité sur le marché français et cherche à se développer à l'international. Le board a validé un budget d'expansion de 2M€ sur 18 mois.",
    mainHypothesis: "Le marché allemand offre le meilleur ratio opportunité/risque grâce à sa proximité culturelle, sa taille et la maturité de ses clients B2B.",
    alternativeHypotheses: [
      "Le marché UK pourrait offrir une croissance plus rapide malgré le Brexit",
      "Le marché espagnol serait plus accessible linguistiquement"
    ],
    constraints: ['Budget 2M€', 'Pas de recrutement massif', 'ROI attendu 18 mois'],
    decision: "Lancer sur le marché allemand avec un bureau à Berlin et une équipe locale de 3 personnes.",
    date: '2024-01-15',
    author: 'Comité de Direction',
    scope: 'Stratégique',
    status: 'validated',
    abandonedBranches: [
      {
        title: 'Expansion UK',
        reason: 'Complexité post-Brexit et coûts d\'entrée trop élevés'
      },
      {
        title: 'Expansion Espagne',
        reason: 'Marché moins mature pour notre offre B2B'
      }
    ],
    children: [
      {
        id: 'dec-002',
        title: 'Recrutement du Country Manager Allemagne',
        context: 'Suite à la décision d\'expansion, nous devons recruter un leader local pour piloter le lancement.',
        mainHypothesis: 'Un profil senior avec réseau établi accélérera la pénétration du marché.',
        alternativeHypotheses: [
          'Détacher un collaborateur français bilingue serait moins risqué'
        ],
        constraints: ['Salaire marché allemand', 'Disponible sous 3 mois'],
        decision: 'Recruter en externe un Country Manager allemand avec 10+ ans d\'expérience B2B SaaS.',
        date: '2024-02-01',
        author: 'DRH + CEO',
        scope: 'Opérationnel',
        status: 'validated',
        abandonedBranches: [
          {
            title: 'Détachement interne',
            reason: 'Aucun profil disponible avec le niveau d\'allemand requis'
          }
        ]
      },
      {
        id: 'dec-003',
        title: 'Choix de la localisation du bureau',
        context: 'Le Country Manager doit avoir un bureau pour constituer l\'équipe locale.',
        mainHypothesis: 'Berlin offre le meilleur vivier de talents tech et startup.',
        alternativeHypotheses: [
          'Munich serait plus proche des grands comptes industriels',
          'Francfort offrirait une meilleure accessibilité européenne'
        ],
        constraints: ['Loyer max 5k€/mois', 'Centre-ville', 'Prêt sous 2 mois'],
        decision: 'Louer un espace de coworking à Berlin Mitte avec option d\'extension.',
        date: '2024-02-15',
        author: 'Country Manager + DG',
        scope: 'Opérationnel',
        status: 'validated',
        abandonedBranches: []
      }
    ]
  },
  {
    id: 'dec-004',
    title: 'Refonte de la politique tarifaire',
    context: 'Les retours clients et l\'analyse concurrentielle montrent que notre pricing est complexe et peu compétitif sur certains segments.',
    mainHypothesis: 'Un pricing simplifié avec 3 tiers augmentera la conversion et réduira les négociations.',
    alternativeHypotheses: [
      'Garder le pricing actuel mais ajouter des remises automatiques',
      'Passer à un modèle usage-based'
    ],
    constraints: ['Ne pas réduire le revenu moyen', 'Transition clients existants'],
    decision: 'Adopter un nouveau pricing en 3 tiers (Starter, Pro, Enterprise) avec migration progressive des clients existants.',
    date: '2024-03-01',
    author: 'CPO + CFO',
    scope: 'Stratégique',
    status: 'pending',
    abandonedBranches: [
      {
        title: 'Modèle usage-based',
        reason: 'Trop complexe à implémenter techniquement à court terme'
      }
    ]
  }
];

export function TraceOS() {
  const { t } = useTranslation();
  const { canAccessPro } = useSubscription();
  const [decisions, setDecisions] = useState<DecisionNodeData[]>(DEMO_DECISIONS);
  const [selectedDecision, setSelectedDecision] = useState<DecisionNodeData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateDecision = (newDecision: Omit<DecisionNodeData, 'id' | 'children'>) => {
    const decision: DecisionNodeData = {
      ...newDecision,
      id: `dec-${Date.now()}`,
      children: []
    };
    setDecisions(prev => [...prev, decision]);
    setIsCreating(false);
  };

  if (!canAccessPro) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <Badge className="mb-4 px-4 py-1.5 bg-gradient-to-r from-primary/20 to-amber-500/20 border-primary/30">
            <Brain className="w-3.5 h-3.5 mr-2" />
            {t('traceOS.badge', 'TraceOS - Mémoire Décisionnelle')}
          </Badge>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
            {t('traceOS.title', 'Traçabilité Intellectuelle')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('traceOS.subtitle', 'Documentez vos décisions stratégiques, conservez la mémoire des hypothèses, visualisez les bifurcations.')}
          </p>
        </div>

        <PremiumPaywall 
          tier="pro"
          title={t('traceOS.paywall.title', 'Fonctionnalité Pro')}
          description={t('traceOS.paywall.description', 'Accédez à TraceOS, le module de traçabilité décisionnelle pour les organisations.')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="px-3 py-1 bg-gradient-to-r from-primary/20 to-amber-500/20 border-primary/30">
              <Brain className="w-3.5 h-3.5 mr-2" />
              TraceOS
            </Badge>
            <Badge variant="outline" className="border-green-500/30 text-green-700">
              <Lock className="w-3 h-3 mr-1" />
              B2B
            </Badge>
          </div>
          <h2 className="font-display text-2xl font-bold">
            {t('traceOS.title', 'Traçabilité Intellectuelle')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('traceOS.subtitle', 'Mémoire stratégique de votre organisation')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            {t('traceOS.export', 'Exporter')}
          </Button>
          <Button onClick={() => setIsCreating(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            {t('traceOS.newDecision', 'Nouvelle décision')}
          </Button>
        </div>
      </div>

      {/* Value Props */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ValueCard 
          icon={<GitBranch className="w-5 h-5" />}
          title={t('traceOS.values.tree.title', 'Arbre décisionnel')}
          description={t('traceOS.values.tree.desc', 'Visualisez les enchaînements')}
        />
        <ValueCard 
          icon={<History className="w-5 h-5" />}
          title={t('traceOS.values.memory.title', 'Mémoire stratégique')}
          description={t('traceOS.values.memory.desc', 'Conservez les hypothèses')}
        />
        <ValueCard 
          icon={<Eye className="w-5 h-5" />}
          title={t('traceOS.values.branches.title', 'Branches abandonnées')}
          description={t('traceOS.values.branches.desc', 'Gardez trace des alternatives')}
        />
        <ValueCard 
          icon={<Shield className="w-5 h-5" />}
          title={t('traceOS.values.governance.title', 'Gouvernance')}
          description={t('traceOS.values.governance.desc', 'Historique non modifiable')}
        />
      </div>

      <Separator />

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('traceOS.searchPlaceholder', 'Rechercher une décision...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <CreateDecisionForm
          onSubmit={handleCreateDecision}
          onCancel={() => setIsCreating(false)}
        />
      )}

      {/* Decision Tree */}
      <Tabs defaultValue="tree" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tree" className="gap-2">
            <GitBranch className="w-4 h-4" />
            {t('traceOS.tabs.tree', 'Arbre')}
          </TabsTrigger>
          <TabsTrigger value="review" className="gap-2">
            <History className="w-4 h-4" />
            {t('traceOS.tabs.review', 'Relecture')}
          </TabsTrigger>
          <TabsTrigger value="governance" className="gap-2">
            <Users className="w-4 h-4" />
            {t('traceOS.tabs.governance', 'Gouvernance')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tree">
          <DecisionTree
            decisions={decisions}
            onSelectDecision={setSelectedDecision}
            selectedDecisionId={selectedDecision?.id}
          />
        </TabsContent>

        <TabsContent value="review">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                {t('traceOS.review.title', 'Relecture stratégique')}
              </CardTitle>
              <CardDescription>
                {t('traceOS.review.desc', 'Analysez l\'enchaînement des décisions et identifiez les moments de rupture.')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Eye className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>{t('traceOS.review.selectDecision', 'Sélectionnez une décision dans l\'arbre pour lancer une relecture.')}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="governance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {t('traceOS.governance.title', 'Gouvernance & Accès')}
              </CardTitle>
              <CardDescription>
                {t('traceOS.governance.desc', 'Gérez les droits d\'accès et la traçabilité des modifications.')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-muted/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{t('traceOS.governance.appendOnly', 'Append-only')}</h4>
                        <p className="text-sm text-muted-foreground">{t('traceOS.governance.appendOnlyDesc', 'L\'historique est non modifiable')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{t('traceOS.governance.roles', 'Gestion des rôles')}</h4>
                        <p className="text-sm text-muted-foreground">{t('traceOS.governance.rolesDesc', 'Lecture / Écriture par utilisateur')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Disclaimer */}
      <div className="p-4 rounded-lg bg-muted/30 border text-center">
        <p className="text-xs text-muted-foreground">
          {t('traceOS.disclaimer', 'TraceOS est un outil de documentation et de traçabilité. Il ne remplace pas le jugement humain ni le processus de décision.')}
        </p>
      </div>
    </div>
  );
}

function ValueCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="bg-muted/30">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
          <div>
            <h4 className="font-medium text-sm">{title}</h4>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
