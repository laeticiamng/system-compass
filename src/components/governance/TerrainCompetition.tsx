import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  Plus,
  Building2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface Competitor {
  id: string;
  name: string;
  type: 'local' | 'international' | 'hybrid';
  scope: string;
  implantation: 'strong' | 'moderate' | 'weak';
  projects: string;
  maturity: 'established' | 'growing' | 'emerging';
}

interface TerrainCompetitionProps {
  countryId: string;
  countryName: string;
  projectType?: string;
}

const TYPE_LABELS: Record<string, { labelKey: string; color: string }> = {
  local: { labelKey: 'governance.competition.types.local', color: 'bg-blue-500/20 text-blue-700' },
  international: { labelKey: 'governance.competition.types.international', color: 'bg-purple-500/20 text-purple-700' },
  hybrid: { labelKey: 'governance.competition.types.hybrid', color: 'bg-amber-500/20 text-amber-700' },
};

const IMPLANTATION_LABELS: Record<string, { labelKey: string; color: string }> = {
  strong: { labelKey: 'governance.competition.implantationLevels.strong', color: 'text-red-600' },
  moderate: { labelKey: 'governance.competition.implantationLevels.moderate', color: 'text-amber-600' },
  weak: { labelKey: 'governance.competition.implantationLevels.weak', color: 'text-green-600' },
};

const MATURITY_LABELS: Record<string, string> = {
  established: 'governance.competition.maturityLevels.established',
  growing: 'governance.competition.maturityLevels.growing',
  emerging: 'governance.competition.maturityLevels.emerging',
};

export function TerrainCompetition({ countryName }: TerrainCompetitionProps) {
  const { t } = useTranslation();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState<Partial<Competitor>>({});

  const handleAdd = () => {
    if (newCompetitor.name) {
      setCompetitors(prev => [...prev, {
        id: Date.now().toString(),
        name: newCompetitor.name || '',
        type: (newCompetitor.type as Competitor['type']) || 'local',
        scope: newCompetitor.scope || '',
        implantation: (newCompetitor.implantation as Competitor['implantation']) || 'moderate',
        projects: newCompetitor.projects || '',
        maturity: (newCompetitor.maturity as Competitor['maturity']) || 'growing',
      }]);
      setNewCompetitor({});
      setShowAddForm(false);
    }
  };

  return (
    <Card className="border-purple-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-purple-600" />
            {t('governance.competition.title', 'Concurrence réelle')}
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAddForm(!showAddForm)}
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            {t('common.add', 'Ajouter')}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('governance.competition.description', 'Cartographie des acteurs sur')} {countryName}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Form */}
        {showAddForm && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-3 border-2 border-dashed border-primary/30">
            <Input
              placeholder={t('governance.competition.name', 'Actor name')}
              value={newCompetitor.name || ''}
              onChange={(e) => setNewCompetitor(prev => ({ ...prev, name: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder={t('governance.competition.scope', 'Scope')}
                value={newCompetitor.scope || ''}
                onChange={(e) => setNewCompetitor(prev => ({ ...prev, scope: e.target.value }))}
              />
              <Input
                placeholder={t('governance.competition.projectTypes', 'Project types')}
                value={newCompetitor.projects || ''}
                onChange={(e) => setNewCompetitor(prev => ({ ...prev, projects: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd}>
                {t('common.save', 'Save')}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>
                {t('common.cancel', 'Cancel')}
              </Button>
            </div>
          </div>
        )}

        {/* Competitors List */}
        <div className="space-y-3">
          {competitors.map(competitor => (
            <div
              key={competitor.id}
              className="p-4 bg-muted/50 rounded-lg space-y-3 hover:bg-muted/80 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">{competitor.name}</span>
                </div>
                <div className="flex gap-2">
                  <Badge className={TYPE_LABELS[competitor.type]?.color}>
                    {t(TYPE_LABELS[competitor.type]?.labelKey ?? '')}
                  </Badge>
                  <Badge variant="outline">
                    {t(MATURITY_LABELS[competitor.maturity] ?? '')}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">{t('governance.competition.scope', 'Scope')}:</span>
                  <p>{competitor.scope}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('governance.competition.projects', 'Projects')}:</span>
                  <p>{competitor.projects}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span className="text-muted-foreground">{t('governance.competition.implantation', 'Implantation')}:</span>
                <span className={IMPLANTATION_LABELS[competitor.implantation]?.color}>
                  {t(IMPLANTATION_LABELS[competitor.implantation]?.labelKey ?? '')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {competitors.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>{t('governance.competition.noCompetitors', 'No competitors identified')}</p>
            <p className="text-sm">{t('governance.competition.addPrompt', 'Add the actors you have identified')}</p>
          </div>
        )}

        {/* Analysis */}
        {competitors.length > 0 && (
          <div className="mt-4 p-4 bg-purple-500/10 rounded-lg">
            <h4 className="font-medium text-sm mb-2">
              {t('governance.competition.analysis', 'Quick analysis')}
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• {t('governance.competition.stronglyEstablished', '{{count}} strongly established actor(s)', { count: competitors.filter(c => c.implantation === 'strong').length })}</li>
              <li>• {t('governance.competition.dominance', 'Dominance')}: {competitors.filter(c => c.type === 'local').length > competitors.filter(c => c.type === 'international').length ? t('governance.competition.dominanceLocal', 'Local') : t('governance.competition.dominanceInternational', 'International')}</li>
              <li>• {t('governance.competition.opportunity', 'Opportunity: underserved segments possible')}</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
