import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const EdgeRuntime: {
  waitUntil: (promise: Promise<unknown>) => void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://world-alignment.lovable.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

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
  'brazil': 'Brésil',
  'cameroon': 'Cameroun',
  'canada': 'Canada',
  'chile': 'Chili',
  'china': 'Chine',
  'colombia': 'Colombie',
  'cuba': 'Cuba',
  'denmark': 'Danemark',
  'france': 'France',
  'germany': 'Allemagne',
  'india': 'Inde',
  'italy': 'Italie',
  'japan': 'Japon',
  'mexico': 'Mexique',
  'morocco': 'Maroc',
  'netherlands': 'Pays-Bas',
  'nigeria': 'Nigeria',
  'norway': 'Norvège',
  'peru': 'Pérou',
  'poland': 'Pologne',
  'portugal': 'Portugal',
  'qatar': 'Qatar',
  'russia': 'Russie',
  'saudi-arabia': 'Arabie Saoudite',
  'singapore': 'Singapour',
  'south-africa': 'Afrique du Sud',
  'spain': 'Espagne',
  'sweden': 'Suède',
  'switzerland': 'Suisse',
  'turkey': 'Turquie',
  'uae': 'Émirats Arabes Unis',
  'united-kingdom': 'Royaume-Uni',
  'usa': 'États-Unis',
  'venezuela': 'Venezuela'
};

const SYSTEM_PROMPT = `Tu es un analyste expert en réalités systémiques des pays. Tu génères des analyses FACTUELLES et DOCUMENTÉES sur les dysfonctionnements réels des systèmes nationaux.

RÈGLES CRITIQUES:
1. Sois FACTUEL - cite des exemples réels, des statistiques, des cas documentés
2. Ne minimise pas les problèmes - les utilisateurs ont besoin de la vérité pour se protéger
3. Couvre les 4 domaines: Santé, Justice, Sécurité, Administration
4. Pour chaque domaine, inclus: niveau de risque, problèmes systémiques, exemples concrets, recours disponibles
5. Réponds UNIQUEMENT en JSON valide, sans commentaires ni texte autour

STRUCTURE JSON REQUISE:
{
  "overallRiskLevel": "critical|high|moderate|low",
  "disclaimer": "Avertissement légal approprié",
  "healthcare": {
    "riskLevel": "critical|high|moderate|low",
    "systemicIssues": ["problème 1", "problème 2"],
    "realExamples": ["exemple documenté 1", "exemple 2"],
    "specificRisks": {
      "medications": { "risk": "high|moderate|low", "details": "..." },
      "laboratories": { "risk": "...", "details": "..." },
      "chronicCare": { "risk": "...", "details": "..." },
      "emergencyServices": { "risk": "...", "details": "..." }
    },
    "recourses": [{ "name": "...", "procedure": "...", "timeline": "...", "effectiveness": "..." }],
    "protectionAdvice": ["conseil 1", "conseil 2"]
  },
  "justice": {
    "riskLevel": "critical|high|moderate|low",
    "systemicIssues": ["corruption judiciaire", "lenteur", "etc"],
    "realExamples": ["cas documenté"],
    "specificRisks": {
      "corruption": { "risk": "...", "details": "..." },
      "delays": { "risk": "...", "details": "..." },
      "lawyerReliability": { "risk": "...", "details": "..." },
      "enforcement": { "risk": "...", "details": "..." }
    },
    "emergencyRecourses": [{ "name": "...", "when": "...", "procedure": "...", "timeline": "...", "cost": "..." }],
    "protectionAdvice": ["conseil"]
  },
  "security": {
    "riskLevel": "critical|high|moderate|low",
    "systemicIssues": ["problème"],
    "realExamples": ["exemple"],
    "specificRisks": {
      "humanTrafficking": { "risk": "...", "details": "...", "hotspots": ["zone"] },
      "organizedCrime": { "risk": "...", "details": "..." },
      "policeReliability": { "risk": "...", "details": "..." },
      "kidnapping": { "risk": "...", "details": "..." }
    },
    "emergencyContacts": [{ "name": "...", "number": "...", "reliability": "..." }],
    "protectionAdvice": ["conseil"]
  },
  "administration": {
    "riskLevel": "critical|high|moderate|low",
    "systemicIssues": ["problème"],
    "realExamples": ["exemple"],
    "specificRisks": {
      "documentFraud": { "risk": "...", "details": "..." },
      "briberyExpectation": { "risk": "...", "details": "..." },
      "processingDelays": { "risk": "...", "details": "..." },
      "arbitraryDecisions": { "risk": "...", "details": "..." }
    },
    "recourses": [{ "name": "...", "procedure": "...", "timeline": "..." }],
    "protectionAdvice": ["conseil"]
  },
  "positiveDevelopments": ["amélioration récente 1", "amélioration 2"],
  "sources": ["source 1", "source 2"]
}`;

async function generateForCountry(
  countryId: string,
  countryName: string,
  language: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  try {
    console.log(`[BATCH] Generating for ${countryId} (${countryName})...`);

    const userPrompt = `Génère une analyse complète des réalités systémiques pour: ${countryName}

Langue de réponse: ${language === 'fr' ? 'Français' : 'English'}

Sois particulièrement attentif à:
- Les problèmes de santé (médicaments contrefaits, équipements périmés, tests non fiables)
- La corruption judiciaire (avocats payés par la partie adverse, juges corrompus)
- Les risques sécuritaires (trafic d'êtres humains, criminalité organisée)
- Les dysfonctionnements administratifs (corruption, délais, arbitraire)

Cite des exemples RÉELS et DOCUMENTÉS. Ne minimise pas les problèmes.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[BATCH] AI error for ${countryId}:`, errorText);
      return { success: false, error: `AI error: ${response.status}` };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return { success: false, error: "No content from AI" };
    }

    // Parse JSON from response
    let jsonData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonData = JSON.parse(jsonMatch[0]);
      } else {
        return { success: false, error: "No JSON found in response" };
      }
    } catch (parseError) {
      console.error(`[BATCH] Parse error for ${countryId}:`, parseError);
      return { success: false, error: "JSON parse error" };
    }

    // Save to cache using raw SQL to avoid type issues
    const { error: upsertError } = await supabase
      .from('terrain_realities_cache')
      .upsert({
        country_id: countryId,
        language,
        data: jsonData,
        generated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      } as Record<string, unknown>, {
        onConflict: 'country_id,language'
      });

    if (upsertError) {
      console.error(`[BATCH] DB error for ${countryId}:`, upsertError);
      return { success: false, error: `DB error: ${upsertError.message}` };
    }

    console.log(`[BATCH] ✓ Completed ${countryId}`);
    return { success: true };
  } catch (err) {
    console.error(`[BATCH] Exception for ${countryId}:`, err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

async function processCountriesInBackground(
  countriesToProcess: string[],
  language: string
) {
  console.log(`[BATCH] Starting background processing of ${countriesToProcess.length} countries`);

  for (const countryId of countriesToProcess) {
    const countryName = COUNTRY_NAMES[countryId] || countryId;
    const result = await generateForCountry(countryId, countryName, language);
    
    if (!result.success) {
      console.error(`[BATCH] Failed ${countryId}: ${result.error}`);
    }

    // Wait 3 seconds between countries to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log(`[BATCH] Background processing complete`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { language = "fr", onlyMissing = true, limit = 38 } = await req.json();
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get countries that already have cached data
    const { data: existingCache } = await supabase
      .from('terrain_realities_cache')
      .select('country_id, language')
      .eq('language', language);

    const existingCountries = new Set(existingCache?.map((c: Record<string, unknown>) => c.country_id as string) || []);
    
    // Filter countries to process
    let countriesToProcess = onlyMissing 
      ? ALL_COUNTRIES.filter(c => !existingCountries.has(c))
      : ALL_COUNTRIES;

    // Apply limit
    countriesToProcess = countriesToProcess.slice(0, limit);

    console.log(`[BATCH] Will process ${countriesToProcess.length} countries: ${countriesToProcess.join(', ')}`);

    // Start background processing
    EdgeRuntime.waitUntil(processCountriesInBackground(countriesToProcess, language));

    // Return immediately
    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Started background generation for ${countriesToProcess.length} countries`,
        language,
        totalCountries: ALL_COUNTRIES.length,
        alreadyCached: existingCountries.size,
        toProcess: countriesToProcess.length,
        countries: countriesToProcess
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[BATCH] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
