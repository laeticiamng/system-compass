import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, CheckCircle2, Circle, Save } from 'lucide-react';

interface StateOfArtItem {
  id: string;
  label: string;
  category: 'legal' | 'market' | 'cultural' | 'admin' | 'network';
  completed: boolean;
  notes?: string;
  sources?: string[];
}

interface TerrainStateOfArtProps {
  countryId: string;
  countryName: string;
  projectType?: string;
  onSave?: (items: StateOfArtItem[]) => void;
}

const DEFAULT_CHECKLIST: Omit<StateOfArtItem, 'completed' | 'notes'>[] = [
  { id: 'legal-structure', label: 'Structure juridique adaptée au projet', category: 'legal' },
  { id: 'legal-visa', label: 'Conditions de visa / permis de travail', category: 'legal' },
  { id: 'legal-contracts', label: 'Droit des contrats local', category: 'legal' },
  { id: 'market-demand', label: 'Demande réelle pour le produit/service', category: 'market' },
  { id: 'market-pricing', label: 'Niveaux de prix pratiqués localement', category: 'market' },
  { id: 'market-competitors', label: 'Acteurs existants et parts de marché', category: 'market' },
  { id: 'cultural-business', label: 'Normes de négociation et relations d\'affaires', category: 'cultural' },
  { id: 'cultural-time', label: 'Rapport au temps et aux délais', category: 'cultural' },
  { id: 'admin-process', label: 'Processus administratifs clés identifiés', category: 'admin' },
  { id: 'admin-timeline', label: 'Délais administratifs réalistes estimés', category: 'admin' },
  { id: 'network-contacts', label: 'Premiers contacts locaux identifiés', category: 'network' },
  { id: 'network-advisors', label: 'Conseillers locaux (avocat, comptable) repérés', category: 'network' },
];

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  legal: { label: 'Juridique', color: 'bg-blue-500/20 text-blue-700 border-blue-500/30' },
  market: { label: 'Marché', color: 'bg-green-500/20 text-green-700 border-green-500/30' },
  cultural: { label: 'Culturel', color: 'bg-purple-500/20 text-purple-700 border-purple-500/30' },
  admin: { label: 'Administratif', color: 'bg-amber-500/20 text-amber-700 border-amber-500/30' },
  network: { label: 'Réseau', color: 'bg-pink-500/20 text-pink-700 border-pink-500/30' },
};

export function TerrainStateOfArt({ countryName, onSave }: TerrainStateOfArtProps) {
  const { t } = useTranslation();
  const [items, setItems] = useState<StateOfArtItem[]>(
    DEFAULT_CHECKLIST.map(item => ({ ...item, completed: false }))
  );
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const completedCount = items.filter(i => i.completed).length;
  const progress = Math.round((completedCount / items.length) * 100);

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const updateNotes = (id: string, note: string) => {
    setNotes(prev => ({ ...prev, [id]: note }));
  };

  const handleSave = () => {
    const itemsWithNotes = items.map(item => ({
      ...item,
      notes: notes[item.id] || '',
    }));
    onSave?.(itemsWithNotes);
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, StateOfArtItem[]>);

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="w-5 h-5 text-primary" />
            {t('governance.stateOfArt.title', 'État de l\'art (avant d\'arriver)')}
          </CardTitle>
          <Badge variant="outline" className={progress === 100 ? 'bg-green-500/20 text-green-700' : ''}>
            {completedCount}/{items.length} ({progress}%)
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('governance.stateOfArt.description', 'Ce que vous devez connaître avant d\'agir sur')} {countryName}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <div key={category} className="space-y-3">
            <Badge className={CATEGORY_LABELS[category]?.color}>
              {CATEGORY_LABELS[category]?.label}
            </Badge>
            <div className="space-y-2">
              {categoryItems.map(item => (
                <div key={item.id} className="space-y-2">
                  <div 
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors cursor-pointer"
                    onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                  >
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => toggleItem(item.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <span className={item.completed ? 'line-through text-muted-foreground' : ''}>
                        {item.label}
                      </span>
                    </div>
                    {item.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  
                  {expandedItem === item.id && (
                    <div className="ml-8 p-3 bg-background border rounded-lg space-y-2">
                      <Textarea
                        placeholder={t('governance.stateOfArt.notesPlaceholder', 'Notes, sources, observations...')}
                        value={notes[item.id] || ''}
                        onChange={(e) => updateNotes(item.id, e.target.value)}
                        className="min-h-[80px] text-sm"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            {t('common.save', 'Sauvegarder')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
