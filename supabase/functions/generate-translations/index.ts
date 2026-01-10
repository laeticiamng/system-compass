import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sourceText, sourceLang, targetLang, context } = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const sourceLangName = LANGUAGE_NAMES[sourceLang] || sourceLang;
    const targetLangName = LANGUAGE_NAMES[targetLang] || targetLang;

    const systemPrompt = `You are a professional translator specializing in localization for web applications.
Your task is to translate content from ${sourceLangName} to ${targetLangName}.

IMPORTANT RULES:
- Maintain the exact same JSON structure as the input
- Preserve all keys unchanged (only translate values)
- Keep proper nouns, technical terms, and brand names unchanged
- Adapt idioms and expressions naturally for the target culture
- Maintain the same tone and style
- For country-specific content, ensure cultural accuracy
- Do NOT add any explanations, just return the translated JSON

Context: ${context || 'General application translation'}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Translate this JSON from ${sourceLangName} to ${targetLangName}. Return ONLY the translated JSON, no explanations:\n\n${JSON.stringify(sourceText, null, 2)}` }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const translatedContent = data.choices?.[0]?.message?.content;

    if (!translatedContent) {
      throw new Error("No translation received from AI");
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonContent = translatedContent;
    const jsonMatch = translatedContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }

    // Parse to validate JSON
    const parsed = JSON.parse(jsonContent.trim());

    return new Response(JSON.stringify({ translation: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Translation error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
