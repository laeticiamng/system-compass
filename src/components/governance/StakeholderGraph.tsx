import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Network, Users, Building2, Landmark, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Stakeholder {
  id: string;
  name: string;
  type: 'government' | 'business' | 'civil_society' | 'international';
  influence: number; // 0-100
  reliability: 'high' | 'medium' | 'low' | 'unknown';
  connections: string[];
}

interface StakeholderGraphProps {
  stakeholders: Stakeholder[];
  countryName: string;
}

export function StakeholderGraph({ stakeholders, countryName }: StakeholderGraphProps) {
  const { t } = useTranslation();

  const typeConfig = {
    government: { 
      icon: Landmark, 
      color: 'bg-blue-500', 
      label: t('governance.stakeholder.government', 'Gouvernement') 
    },
    business: { 
      icon: Briefcase, 
      color: 'bg-green-500', 
      label: t('governance.stakeholder.business', 'Entreprises') 
    },
    civil_society: { 
      icon: Users, 
      color: 'bg-purple-500', 
      label: t('governance.stakeholder.civilSociety', 'Société civile') 
    },
    international: { 
      icon: Building2, 
      color: 'bg-amber-500', 
      label: t('governance.stakeholder.international', 'International') 
    }
  };

  const reliabilityColors = {
    high: 'border-green-500 bg-green-500/10',
    medium: 'border-amber-500 bg-amber-500/10',
    low: 'border-red-500 bg-red-500/10',
    unknown: 'border-muted bg-muted/10'
  };

  const sortedStakeholders = useMemo(() => 
    [...stakeholders].sort((a, b) => b.influence - a.influence),
    [stakeholders]
  );

  const connectionMatrix = useMemo(() => {
    const matrix: Record<string, Set<string>> = {};
    stakeholders.forEach(s => {
      matrix[s.id] = new Set(s.connections);
    });
    return matrix;
  }, [stakeholders]);

  // Reserved for future connection visualization
  void connectionMatrix;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="w-5 h-5" />
          {t('governance.stakeholder.networkTitle', 'Réseau d\'Acteurs')} - {countryName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Legend */}
        <div className="flex flex-wrap gap-2 pb-3 border-b">
          {Object.entries(typeConfig).map(([type, config]) => (
            <Badge key={type} variant="outline" className="gap-1">
              <div className={`w-2 h-2 rounded-full ${config.color}`} />
              {config.label}
            </Badge>
          ))}
        </div>

        {/* Visual Graph Representation */}
        <div className="relative min-h-[300px] bg-muted/20 rounded-lg p-4">
          {/* Center circle for main connections */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border-2 border-dashed border-muted-foreground/20" />
            <div className="absolute w-48 h-48 rounded-full border border-dashed border-muted-foreground/10" />
            <div className="absolute w-64 h-64 rounded-full border border-dashed border-muted-foreground/5" />
          </div>

          {/* Stakeholder nodes positioned in circles based on influence */}
          {sortedStakeholders.slice(0, 8).map((stakeholder, index) => {
            const config = typeConfig[stakeholder.type];
            const NodeIcon = config.icon;
            
            // Position in a circle, higher influence = closer to center
            const radius = 80 + (100 - stakeholder.influence);
            const angle = (index / Math.min(8, sortedStakeholders.length)) * 2 * Math.PI - Math.PI / 2;
            const x = 50 + (radius / 3) * Math.cos(angle);
            const y = 50 + (radius / 3) * Math.sin(angle);

            return (
              <div
                key={stakeholder.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 p-2 rounded-lg border-2 ${reliabilityColors[stakeholder.reliability]} transition-all hover:scale-110 cursor-pointer`}
                style={{ left: `${x}%`, top: `${y}%` }}
                title={`${stakeholder.name} - Influence: ${stakeholder.influence}%`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full ${config.color} flex items-center justify-center`}>
                    <NodeIcon className="w-3 h-3 text-white" />
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-medium truncate max-w-[80px]">{stakeholder.name}</p>
                    <p className="text-[10px] text-muted-foreground">{stakeholder.influence}%</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stakeholder List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">{t('governance.stakeholder.allActors', 'Tous les acteurs')}</h4>
          <div className="grid gap-2 max-h-[200px] overflow-y-auto">
            {sortedStakeholders.map((stakeholder) => {
              const config = typeConfig[stakeholder.type];
              const Icon = config.icon;
              
              return (
                <div key={stakeholder.id} className="flex items-center justify-between p-2 rounded border bg-card">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full ${config.color} flex items-center justify-center`}>
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{stakeholder.name}</p>
                      <p className="text-xs text-muted-foreground">{config.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {stakeholder.influence}%
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        stakeholder.reliability === 'high' ? 'border-green-500 text-green-700' :
                        stakeholder.reliability === 'medium' ? 'border-amber-500 text-amber-700' :
                        stakeholder.reliability === 'low' ? 'border-red-500 text-red-700' :
                        ''
                      }`}
                    >
                      {stakeholder.reliability}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {stakeholders.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Network className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t('governance.stakeholder.empty', 'Aucun acteur cartographié')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
