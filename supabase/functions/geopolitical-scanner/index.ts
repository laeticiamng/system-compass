import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const SCAN_QUERIES = [
  {
    query: "What are the major active armed conflicts and wars happening right now in 2026? List each conflict with affected countries, severity level, and impact on civilians and foreign nationals.",
    conflict_type: "armed_conflict",
  },
  {
    query: "What are the most significant geopolitical tensions and potential flashpoints in 2026? Include trade wars, diplomatic crises, sanctions, and military buildups that could affect international mobility and expatriation.",
    conflict_type: "geopolitical_tension",
  },
  {
    query: "What are the latest coup d'états, civil unrest, mass protests, or political instability events in 2026? Focus on countries where foreign nationals may be at risk.",
    conflict_type: "political_instability",
  },
];

// SECURITY: System prompt is server-defined only
const SYSTEM_PROMPT = `You are an expert geopolitical analyst specializing in risk assessment for expatriates and international mobility.
For each situation you identify, provide a JSON array with objects containing:
- region: geographic region name
- title: concise alert title (max 100 chars)  
- summary: detailed 2-3 sentence description of the situation and its impact on expats
- severity: "critical" | "warning" | "info"
- countries_affected: array of country names affected
- country_codes: array of ISO2 country codes
- impact_assessment: brief assessment of impact on foreign nationals

Respond ONLY with a valid JSON array. No markdown, no explanation.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "Perplexity connector not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const allAlerts: any[] = [];

    // Run all scan queries in parallel
    const scanResults = await Promise.allSettled(
      SCAN_QUERIES.map(async ({ query, conflict_type }) => {
        console.log(`Scanning: ${conflict_type}`);

        const response = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "sonar-pro",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: query },
            ],
            max_tokens: 4096,
            temperature: 0.1,
            search_recency_filter: "week",
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          console.error(`Perplexity error for ${conflict_type}:`, data);
          return [];
        }

        const content = data.choices?.[0]?.message?.content || "";
        const citations = data.citations || [];

        // Parse JSON from response
        try {
          // Extract JSON array from response (handle potential markdown wrapping)
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (!jsonMatch) {
            console.warn(`No JSON array found for ${conflict_type}`);
            return [];
          }

          const alerts = JSON.parse(jsonMatch[0]);
          return alerts.map((alert: any) => ({
            ...alert,
            conflict_type,
            citations,
            ai_model: data.model || "sonar-pro",
            source_query: query,
          }));
        } catch (parseError) {
          console.error(`JSON parse error for ${conflict_type}:`, parseError);
          return [];
        }
      })
    );

    for (const result of scanResults) {
      if (result.status === "fulfilled" && Array.isArray(result.value)) {
        allAlerts.push(...result.value);
      }
    }

    console.log(`Total alerts detected: ${allAlerts.length}`);

    if (allAlerts.length === 0) {
      return new Response(
        JSON.stringify({ success: true, inserted: 0, message: "No new alerts detected" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Deactivate old alerts
    await supabase
      .from("geopolitical_alerts_ai")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("is_active", true);

    // Insert new alerts
    const rows = allAlerts.map((alert) => ({
      region: alert.region || "Unknown",
      title: (alert.title || "").slice(0, 200),
      summary: alert.summary || "",
      category: "geopolitics",
      severity: ["critical", "warning", "info"].includes(alert.severity) ? alert.severity : "warning",
      countries_affected: Array.isArray(alert.countries_affected) ? alert.countries_affected : [],
      country_codes: Array.isArray(alert.country_codes) ? alert.country_codes : [],
      conflict_type: alert.conflict_type,
      impact_assessment: alert.impact_assessment || null,
      citations: Array.isArray(alert.citations) ? alert.citations : [],
      ai_model: alert.ai_model,
      ai_confidence: 0.85,
      source_query: alert.source_query,
      is_active: true,
      detected_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }));

    const { error: insertError } = await supabase
      .from("geopolitical_alerts_ai")
      .insert(rows);

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ success: false, error: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Inserted ${rows.length} geopolitical alerts`);

    return new Response(
      JSON.stringify({ success: true, inserted: rows.length, alerts: rows.map((r) => r.title) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Geopolitical scanner error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Scanner failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
