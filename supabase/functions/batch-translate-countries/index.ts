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

function cleanJsonResponse(content: string): string {
  let cleaned = content
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();
  
  // Fix common JSON issues from AI responses
  // Remove trailing commas before } or ]
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
  
  // Fix unescaped quotes in strings (basic fix)
  // This is a simple heuristic - replace \" that might be broken
  cleaned = cleaned.replace(/([^\\])\\([^"\\nrtbfu])/g, '$1\\\\$2');
  
  return cleaned;
}

async function translateData(data: Record<string, unknown>, targetLang: string, retryCount = 0): Promise<Record<string, unknown>> {
  const targetLanguageName = LANGUAGE_NAMES[targetLang] || targetLang;
  
  const systemPrompt = `You are a professional translator specializing in socio-economic country analysis.
Translate the following JSON content from English to ${targetLanguageName}.
CRITICAL RULES:
- Preserve ALL JSON structure exactly - same keys, same nesting
- Translate ONLY string values, never keys
- Keep technical terms accurate
- Maintain the analytical, informative tone
- Escape all quotes inside strings with backslash
- Return ONLY valid JSON, no explanations, no markdown code blocks
- Double-check your JSON is valid before returning`;

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

  const cleanedContent = cleanJsonResponse(translatedContent);
  
  try {
    return JSON.parse(cleanedContent);
  } catch (parseError) {
    console.error(`JSON parse error for ${targetLang}, attempt ${retryCount + 1}:`, parseError);
    console.error(`Content preview: ${cleanedContent.substring(0, 200)}...`);
    
    // Retry up to 2 times
    if (retryCount < 2) {
      console.log(`Retrying translation for ${targetLang}...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return translateData(data, targetLang, retryCount + 1);
    }
    
    throw new Error(`JSON parse failed after ${retryCount + 1} attempts: ${parseError instanceof Error ? parseError.message : 'Unknown'}`);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { languages = LANGUAGES, limit = 5, offset = 0 } = await req.json();
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get all countries with their data - ALL fields
    const { data: variants } = await supabase
      .from('country_variants')
      .select('*')
      .range(offset, offset + limit - 1);

    const { data: intelligence } = await supabase
      .from('country_intelligence')
      .select('*')
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
