import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://world-alignment.lovable.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SCRAPE-COUNTRY-DATA] ${step}${detailsStr}`);
};

// Hash content using SHA-256
async function hashContent(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// AI extraction prompt
const EXTRACTION_PROMPT = `You are an expert data analyst specializing in country-specific regulatory and economic information. 
Analyze the following webpage content and extract structured data about this country.

IMPORTANT: Only extract information that is explicitly stated in the content. Do not make assumptions or fill in gaps with general knowledge.

For each category you find relevant information about, provide:
1. The extracted data in a structured format
2. A confidence score (0-100) for the accuracy of the extraction
3. Key quotes or references from the source

Categories to look for:
- visa_rules: Visa requirements, types, durations, fees, application processes
- tax_rates: Income tax, corporate tax, VAT, property tax rates and brackets
- cost_of_living: Rent, utilities, food, transportation costs
- healthcare: Healthcare system, insurance requirements, quality indicators
- immigration_policy: Residence permits, work permits, citizenship paths
- lgbtq_rights: Legal status, protections, social acceptance indicators
- natural_risks: Natural disasters, climate risks, safety concerns
- quality_of_life: Indices, rankings, livability factors

Respond in JSON format:
{
  "extracted_data": [
    {
      "category": "visa_rules",
      "data": { ... structured data ... },
      "confidence": 85,
      "source_quotes": ["quote 1", "quote 2"],
      "summary": "Brief summary of what was found"
    }
  ],
  "page_summary": "Overall summary of the page content",
  "data_freshness_indicators": ["any dates or update indicators found"],
  "language": "detected language of the content"
}`;

interface ScrapeRequest {
  country_id?: string;
  source_id?: string;
  force?: boolean; // Force scrape even if not due
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const firecrawlApiKey = Deno.env.get("FIRECRAWL_API_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }
    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Verify admin role
    const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roleData } = await supabaseAuth
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body: ScrapeRequest = await req.json();
    const { country_id, source_id, force = false } = body;

    logStep("Request params", { country_id, source_id, force });

    // Build query for sources to scrape
    let sourcesQuery = supabase
      .from("country_data_sources")
      .select("*, countries(name)")
      .eq("is_active", true);

    if (source_id) {
      sourcesQuery = sourcesQuery.eq("id", source_id);
    } else if (country_id) {
      sourcesQuery = sourcesQuery.eq("country_id", country_id);
    }

    const { data: sources, error: sourcesError } = await sourcesQuery;
    if (sourcesError) throw sourcesError;

    if (!sources || sources.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No sources to scrape",
        processed: 0 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Found sources", { count: sources.length });

    const results: Array<{
      source_id: string;
      country_id: string;
      status: string;
      changes_detected: number;
      error?: string;
    }> = [];

    for (const source of sources) {
      // Check if scrape is due (unless forced)
      if (!force && source.last_scraped_at) {
        const lastScrape = new Date(source.last_scraped_at);
        const nextScrape = new Date(lastScrape.getTime() + source.scrape_frequency_hours * 60 * 60 * 1000);
        if (new Date() < nextScrape) {
          logStep("Skipping source - not due", { source_id: source.id, next_scrape: nextScrape });
          continue;
        }
      }

      // Create scrape job
      const { data: job, error: jobError } = await supabase
        .from("scrape_jobs")
        .insert({
          country_id: source.country_id,
          source_id: source.id,
          status: "running",
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (jobError) {
        logStep("Failed to create job", { error: jobError.message });
        continue;
      }

      try {
        logStep("Scraping source", { source_id: source.id, url: source.source_url });

        // Fetch content using Firecrawl if available, otherwise basic fetch
        let pageContent: string;
        let pageMarkdown: string | undefined;

        if (firecrawlApiKey) {
          const firecrawlResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${firecrawlApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url: source.source_url,
              formats: ["markdown", "html"],
              onlyMainContent: true,
              waitFor: 3000,
            }),
          });

          if (firecrawlResponse.ok) {
            const firecrawlData = await firecrawlResponse.json();
            pageMarkdown = firecrawlData.data?.markdown || firecrawlData.markdown;
            pageContent = pageMarkdown || firecrawlData.data?.html || "";
          } else {
            throw new Error(`Firecrawl error: ${firecrawlResponse.status}`);
          }
        } else {
          // Basic fetch fallback
          const fetchResponse = await fetch(source.source_url, {
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; PyramidCompass/1.0; +https://pyramid-compass.com)",
            },
          });
          if (!fetchResponse.ok) {
            throw new Error(`Fetch error: ${fetchResponse.status}`);
          }
          pageContent = await fetchResponse.text();
        }

        if (!pageContent || pageContent.length < 100) {
          throw new Error("Page content too short or empty");
        }

        // Hash the content
        const contentHash = await hashContent(pageContent);
        logStep("Content hashed", { hash: contentHash.substring(0, 16), length: pageContent.length });

        // Check if content has changed
        const hasChanged = source.last_content_hash !== contentHash;
        
        let changesDetected = 0;
        let tokensUsed = 0;

        if (hasChanged || force) {
          logStep("Content changed, analyzing with AI");

          // Use AI to extract structured data
          const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${lovableApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { role: "system", content: EXTRACTION_PROMPT },
                { 
                  role: "user", 
                  content: `Country: ${source.countries?.name || source.country_id}\nSource Type: ${source.source_type}\nSource URL: ${source.source_url}\n\nPage Content:\n${(pageMarkdown || pageContent).substring(0, 15000)}` 
                }
              ],
              response_format: { type: "json_object" },
            }),
          });

          if (!aiResponse.ok) {
            const errorText = await aiResponse.text();
            if (aiResponse.status === 429) {
              throw new Error("Rate limit exceeded, please try again later");
            }
            if (aiResponse.status === 402) {
              throw new Error("AI credits exhausted");
            }
            throw new Error(`AI error: ${aiResponse.status} - ${errorText}`);
          }

          const aiData = await aiResponse.json();
          tokensUsed = aiData.usage?.total_tokens || 0;

          const extractedContent = aiData.choices?.[0]?.message?.content;
          if (!extractedContent) {
            throw new Error("No AI response content");
          }

          let extractedData;
          try {
            extractedData = JSON.parse(extractedContent);
          } catch {
            throw new Error("Failed to parse AI response as JSON");
          }

          logStep("AI extraction complete", { 
            categories_found: extractedData.extracted_data?.length || 0,
            tokens: tokensUsed 
          });

          // Save detected changes
          if (extractedData.extracted_data && Array.isArray(extractedData.extracted_data)) {
            for (const item of extractedData.extracted_data) {
              if (item.confidence >= 60) { // Only save high-confidence extractions
                const changeTypeMap: Record<string, string> = {
                  visa_rules: 'visa_rules',
                  tax_rates: 'tax_rates',
                  cost_of_living: 'cost_of_living',
                  healthcare: 'healthcare',
                  immigration_policy: 'immigration_policy',
                  lgbtq_rights: 'lgbtq_rights',
                  natural_risks: 'natural_risks',
                  quality_of_life: 'quality_of_life',
                };

                const changeType = changeTypeMap[item.category];
                if (changeType) {
                  const { error: insertError } = await supabase
                    .from("country_data_updates")
                    .insert({
                      country_id: source.country_id,
                      source_id: source.id,
                      change_type: changeType,
                      change_summary: item.summary,
                      new_value: {
                        data: item.data,
                        confidence: item.confidence,
                        source_quotes: item.source_quotes,
                        page_summary: extractedData.page_summary,
                        freshness_indicators: extractedData.data_freshness_indicators,
                      },
                      validation_status: 'pending',
                    });

                  if (!insertError) {
                    changesDetected++;
                  }
                }
              }
            }
          }
        }

        // Update source record
        await supabase
          .from("country_data_sources")
          .update({
            last_scraped_at: new Date().toISOString(),
            last_content_hash: contentHash,
            error_count: 0,
            last_error: null,
          })
          .eq("id", source.id);

        // Update job status
        await supabase
          .from("scrape_jobs")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
            changes_detected: changesDetected,
            tokens_used: tokensUsed,
          })
          .eq("id", job.id);

        results.push({
          source_id: source.id,
          country_id: source.country_id,
          status: "success",
          changes_detected: changesDetected,
        });

        logStep("Source processed", { source_id: source.id, changes: changesDetected });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        logStep("Source error", { source_id: source.id, error: errorMessage });

        // Update source with error
        await supabase
          .from("country_data_sources")
          .update({
            error_count: source.error_count + 1,
            last_error: errorMessage,
          })
          .eq("id", source.id);

        // Update job status
        await supabase
          .from("scrape_jobs")
          .update({
            status: "failed",
            completed_at: new Date().toISOString(),
            error_message: errorMessage,
          })
          .eq("id", job.id);

        results.push({
          source_id: source.id,
          country_id: source.country_id,
          status: "error",
          changes_detected: 0,
          error: errorMessage,
        });
      }
    }

    logStep("Scraping complete", { 
      total: results.length, 
      success: results.filter(r => r.status === "success").length 
    });

    return new Response(JSON.stringify({
      success: true,
      processed: results.length,
      results,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
