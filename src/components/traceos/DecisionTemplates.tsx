/**
 * DecisionTemplates - Pre-built decision templates for common scenarios
 * Helps users structure their decision-making process
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Search,
  Building2,
  Users,
  Banknote,
  Heart,
  Briefcase,
  Home,
  GraduationCap,
  Plane
} from 'lucide-react';

interface DecisionTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  factors: string[];
  questions: string[];
  timeframe: string;
}

const TEMPLATES: DecisionTemplate[] = [
  {
    id: 'career-change',
    name: 'Changement de carrière',
    description: 'Évaluer une transition professionnelle majeure',
    category: 'Professionnel',
    icon: <Briefcase className="h-5 w-5" />,
    factors: ['Compétences transférables', 'Marché du travail', 'Impact financier', 'Équilibre vie pro/perso'],
    questions: [
      'Quelles compétences puis-je transférer ?',
      'Quel est le potentiel du nouveau secteur ?',
      'Combien de temps pour atteindre mon niveau actuel ?'
    ],
    timeframe: '6-18 mois'
  },
  {
    id: 'relocation',
    name: 'Expatriation',
    description: 'Déménager dans un nouveau pays',
    category: 'Géographique',
    icon: <Plane className="h-5 w-5" />,
    factors: ['Coût de la vie', 'Opportunités', 'Qualité de vie', 'Réseau social'],
    questions: [
      'Ai-je les visas nécessaires ?',
      'Comment maintenir mes revenus ?',
      'Quel impact sur ma famille ?'
    ],
    timeframe: '12-24 mois'
  },
  {
    id: 'investment',
    name: 'Investissement majeur',
    description: 'Décision d\'investissement significative',
    category: 'Financier',
    icon: <Banknote className="h-5 w-5" />,
    factors: ['Rendement attendu', 'Niveau de risque', 'Liquidité', 'Diversification'],
    questions: [
      'Quel est mon horizon de placement ?',
      'Quelle perte maximale acceptable ?',
      'Ai-je une réserve de sécurité ?'
    ],
    timeframe: '5-20 ans'
  },
  {
    id: 'business-start',
    name: 'Création d\'entreprise',
    description: 'Lancer une nouvelle activité',
    category: 'Entrepreneuriat',
    icon: <Building2 className="h-5 w-5" />,
    factors: ['Marché cible', 'Concurrence', 'Capital requis', 'Compétences clés'],
    questions: [
      'Mon produit résout-il un vrai problème ?',
      'Ai-je validé avec des clients potentiels ?',
      'Combien de mois de trésorerie ?'
    ],
    timeframe: '2-5 ans'
  },
  {
    id: 'education',
    name: 'Formation/Diplôme',
    description: 'Investir dans sa formation',
    category: 'Éducation',
    icon: <GraduationCap className="h-5 w-5" />,
    factors: ['ROI formation', 'Reconnaissance', 'Temps requis', 'Coût total'],
    questions: [
      'Ce diplôme est-il reconnu dans mon secteur ?',
      'Puis-je continuer à travailler ?',
      'Existe-t-il des alternatives ?'
    ],
    timeframe: '1-4 ans'
  },
  {
    id: 'partnership',
    name: 'Partenariat stratégique',
    description: 'S\'associer avec un partenaire',
    category: 'Professionnel',
    icon: <Users className="h-5 w-5" />,
    factors: ['Complémentarité', 'Valeurs partagées', 'Répartition', 'Exit strategy'],
    questions: [
      'Nos visions sont-elles alignées ?',
      'Comment gérer les désaccords ?',
      'Quelles clauses de sortie ?'
    ],
    timeframe: '3-10 ans'
  },
  {
    id: 'real-estate',
    name: 'Achat immobilier',
    description: 'Acquisition d\'un bien immobilier',
    category: 'Patrimoine',
    icon: <Home className="h-5 w-5" />,
    factors: ['Localisation', 'Prix au m²', 'Potentiel', 'Charges'],
    questions: [
      'Est-ce le bon moment du marché ?',
      'Ma situation est-elle stable ?',
      'Ai-je l\'apport suffisant ?'
    ],
    timeframe: '15-25 ans'
  },
  {
    id: 'health-major',
    name: 'Décision de santé',
    description: 'Choix médical important',
    category: 'Personnel',
    icon: <Heart className="h-5 w-5" />,
    factors: ['Bénéfices/risques', 'Avis multiples', 'Délai', 'Qualité de vie'],
    questions: [
      'Ai-je consulté plusieurs spécialistes ?',
      'Quelles sont les alternatives ?',
      'Quel impact sur ma vie quotidienne ?'
    ],
    timeframe: 'Variable'
  }
];

interface DecisionTemplatesProps {
  onSelectTemplate: (template: DecisionTemplate) => void;
}

export function DecisionTemplates({ onSelectTemplate }: DecisionTemplatesProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(TEMPLATES.map(t => t.category))];

  const filteredTemplates = TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(search.toLowerCase()) ||
                         template.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Modèles de décision
        </CardTitle>
        <CardDescription>
          Choisissez un modèle adapté à votre situation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Badge
            variant={selectedCategory === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(null)}
          >
            Tous
          </Badge>
          {categories.map(cat => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>

        <ScrollArea className="h-80">
          <div className="grid gap-3">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className="p-4 rounded-lg border hover:border-primary/50 hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => onSelectTemplate(template)}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {template.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{template.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {template.timeframe}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {template.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {template.factors.slice(0, 3).map((factor, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                      {template.factors.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.factors.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
