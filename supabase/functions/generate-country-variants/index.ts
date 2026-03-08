import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://system-compass.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const SYSTEM_PROMPT = `Tu es un expert en expatriation et vie quotidienne à l'étranger pour Compass.
Tu produis des VARIANTES PAYS ultra-détaillées et pratiques pour les utilisateurs premium.

CONTRAINTES :
- Contenu PRATIQUE et ACTIONNABLE
- Basé sur le vécu réel des expatriés, pas la théorie
- Exemples concrets avec noms, montants, durées
- Style descriptif, jamais prescriptif
- JSON STRICT uniquement

OBJECTIF : Que le lecteur puisse VISUALISER sa vie dans ce pays après lecture.`;

interface CountryInput {
  country_id: string;
  country_name: string;
  iso2: string;
  region: string;
  primary_pyramid: string;
}

function createGenerationPrompt(country: CountryInput): string {
  return `Génère les VARIANTES PRATIQUES ENRICHIES pour :

Pays: ${country.country_name} (${country.iso2})
Région: ${country.region}
Type pyramide: ${country.primary_pyramid}

STRUCTURE JSON REQUISE :

{
  "country_id": "${country.country_id}",
  
  "daily_life": {
    "title": "Vie quotidienne",
    "items": [
      "Aspect 1 de la vie quotidienne avec détail concret",
      "Aspect 2 avec exemple précis (horaires, montants...)",
      "Aspect 3 spécifique à ce pays",
      "Aspect 4 que les guides ne mentionnent pas",
      "Aspect 5 sur les interactions sociales quotidiennes"
    ]
  },
  
  "typical_day": [
    {
      "profile": "Cadre expatrié",
      "morning": "Description détaillée du matin (réveil, transport, déjeuner...)",
      "afternoon": "Description de l'après-midi (travail, pauses, culture bureau...)",
      "evening": "Description de la soirée (fin travail, loisirs, vie sociale...)",
      "weekend": "Description typique du weekend",
      "monthly_rhythm": "Les rituels mensuels (factures, sorties, événements...)"
    },
    {
      "profile": "Entrepreneur indépendant",
      "morning": "...",
      "afternoon": "...",
      "evening": "...",
      "weekend": "...",
      "monthly_rhythm": "..."
    },
    {
      "profile": "Famille avec enfants",
      "morning": "...",
      "afternoon": "...",
      "evening": "...",
      "weekend": "...",
      "monthly_rhythm": "..."
    }
  ],
  
  "labor_market": {
    "title": "Marché du travail",
    "items": [
      "Réalité 1 du marché du travail (avec chiffres)",
      "Réalité 2 (contrats, négociation, culture)",
      "Réalité 3 (évolution de carrière)",
      "Réalité 4 (relations hiérarchiques)",
      "Réalité 5 (salaires réels vs annoncés)"
    ]
  },
  
  "institutions": {
    "title": "Institutions",
    "items": [
      "Institution 1 et son fonctionnement réel",
      "Institution 2 et ses pièges",
      "Institution 3 et comment y naviguer",
      "Institution 4 et ses délais réels",
      "Institution 5 et astuces locales"
    ]
  },
  
  "entrepreneurship": {
    "title": "Entrepreneuriat",
    "items": [
      "Réalité 1 pour créer une entreprise (avec coûts)",
      "Réalité 2 (fiscalité, charges réelles)",
      "Réalité 3 (financement, accès au capital)",
      "Réalité 4 (culture client, paiement)",
      "Réalité 5 (réseaux obligatoires)"
    ]
  },
  
  "networks": {
    "title": "Réseaux",
    "items": [
      "Type de réseau 1 et comment y accéder",
      "Type de réseau 2 et son importance réelle",
      "Type de réseau 3 (professionnel/personnel)",
      "Codes implicites pour être accepté",
      "Erreurs qui vous excluent définitivement"
    ]
  },
  
  "year_one_reality": [
    {
      "month": "Mois 1-2",
      "reality": "Ce qui se passe vraiment",
      "emotions": "État émotionnel typique",
      "challenges": ["Défi 1", "Défi 2"],
      "wins": ["Victoire possible 1", "Victoire possible 2"]
    },
    {
      "month": "Mois 3-4",
      "reality": "...",
      "emotions": "...",
      "challenges": ["..."],
      "wins": ["..."]
    },
    {
      "month": "Mois 5-6",
      "reality": "Le point de bascule typique",
      "emotions": "...",
      "challenges": ["..."],
      "wins": ["..."]
    },
    {
      "month": "Mois 7-9",
      "reality": "...",
      "emotions": "...",
      "challenges": ["..."],
      "wins": ["..."]
    },
    {
      "month": "Mois 10-12",
      "reality": "Le bilan première année",
      "emotions": "...",
      "challenges": ["..."],
      "wins": ["..."]
    }
  ],
  
  "common_mistakes_timeline": [
    {
      "when": "Avant d'arriver",
      "mistakes": [
        {"mistake": "Erreur 1", "consequence": "Conséquence", "how_to_avoid": "Comment éviter"},
        {"mistake": "Erreur 2", "consequence": "...", "how_to_avoid": "..."}
      ]
    },
    {
      "when": "Premier mois",
      "mistakes": [
        {"mistake": "Erreur 1", "consequence": "...", "how_to_avoid": "..."},
        {"mistake": "Erreur 2", "consequence": "...", "how_to_avoid": "..."}
      ]
    },
    {
      "when": "Mois 2-6",
      "mistakes": [
        {"mistake": "Erreur 1", "consequence": "...", "how_to_avoid": "..."},
        {"mistake": "Erreur 2", "consequence": "...", "how_to_avoid": "..."}
      ]
    },
    {
      "when": "Après 6 mois",
      "mistakes": [
        {"mistake": "Erreur 1", "consequence": "...", "how_to_avoid": "..."},
        {"mistake": "Erreur 2", "consequence": "...", "how_to_avoid": "..."}
      ]
    }
  ],
  
  "hidden_admin_steps": [
    {
      "step": "Étape administrative 1",
      "official_duration": "Durée officielle",
      "real_duration": "Durée réelle",
      "hidden_requirements": ["Requirement 1", "Requirement 2"],
      "cost_official_usd": 0,
      "cost_real_usd": 0,
      "tips": "Astuce de local"
    },
    {
      "step": "Étape administrative 2",
      "official_duration": "...",
      "real_duration": "...",
      "hidden_requirements": ["..."],
      "cost_official_usd": 0,
      "cost_real_usd": 0,
      "tips": "..."
    }
  ],
  
  "cultural_shocks": [
    {
      "shock": "Choc culturel 1",
      "why_shocking": "Pourquoi c'est choquant pour un étranger",
      "local_perspective": "Comment les locaux voient ça",
      "adaptation_time": "Temps d'adaptation typique"
    },
    {
      "shock": "Choc culturel 2",
      "why_shocking": "...",
      "local_perspective": "...",
      "adaptation_time": "..."
    },
    {
      "shock": "Choc culturel 3",
      "why_shocking": "...",
      "local_perspective": "...",
      "adaptation_time": "..."
    },
    {
      "shock": "Choc culturel 4",
      "why_shocking": "...",
      "local_perspective": "...",
      "adaptation_time": "..."
    },
    {
      "shock": "Choc culturel 5",
      "why_shocking": "...",
      "local_perspective": "...",
      "adaptation_time": "..."
    }
  ],
  
  "real_costs_breakdown": {
    "housing": {
      "studio_center_usd": 0,
      "2br_center_usd": 0,
      "studio_suburbs_usd": 0,
      "2br_suburbs_usd": 0,
      "deposit_months": 0,
      "agency_fees_usd": 0,
      "hidden_costs": ["Coût caché 1", "Coût caché 2"]
    },
    "utilities": {
      "electricity_usd": 0,
      "water_usd": 0,
      "internet_usd": 0,
      "phone_usd": 0,
      "heating_cooling_usd": 0
    },
    "food": {
      "groceries_monthly_usd": 0,
      "restaurant_cheap_usd": 0,
      "restaurant_mid_usd": 0,
      "restaurant_nice_usd": 0,
      "coffee_usd": 0,
      "beer_usd": 0
    },
    "transport": {
      "monthly_pass_usd": 0,
      "taxi_per_km_usd": 0,
      "car_rental_daily_usd": 0,
      "gas_per_liter_usd": 0
    },
    "healthcare": {
      "doctor_visit_usd": 0,
      "private_insurance_monthly_usd": 0,
      "dental_checkup_usd": 0,
      "emergency_visit_usd": 0
    },
    "lifestyle": {
      "gym_monthly_usd": 0,
      "cinema_usd": 0,
      "haircut_usd": 0,
      "clothing_mid_usd": 0
    }
  },
  
  "success_timeline_months": {
    "feel_at_home": 0,
    "speak_local_basic": 0,
    "first_local_friends": 0,
    "understand_system": 0,
    "feel_integrated": 0,
    "consider_staying": 0
  },
  
  "expat_communities": [
    {
      "community": "Communauté 1",
      "size": "Taille estimée",
      "where_to_find": "Où les trouver",
      "vibe": "Ambiance générale",
      "helpful_for": "Utile pour quoi"
    },
    {
      "community": "Communauté 2",
      "size": "...",
      "where_to_find": "...",
      "vibe": "...",
      "helpful_for": "..."
    }
  ],
  
  "example_trajectories": [
    {
      "name": "Prénom, âge",
      "origin": "Pays d'origine",
      "profile": "Profil professionnel",
      "trajectory": "Parcours détaillé en 2-3 phrases",
      "outcome": "Résultat après X années",
      "key_lesson": "Leçon principale",
      "would_do_differently": "Ce qu'il/elle ferait différemment"
    },
    {
      "name": "...",
      "origin": "...",
      "profile": "...",
      "trajectory": "...",
      "outcome": "...",
      "key_lesson": "...",
      "would_do_differently": "..."
    },
    {
      "name": "...",
      "origin": "...",
      "profile": "...",
      "trajectory": "...",
      "outcome": "...",
      "key_lesson": "...",
      "would_do_differently": "..."
    },
    {
      "name": "...",
      "origin": "...",
      "profile": "...",
      "trajectory": "...",
      "outcome": "...",
      "key_lesson": "...",
      "would_do_differently": "..."
    },
    {
      "name": "...",
      "origin": "...",
      "profile": "...",
      "trajectory": "...",
      "outcome": "...",
      "key_lesson": "...",
      "would_do_differently": "..."
    }
  ],
  
  "surprises": [
    "Surprise positive 1 que personne ne mentionne",
    "Surprise positive 2",
    "Surprise négative 1 que personne ne mentionne",
    "Surprise négative 2",
    "Surprise neutre mais importante 1"
  ],
  
  "profiles_succeed": [
    "Profil 1 qui réussit avec explication détaillée WHY",
    "Profil 2 qui réussit avec explication WHY",
    "Profil 3 qui réussit avec explication WHY",
    "Profil 4 qui réussit avec explication WHY",
    "Profil 5 qui réussit avec explication WHY"
  ],
  
  "profiles_struggle": [
    "Profil 1 qui galère avec explication détaillée WHY",
    "Profil 2 qui galère avec explication WHY",
    "Profil 3 qui galère avec explication WHY",
    "Profil 4 qui galère avec explication WHY",
    "Profil 5 qui galère avec explication WHY"
  ]
}

RAPPELS :
- Tout doit être SPÉCIFIQUE à ${country.country_name}
- Coûts réalistes en USD
- Exemples de trajectoires diversifiés (origines, profils, outcomes)
- Inclure échecs, pas que succès`;
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
    const body = await req.json();
    
    const country: CountryInput = {
      country_id: body.countryId || body.country_id,
      country_name: body.countryName || body.country_name,
      iso2: body.iso2,
      region: body.region,
      primary_pyramid: body.primaryPyramid || body.primary_pyramid,
    };

    console.log("Generating VARIANTS for:", country.country_name);

    if (!country.country_name || !country.iso2) {
      throw new Error("Missing required fields: country_name and iso2");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Generate the variants
    const generationPrompt = createGenerationPrompt(country);
    const generatedContent = await callLLMWithRetry(SYSTEM_PROMPT, generationPrompt);

    const generatedJSON = extractJSON(generatedContent) as any;
    if (!generatedJSON) {
      throw new Error("Failed to parse generated JSON");
    }

    // Upsert to country_variants table
    const variantsData = {
      country_id: country.country_id,
      is_complete: true,
      daily_life: generatedJSON.daily_life || {},
      labor_market: generatedJSON.labor_market || {},
      institutions: generatedJSON.institutions || {},
      entrepreneurship: generatedJSON.entrepreneurship || {},
      networks: generatedJSON.networks || {},
      surprises: generatedJSON.surprises || [],
      profiles_succeed: generatedJSON.profiles_succeed || [],
      profiles_struggle: generatedJSON.profiles_struggle || [],
      example_trajectories: generatedJSON.example_trajectories || [],
      // New enriched fields
      typical_day: generatedJSON.typical_day || [],
      year_one_reality: generatedJSON.year_one_reality || [],
      common_mistakes_timeline: generatedJSON.common_mistakes_timeline || [],
      hidden_admin_steps: generatedJSON.hidden_admin_steps || [],
      cultural_shocks: generatedJSON.cultural_shocks || [],
      real_costs_breakdown: generatedJSON.real_costs_breakdown || {},
      success_timeline_months: generatedJSON.success_timeline_months || {},
      expat_communities: generatedJSON.expat_communities || [],
    };

    const { error } = await supabase
      .from("country_variants")
      .upsert(variantsData, { onConflict: "country_id" });

    if (error) {
      console.error("Error saving variants:", error);
      throw new Error(`Failed to save variants: ${error.message}`);
    }

    console.log(`Successfully generated VARIANTS for ${country.country_name}`);

    return new Response(
      JSON.stringify({ success: true, country_id: country.country_id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Variants generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
