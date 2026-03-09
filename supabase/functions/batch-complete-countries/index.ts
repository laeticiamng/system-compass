import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return handleCorsPreflightRequest(req);
  }

  const corsHeaders = getCorsHeaders(req);

  try {
    const { type = "both", limit = 5, offset = 0 } = await req.json();
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get countries that need completion
    let countriesToComplete: string[] = [];

    if (type === 'variants' || type === 'both') {
      // Find variants with empty enriched fields
      const { data: variants } = await supabase
        .from('country_variants')
        .select('country_id, real_costs_breakdown, typical_day')
        .range(offset, offset + limit - 1);

      if (variants) {
        const needsCompletion = variants.filter(v => {
          const costsEmpty = !v.real_costs_breakdown || 
            (Array.isArray(v.real_costs_breakdown) && v.real_costs_breakdown.length === 0) ||
            (typeof v.real_costs_breakdown === 'object' && Object.keys(v.real_costs_breakdown).length === 0);
          const dayEmpty = !v.typical_day || 
            (Array.isArray(v.typical_day) && v.typical_day.length === 0) ||
            (typeof v.typical_day === 'object' && Object.keys(v.typical_day).length === 0);
          return costsEmpty || dayEmpty;
        });
        countriesToComplete = needsCompletion.map(v => v.country_id);
      }
    }

    if (type === 'intelligence' || type === 'both') {
      // Find intelligence with empty enriched fields
      const { data: intelligence } = await supabase
        .from('country_intelligence')
        .select('country_id, negotiation_styles, unspoken_rules')
        .range(offset, offset + limit - 1);

      if (intelligence) {
        const needsCompletion = intelligence.filter(i => {
          const negoEmpty = !i.negotiation_styles || 
            (Array.isArray(i.negotiation_styles) && i.negotiation_styles.length === 0) ||
            (typeof i.negotiation_styles === 'object' && Object.keys(i.negotiation_styles).length === 0);
          const rulesEmpty = !i.unspoken_rules || 
            (Array.isArray(i.unspoken_rules) && i.unspoken_rules.length === 0) ||
            (typeof i.unspoken_rules === 'object' && Object.keys(i.unspoken_rules).length === 0);
          return negoEmpty || rulesEmpty;
        });
        
        // Merge with existing list
        const intelligenceCountries = needsCompletion.map(i => i.country_id);
        countriesToComplete = [...new Set([...countriesToComplete, ...intelligenceCountries])];
      }
    }

    console.log(`Found ${countriesToComplete.length} countries to complete`);

    // Process each country sequentially
    const results: Record<string, unknown>[] = [];
    
    for (const countryId of countriesToComplete) {
      try {
        console.log(`Processing ${countryId}...`);
        
        // Call the complete-country-data function
        const response = await supabase.functions.invoke('complete-country-data', {
          body: { countryId, type },
        });

        if (response.error) {
          results.push({ countryId, status: 'error', error: response.error.message });
        } else {
          results.push({ countryId, status: 'completed', ...response.data });
        }

        // Add delay between calls to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (err) {
        results.push({ countryId, status: 'error', error: err instanceof Error ? err.message : 'Unknown' });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        totalProcessed: results.length,
        results 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Batch error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
