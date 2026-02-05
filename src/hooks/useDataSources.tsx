import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Types
export interface DataSource {
  id: string;
  country_id: string;
  source_url: string;
  source_type: 'government' | 'embassy' | 'statistics' | 'immigration' | 'fiscal';
  source_name: string | null;
  last_scraped_at: string | null;
  last_content_hash: string | null;
  scrape_frequency_hours: number;
  is_active: boolean;
  error_count: number;
  last_error: string | null;
  created_at: string;
  updated_at: string;
  countries?: { name: string; iso2: string };
}

export interface DataUpdate {
  id: string;
  country_id: string;
  source_id: string;
  change_type: 'visa_rules' | 'tax_rates' | 'cost_of_living' | 'healthcare' | 'immigration_policy' | 'lgbtq_rights' | 'natural_risks' | 'quality_of_life';
  change_summary: string | null;
  old_value: unknown | null;
  new_value: unknown;
  detected_at: string;
  validated_by: string | null;
  validation_status: 'pending' | 'approved' | 'rejected';
  validation_notes: string | null;
  published_at: string | null;
  created_at: string;
  countries?: { name: string };
  country_data_sources?: { source_name: string; source_url: string };
}

export interface ScrapeJob {
  id: string;
  country_id: string | null;
  source_id: string | null;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  changes_detected: number | null;
  tokens_used: number | null;
  created_at: string;
}

// Fetch all data sources
export function useDataSources(countryId?: string) {
  return useQuery({
    queryKey: ['data-sources', countryId],
    queryFn: async () => {
      let query = supabase
        .from('country_data_sources')
        .select('*, countries(name, iso2)')
        .order('country_id', { ascending: true });

      if (countryId) {
        query = query.eq('country_id', countryId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DataSource[];
    },
  });
}

// Fetch pending updates
export function usePendingUpdates() {
  return useQuery({
    queryKey: ['pending-updates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('country_data_updates')
        .select('*, countries(name), country_data_sources(source_name, source_url)')
        .eq('validation_status', 'pending')
        .order('detected_at', { ascending: false });

      if (error) throw error;
      return data as DataUpdate[];
    },
  });
}

// Fetch recent scrape jobs
export function useScrapeJobs(limit = 20) {
  return useQuery({
    queryKey: ['scrape-jobs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scrape_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as ScrapeJob[];
    },
  });
}

// Dashboard stats
export function useDataSourcesStats() {
  return useQuery({
    queryKey: ['data-sources-stats'],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Fetch all required data in parallel
      const [sourcesRes, updatesRes, countriesRes] = await Promise.all([
        supabase.from('country_data_sources').select('id, country_id, is_active, error_count, last_scraped_at'),
        supabase.from('country_data_updates').select('id, validation_status'),
        supabase.from('countries').select('id'),
      ]);

      const sources = sourcesRes.data || [];
      const updates = updatesRes.data || [];
      const countries = countriesRes.data || [];

      const activeSources = sources.filter(s => s.is_active);
      const sourcesWithErrors = sources.filter(s => s.error_count > 0);
      const recentlyScraped = sources.filter(s => 
        s.last_scraped_at && new Date(s.last_scraped_at) > sevenDaysAgo
      );
      const pendingUpdates = updates.filter(u => u.validation_status === 'pending');
      const approvedUpdates = updates.filter(u => u.validation_status === 'approved');

      // Countries with recent data
      const countriesWithSources = new Set(sources.map(s => s.country_id));
      const upToDateCountries = new Set(
        sources
          .filter(s => s.last_scraped_at && new Date(s.last_scraped_at) > sevenDaysAgo)
          .map(s => s.country_id)
      );

      return {
        totalSources: sources.length,
        activeSources: activeSources.length,
        sourcesWithErrors: sourcesWithErrors.length,
        recentlyScraped: recentlyScraped.length,
        pendingUpdates: pendingUpdates.length,
        approvedUpdates: approvedUpdates.length,
        totalCountries: countries.length,
        countriesWithSources: countriesWithSources.size,
        upToDateCountries: upToDateCountries.size,
      };
    },
  });
}

// Mutations
export function useCreateDataSource() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (source: Omit<DataSource, 'id' | 'created_at' | 'updated_at' | 'last_scraped_at' | 'last_content_hash' | 'error_count' | 'last_error' | 'countries'>) => {
      const { data, error } = await supabase
        .from('country_data_sources')
        .insert(source)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-sources'] });
      queryClient.invalidateQueries({ queryKey: ['data-sources-stats'] });
      toast({ title: 'Source ajoutée', description: 'La source de données a été créée.' });
    },
    onError: (error) => {
      toast({ 
        title: 'Erreur', 
        description: error instanceof Error ? error.message : 'Échec de la création',
        variant: 'destructive' 
      });
    },
  });
}

export function useUpdateDataSource() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DataSource> & { id: string }) => {
      const { data, error } = await supabase
        .from('country_data_sources')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-sources'] });
      toast({ title: 'Source mise à jour' });
    },
    onError: (error) => {
      toast({ 
        title: 'Erreur', 
        description: error instanceof Error ? error.message : 'Échec de la mise à jour',
        variant: 'destructive' 
      });
    },
  });
}

export function useDeleteDataSource() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('country_data_sources')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-sources'] });
      queryClient.invalidateQueries({ queryKey: ['data-sources-stats'] });
      toast({ title: 'Source supprimée' });
    },
    onError: (error) => {
      toast({ 
        title: 'Erreur', 
        description: error instanceof Error ? error.message : 'Échec de la suppression',
        variant: 'destructive' 
      });
    },
  });
}

export function useValidateUpdate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      notes 
    }: { 
      id: string; 
      status: 'approved' | 'rejected'; 
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('country_data_updates')
        .update({
          validation_status: status,
          validated_by: user?.id,
          validation_notes: notes,
          published_at: status === 'approved' ? new Date().toISOString() : null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pending-updates'] });
      queryClient.invalidateQueries({ queryKey: ['data-sources-stats'] });
      toast({ 
        title: variables.status === 'approved' ? 'Changement approuvé' : 'Changement rejeté',
        description: variables.status === 'approved' 
          ? 'Les données seront publiées.'
          : 'Le changement a été rejeté.'
      });
    },
    onError: (error) => {
      toast({ 
        title: 'Erreur', 
        description: error instanceof Error ? error.message : 'Échec de la validation',
        variant: 'destructive' 
      });
    },
  });
}

export function useTriggerScrape() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      country_id, 
      source_id, 
      force = false 
    }: { 
      country_id?: string; 
      source_id?: string; 
      force?: boolean;
    }) => {
      const { data, error } = await supabase.functions.invoke('scrape-country-data', {
        body: { country_id, source_id, force },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['data-sources'] });
      queryClient.invalidateQueries({ queryKey: ['pending-updates'] });
      queryClient.invalidateQueries({ queryKey: ['scrape-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['data-sources-stats'] });
      
      const successCount = data.results?.filter((r: { status: string }) => r.status === 'success').length || 0;
      const changesCount = data.results?.reduce((acc: number, r: { changes_detected: number }) => acc + (r.changes_detected || 0), 0) || 0;
      
      toast({ 
        title: 'Scraping terminé', 
        description: `${successCount} source(s) traitée(s), ${changesCount} changement(s) détecté(s).`
      });
    },
    onError: (error) => {
      toast({ 
        title: 'Erreur de scraping', 
        description: error instanceof Error ? error.message : 'Le scraping a échoué',
        variant: 'destructive' 
      });
    },
  });
}

// Get country data freshness
export function useCountryDataFreshness(countryId: string) {
  return useQuery({
    queryKey: ['country-freshness', countryId],
    queryFn: async () => {
      const { data: sources, error } = await supabase
        .from('country_data_sources')
        .select('last_scraped_at, source_name, source_type')
        .eq('country_id', countryId)
        .eq('is_active', true)
        .order('last_scraped_at', { ascending: false });

      if (error) throw error;

      if (!sources || sources.length === 0) {
        return { 
          status: 'no_sources' as const, 
          lastChecked: null, 
          daysSinceCheck: null,
          sources: [] 
        };
      }

      const lastScraped = sources.find(s => s.last_scraped_at)?.last_scraped_at;
      if (!lastScraped) {
        return { 
          status: 'never_checked' as const, 
          lastChecked: null, 
          daysSinceCheck: null,
          sources 
        };
      }

      const lastDate = new Date(lastScraped);
      const daysSince = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      return {
        status: daysSince <= 7 ? 'fresh' as const : 'stale' as const,
        lastChecked: lastDate,
        daysSinceCheck: daysSince,
        sources,
      };
    },
    enabled: !!countryId,
  });
}
