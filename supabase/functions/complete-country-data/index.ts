import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface CountryInput {
  country_id: string;
  country_name: string;
  region: string;
  primary_pyramid: string;
}

const VARIANTS_PROMPT = `You are an expatriation expert. Generate ONLY the missing enriched fields for country variants.
Return STRICT JSON with these arrays (5-8 items each):

{
  "typical_day": [{"time": "07:00", "activity": "Wake up routine", "cultural_note": "Note about local habits"}],
  "year_one_reality": [{"month": "Month 1-2", "milestone": "What happens", "difficulty": "high/medium/low", "tip": "Practical advice"}],
  "common_mistakes_timeline": [{"phase": "Arrival", "mistake": "Common error", "consequence": "What happens", "prevention": "How to avoid"}],
  "hidden_admin_steps": [{"step": "Admin step name", "time_estimate": "2-4 weeks", "difficulty": "hard/medium/easy", "insider_tip": "Local knowledge"}],
  "cultural_shocks": [{"shock": "Cultural difference", "explanation": "Why it happens", "adaptation_time": "3-6 months"}],
  "real_costs_breakdown": [{"category": "Cost category", "official_cost": "$X", "real_cost": "$Y", "notes": "Hidden fees explanation"}],
  "success_timeline_months": [{"month_range": "1-3", "realistic_goal": "What's achievable", "warning": "What to watch out for"}],
  "expat_communities": [{"name": "Community name", "location": "City/Area", "size": "large/medium/small", "focus": "Professional/Social/National", "entry_difficulty": "easy/moderate/hard"}]
}

Be SPECIFIC to the country. Use realistic local examples.`;

const INTELLIGENCE_PROMPT = `You are a socio-economic analyst. Generate ONLY the missing enriched fields for country intelligence.
Return STRICT JSON with these arrays (5-8 items each):

{
  "unspoken_rules": [{"rule": "Unwritten social rule", "consequence": "What happens if broken", "how_to_know": "How to learn this"}],
  "negotiation_styles": [{"context": "Business/Salary/Contract", "style": "How to negotiate", "taboo": "What to avoid"}],
  "trust_signals": ["Signal that builds trust", "Another trust indicator"],
  "distrust_signals": ["Signal that breaks trust", "Another distrust indicator"],
  "exit_difficulty": [{"scenario": "Exit scenario", "difficulty": "hard/medium/easy", "timeline": "Duration", "hidden_costs": "Hidden obstacles"}],
  "career_ceiling_by_profile": [{"profile": "Profile type", "ceiling": "Maximum level reachable", "workaround": "How to overcome"}],
  "hidden_hierarchies": [{"hierarchy": "Hidden power structure", "how_it_works": "Mechanism", "access_method": "How to navigate"}],
  "taboo_topics": ["Taboo topic 1", "Taboo topic 2"],
  "decision_making_patterns": [{"context": "Decision type", "who_decides": "Who has power", "how_long": "Timeline", "influence_method": "How to influence"}],
  "time_perception": [{"aspect": "Time aspect", "local_norm": "Local expectation", "foreigner_trap": "Common mistake"}]
}

Be SPECIFIC to the country. Use realistic examples based on actual cultural patterns.`;

async function callLLM(systemPrompt: string, userPrompt: string): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY not configured");
  }

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
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM call failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

function extractJSON(text: string): Record<string, unknown> | null {
  try {
    const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    // Try to find JSON in the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return handleCorsPreflightRequest(req);
  }

  const corsHeaders = getCorsHeaders(req);

  try {
    const { countryId, type } = await req.json();
    
    if (!countryId || !type) {
      return new Response(
        JSON.stringify({ error: "Missing countryId or type (variants/intelligence/both)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get country info from countries-data (we need to call the API)
    // For now, we'll get the country name from the database
    const { data: variantData } = await supabase
      .from('country_variants')
      .select('country_id')
      .eq('country_id', countryId)
      .single();

    const { data: intelligenceData } = await supabase
      .from('country_intelligence')
      .select('country_id')
      .eq('country_id', countryId)
      .single();

    // Map country_id to readable name
    const countryName = countryId.split('-').map((w: string) => 
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join(' ');

    const results: Record<string, unknown> = {};

    // Complete variants
    if ((type === 'variants' || type === 'both') && variantData) {
      console.log(`Completing variants for ${countryId}`);
      
      const variantsResponse = await callLLM(
        VARIANTS_PROMPT,
        `Generate enriched variant data for: ${countryName}. Be very specific to this country's actual conditions, costs, and culture.`
      );
      
      const variantsJson = extractJSON(variantsResponse);
      
      if (variantsJson) {
        const { error } = await supabase
          .from('country_variants')
          .update({
            typical_day: variantsJson.typical_day || [],
            year_one_reality: variantsJson.year_one_reality || [],
            common_mistakes_timeline: variantsJson.common_mistakes_timeline || [],
            hidden_admin_steps: variantsJson.hidden_admin_steps || [],
            cultural_shocks: variantsJson.cultural_shocks || [],
            real_costs_breakdown: variantsJson.real_costs_breakdown || [],
            success_timeline_months: variantsJson.success_timeline_months || [],
            expat_communities: variantsJson.expat_communities || [],
            updated_at: new Date().toISOString(),
          })
          .eq('country_id', countryId);

        if (error) throw error;
        results.variants = "completed";
      }
    }

    // Complete intelligence
    if ((type === 'intelligence' || type === 'both') && intelligenceData) {
      console.log(`Completing intelligence for ${countryId}`);
      
      const intelligenceResponse = await callLLM(
        INTELLIGENCE_PROMPT,
        `Generate enriched intelligence data for: ${countryName}. Be very specific to this country's actual social dynamics, power structures, and cultural patterns.`
      );
      
      const intelligenceJson = extractJSON(intelligenceResponse);
      
      if (intelligenceJson) {
        const { error } = await supabase
          .from('country_intelligence')
          .update({
            unspoken_rules: intelligenceJson.unspoken_rules || [],
            negotiation_styles: intelligenceJson.negotiation_styles || [],
            trust_signals: intelligenceJson.trust_signals || [],
            distrust_signals: intelligenceJson.distrust_signals || [],
            exit_difficulty: intelligenceJson.exit_difficulty || [],
            career_ceiling_by_profile: intelligenceJson.career_ceiling_by_profile || [],
            hidden_hierarchies: intelligenceJson.hidden_hierarchies || [],
            taboo_topics: intelligenceJson.taboo_topics || [],
            decision_making_patterns: intelligenceJson.decision_making_patterns || [],
            time_perception: intelligenceJson.time_perception || [],
            updated_at: new Date().toISOString(),
          })
          .eq('country_id', countryId);

        if (error) throw error;
        results.intelligence = "completed";
      }
    }

    console.log(`Completed data for ${countryId}:`, results);

    return new Response(
      JSON.stringify({ success: true, countryId, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
