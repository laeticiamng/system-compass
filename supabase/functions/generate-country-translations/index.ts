import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LANGUAGE_NAMES: Record<string, string> = {
  de: "German",
  es: "Spanish",
  it: "Italian",
  nl: "Dutch",
  pt: "Portuguese",
  fr: "French",
  en: "English"
};

interface CountryData {
  name: string;
  region: string;
  ruleOfGold: string;
  pyramid: {
    top: string;
    institutions: string;
    gatekeepers: string;
    valueCreators: string;
    base: string;
    realAsset: string;
  };
  whoWins: string[];
  whoLoses: string[];
  playbook: {
    do: string[];
    dont: string[];
    plan30Days: string[];
    plan12Months: string[];
    plan5Years: string[];
    planB: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { countryId, sourceCountry, targetLang } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!countryId || !sourceCountry || !targetLang) {
      throw new Error("Missing required fields: countryId, sourceCountry, targetLang");
    }

    const targetLangName = LANGUAGE_NAMES[targetLang] || targetLang;

    const systemPrompt = `You are a professional translator specializing in geopolitical and strategic content.
Your task is to translate country analysis data from English to ${targetLangName}.

CRITICAL RULES:
1. Maintain the EXACT same JSON structure as input
2. Translate ALL text values to ${targetLangName}
3. Keep the JSON keys in English (only translate values)
4. Adapt idioms and expressions naturally for ${targetLangName} speakers
5. Maintain the analytical and strategic tone
6. For country names that have official translations in ${targetLangName}, use them
7. Return ONLY valid JSON, no explanations or markdown

The content is strategic analysis for people considering living/working in this country.`;

    const userPrompt = `Translate this country analysis to ${targetLangName}. Return ONLY the JSON object:

${JSON.stringify(sourceCountry, null, 2)}`;

    console.log(`Translating ${countryId} to ${targetLang}...`);

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
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limit exceeded", 
          retryable: true 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "Payment required - please add credits to your workspace",
          retryable: false 
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No translation received from AI");
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }

    // Clean and parse JSON
    const cleanJson = jsonContent.trim();
    const parsed: CountryData = JSON.parse(cleanJson);

    // Validate structure
    const requiredFields = ['name', 'region', 'ruleOfGold', 'pyramid', 'playbook'];
    for (const field of requiredFields) {
      if (!(field in parsed)) {
        throw new Error(`Missing required field in translation: ${field}`);
      }
    }

    console.log(`Successfully translated ${countryId} to ${targetLang}`);

    return new Response(JSON.stringify({ 
      countryId,
      targetLang,
      translation: parsed 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Translation error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      retryable: false
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
