import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, 
  Clock, 
  AlertTriangle,
  Ship,
  Truck,
  Plane,
  FileCheck
} from 'lucide-react';

interface CustomsItem {
  id: string;
  label: string;
  category: 'documentation' | 'process' | 'timing' | 'risk';
  verified: boolean;
}

interface TerrainCustomsLogisticsProps {
  countryId: string;
  countryName: string;
}

const DEFAULT_CUSTOMS_ITEMS: Omit<CustomsItem, 'verified'>[] = [
  // Documentation
  { id: 'hs-codes', label: 'Codes douaniers (HS) pour produits/équipements identifiés', category: 'documentation' },
  { id: 'certificates', label: 'Certificats requis (origine, conformité, sanitaire)', category: 'documentation' },
  { id: 'import-license', label: 'Licence d\'importation nécessaire ou non', category: 'documentation' },
  
  // Process
  { id: 'customs-broker', label: 'Transitaire/courtier en douane identifié', category: 'process' },
  { id: 'inspection', label: 'Procédures d\'inspection à l\'arrivée', category: 'process' },
  { id: 'storage', label: 'Options de stockage/entrepôt sous douane', category: 'process' },
  
  // Timing
  { id: 'clearance-time', label: 'Délai de dédouanement moyen estimé', category: 'timing' },
  { id: 'port-delays', label: 'Risques de congestion portuaire/aéroportuaire', category: 'timing' },
  { id: 'seasonal', label: 'Périodes de ralentissement (fêtes, saisons)', category: 'timing' },
  
  // Risk
  { id: 'duty-rates', label: 'Taux de droits de douane applicables', category: 'risk' },
  { id: 'quotas', label: 'Quotas ou restrictions quantitatives', category: 'risk' },
  { id: 'prohibited', label: 'Liste des produits prohibés/réglementés vérifiée', category: 'risk' },
];

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  documentation: { 
    label: 'Documentation', 
    icon: <FileCheck className="w-4 h-4" />,
    color: 'bg-blue-500/20 text-blue-700 border-blue-500/30'
  },
  process: { 
    label: 'Processus', 
    icon: <Package className="w-4 h-4" />,
    color: 'bg-green-500/20 text-green-700 border-green-500/30'
  },
  timing: { 
    label: 'Délais', 
    icon: <Clock className="w-4 h-4" />,
    color: 'bg-amber-500/20 text-amber-700 border-amber-500/30'
  },
  risk: { 
    label: 'Risques', 
    icon: <AlertTriangle className="w-4 h-4" />,
    color: 'bg-red-500/20 text-red-700 border-red-500/30'
  },
};

export function TerrainCustomsLogistics({ countryId, countryName }: TerrainCustomsLogisticsProps) {
  const { t } = useTranslation();
  const [items, setItems] = useState<CustomsItem[]>(
    DEFAULT_CUSTOMS_ITEMS.map(item => ({ ...item, verified: false }))
  );

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, verified: !item.verified } : item
    ));
  };

  const verifiedCount = items.filter(i => i.verified).length;
  const progress = Math.round((verifiedCount / items.length) * 100);

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, CustomsItem[]>);

  return (
    <Card className="border-orange-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="w-5 h-5 text-orange-600" />
            {t('governance.customs.title', 'Douanes / Logistique (checklist)')}
          </CardTitle>
          <Badge variant="outline" className={progress === 100 ? 'bg-green-500/20 text-green-700' : ''}>
            {verifiedCount}/{items.length}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('governance.customs.description', 'Vérifications import/export pour')} {countryName}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Transport Modes */}
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1">
            <Ship className="w-3 h-3" /> Maritime
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Plane className="w-3 h-3" /> Aérien
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Truck className="w-3 h-3" /> Terrestre
          </Badge>
        </div>

        {/* Warning */}
        <Alert className="bg-amber-500/10 border-amber-500/30">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm">
            {t('governance.customs.warning', 'Ne jamais supposer que l\'importation sera "facile". Vérifier chaque point avant tout engagement.')}
          </AlertDescription>
        </Alert>

        {/* Categorized Items */}
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2">
              {CATEGORY_CONFIG[category]?.icon}
              <Badge className={CATEGORY_CONFIG[category]?.color}>
                {CATEGORY_CONFIG[category]?.label}
              </Badge>
            </div>
            <div className="space-y-2 ml-6">
              {categoryItems.map(item => (
                <div 
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                    item.verified ? 'bg-green-500/10' : 'bg-muted/50 hover:bg-muted/80'
                  }`}
                  onClick={() => toggleItem(item.id)}
                >
                  <Checkbox
                    checked={item.verified}
                    onCheckedChange={() => toggleItem(item.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className={`flex-1 text-sm ${item.verified ? 'line-through text-muted-foreground' : ''}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Dependencies Notice */}
        <div className="p-4 bg-orange-500/10 rounded-lg">
          <h4 className="font-medium text-sm mb-2">
            {t('governance.customs.dependencies', 'Dépendances à identifier')}
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Fournisseurs exclusifs ou limitants</li>
            <li>Routes logistiques alternatives</li>
            <li>Capacité de stockage local</li>
            <li>Partenaires de dédouanement fiables</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
