/**
 * LiveIntelPanel - Real-time intelligence panel using Perplexity & Firecrawl
 * Revolutionary feature: Live data with citations
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveCountryIntel, type IntelTopic } from '@/hooks/useLiveCountryIntel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Radio,
  DollarSign,
  Heart,
  Shield,
  Receipt,
  Globe,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Zap,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  countryId: string;
  countryName: string;
}

const TOPICS: { id: IntelTopic; icon: typeof Radio; label: string; color: string }[] = [
  { id: 'visa', icon: Globe, label: 'Visa', color: 'text-blue-500' },
  { id: 'cost-of-living', icon: DollarSign, label: 'Coût de vie', color: 'text-emerald-500' },
  { id: 'healthcare', icon: Heart, label: 'Santé', color: 'text-rose-500' },
  { id: 'safety', icon: Shield, label: 'Sécurité', color: 'text-amber-500' },
  { id: 'tax', icon: Receipt, label: 'Fiscalité', color: 'text-purple-500' },
  { id: 'general', icon: Sparkles, label: 'Général', color: 'text-primary' },
];

export function LiveIntelPanel({ countryId, countryName }: Props) {
  const { t } = useTranslation();
  const [selectedTopic, setSelectedTopic] = useState<IntelTopic>('general');
  
  const {
    isLoading,
    activeTopic,
    fetchLiveIntel,
    getCachedIntel,
    isCacheFresh,
    lastIntelResult,
  } = useLiveCountryIntel({ countryName, countryId });

  const cachedData = getCachedIntel(selectedTopic);
  const displayData = selectedTopic === lastIntelResult?.topic ? lastIntelResult : cachedData;
  const isFresh = isCacheFresh(selectedTopic);

  const handleFetch = () => {
    fetchLiveIntel(selectedTopic);
  };

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Zap className="w-5 h-5 text-primary" />
            </motion.div>
            {t('liveIntel.title', 'Intelligence Temps Réel')}
            <Badge variant="outline" className="text-xs bg-red-500/10 text-red-500 border-red-500/30">
              <Radio className="w-3 h-3 mr-1 animate-pulse" />
              LIVE
            </Badge>
          </CardTitle>
          {displayData && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {isFresh ? 'Cache frais' : 'Données en cache'}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Topic Selector */}
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((topic) => {
            const Icon = topic.icon;
            const isActive = selectedTopic === topic.id;
            const isFetching = activeTopic === topic.id;
            
            return (
              <motion.div
                key={topic.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTopic(topic.id)}
                  className={cn(
                    'gap-1.5 transition-all',
                    isActive && 'shadow-lg shadow-primary/25'
                  )}
                  disabled={isFetching}
                >
                  <Icon className={cn('w-3.5 h-3.5', !isActive && topic.color)} />
                  {topic.label}
                  {isFetching && (
                    <RefreshCw className="w-3 h-3 animate-spin ml-1" />
                  )}
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Fetch Button */}
        <Button
          onClick={handleFetch}
          disabled={isLoading}
          className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              {t('liveIntel.fetching', 'Recherche en cours...')}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {t('liveIntel.fetchNow', 'Actualiser données live')}
            </>
          )}
        </Button>

        {/* Results */}
        <AnimatePresence mode="wait">
          {isLoading && !displayData ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </motion.div>
          ) : displayData ? (
            <motion.div
              key={displayData.topic}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Content */}
              <ScrollArea className="h-[300px] rounded-lg border bg-muted/20 p-4">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {displayData.content}
                  </p>
                </div>
              </ScrollArea>

              {/* Citations */}
              {displayData.citations && displayData.citations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    {t('liveIntel.sources', 'Sources')} ({displayData.citations.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {displayData.citations.slice(0, 5).map((citation, idx) => {
                      let domain = 'source';
                      try {
                        domain = new URL(citation).hostname.replace('www.', '');
                      } catch {
                        // Invalid URL, use default
                      }
                      return (
                        <motion.a
                          key={idx}
                          href={citation}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.05 }}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {domain}
                        </motion.a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Timestamp */}
              <p className="text-xs text-muted-foreground text-right">
                {t('liveIntel.updated', 'Mis à jour')}: {displayData.timestamp.toLocaleString()}
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-muted-foreground"
            >
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                {t('liveIntel.clickToFetch', 'Cliquez pour obtenir des données en temps réel')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
