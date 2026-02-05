import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Globe, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Plus,
  Trash2,
  ExternalLink,
  Filter,
  Search,
  Database,
  Activity,
  FileCheck,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { 
  useDataSources, 
  usePendingUpdates, 
  useScrapeJobs,
  useDataSourcesStats,
  useCreateDataSource,
  useDeleteDataSource,
  useUpdateDataSource,
  useValidateUpdate,
  useTriggerScrape,
  type DataSource,
  type DataUpdate
} from '@/hooks/useDataSources';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

// Hook to fetch countries list
function useCountriesList() {
  return useQuery({
    queryKey: ['countries-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('id, name, iso2')
        .order('name');
      if (error) throw error;
      return data;
    },
  });
}

const SOURCE_TYPE_LABELS: Record<string, string> = {
  government: 'Gouvernement',
  embassy: 'Ambassade',
  statistics: 'Statistiques',
  immigration: 'Immigration',
  fiscal: 'Fiscal',
};

const CHANGE_TYPE_LABELS: Record<string, string> = {
  visa_rules: 'Règles de visa',
  tax_rates: 'Taux d\'imposition',
  cost_of_living: 'Coût de la vie',
  healthcare: 'Santé',
  immigration_policy: 'Politique d\'immigration',
  lgbtq_rights: 'Droits LGBTQ+',
  natural_risks: 'Risques naturels',
  quality_of_life: 'Qualité de vie',
};

function StatCard({ title, value, icon: Icon, description, variant = 'default' }: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}) {
  const variantStyles = {
    default: 'text-muted-foreground',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    error: 'text-red-600 dark:text-red-400',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${variantStyles[variant]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function AddSourceDialog({ onAdd }: { onAdd: (source: Partial<DataSource>) => void }) {
  const { data: countries } = useCountriesList();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    country_id: '',
    source_url: '',
    source_name: '',
    source_type: 'government' as DataSource['source_type'],
    scrape_frequency_hours: 168,
    is_active: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setOpen(false);
    setFormData({
      country_id: '',
      source_url: '',
      source_name: '',
      source_type: 'government',
      scrape_frequency_hours: 168,
      is_active: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une source
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nouvelle source de données</DialogTitle>
            <DialogDescription>
              Ajoutez une URL officielle à surveiller pour un pays.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="country">Pays</Label>
              <Select 
                value={formData.country_id} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, country_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un pays" />
                </SelectTrigger>
                <SelectContent>
                  {countries?.map((country: { id: string; name: string }) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="source_name">Nom de la source</Label>
              <Input
                id="source_name"
                placeholder="Ex: Ministère de l'Immigration"
                value={formData.source_name}
                onChange={(e) => setFormData(prev => ({ ...prev, source_name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="source_url">URL</Label>
              <Input
                id="source_url"
                type="url"
                placeholder="https://..."
                value={formData.source_url}
                onChange={(e) => setFormData(prev => ({ ...prev, source_url: e.target.value }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="source_type">Type de source</Label>
              <Select 
                value={formData.source_type} 
                onValueChange={(v: DataSource['source_type']) => setFormData(prev => ({ ...prev, source_type: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SOURCE_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="frequency">Fréquence de vérification</Label>
              <Select 
                value={formData.scrape_frequency_hours.toString()} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, scrape_frequency_hours: parseInt(v) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">Quotidien</SelectItem>
                  <SelectItem value="72">Tous les 3 jours</SelectItem>
                  <SelectItem value="168">Hebdomadaire</SelectItem>
                  <SelectItem value="336">Bimensuel</SelectItem>
                  <SelectItem value="720">Mensuel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={!formData.country_id || !formData.source_url}>
              Ajouter
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SourceRow({ source, onScrape, onDelete, onToggle, isScraping }: {
  source: DataSource;
  onScrape: () => void;
  onDelete: () => void;
  onToggle: (active: boolean) => void;
  isScraping: boolean;
}) {
  const lastScraped = source.last_scraped_at 
    ? formatDistanceToNow(new Date(source.last_scraped_at), { addSuffix: true, locale: fr })
    : 'Jamais';

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{source.source_name || source.source_url}</span>
          <Badge variant="outline">{SOURCE_TYPE_LABELS[source.source_type]}</Badge>
          {source.error_count > 0 && (
            <Badge variant="destructive">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {source.error_count} erreur(s)
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
          <span className="truncate max-w-[300px]">{source.source_url}</span>
          <span>•</span>
          <span>{source.countries?.name}</span>
          <span>•</span>
          <span>Vérifié {lastScraped}</span>
        </div>
        {source.last_error && (
          <p className="text-sm text-destructive mt-1 truncate">{source.last_error}</p>
        )}
      </div>
      <div className="flex items-center gap-2 ml-4">
        <Switch
          checked={source.is_active}
          onCheckedChange={onToggle}
          aria-label="Activer/Désactiver"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={onScrape}
          disabled={isScraping}
        >
          <RefreshCw className={`h-4 w-4 ${isScraping ? 'animate-spin' : ''}`} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          asChild
        >
          <a href={source.source_url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function UpdateCard({ update, onValidate }: {
  update: DataUpdate;
  onValidate: (status: 'approved' | 'rejected', notes?: string) => void;
}) {
  const [notes, setNotes] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge>{CHANGE_TYPE_LABELS[update.change_type]}</Badge>
            <span className="text-sm text-muted-foreground">
              {update.countries?.name}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(update.detected_at), { addSuffix: true, locale: fr })}
          </span>
        </div>
        <CardTitle className="text-base mt-2">
          {update.change_summary || 'Changement détecté'}
        </CardTitle>
        <CardDescription>
          Source: {update.country_data_sources?.source_name || update.country_data_sources?.source_url}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="link"
          size="sm"
          className="px-0 mb-2"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Masquer les détails' : 'Voir les détails'}
        </Button>
        
        {showDetails && (
          <ScrollArea className="h-[200px] mb-4 p-3 bg-muted rounded-md">
            <pre className="text-xs whitespace-pre-wrap">
              {JSON.stringify(update.new_value, null, 2)}
            </pre>
          </ScrollArea>
        )}

        <div className="space-y-3">
          <Textarea
            placeholder="Notes de validation (optionnel)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={() => onValidate('approved', notes)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approuver
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onValidate('rejected', notes)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rejeter
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDataSources() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [scrapingSourceId, setScrapingSourceId] = useState<string | null>(null);

  const { data: sources, isLoading: sourcesLoading } = useDataSources();
  const { data: pendingUpdates, isLoading: updatesLoading } = usePendingUpdates();
  const { data: jobs } = useScrapeJobs();
  const { data: stats } = useDataSourcesStats();
  const { data: countries } = useCountriesList();

  const createSource = useCreateDataSource();
  const deleteSource = useDeleteDataSource();
  const updateSource = useUpdateDataSource();
  const validateUpdate = useValidateUpdate();
  const triggerScrape = useTriggerScrape();

  const filteredSources = sources?.filter(source => {
    const matchesSearch = searchQuery === '' || 
      source.source_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.source_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.countries?.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCountry = filterCountry === 'all' || source.country_id === filterCountry;
    
    return matchesSearch && matchesCountry;
  });

  const handleScrape = async (sourceId: string) => {
    setScrapingSourceId(sourceId);
    try {
      await triggerScrape.mutateAsync({ source_id: sourceId, force: true });
    } finally {
      setScrapingSourceId(null);
    }
  };

  const handleScrapeAll = async () => {
    setScrapingSourceId('all');
    try {
      await triggerScrape.mutateAsync({ force: false });
    } finally {
      setScrapingSourceId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Sources de données</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les sources officielles et validez les mises à jour automatiques
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleScrapeAll}
            disabled={scrapingSourceId === 'all'}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${scrapingSourceId === 'all' ? 'animate-spin' : ''}`} />
            Scanner tout
          </Button>
          <AddSourceDialog onAdd={(source) => createSource.mutate(source as Parameters<typeof createSource.mutate>[0])} />
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Pays couverts"
          value={`${stats?.upToDateCountries || 0}/${stats?.totalCountries || 0}`}
          icon={Globe}
          description="Pays avec données < 7 jours"
          variant={stats?.upToDateCountries && stats.upToDateCountries > 20 ? 'success' : 'warning'}
        />
        <StatCard
          title="Sources actives"
          value={stats?.activeSources || 0}
          icon={Database}
          description={`${stats?.recentlyScraped || 0} vérifiées récemment`}
        />
        <StatCard
          title="En attente"
          value={stats?.pendingUpdates || 0}
          icon={Clock}
          description="Changements à valider"
          variant={stats?.pendingUpdates && stats.pendingUpdates > 10 ? 'warning' : 'default'}
        />
        <StatCard
          title="Sources en erreur"
          value={stats?.sourcesWithErrors || 0}
          icon={AlertTriangle}
          description="Nécessitent attention"
          variant={stats?.sourcesWithErrors && stats.sourcesWithErrors > 0 ? 'error' : 'success'}
        />
      </div>

      <Tabs defaultValue="sources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sources">
            <Database className="h-4 w-4 mr-2" />
            Sources ({sources?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="pending">
            <FileCheck className="h-4 w-4 mr-2" />
            En attente ({pendingUpdates?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="h-4 w-4 mr-2" />
            Activité
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une source..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCountry} onValueChange={setFilterCountry}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrer par pays" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les pays</SelectItem>
                {countries?.map((country: { id: string; name: string }) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sources List */}
          {sourcesLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredSources?.length === 0 ? (
            <Card className="py-12">
              <CardContent className="flex flex-col items-center justify-center text-center">
                <Database className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-1">Aucune source trouvée</h3>
                <p className="text-muted-foreground text-sm">
                  {searchQuery || filterCountry !== 'all' 
                    ? 'Essayez de modifier vos filtres'
                    : 'Commencez par ajouter une source de données'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredSources?.map(source => (
                <SourceRow
                  key={source.id}
                  source={source}
                  onScrape={() => handleScrape(source.id)}
                  onDelete={() => deleteSource.mutate(source.id)}
                  onToggle={(active) => updateSource.mutate({ id: source.id, is_active: active })}
                  isScraping={scrapingSourceId === source.id}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {updatesLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : pendingUpdates?.length === 0 ? (
            <Card className="py-12">
              <CardContent className="flex flex-col items-center justify-center text-center">
                <CheckCircle className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-semibold mb-1">Tout est à jour</h3>
                <p className="text-muted-foreground text-sm">
                  Aucun changement en attente de validation
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingUpdates?.map(update => (
                <UpdateCard
                  key={update.id}
                  update={update}
                  onValidate={(status, notes) => validateUpdate.mutate({ 
                    id: update.id, 
                    status, 
                    notes 
                  })}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des jobs</CardTitle>
              <CardDescription>Dernières exécutions du scraping automatique</CardDescription>
            </CardHeader>
            <CardContent>
              {jobs?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucun job exécuté pour le moment
                </p>
              ) : (
                <div className="space-y-2">
                  {jobs?.map(job => (
                    <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {job.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        ) : job.status === 'failed' ? (
                          <XCircle className="h-5 w-5 text-destructive" />
                        ) : job.status === 'running' ? (
                          <RefreshCw className="h-5 w-5 text-primary animate-spin" />
                        ) : (
                          <Clock className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <p className="text-sm font-medium">
                            {job.country_id || 'Toutes les sources'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(job.created_at), { addSuffix: true, locale: fr })}
                            {job.changes_detected ? ` • ${job.changes_detected} changement(s)` : ''}
                            {job.tokens_used ? ` • ${job.tokens_used} tokens` : ''}
                          </p>
                        </div>
                      </div>
                      {job.error_message && (
                        <Badge variant="destructive" className="text-xs">
                          {job.error_message.substring(0, 50)}...
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
