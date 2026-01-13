import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// All countries with complete data
const ALL_COUNTRIES = [
  'argentina', 'australia', 'austria', 'belgium', 'brazil', 'cameroon', 
  'canada', 'chile', 'china', 'colombia', 'cuba', 'denmark', 'france', 
  'germany', 'india', 'italy', 'japan', 'mexico', 'morocco', 'netherlands', 
  'nigeria', 'norway', 'peru', 'poland', 'portugal', 'qatar', 'russia', 
  'saudi-arabia', 'singapore', 'south-africa', 'spain', 'sweden', 
  'switzerland', 'turkey', 'uae', 'united-kingdom', 'usa', 'venezuela'
];

const COUNTRY_NAMES: Record<string, string> = {
  'argentina': 'Argentina',
  'australia': 'Australia', 
  'austria': 'Austria',
  'belgium': 'Belgium',
  'brazil': 'Brazil',
  'cameroon': 'Cameroon',
  'canada': 'Canada',
  'chile': 'Chile',
  'china': 'China',
  'colombia': 'Colombia',
  'cuba': 'Cuba',
  'denmark': 'Denmark',
  'france': 'France',
  'germany': 'Germany',
  'india': 'India',
  'italy': 'Italy',
  'japan': 'Japan',
  'mexico': 'Mexico',
  'morocco': 'Morocco',
  'netherlands': 'Netherlands',
  'nigeria': 'Nigeria',
  'norway': 'Norway',
  'peru': 'Peru',
  'poland': 'Poland',
  'portugal': 'Portugal',
  'qatar': 'Qatar',
  'russia': 'Russia',
  'saudi-arabia': 'Saudi Arabia',
  'singapore': 'Singapore',
  'south-africa': 'South Africa',
  'spain': 'Spain',
  'sweden': 'Sweden',
  'switzerland': 'Switzerland',
  'turkey': 'Turkey',
  'uae': 'United Arab Emirates',
  'united-kingdom': 'United Kingdom',
  'usa': 'United States',
  'venezuela': 'Venezuela'
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { language = "fr", onlyMissing = true, limit = 5, offset = 0 } = await req.json();
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get countries that already have cached data
    const { data: existingCache } = await supabase
      .from('terrain_realities_cache')
      .select('country_id, language')
      .eq('language', language);

    const existingCountries = new Set(existingCache?.map(c => c.country_id) || []);
    
    // Filter countries to process
    let countriesToProcess = onlyMissing 
      ? ALL_COUNTRIES.filter(c => !existingCountries.has(c))
      : ALL_COUNTRIES;

    // Apply pagination
    countriesToProcess = countriesToProcess.slice(offset, offset + limit);

    console.log(`Processing ${countriesToProcess.length} countries for language: ${language}`);
    console.log(`Countries: ${countriesToProcess.join(', ')}`);

    const results: { country: string; status: string; error?: string }[] = [];

    // Process countries sequentially to avoid rate limits
    for (const countryId of countriesToProcess) {
      try {
        console.log(`Generating terrain realities for ${countryId}...`);
        
        // Call the terrain-realities function
        const response = await supabase.functions.invoke('terrain-realities', {
          body: { 
            country: countryId,
            countryName: COUNTRY_NAMES[countryId] || countryId,
            language 
          },
        });

        if (response.error) {
          console.error(`Error for ${countryId}:`, response.error);
          results.push({ country: countryId, status: 'error', error: response.error.message });
        } else {
          console.log(`Successfully generated for ${countryId}`);
          results.push({ country: countryId, status: 'completed' });
        }

        // Add delay between calls to avoid rate limits (5 seconds)
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (err) {
        console.error(`Exception for ${countryId}:`, err);
        results.push({ 
          country: countryId, 
          status: 'error', 
          error: err instanceof Error ? err.message : 'Unknown error' 
        });
      }
    }

    const completed = results.filter(r => r.status === 'completed').length;
    const failed = results.filter(r => r.status === 'error').length;
    const remaining = ALL_COUNTRIES.length - existingCountries.size - completed;

    return new Response(
      JSON.stringify({ 
        success: true,
        language,
        totalCountries: ALL_COUNTRIES.length,
        alreadyCached: existingCountries.size,
        processed: results.length,
        completed,
        failed,
        remaining,
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
