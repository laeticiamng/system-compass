/**
 * ZoneRecommendations - AI-powered recommendations for latent zones
 * Suggests actions based on zone patterns and history
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  ArrowRight, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Zap,
  Target
} from 'lucide-react';

interface Recommendation {
  id: string;
  zoneId: string;
  zoneName: string;
  type: 'action' | 'warning' | 'insight' | 'opportunity';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  suggestedAction?: string;
  estimatedImpact?: string;
}

interface ZoneRecommendationsProps {
  recommendations: Recommendation[];
  onApplyRecommendation: (rec: Recommendation) => void;
  onDismiss: (recId: string) => void;
}

export function ZoneRecommendations({ 
  recommendations, 
  onApplyRecommendation,
  onDismiss 
}: ZoneRecommendationsProps) {
  const getTypeIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'action': return <Target className="h-4 w-4" />;
      case 'warning': return <AlertCircle className="h-4 w-4" />;
      case 'insight': return <Lightbulb className="h-4 w-4" />;
      case 'opportunity': return <Zap className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: Recommendation['type']) => {
    switch (type) {
      case 'action': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'warning': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'insight': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'opportunity': return 'bg-green-500/10 text-green-600 border-green-500/20';
    }
  };

  const getPriorityBadge = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive">Urgent</Badge>;
      case 'medium': return <Badge variant="secondary">Moyen</Badge>;
      case 'low': return <Badge variant="outline">Faible</Badge>;
    }
  };

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <h3 className="font-medium mb-1">Tout est en ordre</h3>
          <p className="text-sm text-muted-foreground">
            Aucune recommandation pour le moment
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Recommandations
          </CardTitle>
          <Badge variant="outline">{recommendations.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map(rec => (
          <div 
            key={rec.id}
            className={`p-4 rounded-lg border ${getTypeColor(rec.type)}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {getTypeIcon(rec.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{rec.title}</h4>
                  {getPriorityBadge(rec.priority)}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {rec.description}
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  Zone: <span className="font-medium">{rec.zoneName}</span>
                </p>
                
                {rec.suggestedAction && (
                  <div className="flex items-center gap-2 p-2 rounded bg-background/50 mb-3">
                    <ArrowRight className="h-3 w-3 flex-shrink-0" />
                    <span className="text-xs">{rec.suggestedAction}</span>
                  </div>
                )}

                {rec.estimatedImpact && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Impact estimé: {rec.estimatedImpact}
                  </p>
                )}

                <div className="flex gap-2 mt-3">
                  <Button 
                    size="sm" 
                    onClick={() => onApplyRecommendation(rec)}
                  >
                    Appliquer
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => onDismiss(rec.id)}
                  >
                    Ignorer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
