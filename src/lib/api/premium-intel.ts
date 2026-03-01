import { supabase } from '@/integrations/supabase/client';

/**
 * Premium Intelligence API - Firecrawl, Perplexity, ElevenLabs
 */

export interface ScrapeResult {
  success: boolean;
  data?: {
    markdown?: string;
    html?: string;
    metadata?: {
      title?: string;
      description?: string;
      sourceURL?: string;
    };
  };
  error?: string;
}

export interface PerplexityResult {
  success: boolean;
  content?: string;
  citations?: string[];
  model?: string;
  error?: string;
}

export interface TTSResult {
  success: boolean;
  audioContent?: string;
  format?: string;
  voice?: string;
  error?: string;
}

/**
 * Scrape live data from any URL using Firecrawl
 */
export async function scrapeUrl(
  url: string,
  options?: {
    formats?: ('markdown' | 'html' | 'links')[];
    onlyMainContent?: boolean;
  }
): Promise<ScrapeResult> {
  const { data, error } = await supabase.functions.invoke('firecrawl-scrape', {
    body: { url, options }
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return data;
}

/**
 * AI-powered search with citations using Perplexity
 */
export async function searchWithAI(
  query: string,
  options?: {
    model?: 'sonar' | 'sonar-pro';
    maxTokens?: number;
    domainFilter?: string[];
    recencyFilter?: 'day' | 'week' | 'month' | 'year';
  }
): Promise<PerplexityResult> {
  // SECURITY: Only send safe options to server - systemPrompt is server-defined only
  const safeOptions = options ? {
    model: options.model,
    maxTokens: options.maxTokens,
    domainFilter: options.domainFilter,
    recencyFilter: options.recencyFilter,
  } : undefined;
  const { data, error } = await supabase.functions.invoke('perplexity-search', {
    body: { query, options: safeOptions }
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return data;
}

/**
 * Generate audio narration using ElevenLabs
 */
export async function generateAudio(
  text: string,
  options?: {
    voiceStyle?: 'narrator' | 'guide' | 'expert' | 'friendly';
    voiceId?: string;
    stability?: number;
    speed?: number;
  }
): Promise<TTSResult> {
  const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
    body: { 
      text, 
      voiceStyle: options?.voiceStyle,
      voiceId: options?.voiceId,
      options 
    }
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return data;
}

/**
 * Play audio from base64 content
 */
export function playBase64Audio(base64Audio: string): HTMLAudioElement {
  const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
  const audio = new Audio(audioUrl);
  audio.play();
  return audio;
}

/**
 * Get live country intelligence using Perplexity
 */
export async function getLiveCountryIntel(
  countryName: string,
  topic: 'visa' | 'cost-of-living' | 'healthcare' | 'safety' | 'tax' | 'general'
): Promise<PerplexityResult> {
  const prompts: Record<string, string> = {
    visa: `What are the current visa requirements, digital nomad visa options, and residency pathways for ${countryName} in 2026? Include processing times and costs.`,
    'cost-of-living': `What is the current cost of living in ${countryName}? Include rent, food, transport, and healthcare costs for expats in 2026.`,
    healthcare: `What is the healthcare system like in ${countryName} for expats? Include public vs private options, insurance requirements, and quality ratings.`,
    safety: `How safe is ${countryName} for expats? Include crime rates, political stability, natural disaster risks, and areas to avoid.`,
    tax: `What are the tax implications for expats living in ${countryName}? Include income tax rates, tax residency rules, and double taxation treaties.`,
    general: `Provide a comprehensive overview of ${countryName} for someone considering expatriation. Include pros, cons, and practical advice.`
  };

  return searchWithAI(prompts[topic] || prompts.general, {
    recencyFilter: 'month',
    model: 'sonar-pro'
  });
}

/**
 * Scrape official government visa page
 */
export async function scrapeVisaInfo(countryUrl: string): Promise<ScrapeResult> {
  return scrapeUrl(countryUrl, {
    formats: ['markdown'],
    onlyMainContent: true
  });
}
