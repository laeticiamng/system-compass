/**
 * useLiveCountryIntel - Hook for real-time country intelligence using Perplexity & Firecrawl
 * Revolutionary feature: Live data scraping + AI-powered research with citations
 */

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { scrapeUrl, searchWithAI, getLiveCountryIntel, type PerplexityResult, type ScrapeResult } from '@/lib/api/premium-intel';
import { useToast } from '@/hooks/use-toast';

export type IntelTopic = 'visa' | 'cost-of-living' | 'healthcare' | 'safety' | 'tax' | 'general';

interface LiveIntelData {
  content: string;
  citations: string[];
  timestamp: Date;
  topic: IntelTopic;
  isLive: boolean;
}

interface UseLiveCountryIntelOptions {
  countryName: string;
  countryId: string;
  enabled?: boolean;
}

export function useLiveCountryIntel({ countryName, countryId }: UseLiveCountryIntelOptions) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTopic, setActiveTopic] = useState<IntelTopic | null>(null);

  // Cache key for live intel
  const cacheKey = ['live-intel', countryId];

  // Fetch live intelligence for a specific topic
  const fetchLiveIntel = useMutation({
    mutationFn: async (topic: IntelTopic): Promise<LiveIntelData> => {
      setActiveTopic(topic);
      
      const result = await getLiveCountryIntel(countryName, topic);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch live intelligence');
      }

      return {
        content: result.content || '',
        citations: result.citations || [],
        timestamp: new Date(),
        topic,
        isLive: true,
      };
    },
    onSuccess: (data) => {
      // Cache the result
      queryClient.setQueryData([...cacheKey, data.topic], data);
      toast({
        title: '🔴 Live Intel',
        description: `Données ${data.topic} actualisées avec ${data.citations.length} sources`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur Live Intel',
        description: error instanceof Error ? error.message : 'Échec récupération données',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setActiveTopic(null);
    },
  });

  // Scrape a specific URL for visa/official info
  const scrapeOfficialSource = useMutation({
    mutationFn: async (url: string): Promise<ScrapeResult> => {
      const result = await scrapeUrl(url, {
        formats: ['markdown'],
        onlyMainContent: true,
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to scrape URL');
      }
      
      return result;
    },
    onSuccess: () => {
      toast({
        title: '📄 Source Scrapée',
        description: 'Contenu officiel extrait avec succès',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur Scraping',
        description: error instanceof Error ? error.message : 'Échec extraction',
        variant: 'destructive',
      });
    },
  });

  // Get cached intel for a topic
  const getCachedIntel = useCallback((topic: IntelTopic): LiveIntelData | undefined => {
    return queryClient.getQueryData([...cacheKey, topic]);
  }, [queryClient, cacheKey]);

  // Check if cache is fresh (< 1 hour)
  const isCacheFresh = useCallback((topic: IntelTopic): boolean => {
    const cached = getCachedIntel(topic);
    if (!cached) return false;
    
    const oneHour = 60 * 60 * 1000;
    return Date.now() - cached.timestamp.getTime() < oneHour;
  }, [getCachedIntel]);

  // Quick search with AI
  const quickSearch = useMutation({
    mutationFn: async (query: string): Promise<PerplexityResult> => {
      const result = await searchWithAI(query, {
        recencyFilter: 'month',
        maxTokens: 500,
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Search failed');
      }
      
      return result;
    },
  });

  return {
    // State
    isLoading: fetchLiveIntel.isPending,
    isScraping: scrapeOfficialSource.isPending,
    isSearching: quickSearch.isPending,
    activeTopic,
    
    // Actions
    fetchLiveIntel: fetchLiveIntel.mutate,
    scrapeOfficialSource: scrapeOfficialSource.mutate,
    quickSearch: quickSearch.mutateAsync,
    
    // Cache
    getCachedIntel,
    isCacheFresh,
    
    // Results
    lastIntelResult: fetchLiveIntel.data,
    lastScrapeResult: scrapeOfficialSource.data,
    lastSearchResult: quickSearch.data,
    
    // Errors
    intelError: fetchLiveIntel.error,
    scrapeError: scrapeOfficialSource.error,
    searchError: quickSearch.error,
  };
}
