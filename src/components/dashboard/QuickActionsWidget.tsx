import { useTranslation } from 'react-i18next';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Key, 
  Globe, 
  BarChart3, 
  Gamepad2, 
  FileText, 
  Users,
  Zap,
  ArrowRight
} from 'lucide-react';

interface QuickAction {
  id: string;
  labelKey: string;
  icon: React.ReactNode;
  route: string;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'exit-keys',
    labelKey: 'quickActions.exitKeys',
    icon: <Key className="w-4 h-4" />,
    route: '/exit-keys',
    color: 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20',
  },
  {
    id: 'countries',
    labelKey: 'quickActions.countries',
    icon: <Globe className="w-4 h-4" />,
    route: '/countries',
    color: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  },
  {
    id: 'compare',
    labelKey: 'quickActions.compare',
    icon: <BarChart3 className="w-4 h-4" />,
    route: '/compare',
    color: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
  },
  {
    id: 'game',
    labelKey: 'quickActions.game',
    icon: <Gamepad2 className="w-4 h-4" />,
    route: '/life-game',
    color: 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20',
  },
  {
    id: 'experts',
    labelKey: 'quickActions.experts',
    icon: <Users className="w-4 h-4" />,
    route: '/experts',
    color: 'bg-pink-500/10 text-pink-500 hover:bg-pink-500/20',
  },
  {
    id: 'tools',
    labelKey: 'quickActions.tools',
    icon: <FileText className="w-4 h-4" />,
    route: '/tools',
    color: 'bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20',
  },
];

export function QuickActionsWidget() {
  const { t } = useTranslation();
  const navigate = useLocalizedNavigate();

  return (
    <Card className="glass-card border-primary/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          {t('dashboard.quickActions', 'Actions rapides')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="ghost"
              className={`h-auto py-3 px-3 flex flex-col items-center gap-2 ${action.color} transition-all duration-200`}
              onClick={() => navigate(action.route)}
            >
              <div className="p-2 rounded-lg bg-background/50">
                {action.icon}
              </div>
              <span className="text-xs font-medium text-center leading-tight">
                {t(action.labelKey, action.id)}
              </span>
            </Button>
          ))}
        </div>
        
        {/* View All Tools Link */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-3 text-muted-foreground hover:text-primary"
          onClick={() => navigate('/tools')}
        >
          {t('dashboard.viewAllTools', 'Voir tous les outils')}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
