// Governance Actor Cards Component
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Users, Building2, Landmark, Briefcase, 
  Globe, Scale, HelpCircle, Star, AlertTriangle,
  ThumbsUp, ThumbsDown, Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GovernanceActor {
  id: string;
  name: string;
  type: 'government' | 'regulatory' | 'industry' | 'civil_society' | 'international' | 'informal';
  influence: number; // 0-100
  reliability: 'high' | 'medium' | 'low' | 'unknown';
  stance: 'favorable' | 'neutral' | 'unfavorable' | 'variable';
  description?: string;
  sector?: string;
}

interface ActorCardsProps {
  countryId: string;
  countryName: string;
  actors?: GovernanceActor[];
  governanceData?: {
    power_formal?: Array<{ name: string; influence: number }>;
    power_informal?: Array<{ name: string; influence: number }>;
  };
}

export function ActorCards({ countryName, actors, governanceData }: ActorCardsProps) {
  const { t } = useTranslation();

  // Generate actors from governance data if not provided
  const displayActors: GovernanceActor[] = actors || generateActorsFromData(governanceData);

  const getActorIcon = (type: string) => {
    switch (type) {
      case 'government': return Landmark;
      case 'regulatory': return Scale;
      case 'industry': return Briefcase;
      case 'civil_society': return Users;
      case 'international': return Globe;
      case 'informal': return Building2;
      default: return Building2;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      government: t('governance.actors.types.government', 'Government'),
      regulatory: t('governance.actors.types.regulatory', 'Regulatory'),
      industry: t('governance.actors.types.industry', 'Industry'),
      civil_society: t('governance.actors.types.civilSociety', 'Civil Society'),
      international: t('governance.actors.types.international', 'International'),
      informal: t('governance.actors.types.informal', 'Informal'),
    };
    return labels[type] || type;
  };

  const getReliabilityColor = (reliability: string) => {
    switch (reliability) {
      case 'high': return 'text-green-600 bg-green-500/10';
      case 'medium': return 'text-yellow-600 bg-yellow-500/10';
      case 'low': return 'text-red-600 bg-red-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getStanceIcon = (stance: string) => {
    switch (stance) {
      case 'favorable': return <ThumbsUp className="w-3 h-3 text-green-600" />;
      case 'unfavorable': return <ThumbsDown className="w-3 h-3 text-red-600" />;
      case 'neutral': return <Minus className="w-3 h-3 text-muted-foreground" />;
      default: return <HelpCircle className="w-3 h-3 text-muted-foreground" />;
    }
  };

  if (displayActors.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>{t('governance.actors.noData', 'No actor data available for this country')}</p>
        </CardContent>
      </Card>
    );
  }

  // Group actors by type
  const actorsByType = displayActors.reduce((acc, actor) => {
    if (!acc[actor.type]) acc[actor.type] = [];
    acc[actor.type].push(actor);
    return acc;
  }, {} as Record<string, GovernanceActor[]>);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-5 h-5" />
          {t('governance.actors.title', 'Key Actors')}
          <span className="text-sm font-normal text-muted-foreground">• {countryName}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(actorsByType).map(([type, typeActors]) => {
          const TypeIcon = getActorIcon(type);
          return (
            <div key={type} className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <TypeIcon className="w-4 h-4 text-muted-foreground" />
                {getTypeLabel(type)}
                <Badge variant="outline" className="text-xs">{typeActors.length}</Badge>
              </h4>
              
              <div className="grid gap-2">
                {typeActors.map((actor) => (
                  <div 
                    key={actor.id}
                    className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{actor.name}</p>
                          {actor.influence >= 80 && (
                            <Tooltip>
                              <TooltipTrigger>
                                <Star className="w-3 h-3 text-amber-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">{t('governance.actors.highInfluence', 'High influence actor')}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        {actor.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {actor.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger>
                            {getStanceIcon(actor.stance)}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              {t(`governance.actors.stance.${actor.stance}`, actor.stance)}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", getReliabilityColor(actor.reliability))}
                        >
                          {t(`governance.actors.reliability.${actor.reliability}`, actor.reliability)}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Influence bar */}
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{t('governance.actors.influence', 'Influence')}</span>
                        <span>{actor.influence}%</span>
                      </div>
                      <Progress value={actor.influence} className="h-1.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Warning for low-reliability actors */}
        {displayActors.some(a => a.reliability === 'low') && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              {t('governance.actors.lowReliabilityWarning', 'Some actors have low reliability ratings. Verify information through multiple sources.')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to generate actors from governance data
function generateActorsFromData(governanceData?: {
  power_formal?: Array<{ name: string; influence: number }>;
  power_informal?: Array<{ name: string; influence: number }>;
}): GovernanceActor[] {
  const actors: GovernanceActor[] = [];

  if (governanceData?.power_formal) {
    governanceData.power_formal.forEach((actor, index) => {
      actors.push({
        id: `formal-${index}`,
        name: actor.name,
        type: index === 0 ? 'government' : index === 1 ? 'regulatory' : 'industry',
        influence: actor.influence || 50,
        reliability: actor.influence >= 70 ? 'high' : actor.influence >= 40 ? 'medium' : 'unknown',
        stance: 'neutral',
      });
    });
  }

  if (governanceData?.power_informal) {
    governanceData.power_informal.forEach((actor, index) => {
      actors.push({
        id: `informal-${index}`,
        name: actor.name,
        type: 'informal',
        influence: actor.influence || 40,
        reliability: 'medium',
        stance: 'variable',
      });
    });
  }

  // Add some default actors if none exist
  if (actors.length === 0) {
    actors.push(
      {
        id: 'default-1',
        name: 'Central Government',
        type: 'government',
        influence: 85,
        reliability: 'high',
        stance: 'neutral',
      },
      {
        id: 'default-2',
        name: 'Regulatory Authority',
        type: 'regulatory',
        influence: 70,
        reliability: 'high',
        stance: 'neutral',
      }
    );
  }

  return actors;
}
