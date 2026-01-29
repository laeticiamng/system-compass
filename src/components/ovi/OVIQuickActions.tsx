/**
 * OVIQuickActions - Quick action buttons for OVI module
 * Provides fast access to common OVI operations
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Brain, 
  FileText, 
  Lightbulb,
  Link2,
  Download,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  variant?: 'default' | 'outline' | 'secondary';
}

interface OVIQuickActionsProps {
  onNewReflection?: () => void;
  onCollectEvidence?: () => void;
  onExportInsights?: () => void;
  onLinkToTraceOS?: () => void;
}

export function OVIQuickActions({ 
  onNewReflection, 
  onCollectEvidence,
  onExportInsights,
  onLinkToTraceOS
}: OVIQuickActionsProps) {
  const navigate = useNavigate();

  const actions: QuickAction[] = [
    {
      id: 'new-reflection',
      label: 'Nouvelle réflexion',
      description: 'Démarrer une session de réflexion guidée',
      icon: <Brain className="h-4 w-4" />,
      action: () => onNewReflection?.(),
      variant: 'default'
    },
    {
      id: 'collect-evidence',
      label: 'Collecter une preuve',
      description: 'Ajouter un élément factuel',
      icon: <Plus className="h-4 w-4" />,
      action: () => onCollectEvidence?.(),
      variant: 'outline'
    },
    {
      id: 'read-article',
      label: 'Lire un article',
      description: 'Continuer votre apprentissage',
      icon: <BookOpen className="h-4 w-4" />,
      action: () => navigate('/ovi#articles'),
      variant: 'outline'
    },
    {
      id: 'apply-framework',
      label: 'Appliquer un cadre',
      description: 'Utiliser un framework de réflexion',
      icon: <Lightbulb className="h-4 w-4" />,
      action: () => navigate('/ovi#frameworks'),
      variant: 'outline'
    },
    {
      id: 'link-traceos',
      label: 'Lier à TraceOS',
      description: 'Connecter à une décision',
      icon: <Link2 className="h-4 w-4" />,
      action: () => onLinkToTraceOS?.(),
      variant: 'secondary'
    },
    {
      id: 'export',
      label: 'Exporter',
      description: 'Télécharger vos insights',
      icon: <Download className="h-4 w-4" />,
      action: () => onExportInsights?.(),
      variant: 'secondary'
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Actions rapides
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {actions.map(action => (
            <Button
              key={action.id}
              variant={action.variant || 'outline'}
              className="h-auto py-3 px-3 flex flex-col items-start gap-1 text-left"
              onClick={action.action}
            >
              <div className="flex items-center gap-2">
                {action.icon}
                <span className="text-sm font-medium">{action.label}</span>
              </div>
              <span className="text-xs text-muted-foreground font-normal">
                {action.description}
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
