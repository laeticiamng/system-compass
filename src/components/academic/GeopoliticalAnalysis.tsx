import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Shield,
  Scale,
  TrendingUp,
  AlertTriangle,
  Building,
  FileText,
  Flag,
  Award,
  Zap,
  BookOpen
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { cn } from '@/lib/utils';

// Types for geopolitical analysis
interface PowerIndex {
  dimension: string;
  score: number;
  global_rank: number;
  trend: 'up' | 'down' | 'stable';
  details: string;
}

interface InstitutionalIndicator {
  name: string;
  value: number;
  source: string;
  year: number;
  interpretation: string;
}

interface LegalFramework {
  domain: string;
  framework: string;
  investor_friendly: 'high' | 'medium' | 'low';
  stability: 'high' | 'medium' | 'low';
  key_points: string[];
}

interface GeopoliticalRisk {
  category: string;
  level: 'critical' | 'high' | 'medium' | 'low';
  probability: number;
  impact: number;
  description: string;
  mitigations: string[];
}

interface SoftPowerMetric {
  category: string;
  score: number;
  components: { name: string; value: number }[];
}

interface GeopoliticalAnalysisProps {
  countryCode?: string;
  countryName?: string;
  onExportReport?: () => void;
}

// Mock data for demonstration
const mockPowerIndices: PowerIndex[] = [
  { dimension: 'Économique', score: 76, global_rank: 7, trend: 'down', details: 'PIB nominal en recul relatif, coûts énergétiques post-Ukraine, dette publique élevée (112% PIB)' },
  { dimension: 'Militaire', score: 78, global_rank: 5, trend: 'up', details: 'Budget défense porté à 2.4% PIB (post-Ukraine). Industrie de défense en expansion. OTAN renforcé.' },
  { dimension: 'Diplomatique', score: 82, global_rank: 5, trend: 'down', details: 'Siège ONU, G7. Influence réduite au Sahel (retrait Mali/Burkina/Niger). Médiation Moyen-Orient limitée.' },
  { dimension: 'Technologique', score: 70, global_rank: 8, trend: 'up', details: 'IA (Mistral), quantique, spatial. Mais dépendance aux semi-conducteurs asiatiques.' },
  { dimension: 'Culturel', score: 90, global_rank: 2, trend: 'stable', details: 'Soft power toujours fort. JO 2024 boost. Francophonie fragilisée par pertes en Afrique.' },
  { dimension: 'Juridique', score: 73, global_rank: 9, trend: 'down', details: 'État de droit sous tension. Réformes contestées. Mais arbitrage international reste fort (ICC Paris).' },
];

const mockInstitutionalIndicators: InstitutionalIndicator[] = [
  { name: 'Ease of Doing Business', value: 32, source: 'World Bank', year: 2025, interpretation: 'Top 20% mondial — mais lourdeur administrative persistante' },
  { name: 'Corruption Perception Index', value: 69, source: 'Transparency International', year: 2025, interpretation: 'Légère dégradation — affaires de financement politique' },
  { name: 'Rule of Law Index', value: 0.71, source: 'World Justice Project', year: 2025, interpretation: 'État de droit sous tension (mouvements sociaux, réformes contestées)' },
  { name: 'Economic Freedom Index', value: 64.2, source: 'Heritage Foundation', year: 2026, interpretation: 'Modérément libre — pression fiscale en hausse' },
  { name: 'Global Peace Index', value: 1.89, source: 'IEP', year: 2025, interpretation: 'Paix relative mais contexte géopolitique tendu (OTAN, Sahel)' },
  { name: 'Human Development Index', value: 0.901, source: 'UNDP', year: 2025, interpretation: 'Développement très élevé — léger recul QoL' },
  { name: 'Political Stability Index', value: 0.32, source: 'World Bank', year: 2025, interpretation: 'En baisse — tensions sociales, contexte guerre Ukraine' },
  { name: 'Press Freedom Index', value: 28, source: 'RSF', year: 2025, interpretation: 'Situation satisfaisante mais pressions croissantes' },
];

const mockLegalFrameworks: LegalFramework[] = [
  {
    domain: 'Droit des sociétés',
    framework: 'Code de Commerce, Loi PACTE 2019',
    investor_friendly: 'high',
    stability: 'high',
    key_points: ['SAS simplifiée', 'Création en 24h', 'Capital minimum 1€', 'Gouvernance flexible']
  },
  {
    domain: 'Droit du travail',
    framework: 'Code du Travail, Ordonnances Macron 2017',
    investor_friendly: 'medium',
    stability: 'medium',
    key_points: ['CDI par défaut', 'Rupture conventionnelle', 'CSE obligatoire >11 salariés', 'Réforme continue']
  },
  {
    domain: 'Propriété intellectuelle',
    framework: 'Code PI, Convention de Paris, Règlements UE',
    investor_friendly: 'high',
    stability: 'high',
    key_points: ['INPI centralisé', 'Brevets européens', 'Droits d\'auteur automatiques', 'Crédit impôt recherche']
  },
  {
    domain: 'Fiscalité des entreprises',
    framework: 'CGI, Conventions bilatérales, Directive ATAD',
    investor_friendly: 'medium',
    stability: 'medium',
    key_points: ['IS 25%', 'Régimes spéciaux (JEI, IP Box)', 'CIR généreux', 'Holding privilégié']
  },
  {
    domain: 'Arbitrage et résolution des litiges',
    framework: 'CPC, ICC Paris, CMAP',
    investor_friendly: 'high',
    stability: 'high',
    key_points: ['Paris place d\'arbitrage mondial', 'Chambre commerciale internationale', 'Médiation encouragée']
  },
];

const mockGeopoliticalRisks: GeopoliticalRisk[] = [
  {
    category: 'Guerre Russie-Ukraine (impact indirect)',
    level: 'high',
    probability: 85,
    impact: 75,
    description: 'Conflit armé en cours depuis 2022. Sanctions UE massives, hausse des coûts énergétiques (+40-60%), perturbation des chaînes d\'approvisionnement. Risque d\'escalade nucléaire faible mais non nul. Dépenses militaires en hausse.',
    mitigations: ['Diversification énergétique', 'Renforcement défense européenne', 'Sanctions progressives', 'Supply chain résiliente']
  },
  {
    category: 'Conflit Israël-Gaza / Moyen-Orient',
    level: 'high',
    probability: 70,
    impact: 65,
    description: 'Conflit à Gaza avec répercussions régionales (Liban, Yémen/Mer Rouge). Perturbations commerciales maritimes (+30% coûts fret). Tensions diplomatiques. Risque d\'embrasement régional impliquant l\'Iran.',
    mitigations: ['Routes commerciales alternatives', 'Diversification des partenaires MO', 'Assurance risque politique']
  },
  {
    category: 'Tensions Chine-Taïwan',
    level: 'medium',
    probability: 20,
    impact: 95,
    description: 'Risque de blocus ou conflit armé sur Taïwan. Impact catastrophique potentiel sur les semi-conducteurs (TSMC = 60% production mondiale). Dépendance technologique européenne massive.',
    mitigations: ['Reshoring semi-conducteurs (Intel, STMicro)', 'Stocks stratégiques', 'Scénarios de crise', 'Diversification fournisseurs']
  },
  {
    category: 'Perte d\'influence au Sahel',
    level: 'high',
    probability: 90,
    impact: 55,
    description: 'Coups d\'État au Mali, Burkina Faso, Niger. Retrait des forces françaises. Perte de contrats miniers et énergétiques (uranium Niger). Alliance AES pro-Russie/Wagner. Fragilisation de la Francophonie.',
    mitigations: ['Repositionnement diplomatique', 'Partenariats avec pays côtiers stables', 'Diversification sources uranium']
  },
  {
    category: 'Instabilité sociale interne',
    level: 'medium',
    probability: 55,
    impact: 55,
    description: 'Mouvements sociaux récurrents (réforme retraites, inflation). Fragmentation politique. Montée des extrêmes. Risque de paralysie législative. Contexte pré-électoral tendu.',
    mitigations: ['Diversification géographique', 'Plans de continuité', 'Assurance pertes d\'exploitation']
  },
  {
    category: 'Risque cyber (étatique)',
    level: 'critical',
    probability: 75,
    impact: 80,
    description: 'Attaques cyber étatiques (Russie, Chine) en forte augmentation depuis 2022. Hôpitaux, collectivités, entreprises stratégiques ciblés. Guerre hybride incluant désinformation et ingérence électorale.',
    mitigations: ['ANSSI guidelines renforcés', 'NIS2 obligatoire', 'Cyber-assurance', 'SOC 24/7']
  },
  {
    category: 'Guerre civile Myanmar',
    level: 'low',
    probability: 95,
    impact: 30,
    description: 'Impact indirect limité pour la France mais significatif pour les expats en Asie du Sud-Est. Flux de réfugiés vers Thaïlande et Inde. Déstabilisation régionale. Sanctions UE maintenues.',
    mitigations: ['Éviter la zone', 'Alternatives régionales (Vietnam, Cambodge)', 'Suivi ASEAN']
  },
  {
    category: 'Guerre civile au Soudan',
    level: 'low',
    probability: 95,
    impact: 25,
    description: 'Plus grande crise humanitaire mondiale (10M+ déplacés). Impact sur le Tchad et l\'Égypte. Risques pour les rares expats français dans la zone. Fermeture ambassade France à Khartoum.',
    mitigations: ['Aucun engagement dans la zone', 'Suivi crise humanitaire', 'Plan évacuation régional']
  },
];

const mockSoftPower: SoftPowerMetric[] = [
  { category: 'Culture', score: 95, components: [{ name: 'Musées', value: 98 }, { name: 'Gastronomie', value: 95 }, { name: 'Mode', value: 92 }] },
  { category: 'Éducation', score: 82, components: [{ name: 'Universités', value: 78 }, { name: 'Grandes Écoles', value: 95 }, { name: 'Recherche', value: 73 }] },
  { category: 'Diplomatie', score: 88, components: [{ name: 'ONU', value: 95 }, { name: 'UE', value: 90 }, { name: 'Francophonie', value: 80 }] },
  { category: 'Entreprises', score: 75, components: [{ name: 'CAC40', value: 85 }, { name: 'Luxe', value: 98 }, { name: 'Tech', value: 55 }] },
  { category: 'Tourisme', score: 98, components: [{ name: 'Visiteurs', value: 99 }, { name: 'Patrimoine', value: 98 }, { name: 'Infrastructure', value: 95 }] },
];

export function GeopoliticalAnalysis({
  countryName = 'France',
}: GeopoliticalAnalysisProps) {
  const [activeTab, setActiveTab] = useState<'power' | 'institutions' | 'legal' | 'risks' | 'softpower'>('power');

  const radarData = mockPowerIndices.map(p => ({
    dimension: p.dimension,
    score: p.score,
    fullMark: 100,
  }));

  const getRiskColor = (level: GeopoliticalRisk['level']): string => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-500/10';
      case 'high': return 'text-orange-600 bg-orange-500/10';
      case 'medium': return 'text-amber-600 bg-amber-500/10';
      case 'low': return 'text-green-600 bg-green-500/10';
    }
  };

  const getFriendlinessColor = (level: 'high' | 'medium' | 'low'): string => {
    switch (level) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-amber-600';
      case 'low': return 'text-red-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-xl p-6 border-l-4 border-primary">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Globe className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-2xl font-bold mb-2">
              Analyse Géopolitique & Institutionnelle
            </h2>
            <p className="text-muted-foreground">
              Cadre d'analyse niveau Sciences Po / ENA pour l'évaluation des environnements 
              institutionnels et des risques pays. Sources : World Bank, IMF, WEF, Transparency International.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline" className="gap-1">
                <Flag className="w-3 h-3" />
                {countryName}
              </Badge>
              <Badge variant="outline">Indicateurs Institutionnels</Badge>
              <Badge variant="outline">Droit Comparé</Badge>
              <Badge variant="outline">Soft Power</Badge>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="power" className="gap-2">
            <Zap className="w-4 h-4" />
            Puissance
          </TabsTrigger>
          <TabsTrigger value="institutions" className="gap-2">
            <Building className="w-4 h-4" />
            Institutions
          </TabsTrigger>
          <TabsTrigger value="legal" className="gap-2">
            <Scale className="w-4 h-4" />
            Cadre Légal
          </TabsTrigger>
          <TabsTrigger value="risks" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Risques
          </TabsTrigger>
          <TabsTrigger value="softpower" className="gap-2">
            <Award className="w-4 h-4" />
            Soft Power
          </TabsTrigger>
        </TabsList>

        {/* Power Index */}
        <TabsContent value="power" className="space-y-6 mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Indice de Puissance Composite</CardTitle>
                <CardDescription>
                  Méthodologie inspirée du Comprehensive National Power (CNP) et du 
                  Global Power Index. Agrégation multi-dimensionnelle.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name={countryName}
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Détail par Dimension</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPowerIndices.map((index) => (
                    <div key={index.dimension} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{index.dimension}</span>
                          <Badge variant="outline" className="text-xs">
                            #{index.global_rank} mondial
                          </Badge>
                          {index.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                          {index.trend === 'down' && <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />}
                        </div>
                        <span className="font-bold">{index.score}/100</span>
                      </div>
                      <Progress value={index.score} className="h-2" />
                      <p className="text-xs text-muted-foreground">{index.details}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Institutional Indicators */}
        <TabsContent value="institutions" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Indicateurs Institutionnels Internationaux
              </CardTitle>
              <CardDescription>
                Indices de référence utilisés par les investisseurs institutionnels, 
                les agences de notation et les organisations multilatérales.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {mockInstitutionalIndicators.map((indicator) => (
                  <motion.div
                    key={indicator.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-lg p-4 border"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm">{indicator.name}</h4>
                      <Badge variant="outline" className="text-xs">{indicator.year}</Badge>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-2xl font-bold text-primary">
                        {typeof indicator.value === 'number' && indicator.value < 10 
                          ? indicator.value.toFixed(2) 
                          : indicator.value}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{indicator.interpretation}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <FileText className="w-3 h-3" />
                      <span>Source: {indicator.source}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Legal Framework */}
        <TabsContent value="legal" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Cadre Juridique Comparé
              </CardTitle>
              <CardDescription>
                Analyse du droit des affaires et de l'environnement réglementaire 
                pour les investisseurs et entrepreneurs internationaux.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockLegalFrameworks.map((framework) => (
                  <div key={framework.domain} className="glass-card rounded-lg p-5 border">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{framework.domain}</h4>
                        <p className="text-sm text-muted-foreground">{framework.framework}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", getFriendlinessColor(framework.investor_friendly))}
                        >
                          Investisseur: {framework.investor_friendly === 'high' ? '★★★' : framework.investor_friendly === 'medium' ? '★★☆' : '★☆☆'}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", getFriendlinessColor(framework.stability))}
                        >
                          Stabilité: {framework.stability === 'high' ? '★★★' : framework.stability === 'medium' ? '★★☆' : '★☆☆'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {framework.key_points.map((point, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {point}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geopolitical Risks */}
        <TabsContent value="risks" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Cartographie des Risques Géopolitiques
              </CardTitle>
              <CardDescription>
                Méthodologie PESTLE-R étendue avec évaluation probabilité × impact. 
                Standards Coface/Euler Hermes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockGeopoliticalRisks.map((risk) => (
                  <motion.div
                    key={risk.category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "rounded-lg p-5 border-l-4",
                      risk.level === 'critical' && "border-red-500 bg-red-500/5",
                      risk.level === 'high' && "border-orange-500 bg-orange-500/5",
                      risk.level === 'medium' && "border-amber-500 bg-amber-500/5",
                      risk.level === 'low' && "border-green-500 bg-green-500/5",
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{risk.category}</h4>
                          <Badge className={getRiskColor(risk.level)}>
                            {risk.level.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{risk.description}</p>
                      </div>
                      <div className="text-right text-sm">
                        <div>Probabilité: <span className="font-bold">{risk.probability}%</span></div>
                        <div>Impact: <span className="font-bold">{risk.impact}/100</span></div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs font-medium mb-2 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Mesures de mitigation :
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {risk.mitigations.map((mitigation, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {mitigation}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Risk Matrix */}
              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Score de Risque Agrégé
                </h4>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <div className="text-2xl font-bold text-green-600">B+</div>
                    <div className="text-xs text-muted-foreground">Note Coface</div>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-500/10">
                    <div className="text-2xl font-bold text-blue-600">AA</div>
                    <div className="text-xs text-muted-foreground">Fitch Ratings</div>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-500/10">
                    <div className="text-2xl font-bold text-purple-600">Aa2</div>
                    <div className="text-xs text-muted-foreground">Moody's</div>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-500/10">
                    <div className="text-2xl font-bold text-amber-600">AA</div>
                    <div className="text-xs text-muted-foreground">S&P</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Soft Power */}
        <TabsContent value="softpower" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Analyse du Soft Power
              </CardTitle>
              <CardDescription>
                Méthodologie Portland/USC (Soft Power 30) et Brand Finance Nation Brands. 
                Capacité d'influence non-coercitive.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={mockSoftPower}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {mockSoftPower.map((metric) => (
                  <div key={metric.category} className="glass-card rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{metric.category}</h4>
                      <span className="text-xl font-bold text-primary">{metric.score}</span>
                    </div>
                    <div className="space-y-2">
                      {metric.components.map((comp) => (
                        <div key={comp.name} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-24">{comp.name}</span>
                          <Progress value={comp.value} className="flex-1 h-1.5" />
                          <span className="text-xs font-medium w-8">{comp.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="font-semibold mb-2">Classement Soft Power 30</h4>
                <p className="text-sm text-muted-foreground">
                  La France occupe régulièrement le <strong>Top 5 mondial</strong> du classement Soft Power 30,
                  particulièrement forte en culture (#1), diplomatie (#3) et tourisme (#1 mondial en visiteurs).
                  Points d'amélioration : Digital et Innovation technologique.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default GeopoliticalAnalysis;
