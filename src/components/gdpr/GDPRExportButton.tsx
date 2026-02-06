/**
 * GDPRExportButton - GDPR data export functionality
 * Allows users to download all their personal data
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Loader2, Shield, FileJson, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DataCategory {
  id: string;
  label: string;
  description: string;
  table: string;
}

const DATA_CATEGORIES: DataCategory[] = [
  {
    id: 'profile',
    label: 'Profil utilisateur',
    description: 'Informations de profil, préférences, paramètres',
    table: 'profiles',
  },
  {
    id: 'exitKeys',
    label: 'Stratégies',
    description: 'Analyses et stratégies sauvegardées',
    table: 'exit_keys_history',
  },
  {
    id: 'comparisons',
    label: 'Comparaisons',
    description: 'Comparaisons de pays sauvegardées',
    table: 'saved_comparisons',
  },
  {
    id: 'progress',
    label: 'Progression',
    description: 'Suivi des étapes et objectifs',
    table: 'dashboard_progress',
  },
  {
    id: 'cases',
    label: 'Cas B2B',
    description: 'Dossiers et projets professionnels',
    table: 'user_cases',
  },
  {
    id: 'latentZones',
    label: 'Zones latentes',
    description: 'Zones et tensions identifiées',
    table: 'latent_zones',
  },
  {
    id: 'gameStats',
    label: 'Statistiques de jeu',
    description: 'Scores et progression ludique',
    table: 'game_statistics',
  },
  {
    id: 'consent',
    label: 'Consentements RGPD',
    description: 'Historique des consentements',
    table: 'gdpr_consent_log',
  },
];

export function GDPRExportButton() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    DATA_CATEGORIES.map(c => c.id)
  );

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleExport = async () => {
    if (!user) {
      toast.error(t('gdpr.export.notLoggedIn', 'Vous devez être connecté'));
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error(t('gdpr.export.selectAtLeastOne', 'Sélectionnez au moins une catégorie'));
      return;
    }

    setExporting(true);
    
    try {
      const exportData: Record<string, any> = {
        exportDate: new Date().toISOString(),
        userId: user.id,
        email: user.email,
        categories: {},
      };

      // Fetch data for each selected category
      for (const categoryId of selectedCategories) {
        const category = DATA_CATEGORIES.find(c => c.id === categoryId);
        if (!category) continue;

        try {
          const { data, error } = await supabase
            .from(category.table as any)
            .select('*')
            .eq('user_id', user.id);

          if (error) {
            console.warn(`Error fetching ${category.table}:`, error);
            exportData.categories[categoryId] = { error: 'Could not fetch data' };
          } else {
            exportData.categories[categoryId] = {
              label: category.label,
              recordCount: data?.length || 0,
              data: data || [],
            };
          }
        } catch (err) {
          exportData.categories[categoryId] = { error: 'Fetch failed' };
        }
      }

      // Generate and download JSON file
      const blob = new Blob(
        [JSON.stringify(exportData, null, 2)],
        { type: 'application/json' }
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mes-donnees-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(t('gdpr.export.success', 'Export réussi'));
      setIsOpen(false);
    } catch (error) {
      console.error('GDPR export error:', error);
      toast.error(t('gdpr.export.error', 'Erreur lors de l\'export'));
    } finally {
      setExporting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Shield className="w-4 h-4" />
          {t('gdpr.export.button', 'Exporter mes données')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-primary" />
            {t('gdpr.export.title', 'Export de vos données')}
          </DialogTitle>
          <DialogDescription>
            {t('gdpr.export.description', 'Conformément au RGPD, vous pouvez télécharger une copie de toutes vos données personnelles.')}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm font-medium mb-3">
            {t('gdpr.export.selectCategories', 'Sélectionnez les catégories à exporter :')}
          </p>
          
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {DATA_CATEGORIES.map(category => (
              <label
                key={category.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/30 cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={() => toggleCategory(category.id)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{category.label}</p>
                  <p className="text-xs text-muted-foreground">{category.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p className="text-xs">
            {t('gdpr.export.warning', 'L\'export peut prendre quelques secondes. Le fichier sera téléchargé au format JSON.')}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {t('common.cancel', 'Annuler')}
          </Button>
          <Button
            onClick={handleExport}
            disabled={exporting || selectedCategories.length === 0}
            className="gap-2"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {t('gdpr.export.download', 'Télécharger')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
