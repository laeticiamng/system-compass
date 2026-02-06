/**
 * ResourceDownloadCenter - Downloadable resources and guides
 */
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileText, 
  BookOpen, 
  CheckSquare, 
  Calculator,
  FileSpreadsheet,
  Lock
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'xlsx' | 'checklist';
  icon: React.ReactNode;
  premium: boolean;
  downloads: number;
}

const RESOURCES: Resource[] = [
  {
    id: 'expat-checklist',
    title: 'Checklist complète expatriation',
    description: '150 points à vérifier avant, pendant et après votre départ',
    type: 'pdf',
    icon: <CheckSquare className="w-5 h-5" />,
    premium: false,
    downloads: 12543,
  },
  {
    id: 'fiscal-guide',
    title: 'Guide fiscal international',
    description: 'Comprendre la fiscalité dans 30+ pays',
    type: 'pdf',
    icon: <BookOpen className="w-5 h-5" />,
    premium: true,
    downloads: 8234,
  },
  {
    id: 'budget-template',
    title: 'Template budget expatriation',
    description: 'Calculez tous vos coûts de déménagement',
    type: 'xlsx',
    icon: <FileSpreadsheet className="w-5 h-5" />,
    premium: false,
    downloads: 6789,
  },
  {
    id: 'visa-comparison',
    title: 'Comparatif visas nomade digital',
    description: '25 pays avec visa pour travailleurs à distance',
    type: 'pdf',
    icon: <FileText className="w-5 h-5" />,
    premium: true,
    downloads: 5432,
  },
  {
    id: 'cost-calculator',
    title: 'Calculateur coût de vie',
    description: 'Excel interactif pour comparer les budgets',
    type: 'xlsx',
    icon: <Calculator className="w-5 h-5" />,
    premium: true,
    downloads: 4321,
  },
];

export function ResourceDownloadCenter() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { tier } = useSubscription();
  const isPremium = tier === 'premium';
  
  const handleDownload = (resource: Resource) => {
    if (resource.premium && !isPremium) {
      toast.error(t('toast.error.resource.premium', 'Ressource premium'), {
        description: t('toast.error.resource.premiumDesc', 'Passez à un plan premium pour accéder à cette ressource.'),
      });
      return;
    }
    
    if (!user) {
      toast.error(t('toast.error.resource.authRequired', 'Connexion requise'), {
        description: t('toast.error.resource.authRequiredDesc', 'Connectez-vous pour télécharger les ressources.'),
      });
      return;
    }
    
    // Simulate download
    toast.success(t('toast.resource.downloading', 'Téléchargement de "{{title}}"', { title: resource.title }), {
      description: t('toast.resource.downloadingDesc', 'Le fichier sera disponible sous peu.'),
    });
  };
  
  const getTypeLabel = (type: Resource['type']) => {
    switch (type) {
      case 'pdf': return 'PDF';
      case 'xlsx': return 'Excel';
      case 'checklist': return 'Checklist';
    }
  };
  
  const getTypeBadgeClass = (type: Resource['type']) => {
    switch (type) {
      case 'pdf': return 'bg-red-500/10 text-red-500';
      case 'xlsx': return 'bg-emerald-500/10 text-emerald-500';
      case 'checklist': return 'bg-blue-500/10 text-blue-500';
    }
  };
  
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5 text-primary" />
          {t('resources.downloadCenter', 'Centre de téléchargement')}
        </CardTitle>
        <CardDescription>
          {t('resources.downloadCenterDesc', 'Guides, checklists et outils pour votre projet')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {RESOURCES.map((resource) => (
          <div 
            key={resource.id}
            className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
          >
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {resource.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium truncate">{resource.title}</h4>
                {resource.premium && (
                  <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/20">
                    Premium
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">{resource.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className={getTypeBadgeClass(resource.type)}>
                  {getTypeLabel(resource.type)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {resource.downloads.toLocaleString()} téléchargements
                </span>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleDownload(resource)}
              className="shrink-0"
            >
              {resource.premium && !isPremium ? (
                <Lock className="w-4 h-4" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
