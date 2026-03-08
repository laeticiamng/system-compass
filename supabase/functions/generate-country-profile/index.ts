import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://system-compass.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const SYSTEM_PROMPT = `Tu es un moteur d'analyse socio-économique pour Compass.
Tu produis une fiche pays TRONC COMMUN ultra-complète et spécifique.

CONTRAINTES ABSOLUES :
- Style descriptif JAMAIS prescriptif : interdit "tu dois", "il faut", "la meilleure option"
- Interdit conseil juridique/financier/immigration/médical
- Interdit généralisations stigmatisantes sur des peuples : parle de systèmes, institutions, incitations
- Si incertain : "tend à" + baisse confiance
- JSON STRICT uniquement

OBJECTIF : Maximiser la SPÉCIFICITÉ pays. Chaque phrase doit être UNIQUE à ce pays.`;

const VALIDATOR_PROMPT = `Tu es un auditeur qualité pour Compass.
Mission :
1) Supprimer toute injonction ("tu dois", recommandations directes)
2) Neutraliser tout conseil juridique/financier/immigration/médical
3) Reformuler stéréotypes en dynamiques de systèmes
4) AUGMENTER la spécificité si trop générique
5) Vérifier disclaimers présents
Sortie : JSON corrigé strictement au même schéma.`;

interface CountryInput {
  country_id: string;
  country_name: string;
  iso2: string;
  region: string;
  primary_pyramid: string;
}

function createGenerationPrompt(country: CountryInput): string {
  return `Génère la fiche TRONC COMMUN ENRICHIE pour :

Pays: ${country.country_name} (${country.iso2})
Région: ${country.region}
Type pyramide: ${country.primary_pyramid}

STRUCTURE JSON REQUISE (TOUTES les sections obligatoires) :

{
  "country": {
    "name": "${country.country_name}",
    "iso2": "${country.iso2}",
    "region": "${country.region}",
    "primary_pyramid": "${country.primary_pyramid}",
    "last_updated": "YYYY-MM-DD"
  },
  
  "disclaimer": {
    "analysis_only": true,
    "no_advice": true,
    "simulation_not_prediction": true,
    "variability_note": "Les situations individuelles varient considérablement"
  },
  
  "core_analysis": {
    "system_summary": "Description de 8-12 phrases du fonctionnement réel du pays",
    "rule_of_gold": "La règle d'or unique pour naviguer ce système (1 phrase percutante)",
    
    "pyramid_structure": {
      "top": "Qui détient vraiment le pouvoir au sommet",
      "institutions": "Rôle réel des institutions (vs rôle officiel)",
      "gatekeepers": "Qui contrôle les accès et comment",
      "value_creators": "Qui crée de la valeur et comment ils sont traités",
      "base": "La masse et son rapport au système",
      "real_asset": "Ce qui a vraiment de la valeur dans ce système"
    },
    
    "who_wins": [
      "Profil 1 qui prospère (avec explication WHY)",
      "Profil 2 qui prospère (avec explication WHY)",
      "Profil 3 qui prospère (avec explication WHY)",
      "Profil 4 qui prospère (avec explication WHY)"
    ],
    
    "who_loses": [
      "Profil 1 qui souffre (avec explication WHY)",
      "Profil 2 qui souffre (avec explication WHY)",
      "Profil 3 qui souffre (avec explication WHY)",
      "Profil 4 qui souffre (avec explication WHY)"
    ],
    
    "risks_scores": {
      "legal": 0,
      "safety": 0,
      "corruption": 0,
      "volatility": 0,
      "bureaucracy": 0
    }
  },
  
  "integration_timeline": {
    "week_1": {
      "phase": "Arrivée",
      "key_tasks": ["Tâche 1", "Tâche 2", "Tâche 3"],
      "typical_blockers": ["Blocage 1", "Blocage 2"],
      "estimated_cost_usd": 0
    },
    "month_1": {
      "phase": "Installation",
      "key_tasks": ["Tâche 1", "Tâche 2", "Tâche 3", "Tâche 4"],
      "typical_blockers": ["Blocage 1", "Blocage 2"],
      "estimated_cost_usd": 0
    },
    "month_3": {
      "phase": "Stabilisation",
      "key_tasks": ["Tâche 1", "Tâche 2"],
      "typical_blockers": ["Blocage 1"],
      "estimated_cost_usd": 0
    },
    "month_6": {
      "phase": "Intégration",
      "key_tasks": ["Tâche 1", "Tâche 2"],
      "success_indicators": ["Indicateur 1", "Indicateur 2"],
      "estimated_cost_usd": 0
    },
    "year_1": {
      "phase": "Établissement",
      "milestones": ["Milestone 1", "Milestone 2"],
      "warning_if_not_reached": "Signal d'alerte si non atteint"
    }
  },
  
  "hidden_costs": {
    "administrative": {
      "description": "Frais administratifs cachés",
      "items": [
        {"name": "Frais 1", "amount_usd": 0, "frequency": "once/monthly/yearly"},
        {"name": "Frais 2", "amount_usd": 0, "frequency": "once"}
      ]
    },
    "social": {
      "description": "Coûts sociaux implicites",
      "items": [
        {"name": "Coût social 1", "amount_usd": 0, "frequency": "monthly"},
        {"name": "Coût social 2", "amount_usd": 0, "frequency": "yearly"}
      ]
    },
    "opportunity": {
      "description": "Coûts d'opportunité spécifiques au système",
      "items": ["Coût opp 1", "Coût opp 2"]
    },
    "total_first_year_estimate_usd": 0
  },
  
  "red_flags": {
    "personal_fit": [
      "Si vous êtes [profil], ce pays n'est probablement pas pour vous parce que...",
      "Si vous avez [caractéristique], attention à...",
      "Si votre priorité est [X], considérez que..."
    ],
    "timing_warnings": [
      "N'arrivez pas pendant [période] parce que...",
      "Évitez de [action] avant d'avoir [condition]"
    ],
    "deal_breakers": [
      "Ce pays n'est pas viable pour vous si...",
      "Partez immédiatement si..."
    ]
  },
  
  "playbook": {
    "do": [
      "Action recommandée 1 avec contexte",
      "Action recommandée 2 avec contexte",
      "Action recommandée 3 avec contexte",
      "Action recommandée 4 avec contexte",
      "Action recommandée 5 avec contexte"
    ],
    "dont": [
      "Erreur à éviter 1 avec conséquence",
      "Erreur à éviter 2 avec conséquence",
      "Erreur à éviter 3 avec conséquence",
      "Erreur à éviter 4 avec conséquence",
      "Erreur à éviter 5 avec conséquence"
    ],
    "plan_30_days": [
      "Étape 1 avec détail",
      "Étape 2 avec détail",
      "Étape 3 avec détail",
      "Étape 4 avec détail"
    ],
    "plan_12_months": [
      "Objectif 1 avec critères de succès",
      "Objectif 2 avec critères de succès",
      "Objectif 3 avec critères de succès",
      "Objectif 4 avec critères de succès"
    ],
    "plan_5_years": [
      "Vision 1",
      "Vision 2",
      "Vision 3"
    ],
    "plan_b": "Alternative détaillée si le plan principal échoue"
  },
  
  "comparison_context": {
    "similar_countries": ["Pays similaire 1", "Pays similaire 2"],
    "key_differences": [
      "Différence 1 avec implications",
      "Différence 2 avec implications"
    ],
    "often_confused_with": "Pays avec lequel on confond souvent",
    "why_different": "Explication de la différence fondamentale"
  },
  
  "quality": {
    "specificity_score": 0,
    "confidence": 0,
    "stereotype_risk": false,
    "sources_count": 0
  }
}

RAPPELS CRITIQUES :
- Chaque élément doit être SPÉCIFIQUE à ${country.country_name}
- Pas de phrases génériques applicables à n'importe quel pays
- Coûts en USD pour comparabilité
- Scores de 0 à 100`;
}

async function callLLMWithRetry(
  systemPrompt: string, 
  userPrompt: string, 
  maxRetries = 3,
  baseDelay = 2000
): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY is not configured");
  }
  
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`LLM call attempt ${attempt}/${maxRetries}`);
      
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
        const status = response.status;
        
        if (status >= 500 || status === 429) {
          lastError = new Error(`AI API error: ${status} - ${errorText}`);
          console.warn(`Retryable error on attempt ${attempt}: ${lastError.message}`);
          
          if (attempt < maxRetries) {
            const delay = baseDelay * Math.pow(2, attempt - 1);
            console.log(`Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        } else {
          throw new Error(`AI API error: ${status} - ${errorText}`);
        }
      } else {
        const data = await response.json();
        console.log(`LLM call successful on attempt ${attempt}`);
        return data.choices[0].message.content;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`Error on attempt ${attempt}: ${lastError.message}`);
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error("All LLM retry attempts failed");
}

function extractJSON(text: string): object | null {
  const cleanedText = text
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();
  
  const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      return null;
    }
  }
  return null;
}

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
    
    let job_id = body.job_id;
    let country: CountryInput;
    
    if (body.country) {
      country = body.country;
    } else {
      country = {
        country_id: body.countryId || body.country_id,
        country_name: body.countryName || body.country_name,
        iso2: body.iso2,
        region: body.region,
        primary_pyramid: body.primaryPyramid || body.primary_pyramid,
      };
    }

    console.log("Received request for country:", country.country_name);

    if (!country.country_name || !country.iso2) {
      throw new Error("Missing required fields: country_name and iso2");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    if (job_id) {
      await supabase
        .from("country_generation_jobs")
        .update({ status: "running", started_at: new Date().toISOString() })
        .eq("id", job_id);
    }

    console.log(`Starting ENRICHED generation for ${country.country_name}`);

    // Step 1: Generate the enriched country profile
    const generationPrompt = createGenerationPrompt(country);
    const generatedContent = await callLLMWithRetry(SYSTEM_PROMPT, generationPrompt);

    const generatedJSON = extractJSON(generatedContent);
    if (!generatedJSON) {
      throw new Error("Failed to parse generated JSON");
    }

    if (job_id) {
      await supabase
        .from("country_generation_jobs")
        .update({ status: "validating" })
        .eq("id", job_id);
    }

    // Step 2: Validate and clean the content
    const validationPrompt = `Voici le JSON à auditer et corriger :\n\n${JSON.stringify(generatedJSON, null, 2)}`;
    const validatedContent = await callLLMWithRetry(VALIDATOR_PROMPT, validationPrompt);

    const validatedJSON = extractJSON(validatedContent) || generatedJSON;

    const quality = (validatedJSON as any).quality || {};
    const specificityScore = quality.specificity_score || 0;
    const confidenceScore = quality.confidence || 0;
    const stereotypeFlag = quality.stereotype_risk || false;

    // Sync to related tables
    await syncToCountryIntelligence(supabase, country.country_id, validatedJSON as any);
    await syncToCountryTags(supabase, country.country_id, validatedJSON as any);

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

    console.log(`Completed ENRICHED generation for ${country.country_name}`);

    return new Response(
      JSON.stringify({ success: true, country_id: country.country_id, synced: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Generation error:", error);

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
