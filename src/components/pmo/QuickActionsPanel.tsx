import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  AlertTriangle, 
  Calendar, 
  Target,
  Upload,
  Download,
  RefreshCw
} from 'lucide-react';

interface QuickAction {
  id: string;
  icon: typeof Plus;
  label: string;
  description?: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'secondary';
}

interface QuickActionsPanelProps {
  onAddRisk?: () => void;
  onAddMilestone?: () => void;
  onAddInitiative?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onRefresh?: () => void;
}

export function QuickActionsPanel({
  onAddRisk,
  onAddMilestone,
  onAddInitiative,
  onExport,
  onImport,
  onRefresh,
}: QuickActionsPanelProps) {
  const { t } = useTranslation();

  const primaryActions: QuickAction[] = [
    {
      id: 'add-risk',
      icon: AlertTriangle,
      label: t('pmo.actions.addRisk', 'Ajouter un risque'),
      onClick: onAddRisk || (() => {}),
      variant: 'outline',
    },
    {
      id: 'add-milestone',
      icon: Calendar,
      label: t('pmo.actions.addMilestone', 'Ajouter un jalon'),
      onClick: onAddMilestone || (() => {}),
      variant: 'outline',
    },
    {
      id: 'add-initiative',
      icon: Target,
      label: t('pmo.actions.addInitiative', 'Nouvelle initiative'),
      onClick: onAddInitiative || (() => {}),
      variant: 'default',
    },
  ];

  const secondaryActions: QuickAction[] = [
    {
      id: 'export',
      icon: Download,
      label: t('pmo.actions.export', 'Exporter'),
      onClick: onExport || (() => {}),
      variant: 'secondary',
    },
    {
      id: 'import',
      icon: Upload,
      label: t('pmo.actions.import', 'Importer'),
      onClick: onImport || (() => {}),
      variant: 'secondary',
    },
    {
      id: 'refresh',
      icon: RefreshCw,
      label: t('pmo.actions.refresh', 'Actualiser'),
      onClick: onRefresh || (() => {}),
      variant: 'secondary',
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Plus className="w-5 h-5 text-primary" />
          {t('pmo.quickActions', 'Actions rapides')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Actions */}
        <div className="grid gap-2">
          {primaryActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant={action.variant}
                onClick={action.onClick}
                className="w-full justify-start gap-2"
              >
                <Icon className="w-4 h-4" />
                {action.label}
              </Button>
            );
          })}
        </div>

        {/* Separator */}
        <div className="border-t border-border/50" />

        {/* Secondary Actions */}
        <div className="grid grid-cols-3 gap-2">
          {secondaryActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant={action.variant}
                size="sm"
                onClick={action.onClick}
                className="flex-col h-auto py-3 gap-1"
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{action.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Keyboard shortcuts hint */}
        <p className="text-xs text-muted-foreground text-center">
          {t('pmo.keyboardHint', 'Astuce: Ctrl+N pour nouvelle initiative')}
        </p>
      </CardContent>
    </Card>
  );
}
