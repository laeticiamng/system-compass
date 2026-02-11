import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://world-alignment.lovable.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LANGUAGE_NAMES: Record<string, string> = {
  de: "German",
  es: "Spanish", 
  it: "Italian",
  nl: "Dutch",
  pt: "Portuguese",
  zh: "Chinese (Simplified)",
  hi: "Hindi",
  ar: "Arabic",
  bn: "Bengali",
  ru: "Russian",
  ur: "Urdu"
};

const ALL_SECONDARY_LANGUAGES = ['de', 'es', 'nl', 'it', 'pt', 'zh', 'hi', 'ar', 'bn', 'ru', 'ur'];

// All top-level sections from en.json
const ALL_SECTIONS = [
  'exitKeys', 'common', 'errors', 'ai', 'journey', 'insights', 'steps', 
  'responsibility', 'profiles', 'cta', 'guestMode', 'finalCta', 
  'disclaimerConsent', 'simulationDisclaimer', 'header', 'notDoes',
  'systemicMistakes', 'dashboard', 'achievements', 'game', 'footer', 
  'about', 'nav', 'tests', 'worldMap', 'history', 'export', 'vacation',
  'hero', 'howItWorks', 'pyramids', 'pyramidTypes', 'featured', 
  'countries', 'countryDetail', 'profileBuilder', 'pmDashboard', 
  'pmCountry', 'pmTeam', 'pmForecast', 'pmBudget', 'pmRisk', 
  'pmReports', 'pmAnalytics', 'pmSettings', 'governance', 'ovi', 
  'latent', 'irreversa', 'settings', 'admin', 'notifications', 
  'profile', 'profileSetup', 'lifeTrajectory', 'lifeProfiles', 
  'lgbtqRights', 'pyramidQuiz', 'countriesData', 'auth', 'resources',
  'lifeGame', 'pmo', 'financialIntel'
];

function getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  let keys: string[] = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys = keys.concat(getAllKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

async function translateSection(
  sourceText: unknown,
  sourceLang: string,
  targetLang: string,
  context: string
): Promise<unknown> {
  const sourceLangName = LANGUAGE_NAMES[sourceLang] || 'English';
  const targetLangName = LANGUAGE_NAMES[targetLang] || targetLang;

  const systemPrompt = `You are a professional translator for web applications.
Translate from ${sourceLangName} to ${targetLangName}.

RULES:
- Maintain the exact same JSON structure
- Only translate values, not keys
- Keep proper nouns unchanged
- Adapt idioms naturally for target culture
- Return ONLY valid JSON, no explanations

Context: ${context}`;

  const LOVABLE_API_URL = "https://ai.gateway.lovable.dev/v1";
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY not configured");
  }

  const response = await fetch(`${LOVABLE_API_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Translate this JSON to ${targetLangName}. Return ONLY the JSON:\n\n${JSON.stringify(sourceText, null, 2)}` }
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API error:", response.status, errorText);
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  let content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No translation received");
  }

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    content = jsonMatch[1];
  }

  return JSON.parse(content.trim());
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { targetLanguages, sections, sourceTranslations, forceRegenerate } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const langs = targetLanguages || ALL_SECONDARY_LANGUAGES;
    const sects = sections || ALL_SECTIONS;

    console.log(`Syncing ${langs.length} languages, ${sects.length} sections`);

    const results: { language: string; section: string; status: string; keys?: number; message?: string }[] = [];
    let totalKeysTranslated = 0;

    for (const lang of langs) {
      // Get current translations from DB
      const { data: dbData } = await supabase
        .from('ui_translations')
        .select('translations')
        .eq('language', lang)
        .eq('namespace', 'translation')
        .single();

      let currentTranslations = (dbData?.translations as Record<string, unknown>) || {};

      for (const section of sects) {
        const sourceSection = sourceTranslations?.[section];
        if (!sourceSection) {
          results.push({ language: lang, section, status: 'skipped', message: 'Not in source' });
          continue;
        }

        // Check if already translated
        const targetSection = currentTranslations[section];
        if (targetSection && !forceRegenerate) {
          const sourceKeys = getAllKeys(sourceSection as Record<string, unknown>);
          const targetKeys = getAllKeys(targetSection as Record<string, unknown>);
          const coverage = (targetKeys.length / sourceKeys.length) * 100;

          if (coverage >= 95) {
            results.push({ language: lang, section, status: 'skipped', message: `${coverage.toFixed(0)}% complete` });
            continue;
          }
        }

        try {
          console.log(`Translating ${lang}/${section}...`);
          const translated = await translateSection(
            sourceSection,
            'en',
            lang,
            `Web application for country analysis and expatriation. Section: ${section}`
          );

          currentTranslations = {
            ...currentTranslations,
            [section]: translated
          };

          const keysCount = getAllKeys(translated as Record<string, unknown>).length;
          totalKeysTranslated += keysCount;

          results.push({ language: lang, section, status: 'success', keys: keysCount });

          // Rate limiting
          await new Promise(r => setTimeout(r, 500));
        } catch (err) {
          console.error(`Error translating ${lang}/${section}:`, err);
          results.push({ 
            language: lang, 
            section, 
            status: 'error', 
            message: err instanceof Error ? err.message : 'Unknown error' 
          });
        }
      }

      // Save all translations for this language
      const { error: upsertError } = await supabase
        .from('ui_translations')
        .upsert([{
          language: lang,
          namespace: 'translation',
          translations: currentTranslations,
          updated_at: new Date().toISOString()
        }], {
          onConflict: 'language,namespace'
        });

      if (upsertError) {
        console.error(`Error saving ${lang}:`, upsertError);
      } else {
        console.log(`Saved ${lang} translations`);
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    const skippedCount = results.filter(r => r.status === 'skipped').length;

    return new Response(JSON.stringify({
      success: true,
      summary: {
        totalSections: results.length,
        translated: successCount,
        skipped: skippedCount,
        errors: errorCount,
        totalKeysTranslated
      },
      results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Sync error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
