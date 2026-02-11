import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://system-compass.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
  bn: "Bengali",
  ru: "Russian",
  ur: "Urdu",
  ja: "Japanese",
  ko: "Korean",
  tr: "Turkish",
  pl: "Polish",
  vi: "Vietnamese",
  th: "Thai",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { countryId, targetLang, variantsData } = await req.json();

    if (!countryId || !targetLang || !variantsData) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // English is the source language, no translation needed
    if (targetLang === "en") {
      return new Response(
        JSON.stringify({ translatedData: variantsData, cached: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check cache first
    const { data: cached } = await supabase
      .from("country_variants_translations")
      .select("translated_data")
      .eq("country_id", countryId)
      .eq("language", targetLang)
      .single();

    if (cached) {
      console.log(`Cache hit for ${countryId} in ${targetLang}`);
      return new Response(
        JSON.stringify({ translatedData: cached.translated_data, cached: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Translating variants for ${countryId} to ${targetLang}`);

    // Translate using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

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
          { role: "user", content: JSON.stringify(variantsData) },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI translation error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI translation failed: ${response.status}`);
    }

    const aiResponse = await response.json();
    const translatedContent = aiResponse.choices?.[0]?.message?.content;

    if (!translatedContent) {
      throw new Error("No translation content received");
    }

    // Parse the translated JSON
    let translatedData;
    try {
      // Clean potential markdown code blocks
      const cleanedContent = translatedContent
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
      translatedData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse translation:", translatedContent);
      throw new Error("Failed to parse translated content");
    }

    // Cache the translation
    await supabase
      .from("country_variants_translations")
      .upsert({
        country_id: countryId,
        language: targetLang,
        translated_data: translatedData,
      });

    console.log(`Successfully translated and cached variants for ${countryId} in ${targetLang}`);

    return new Response(
      JSON.stringify({ translatedData, cached: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Translation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Translation failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
