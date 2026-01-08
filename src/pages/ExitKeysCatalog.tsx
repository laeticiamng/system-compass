import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { EXIT_KEYS, ExitKey } from '@/lib/exit-keys-engine';
import { PyramidType } from '@/lib/types';
import { SimulationDisclaimer } from '@/components/SimulationDisclaimer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Key, 
  Clock, 
  Target, 
  AlertTriangle, 
  Zap,
  Filter,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

type DifficultyFilter = 'all' | 'accessible' | 'exigeant' | 'expert';
type PyramidFilter = 'all' | PyramidType;

const PYRAMID_LABELS: Record<PyramidType, string> = {
  PROBLEM_RENT: 'Rente Problème',
  STABILITY_REDIS: 'Stabilité Redis',
  COMPETENCE_TRUST: 'Compétence Confiance',
  GROWTH_RISK: 'Croissance Risque',
  HYBRID_TRANSITION: 'Transition Hybride',
  RESOURCE_EXTRACTION: 'Extraction Ressources',
};

const ALL_PYRAMIDS: PyramidType[] = [
  'PROBLEM_RENT',
  'STABILITY_REDIS',
  'COMPETENCE_TRUST',
  'GROWTH_RISK',
  'HYBRID_TRANSITION',
  'RESOURCE_EXTRACTION',
];

export default function ExitKeysCatalog() {
  const { t } = useTranslation();
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [pyramidFilter, setPyramidFilter] = useState<PyramidFilter>('all');

  const filteredKeys = useMemo(() => {
    return EXIT_KEYS.filter(key => {
      if (difficultyFilter !== 'all' && key.difficulty !== difficultyFilter) {
        return false;
      }
      if (pyramidFilter !== 'all' && !key.linkedPyramids.includes(pyramidFilter)) {
        return false;
      }
      return true;
    });
  }, [difficultyFilter, pyramidFilter]);

  const getDifficultyColor = (difficulty: ExitKey['difficulty']) => {
    switch (difficulty) {
      case 'accessible': return 'bg-green-500/10 text-green-600 border-green-500/30';
      case 'exigeant': return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
      case 'expert': return 'bg-red-500/10 text-red-600 border-red-500/30';
    }
  };

  const getPyramidLabel = (pyramid: PyramidType) => {
    return PYRAMID_LABELS[pyramid] || pyramid;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Key className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              Catalogue des Clés de Sortie
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mb-3">
            Stratégies structurées pour changer de système. Chaque clé est une trajectoire mesurable, sans promesse vague.
          </p>
          <SimulationDisclaimer variant="compact" />
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filtres :</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Difficulté</span>
                <Select value={difficultyFilter} onValueChange={(v) => setDifficultyFilter(v as DifficultyFilter)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="accessible">Accessible</SelectItem>
                    <SelectItem value="exigeant">Exigeant</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Système</span>
                <Select value={pyramidFilter} onValueChange={(v) => setPyramidFilter(v as PyramidFilter)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les systèmes</SelectItem>
                    {ALL_PYRAMIDS.map((pyramid) => (
                      <SelectItem key={pyramid} value={pyramid}>
                        {PYRAMID_LABELS[pyramid]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(difficultyFilter !== 'all' || pyramidFilter !== 'all') && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setDifficultyFilter('all');
                    setPyramidFilter('all');
                  }}
                >
                  Réinitialiser
                </Button>
              )}

              <div className="ml-auto text-sm text-muted-foreground">
                {filteredKeys.length} clé{filteredKeys.length > 1 ? 's' : ''} trouvée{filteredKeys.length > 1 ? 's' : ''}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Keys Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredKeys.map((key) => (
            <Card key={key.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{key.icon}</span>
                    <div>
                      <h3 className="font-semibold text-lg leading-tight">{key.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={getDifficultyColor(key.difficulty)}>
                          {key.difficulty}
                        </Badge>
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="w-3 h-3" />
                          {key.timeframe}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Unlocks */}
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm">{key.unlocks}</p>
                  </div>
                </div>

                {/* Success Condition */}
                <div className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium mb-0.5">Condition de réussite</p>
                    <p className="text-sm">{key.successCondition}</p>
                  </div>
                </div>

                {/* Main Risk */}
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium mb-0.5">Risque principal</p>
                    <p className="text-sm text-muted-foreground">{key.mainRisk}</p>
                  </div>
                </div>

                {/* Raw Truth */}
                <div className="p-3 bg-muted/50 rounded-lg border-l-2 border-foreground/20">
                  <p className="text-sm italic text-muted-foreground">« {key.rawTruth} »</p>
                </div>

                {/* Linked Pyramids */}
                <div className="flex flex-wrap gap-1">
                  {key.linkedPyramids.map((pyramid) => (
                    <Badge key={pyramid} variant="outline" className="text-xs">
                      {getPyramidLabel(pyramid)}
                    </Badge>
                  ))}
                  <ArrowRight className="w-4 h-4 text-muted-foreground mx-1" />
                  {key.targetPyramids.map((pyramid) => (
                    <Badge key={pyramid} variant="secondary" className="text-xs">
                      {getPyramidLabel(pyramid)}
                    </Badge>
                  ))}
                </div>

                {/* Steps Count */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                  <CheckCircle2 className="w-3 h-3" />
                  {key.steps.length} phases • {key.requirements.length} prérequis
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredKeys.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Aucune clé ne correspond aux filtres sélectionnés.</p>
            <Button 
              variant="outline"
              onClick={() => {
                setDifficultyFilter('all');
                setPyramidFilter('all');
              }}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 text-center">
          <Card className="inline-block p-6 bg-primary/5 border-primary/20">
            <p className="text-lg font-medium mb-4">
              Trouvez la clé adaptée à votre profil
            </p>
            <Link to="/exit-keys">
              <Button size="lg" className="gap-2">
                <Key className="w-5 h-5" />
                Simuler ma trajectoire
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
