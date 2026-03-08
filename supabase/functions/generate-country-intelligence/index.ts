import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireAuth, requireAdmin, authErrorResponse, AuthError } from "../_shared/auth.ts";
import { validate, validationErrorResponse } from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://system-compass.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface CountryInput {
  country_id: string;
  country_name: string;
  iso2: string;
  region: string;
  primary_pyramid: string;
}

const SYSTEM_PROMPT = `Tu es un analyste en intelligence sociale et géopolitique pour Compass.
Tu produis de l'INTELLIGENCE SYSTÈME ultra-stratégique pour les utilisateurs premium+.

CONTRAINTES :
- Analyse en profondeur des RÈGLES INVISIBLES
- Basé sur des patterns observables, pas des stéréotypes
- Explique le POURQUOI derrière chaque règle
- Style analytique, jamais prescriptif
- JSON STRICT uniquement

OBJECTIF : Révéler ce que 10 ans d'expérience dans le pays enseignent.`;

function createGenerationPrompt(country: CountryInput): string {
  return `Génère l'INTELLIGENCE SYSTÈME ENRICHIE pour :

Pays: ${country.country_name} (${country.iso2})
Région: ${country.region}
Type pyramide: ${country.primary_pyramid}

STRUCTURE JSON REQUISE :

{
  "country_id": "${country.country_id}",
  
  "power_formal": [
    "Structure de pouvoir formel 1 avec explication de son fonctionnement réel",
    "Structure de pouvoir formel 2",
    "Structure de pouvoir formel 3"
  ],
  
  "power_informal": [
    "Source de pouvoir informel 1 avec comment l'identifier",
    "Source de pouvoir informel 2",
    "Source de pouvoir informel 3"
  ],
  
  "power_keys_ranking": {
    "capital": 0,
    "diplomas": 0,
    "networks": 0,
    "conformity": 0,
    "visibility": 0,
    "seniority": 0,
    "family_name": 0,
    "foreign_credentials": 0
  },
  
  "unspoken_rules": [
    {
      "rule": "Règle non-dite 1",
      "why_exists": "Pourquoi cette règle existe (contexte historique/culturel)",
      "how_to_detect": "Comment repérer cette règle en action",
      "consequence_if_broken": "Ce qui arrive si on la viole",
      "exception_exists": "Y a-t-il des exceptions et lesquelles"
    },
    {
      "rule": "Règle non-dite 2",
      "why_exists": "...",
      "how_to_detect": "...",
      "consequence_if_broken": "...",
      "exception_exists": "..."
    },
    {
      "rule": "Règle non-dite 3",
      "why_exists": "...",
      "how_to_detect": "...",
      "consequence_if_broken": "...",
      "exception_exists": "..."
    },
    {
      "rule": "Règle non-dite 4",
      "why_exists": "...",
      "how_to_detect": "...",
      "consequence_if_broken": "...",
      "exception_exists": "..."
    },
    {
      "rule": "Règle non-dite 5",
      "why_exists": "...",
      "how_to_detect": "...",
      "consequence_if_broken": "...",
      "exception_exists": "..."
    }
  ],
  
  "negotiation_styles": {
    "general_approach": "Style de négociation dominant dans la culture",
    "salary_negotiation": "Comment négocier un salaire (timing, style, tabous)",
    "business_deals": "Comment se font les deals business",
    "conflict_resolution": "Comment se résolvent les conflits",
    "what_works": ["Tactique efficace 1", "Tactique efficace 2", "Tactique efficace 3"],
    "what_fails": ["Tactique contre-productive 1", "Tactique contre-productive 2"],
    "timing_matters": "L'importance du timing et quand négocier"
  },
  
  "trust_signals": [
    {
      "signal": "Signal de confiance 1",
      "meaning": "Ce que ça signifie vraiment",
      "how_to_demonstrate": "Comment montrer ce signal",
      "time_to_earn": "Temps pour l'acquérir"
    },
    {
      "signal": "Signal de confiance 2",
      "meaning": "...",
      "how_to_demonstrate": "...",
      "time_to_earn": "..."
    },
    {
      "signal": "Signal de confiance 3",
      "meaning": "...",
      "how_to_demonstrate": "...",
      "time_to_earn": "..."
    }
  ],
  
  "distrust_signals": [
    {
      "signal": "Signal de méfiance 1",
      "why_triggers_distrust": "Pourquoi ça déclenche la méfiance",
      "how_to_avoid": "Comment éviter de l'envoyer",
      "recovery_possible": "Peut-on récupérer et comment"
    },
    {
      "signal": "Signal de méfiance 2",
      "why_triggers_distrust": "...",
      "how_to_avoid": "...",
      "recovery_possible": "..."
    },
    {
      "signal": "Signal de méfiance 3",
      "why_triggers_distrust": "...",
      "how_to_avoid": "...",
      "recovery_possible": "..."
    }
  ],
  
  "exit_difficulty": {
    "leaving_job": {
      "difficulty": "easy/medium/hard/very_hard",
      "notice_period_typical": "Durée typique de préavis",
      "reputation_impact": "Impact sur la réputation",
      "network_consequences": "Conséquences sur le réseau"
    },
    "leaving_country": {
      "difficulty": "easy/medium/hard/very_hard",
      "admin_hurdles": ["Obstacle admin 1", "Obstacle admin 2"],
      "financial_traps": ["Piège financier 1", "Piège financier 2"],
      "social_pressure": "Pression sociale au départ"
    },
    "changing_industry": {
      "difficulty": "easy/medium/hard/very_hard",
      "typical_barriers": ["Barrière 1", "Barrière 2"],
      "age_factor": "Impact de l'âge sur la transition"
    }
  },
  
  "career_ceiling_by_profile": [
    {
      "profile": "Expat occidental",
      "typical_ceiling": "Niveau max atteignable typiquement",
      "why_ceiling_exists": "Pourquoi ce plafond existe",
      "how_to_break_through": "Comment le dépasser (si possible)"
    },
    {
      "profile": "Femme",
      "typical_ceiling": "...",
      "why_ceiling_exists": "...",
      "how_to_break_through": "..."
    },
    {
      "profile": "Non-diplômé prestigieux",
      "typical_ceiling": "...",
      "why_ceiling_exists": "...",
      "how_to_break_through": "..."
    },
    {
      "profile": "Entrepreneur",
      "typical_ceiling": "...",
      "why_ceiling_exists": "...",
      "how_to_break_through": "..."
    }
  ],
  
  "hidden_hierarchies": [
    {
      "hierarchy": "Hiérarchie cachée 1",
      "how_it_works": "Comment elle fonctionne",
      "who_benefits": "Qui en bénéficie",
      "who_suffers": "Qui en souffre",
      "how_to_navigate": "Comment naviguer"
    },
    {
      "hierarchy": "Hiérarchie cachée 2",
      "how_it_works": "...",
      "who_benefits": "...",
      "who_suffers": "...",
      "how_to_navigate": "..."
    }
  ],
  
  "taboo_topics": [
    {
      "topic": "Sujet tabou 1",
      "why_taboo": "Pourquoi c'est tabou",
      "safe_to_discuss_with": "Avec qui on peut en parler",
      "consequences_if_raised": "Conséquences si abordé mal à propos"
    },
    {
      "topic": "Sujet tabou 2",
      "why_taboo": "...",
      "safe_to_discuss_with": "...",
      "consequences_if_raised": "..."
    },
    {
      "topic": "Sujet tabou 3",
      "why_taboo": "...",
      "safe_to_discuss_with": "...",
      "consequences_if_raised": "..."
    }
  ],
  
  "decision_making_patterns": {
    "individual_vs_collective": "Comment les décisions sont prises (individuelles vs collectives)",
    "speed": "Vitesse typique de décision",
    "reversibility": "Les décisions sont-elles facilement réversibles",
    "who_really_decides": "Qui décide vraiment (vs qui semble décider)",
    "how_to_influence": "Comment influencer une décision"
  },
  
  "time_perception": {
    "punctuality_importance": "Importance de la ponctualité (1-10)",
    "meeting_culture": "Culture des réunions (durée, fréquence, utilité)",
    "deadline_meaning": "Ce que 'deadline' signifie vraiment",
    "long_term_planning": "Horizon de planification typique",
    "urgency_culture": "Culture de l'urgence"
  },
  
  "social_norms": "Description générale des normes sociales dominantes",
  "authority_relation": "Relation typique à l'autorité",
  "risk_attitude": "Attitude face au risque",
  "conflict_approach": "Approche des conflits",
  
  "strategies_rewarded": [
    "Quand tu [action], alors [récompense]",
    "Quand tu [action], alors [récompense]",
    "Quand tu [action], alors [récompense]"
  ],
  
  "strategies_punished": [
    "Quand tu [action], alors [punition]",
    "Quand tu [action], alors [punition]",
    "Quand tu [action], alors [punition]"
  ],
  
  "newcomer_mistakes": [
    "Erreur de nouveau 1 avec conséquence",
    "Erreur de nouveau 2 avec conséquence",
    "Erreur de nouveau 3 avec conséquence"
  ],
  
  "mobility_elevators": [
    "Ascenseur social 1 avec comment y accéder",
    "Ascenseur social 2",
    "Ascenseur social 3"
  ],
  "mobility_speed": "lente/moyenne/rapide",
  "mobility_speed_reason": "Explication de la vitesse de mobilité",
  
  "mental_cost": "faible/moyen/élevé/très_élevé",
  "mental_cost_reason": "Explication du coût mental",
  
  "system_produces": [
    "Trait 1 que le système produit chez les habitants",
    "Trait 2",
    "Trait 3"
  ],
  
  "adaptive_behaviors": [
    "Comportement adaptatif 1",
    "Comportement adaptatif 2",
    "Comportement adaptatif 3"
  ],
  
  "backfiring_behaviors": [
    "Comportement contre-productif 1",
    "Comportement contre-productif 2",
    "Comportement contre-productif 3"
  ],
  
  "dependencies": [
    "Dépendance économique/politique 1",
    "Dépendance 2",
    "Dépendance 3"
  ],
  "cycle_status": "Description du cycle économique actuel",
  "macro_risks": [
    "Risque macro 1",
    "Risque macro 2",
    "Risque macro 3"
  ],
  
  "historical_traces": [
    "Trace historique 1 encore visible aujourd'hui",
    "Trace historique 2",
    "Trace historique 3"
  ],
  
  "legacy_implications": {
    "trust": "Impact de l'histoire sur la confiance",
    "institutions": "Impact sur les institutions",
    "merit": "Impact sur la perception du mérite",
    "risk": "Impact sur la perception du risque"
  }
}

RAPPELS :
- Chaque insight doit être SPÉCIFIQUE à ${country.country_name}
- Expliquer le POURQUOI, pas juste le QUOI
- Patterns observables, pas stéréotypes
- Inclure nuances et exceptions`;
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
          if (attempt < maxRetries) {
            const delay = baseDelay * Math.pow(2, attempt - 1);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        } else {
          throw new Error(`AI API error: ${status} - ${errorText}`);
        }
      } else {
        const data = await response.json();
        return data.choices[0].message.content;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client for auth validation
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
    });

    // Authenticate user - admin only for country intelligence generation
    let authResult;
    try {
      authResult = await requireAuth(req, supabaseAuth);
      // This is an admin-only operation (expensive AI generation)
      await requireAdmin(authResult.userId, supabaseAuth);
    } catch (err) {
      return authErrorResponse(err as AuthError, corsHeaders);
    }

    console.log(`[generate-country-intelligence] Admin user ${authResult.userId} authenticated`);

    const body = await req.json();
    
    // Validate input
    const validation = validate<CountryInput>(body)
      .string('country_id' as keyof CountryInput, { required: true })
      .string('country_name' as keyof CountryInput, { required: true, max: 100 })
      .string('iso2' as keyof CountryInput, { required: true, min: 2, max: 3 })
      .string('region' as keyof CountryInput, { max: 100 })
      .string('primary_pyramid' as keyof CountryInput, { max: 100 })
      .validate();

    if (!validation.success) {
      return validationErrorResponse(validation.errors!, corsHeaders);
    }

    const country: CountryInput = {
      country_id: (validation.data as any).country_id || body.countryId || body.country_id,
      country_name: (validation.data as any).country_name || body.countryName || body.country_name,
      iso2: (validation.data as any).iso2 || body.iso2,
      region: (validation.data as any).region || body.region,
      primary_pyramid: (validation.data as any).primary_pyramid || body.primaryPyramid || body.primary_pyramid,
    };

    console.log("Generating INTELLIGENCE for:", country.country_name);

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Generate the intelligence
    const generationPrompt = createGenerationPrompt(country);
    const generatedContent = await callLLMWithRetry(SYSTEM_PROMPT, generationPrompt);

    const generatedJSON = extractJSON(generatedContent) as any;
    if (!generatedJSON) {
      throw new Error("Failed to parse generated JSON");
    }

    // Upsert to country_intelligence table
    const intelligenceData = {
      country_id: country.country_id,
      is_complete: true,
      power_formal: generatedJSON.power_formal || [],
      power_informal: generatedJSON.power_informal || [],
      power_keys_ranking: generatedJSON.power_keys_ranking || {},
      social_norms: generatedJSON.social_norms || "",
      authority_relation: generatedJSON.authority_relation || "",
      risk_attitude: generatedJSON.risk_attitude || "",
      conflict_approach: generatedJSON.conflict_approach || "",
      strategies_rewarded: generatedJSON.strategies_rewarded || [],
      strategies_punished: generatedJSON.strategies_punished || [],
      newcomer_mistakes: generatedJSON.newcomer_mistakes || [],
      mobility_elevators: generatedJSON.mobility_elevators || [],
      mobility_speed: generatedJSON.mobility_speed || "moyenne",
      mobility_speed_reason: generatedJSON.mobility_speed_reason || "",
      mental_cost: generatedJSON.mental_cost || "moyen",
      mental_cost_reason: generatedJSON.mental_cost_reason || "",
      system_produces: generatedJSON.system_produces || [],
      adaptive_behaviors: generatedJSON.adaptive_behaviors || [],
      backfiring_behaviors: generatedJSON.backfiring_behaviors || [],
      dependencies: generatedJSON.dependencies || [],
      cycle_status: generatedJSON.cycle_status || "stable",
      macro_risks: generatedJSON.macro_risks || [],
      historical_traces: generatedJSON.historical_traces || [],
      legacy_implications: generatedJSON.legacy_implications || {},
      // New enriched fields
      unspoken_rules: generatedJSON.unspoken_rules || [],
      negotiation_styles: generatedJSON.negotiation_styles || {},
      trust_signals: generatedJSON.trust_signals || [],
      distrust_signals: generatedJSON.distrust_signals || [],
      exit_difficulty: generatedJSON.exit_difficulty || {},
      career_ceiling_by_profile: generatedJSON.career_ceiling_by_profile || [],
      hidden_hierarchies: generatedJSON.hidden_hierarchies || [],
      taboo_topics: generatedJSON.taboo_topics || [],
      decision_making_patterns: generatedJSON.decision_making_patterns || {},
      time_perception: generatedJSON.time_perception || {},
    };

    const { error } = await supabase
      .from("country_intelligence")
      .upsert(intelligenceData, { onConflict: "country_id" });

    if (error) {
      console.error("Error saving intelligence:", error);
      throw new Error(`Failed to save intelligence: ${error.message}`);
    }

    console.log(`Successfully generated INTELLIGENCE for ${country.country_name}`);

    return new Response(
      JSON.stringify({ success: true, country_id: country.country_id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Intelligence generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
