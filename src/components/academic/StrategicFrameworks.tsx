import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp,
  Shield, 
  Target, 
  Scale, 
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  BookOpen,
  Lightbulb,
  Layers
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

// Types for strategic analysis
interface PESTELItem {
  category: 'political' | 'economic' | 'social' | 'technological' | 'environmental' | 'legal';
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  magnitude: 1 | 2 | 3 | 4 | 5;
  timeframe: 'short' | 'medium' | 'long';
  notes?: string;
}

interface PorterForce {
  force: 'rivalry' | 'newEntrants' | 'substitutes' | 'buyerPower' | 'supplierPower';
  intensity: 1 | 2 | 3 | 4 | 5;
  factors: string[];
  implications: string;
}

interface SWOTItem {
  quadrant: 'strengths' | 'weaknesses' | 'opportunities' | 'threats';
  item: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

interface DecisionMatrixOption {
  name: string;
  scores: Record<string, number>;
  totalScore?: number;
}

interface DecisionCriterion {
  name: string;
  weight: number;
  description?: string;
}

interface StrategicFrameworksProps {
  context?: 'country' | 'business' | 'personal';
  countryCode?: string;
}

export function StrategicFrameworks(_props: StrategicFrameworksProps) {
  const [activeFramework, setActiveFramework] = useState<'pestel' | 'porter' | 'swot' | 'matrix'>('pestel');
  
  // PESTEL Analysis State
  const [pestelItems, setPestelItems] = useState<PESTELItem[]>([]);
  
  // Porter's Five Forces State
  const [porterForces, setPorterForces] = useState<PorterForce[]>([
    { force: 'rivalry', intensity: 3, factors: [], implications: '' },
    { force: 'newEntrants', intensity: 3, factors: [], implications: '' },
    { force: 'substitutes', intensity: 3, factors: [], implications: '' },
    { force: 'buyerPower', intensity: 3, factors: [], implications: '' },
    { force: 'supplierPower', intensity: 3, factors: [], implications: '' },
  ]);
  
  // SWOT State
  const [swotItems, setSwotItems] = useState<SWOTItem[]>([]);
  
  // Decision Matrix State
  const [criteria] = useState<DecisionCriterion[]>([
    { name: 'Coût', weight: 0.25, description: 'Impact financier total' },
    { name: 'Temps', weight: 0.20, description: 'Délai de mise en œuvre' },
    { name: 'Risque', weight: 0.25, description: 'Exposition aux aléas' },
    { name: 'Qualité de vie', weight: 0.15, description: 'Impact sur le bien-être' },
    { name: 'Opportunités', weight: 0.15, description: 'Potentiel de croissance' },
  ]);
  const [options, setOptions] = useState<DecisionMatrixOption[]>([]);

  const pestelCategories = [
    { key: 'political', icon: Shield, color: 'text-blue-500', label: 'Politique', description: 'Stabilité gouvernementale, politique fiscale, commerce international' },
    { key: 'economic', icon: TrendingUp, color: 'text-green-500', label: 'Économique', description: 'PIB, inflation, taux de change, marché du travail' },
    { key: 'social', icon: Target, color: 'text-purple-500', label: 'Social', description: 'Démographie, éducation, mobilité sociale, culture' },
    { key: 'technological', icon: Layers, color: 'text-cyan-500', label: 'Technologique', description: 'Infrastructure digitale, innovation, R&D' },
    { key: 'environmental', icon: AlertTriangle, color: 'text-amber-500', label: 'Environnemental', description: 'Climat, ressources naturelles, durabilité' },
    { key: 'legal', icon: Scale, color: 'text-red-500', label: 'Légal', description: 'Droit du travail, fiscalité, réglementation' },
  ];

  const porterLabels: Record<string, { label: string; description: string }> = {
    rivalry: { label: 'Rivalité concurrentielle', description: 'Intensité de la compétition entre acteurs existants' },
    newEntrants: { label: 'Menace de nouveaux entrants', description: 'Barrières à l\'entrée et attractivité du marché' },
    substitutes: { label: 'Menace de substituts', description: 'Alternatives disponibles pour les clients' },
    buyerPower: { label: 'Pouvoir de négociation clients', description: 'Capacité des acheteurs à influencer les prix' },
    supplierPower: { label: 'Pouvoir de négociation fournisseurs', description: 'Dépendance vis-à-vis des fournisseurs' },
  };

  const addPestelItem = (category: PESTELItem['category']) => {
    const newItem: PESTELItem = {
      category,
      factor: '',
      impact: 'neutral',
      magnitude: 3,
      timeframe: 'medium',
    };
    setPestelItems([...pestelItems, newItem]);
  };

  const updatePorterForce = (forceKey: string, field: keyof PorterForce, value: any) => {
    setPorterForces(forces => 
      forces.map(f => f.force === forceKey ? { ...f, [field]: value } : f)
    );
  };

  const addSwotItem = (quadrant: SWOTItem['quadrant']) => {
    const newItem: SWOTItem = {
      quadrant,
      item: '',
      priority: 'medium',
      actionable: false,
    };
    setSwotItems([...swotItems, newItem]);
  };

  const calculateMatrixScores = () => {
    return options.map(option => {
      const totalScore = criteria.reduce((sum, criterion) => {
        const score = option.scores[criterion.name] || 0;
        return sum + (score * criterion.weight);
      }, 0);
      return { ...option, totalScore };
    }).sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
  };

  const getIntensityLabel = (intensity: number): string => {
    const labels = ['Très faible', 'Faible', 'Modérée', 'Forte', 'Très forte'];
    return labels[intensity - 1] || 'Modérée';
  };

  const getIntensityColor = (intensity: number): string => {
    const colors = ['bg-green-500', 'bg-lime-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'];
    return colors[intensity - 1] || 'bg-yellow-500';
  };

  return (
    <div className="space-y-6">
      {/* Header avec contexte académique */}
      <div className="glass-card rounded-xl p-6 border-l-4 border-primary">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-2xl font-bold mb-2">
              Frameworks d'Analyse Stratégique
            </h2>
            <p className="text-muted-foreground">
              Méthodologies enseignées dans les grandes écoles de commerce (HEC, INSEAD, LBS) 
              pour une prise de décision structurée et rigoureuse.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline" className="gap-1">
                <Lightbulb className="w-3 h-3" />
                Niveau MBA
              </Badge>
              <Badge variant="outline">Michael Porter</Badge>
              <Badge variant="outline">Analyse PESTEL</Badge>
              <Badge variant="outline">Matrice de décision</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation entre frameworks */}
      <Tabs value={activeFramework} onValueChange={(v) => setActiveFramework(v as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pestel" className="gap-2">
            <Layers className="w-4 h-4" />
            PESTEL
          </TabsTrigger>
          <TabsTrigger value="porter" className="gap-2">
            <Shield className="w-4 h-4" />
            Porter
          </TabsTrigger>
          <TabsTrigger value="swot" className="gap-2">
            <Target className="w-4 h-4" />
            SWOT
          </TabsTrigger>
          <TabsTrigger value="matrix" className="gap-2">
            <Scale className="w-4 h-4" />
            Matrice
          </TabsTrigger>
        </TabsList>

        {/* PESTEL Analysis */}
        <TabsContent value="pestel" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Analyse PESTEL</CardTitle>
              <CardDescription>
                Framework macro-environnemental développé par Francis Aguilar (Harvard, 1967). 
                Analyse systématique des facteurs externes influençant votre stratégie.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pestelCategories.map((cat) => {
                  const Icon = cat.icon;
                  const categoryItems = pestelItems.filter(i => i.category === cat.key);
                  
                  return (
                    <motion.div
                      key={cat.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card rounded-lg p-4 border border-border/50"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn("p-2 rounded-lg bg-muted", cat.color)}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{cat.label}</h4>
                          <p className="text-xs text-muted-foreground">{cat.description}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {categoryItems.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                            <Badge 
                              variant={item.impact === 'positive' ? 'default' : item.impact === 'negative' ? 'destructive' : 'outline'}
                              className="text-xs"
                            >
                              {item.impact === 'positive' ? '+' : item.impact === 'negative' ? '-' : '~'}
                            </Badge>
                            <span className="text-sm flex-1 truncate">{item.factor || 'Nouveau facteur'}</span>
                          </div>
                        ))}
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full mt-2"
                          onClick={() => addPestelItem(cat.key as any)}
                        >
                          + Ajouter un facteur
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Porter's Five Forces */}
        <TabsContent value="porter" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Les 5 Forces de Porter</CardTitle>
              <CardDescription>
                Modèle d'analyse concurrentielle développé par Michael Porter (Harvard Business School, 1979). 
                Évalue l'attractivité d'un secteur et les leviers de rentabilité.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Diagramme visuel des 5 forces */}
              <div className="relative flex justify-center items-center py-8 mb-8">
                <div className="relative">
                  {/* Centre - Rivalité */}
                  <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-primary/30">
                    <div className="text-center">
                      <p className="font-semibold text-sm">Rivalité</p>
                      <p className="text-xs text-muted-foreground">concurrentielle</p>
                      <Badge className={cn("mt-2", getIntensityColor(porterForces.find(f => f.force === 'rivalry')?.intensity || 3))}>
                        {getIntensityLabel(porterForces.find(f => f.force === 'rivalry')?.intensity || 3)}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Forces externes positionnées */}
                  {['newEntrants', 'substitutes', 'buyerPower', 'supplierPower'].map((force, idx) => {
                    const positions = [
                      { top: '-80px', left: '50%', transform: 'translateX(-50%)' },
                      { bottom: '-80px', left: '50%', transform: 'translateX(-50%)' },
                      { right: '-100px', top: '50%', transform: 'translateY(-50%)' },
                      { left: '-100px', top: '50%', transform: 'translateY(-50%)' },
                    ];
                    const forceData = porterForces.find(f => f.force === force);
                    
                    return (
                      <div 
                        key={force}
                        className="absolute w-24 text-center"
                        style={positions[idx] as any}
                      >
                        <div className="text-xs font-medium">{porterLabels[force].label}</div>
                        <Badge 
                          className={cn("mt-1 text-xs", getIntensityColor(forceData?.intensity || 3))}
                        >
                          {forceData?.intensity || 3}/5
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Détail des forces */}
              <div className="space-y-4">
                {porterForces.map((force) => (
                  <div key={force.force} className="glass-card rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{porterLabels[force.force].label}</h4>
                        <p className="text-xs text-muted-foreground">{porterLabels[force.force].description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Intensité:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <button
                              key={level}
                              onClick={() => updatePorterForce(force.force, 'intensity', level)}
                              className={cn(
                                "w-6 h-6 rounded text-xs font-medium transition-all",
                                force.intensity >= level 
                                  ? getIntensityColor(level) + " text-white"
                                  : "bg-muted hover:bg-muted/80"
                              )}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <Textarea
                      placeholder="Facteurs clés et implications stratégiques..."
                      value={force.implications}
                      onChange={(e) => updatePorterForce(force.force, 'implications', e.target.value)}
                      className="min-h-[60px]"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SWOT Analysis */}
        <TabsContent value="swot" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Analyse SWOT/FFOM</CardTitle>
              <CardDescription>
                Outil de diagnostic stratégique croisant facteurs internes (Forces/Faiblesses) 
                et externes (Opportunités/Menaces) pour identifier les axes stratégiques prioritaires.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { key: 'strengths', label: 'Forces', color: 'border-green-500 bg-green-500/5', icon: CheckCircle },
                  { key: 'weaknesses', label: 'Faiblesses', color: 'border-red-500 bg-red-500/5', icon: AlertTriangle },
                  { key: 'opportunities', label: 'Opportunités', color: 'border-blue-500 bg-blue-500/5', icon: TrendingUp },
                  { key: 'threats', label: 'Menaces', color: 'border-amber-500 bg-amber-500/5', icon: Shield },
                ].map(({ key, label, color, icon: Icon }) => {
                  const items = swotItems.filter(i => i.quadrant === key);
                  
                  return (
                    <div key={key} className={cn("rounded-xl p-5 border-2", color)}>
                      <div className="flex items-center gap-2 mb-4">
                        <Icon className="w-5 h-5" />
                        <h4 className="font-semibold">{label}</h4>
                        <Badge variant="outline" className="ml-auto">{items.length}</Badge>
                      </div>
                      
                      <div className="space-y-2 min-h-[100px]">
                        {items.map((item, idx) => (
                          <div 
                            key={idx}
                            className="flex items-center gap-2 p-2 bg-background/80 rounded-lg"
                          >
                            <Badge 
                              variant={item.priority === 'high' ? 'destructive' : item.priority === 'low' ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {item.priority === 'high' ? 'P1' : item.priority === 'medium' ? 'P2' : 'P3'}
                            </Badge>
                            <span className="text-sm flex-1">{item.item || 'Nouvel élément'}</span>
                            {item.actionable && (
                              <ChevronRight className="w-4 h-4 text-primary" />
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full mt-3"
                        onClick={() => addSwotItem(key as any)}
                      >
                        + Ajouter
                      </Button>
                    </div>
                  );
                })}
              </div>
              
              {/* Matrice TOWS */}
              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h5 className="font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  Stratégies TOWS (extension)
                </h5>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-green-500/10 rounded">
                    <span className="font-medium text-green-700">S-O :</span> Stratégies offensives (exploiter les opportunités avec vos forces)
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded">
                    <span className="font-medium text-blue-700">W-O :</span> Stratégies de développement (corriger faiblesses pour saisir opportunités)
                  </div>
                  <div className="p-3 bg-amber-500/10 rounded">
                    <span className="font-medium text-amber-700">S-T :</span> Stratégies défensives (utiliser forces pour contrer menaces)
                  </div>
                  <div className="p-3 bg-red-500/10 rounded">
                    <span className="font-medium text-red-700">W-T :</span> Stratégies de retrait (minimiser faiblesses face aux menaces)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Decision Matrix */}
        <TabsContent value="matrix" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Matrice de Décision Pondérée</CardTitle>
              <CardDescription>
                Outil d'aide à la décision multi-critères (MCDM) pour évaluer objectivement 
                plusieurs options selon des critères pondérés. Méthode utilisée en consulting stratégique.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Critères avec pondération */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Critères de décision</h4>
                <div className="space-y-3">
                  {criteria.map((criterion, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{criterion.name}</span>
                          <span className="text-sm text-muted-foreground">{(criterion.weight * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={criterion.weight * 100} className="h-2" />
                      </div>
                      <p className="text-xs text-muted-foreground w-40">{criterion.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Tableau de scoring */}
              {options.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Option</th>
                        {criteria.map(c => (
                          <th key={c.name} className="text-center p-2">{c.name}</th>
                        ))}
                        <th className="text-center p-2 font-bold">Score Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculateMatrixScores().map((option, idx) => (
                        <tr key={idx} className={cn("border-b", idx === 0 && "bg-primary/5")}>
                          <td className="p-2 font-medium">{option.name}</td>
                          {criteria.map(c => (
                            <td key={c.name} className="text-center p-2">
                              {option.scores[c.name] || '-'}
                            </td>
                          ))}
                          <td className="text-center p-2 font-bold text-primary">
                            {option.totalScore?.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setOptions([...options, { name: `Option ${options.length + 1}`, scores: {} }])}
              >
                + Ajouter une option
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default StrategicFrameworks;
