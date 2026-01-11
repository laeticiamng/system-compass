import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const LANGUAGES = ["fr", "es", "de", "it", "pt", "nl", "ar", "zh", "ru", "hi", "ja", "ko", "pl", "tr"];

const LANGUAGE_NAMES: Record<string, string> = {
  fr: "French",
  de: "German",
  es: "Spanish",
  it: "Italian",
  nl: "Dutch",
  pt: "Portuguese",
  zh: "Mandarin Chinese",
  hi: "Hindi",
  ar: "Arabic",
  ru: "Russian",
  ja: "Japanese",
  ko: "Korean",
  tr: "Turkish",
  pl: "Polish",
};

async function translateData(data: Record<string, unknown>, targetLang: string): Promise<Record<string, unknown>> {
  const targetLanguageName = LANGUAGE_NAMES[targetLang] || targetLang;
  
  const systemPrompt = `You are a professional translator specializing in socio-economic country analysis.
Translate the following JSON content from English to ${targetLanguageName}.
CRITICAL RULES:
- Preserve ALL JSON structure exactly
- Translate ONLY string values, never keys
- Keep technical terms accurate
- Maintain the analytical, informative tone
- Return ONLY valid JSON, no explanations or markdown`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(data) },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Translation API failed: ${response.status}`);
  }

  const aiResponse = await response.json();
  const translatedContent = aiResponse.choices?.[0]?.message?.content;

  if (!translatedContent) {
    throw new Error("No translation content received");
  }

  const cleanedContent = translatedContent
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();
  
  return JSON.parse(cleanedContent);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { languages = LANGUAGES, limit = 5, offset = 0 } = await req.json();
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get all countries with their data
    const { data: variants } = await supabase
      .from('country_variants')
      .select('country_id, daily_life, entrepreneurship, labor_market, institutions, networks, profiles_succeed, profiles_struggle, surprises, example_trajectories, typical_day, real_costs_breakdown, cultural_shocks, expat_communities, hidden_admin_steps, year_one_reality, success_timeline_months, common_mistakes_timeline')
      .range(offset, offset + limit - 1);

    const { data: intelligence } = await supabase
      .from('country_intelligence')
      .select('country_id, power_formal, power_informal, power_keys_ranking, strategies_rewarded, strategies_punished, adaptive_behaviors, backfiring_behaviors, newcomer_mistakes, mobility_elevators, dependencies, historical_traces, legacy_implications, macro_risks, system_produces, negotiation_styles, unspoken_rules, trust_signals, distrust_signals, taboo_topics, hidden_hierarchies, time_perception, decision_making_patterns, career_ceiling_by_profile, exit_difficulty')
      .range(offset, offset + limit - 1);

    if (!variants?.length) {
      return new Response(
        JSON.stringify({ success: true, message: "No more countries to translate" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${variants.length} countries for ${languages.length} languages`);

    const results: Record<string, unknown>[] = [];

    for (const variant of variants) {
      const countryId = variant.country_id;
      const intel = intelligence?.find(i => i.country_id === countryId);

      for (const lang of languages) {
        try {
          // Check if translations already exist
          const { data: existingVariant } = await supabase
            .from('country_variants_translations')
            .select('id')
            .eq('country_id', countryId)
            .eq('language', lang)
            .single();

          const { data: existingIntel } = await supabase
            .from('country_intelligence_translations')
            .select('id')
            .eq('country_id', countryId)
            .eq('language', lang)
            .single();

          if (existingVariant && existingIntel) {
            console.log(`Skipping ${countryId}/${lang} - already translated`);
            results.push({ countryId, lang, status: 'skipped' });
            continue;
          }

          console.log(`Translating ${countryId} to ${lang}...`);

          // Translate variants if needed
          if (!existingVariant) {
            const { country_id: _, ...variantData } = variant;
            const translatedVariant = await translateData(variantData, lang);
            
            await supabase
              .from('country_variants_translations')
              .upsert({
                country_id: countryId,
                language: lang,
                translated_data: translatedVariant,
              });
            
            console.log(`Variants translated for ${countryId}/${lang}`);
          }

          // Translate intelligence if needed
          if (!existingIntel && intel) {
            const { country_id: _, ...intelData } = intel;
            const translatedIntel = await translateData(intelData, lang);
            
            await supabase
              .from('country_intelligence_translations')
              .upsert({
                country_id: countryId,
                language: lang,
                translated_data: translatedIntel,
              });
            
            console.log(`Intelligence translated for ${countryId}/${lang}`);
          }

          results.push({ countryId, lang, status: 'completed' });

          // Delay between translations to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (err) {
          console.error(`Error translating ${countryId}/${lang}:`, err);
          results.push({ countryId, lang, status: 'error', error: err instanceof Error ? err.message : 'Unknown' });
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        countriesProcessed: variants.length,
        languagesProcessed: languages.length,
        results 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Batch translation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
