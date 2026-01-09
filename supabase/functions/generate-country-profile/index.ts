import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const SYSTEM_PROMPT = `Tu es un moteur d'analyse socio-économique pour une application appelée Pyramid Compass.
Tu dois produire une fiche pays structurée en 3 couches (Tronc, Variante, Intelligence Système A→G) + des tags 1–5.
Contraintes absolues :
- Style descriptif, jamais prescriptif : interdit d'écrire "tu dois", "il faut", "la meilleure option est".
- Interdit de donner du conseil juridique/financier/immigration/médical. Outil d'analyse uniquement.
- Interdit de faire des généralisations stigmatisantes sur des peuples : parler de systèmes, institutions, incitations, règles implicites.
- Si une information est incertaine : écrire "unknown" ou formuler en "tend à" + baisser la confiance.
- Toujours inclure les disclaimers : "simulation ≠ prédiction", "outil d'analyse", "variations individuelles possibles".
- Sortie JSON STRICTE uniquement, conforme au schéma fourni.
Objectif : maximiser la spécificité pays (éviter copier-coller de la pyramide).`;

const VALIDATOR_PROMPT = `Tu es un auditeur de sécurité et qualité pour Pyramid Compass.
Entrée : un JSON de fiche pays.
Ta mission :
1) Détecter et supprimer toute injonction ("tu dois", "il faut", recommandations directes).
2) Détecter les phrases qui ressemblent à du conseil juridique/financier/immigration/médical : les neutraliser.
3) Détecter tout stéréotype ou jugement sur des peuples : reformuler en dynamique de systèmes / incitations.
4) Vérifier que la fiche n'est pas un copier-coller générique de la pyramide : augmenter la spécificité pays si trop vague.
5) Vérifier présence disclaimers.
Sortie : JSON corrigé strictement au même schéma, sans texte hors JSON.`;

interface CountryInput {
  country_id: string;
  country_name: string;
  iso2: string;
  region: string;
  primary_pyramid: string;
}

function createGenerationPrompt(country: CountryInput): string {
  return `Génère la fiche JSON pour le pays suivant :

Country:
- name: ${country.country_name}
- iso2: ${country.iso2}
- region: ${country.region}
- primary_pyramid: ${country.primary_pyramid}

Exigences :
1) Couche Tronc (gratuit) : 6-10 lignes + 3 rewards + 3 punishes + 3 erreurs fréquentes.
2) Couche Variante pays (premium) : informations réellement spécifiques au pays (institutions, marché travail, réseaux, friction quotidienne, surprises, profils qui réussissent/qui souffrent).
3) Couche Intelligence A→G (premium+) : Power map, OS social, stratégies descriptives, mobilité, psycho/socio, géopolitique, héritage historique utile.
4) Tags 1–5 : attribue des scores cohérents avec justification implicite.
5) Ajoute une section "sources.public_sources" avec 2–6 sources publiques.
6) Remplis quality.specificity_score, confidence_0_to_100, et flags.

Rappels :
- Pas de conseil. Pas de verdict. Pas d'injonction.
- Parle de dynamiques de pouvoir et de stratégies sociales sans stéréotypes.
- JSON strict uniquement.

Schéma JSON attendu :
{
  "country": { "name": "", "iso2": "", "region": "", "primary_pyramid": "", "last_updated": "YYYY-MM-DD" },
  "disclaimer": { "analysis_only": true, "no_advice": true, "simulation_not_prediction": true, "variability_note": "" },
  "layers": {
    "tronc_free": { "system_summary_6_10_lines": "", "rewards_3": [], "punishes_3": [], "common_mistakes_3": [] },
    "variant_premium": { "institutions_admin_3": [], "networks_reputation_degrees_3": [], "labor_market_3": [], "entrepreneurship_3": [], "daily_life_friction_3": [], "what_surprises_newcomers_5": [], "profiles_often_thrive_3": [], "profiles_often_struggle_3": [] },
    "intelligence_premium_plus": {
      "A_power_map": { "formal_power_3": [], "informal_power_3": [], "door_openers_ranked_1_to_5": [] },
      "B_social_operating_system": { "norms_conformity_vs_differentiation": "", "relation_to_authority": "", "risk_relationship": "", "conflict_style": "" },
      "C_social_strategies_descriptive": { "often_rewarded_3": [], "often_punished_3": [], "newcomer_traps_3": [] },
      "D_mobility_social_elevators": { "real_elevators": [], "mobility_speed": "", "mental_cost": "", "short_justification": "" },
      "E_psycho_socio_system_effects": { "system_induced_traits": [], "adaptive_behaviors_3": [], "backfire_behaviors_3": [] },
      "F_geopolitics_and_flows": { "macro_dependencies": [], "cycle_state": "", "macro_risks_simple": [] },
      "G_historical_inheritance": { "historical_traces_2_to_4": [], "implications_for_trust_rules_merit_risk": [] }
    }
  },
  "tags_1_to_5": { "network_weight": 0, "degree_weight": 0, "risk_tolerance_system": 0, "admin_speed": 0, "authority_verticality": 0, "mental_friction_cost": 0, "social_mobility": 0, "predictability": 0, "reputation_sensitivity": 0, "rule_compliance_pressure": 0 },
  "quality": { "specificity_score_0_to_100": 0, "anti_advice_passed": true, "stereotype_risk_flag": false, "confidence_0_to_100": 0 },
  "sources": { "public_sources": [], "notes": "" }
}`;
}

async function callLLM(systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function extractJSON(text: string): object | null {
  // Try to find JSON in the response
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

// Sync generated JSON to country_intelligence table
async function syncToCountryIntelligence(supabase: any, countryId: string, json: any) {
  try {
    const layers = json.layers?.intelligence_premium_plus || {};
    const powerMap = layers.A_power_map || {};
    const socialOS = layers.B_social_operating_system || {};
    const strategies = layers.C_social_strategies_descriptive || {};
    const mobility = layers.D_mobility_social_elevators || {};
    const psycho = layers.E_psycho_socio_system_effects || {};
    const geo = layers.F_geopolitics_and_flows || {};
    const history = layers.G_historical_inheritance || {};

    const data = {
      country_id: countryId,
      is_complete: true,
      power_formal: powerMap.formal_power_3 || [],
      power_informal: powerMap.informal_power_3 || [],
      power_keys_ranking: powerMap.door_openers_ranked_1_to_5?.reduce((acc: any, item: any) => {
        if (item.factor && item.rank) acc[item.factor] = item.rank;
        return acc;
      }, {}) || {},
      social_norms: socialOS.norms_conformity_vs_differentiation || "",
      authority_relation: socialOS.relation_to_authority || "",
      risk_attitude: socialOS.risk_relationship || "",
      conflict_approach: socialOS.conflict_style || "",
      strategies_rewarded: strategies.often_rewarded_3 || [],
      strategies_punished: strategies.often_punished_3 || [],
      newcomer_mistakes: strategies.newcomer_traps_3 || [],
      mobility_elevators: mobility.real_elevators || [],
      mobility_speed: mobility.mobility_speed || "moyenne",
      mobility_speed_reason: mobility.short_justification || "",
      mental_cost: mobility.mental_cost || "moyen",
      mental_cost_reason: mobility.short_justification || "",
      system_produces: psycho.system_induced_traits || [],
      adaptive_behaviors: psycho.adaptive_behaviors_3 || [],
      backfiring_behaviors: psycho.backfire_behaviors_3 || [],
      dependencies: geo.macro_dependencies || [],
      cycle_status: geo.cycle_state || "stable",
      macro_risks: geo.macro_risks_simple || [],
      historical_traces: history.historical_traces_2_to_4 || [],
      legacy_implications: history.implications_for_trust_rules_merit_risk || {},
    };

    const { error } = await supabase
      .from("country_intelligence")
      .upsert(data, { onConflict: "country_id" });

    if (error) {
      console.error("Error syncing to country_intelligence:", error);
    } else {
      console.log(`Synced country_intelligence for ${countryId}`);
    }
  } catch (e) {
    console.error("Error in syncToCountryIntelligence:", e);
  }
}

// Sync generated JSON to country_tags table
async function syncToCountryTags(supabase: any, countryId: string, json: any) {
  try {
    const tags = json.tags_1_to_5 || {};

    const data = {
      country_id: countryId,
      network_weight: tags.network_weight || 3,
      diploma_weight: tags.degree_weight || 3,
      risk_tolerance: tags.risk_tolerance_system || 3,
      admin_speed: tags.admin_speed || 3,
      authority_verticality: tags.authority_verticality || 3,
      mental_friction: tags.mental_friction_cost || 3,
      social_mobility: tags.social_mobility || 3,
      predictability: tags.predictability || 3,
      reputation_requirement: tags.reputation_sensitivity || 3,
      compliance_sensitivity: tags.rule_compliance_pressure || 3,
    };

    const { error } = await supabase
      .from("country_tags")
      .upsert(data, { onConflict: "country_id" });

    if (error) {
      console.error("Error syncing to country_tags:", error);
    } else {
      console.log(`Synced country_tags for ${countryId}`);
    }
  } catch (e) {
    console.error("Error in syncToCountryTags:", e);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Support both formats: {job_id, country} or direct {countryId, countryName, ...}
    let job_id = body.job_id;
    let country: CountryInput;
    
    if (body.country) {
      country = body.country;
    } else {
      // Direct format from manual testing
      country = {
        country_id: body.countryId || body.country_id,
        country_name: body.countryName || body.country_name,
        iso2: body.iso2,
        region: body.region,
        primary_pyramid: body.primaryPyramid || body.primary_pyramid,
      };
    }

    console.log("Received request for country:", country.country_name);

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    if (!country.country_name || !country.iso2) {
      throw new Error("Missing required fields: country_name and iso2");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Update job status to running (only if job_id exists)
    if (job_id) {
      await supabase
        .from("country_generation_jobs")
        .update({ status: "running", started_at: new Date().toISOString() })
        .eq("id", job_id);
    }

    console.log(`Starting generation for ${country.country_name}`);

    // Step 1: Generate the country profile
    const generationPrompt = createGenerationPrompt(country);
    const generatedContent = await callLLM(SYSTEM_PROMPT, generationPrompt);

    const generatedJSON = extractJSON(generatedContent);
    if (!generatedJSON) {
      throw new Error("Failed to parse generated JSON");
    }

    // Update status to validating (only if job_id exists)
    if (job_id) {
      await supabase
        .from("country_generation_jobs")
        .update({ status: "validating" })
        .eq("id", job_id);
    }

    // Step 2: Validate and clean the content
    const validationPrompt = `Voici le JSON à auditer et corriger :\n\n${JSON.stringify(generatedJSON, null, 2)}`;
    const validatedContent = await callLLM(VALIDATOR_PROMPT, validationPrompt);

    const validatedJSON = extractJSON(validatedContent) || generatedJSON;

    // Extract quality metrics
    const quality = (validatedJSON as any).quality || {};
    const specificityScore = quality.specificity_score_0_to_100 || 0;
    const confidenceScore = quality.confidence_0_to_100 || 0;
    const stereotypeFlag = quality.stereotype_risk_flag || false;

    // Sync to country_intelligence table
    await syncToCountryIntelligence(supabase, country.country_id, validatedJSON as any);

    // Sync to country_tags table
    await syncToCountryTags(supabase, country.country_id, validatedJSON as any);

    // Update job with results (only if job_id exists)
    if (job_id) {
      await supabase
        .from("country_generation_jobs")
        .update({
          status: "done",
          json_payload: validatedJSON,
          specificity_score: specificityScore,
          confidence_score: confidenceScore,
          stereotype_flag: stereotypeFlag,
          completed_at: new Date().toISOString(),
        })
        .eq("id", job_id);
    }

    console.log(`Completed generation and sync for ${country.country_name}`);

    return new Response(
      JSON.stringify({ success: true, country_id: country.country_id, synced: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Generation error:", error);

    // Try to update job status to failed
    try {
      const { job_id } = await req.clone().json();
      if (job_id) {
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
        await supabase
          .from("country_generation_jobs")
          .update({
            status: "failed",
            error_message: error instanceof Error ? error.message : "Unknown error",
            completed_at: new Date().toISOString(),
          })
          .eq("id", job_id);
      }
    } catch {}

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
