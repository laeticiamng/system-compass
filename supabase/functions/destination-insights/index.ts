import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validate, validationErrorResponse, isString, isArray, sanitizeString } from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://world-alignment.lovable.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

// Valid modes for the API
const VALID_MODES = ['insights', 'vacation', 'vacation_recommendations'] as const;
type Mode = typeof VALID_MODES[number];

// Input validation interface
interface DestinationInsightsInput {
  destination?: string | { name?: string; countryName?: string };
  nationalities?: string[] | string;
  aspiration?: string;
  mode?: Mode;
  currentCountry?: string;
  preferences?: {
    climate?: string;
    budget?: string;
    activities?: string[];
    duration?: number;
  };
}

// Sanitize and validate input
function validateInput(body: unknown): { valid: boolean; data?: DestinationInsightsInput; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const input = body as Record<string, unknown>;
  const result: DestinationInsightsInput = {};

  // Validate mode (optional, defaults to 'insights')
  if (input.mode !== undefined) {
    if (!isString(input.mode) || !VALID_MODES.includes(input.mode as Mode)) {
      return { valid: false, error: `mode must be one of: ${VALID_MODES.join(', ')}` };
    }
    result.mode = input.mode as Mode;
  }

  // Validate destination
  if (input.destination !== undefined) {
    if (isString(input.destination)) {
      result.destination = sanitizeString(input.destination).slice(0, 200);
    } else if (typeof input.destination === 'object' && input.destination !== null) {
      const dest = input.destination as Record<string, unknown>;
      result.destination = {
        name: dest.name && isString(dest.name) ? sanitizeString(dest.name).slice(0, 200) : undefined,
        countryName: dest.countryName && isString(dest.countryName) ? sanitizeString(dest.countryName).slice(0, 200) : undefined,
      };
    }
  }

  // Validate nationalities
  if (input.nationalities !== undefined) {
    if (isString(input.nationalities)) {
      result.nationalities = sanitizeString(input.nationalities).slice(0, 500);
    } else if (isArray(input.nationalities)) {
      result.nationalities = (input.nationalities as unknown[])
        .filter(isString)
        .map(n => sanitizeString(n).slice(0, 100))
        .slice(0, 10);
    }
  }

  // Validate aspiration
  if (input.aspiration !== undefined && isString(input.aspiration)) {
    result.aspiration = sanitizeString(input.aspiration).slice(0, 500);
  }

  // Validate currentCountry
  if (input.currentCountry !== undefined && isString(input.currentCountry)) {
    result.currentCountry = sanitizeString(input.currentCountry).slice(0, 200);
  }

  // Validate preferences (for vacation_recommendations mode)
  if (input.preferences !== undefined && typeof input.preferences === 'object') {
    const prefs = input.preferences as Record<string, unknown>;
    result.preferences = {
      climate: prefs.climate && isString(prefs.climate) ? sanitizeString(prefs.climate).slice(0, 50) : undefined,
      budget: prefs.budget && isString(prefs.budget) ? sanitizeString(prefs.budget).slice(0, 50) : undefined,
      activities: prefs.activities && isArray(prefs.activities) 
        ? (prefs.activities as unknown[]).filter(isString).map(a => sanitizeString(a).slice(0, 100)).slice(0, 10)
        : undefined,
      duration: prefs.duration && typeof prefs.duration === 'number' && prefs.duration > 0 && prefs.duration <= 365
        ? prefs.duration
        : undefined,
    };
  }

  return { valid: true, data: result };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validation = validateInput(body);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { destination, nationalities, aspiration, mode, currentCountry, preferences } = validation.data!;
    
    // Check for Lovable AI key first, fallback to OpenAI
    const apiKey = LOVABLE_API_KEY || Deno.env.get("OPENAI_API_KEY");
    const useLovableAI = !!LOVABLE_API_KEY;
    
    if (!apiKey) {
      console.error("No AI API key configured");
      throw new Error("No AI API key configured (LOVABLE_API_KEY or OPENAI_API_KEY)");
    }

    // Handle vacation_recommendations mode (returns JSON, no streaming)
    if (mode === 'vacation_recommendations') {
      return await handleVacationRecommendations(
        currentCountry || '',
        Array.isArray(nationalities) ? nationalities : (nationalities ? [nationalities] : []),
        preferences || {},
        apiKey,
        useLovableAI
      );
    }

    // Standard insights mode (streaming)
    const modeContext = mode === 'vacation' 
      ? "L'utilisateur envisage des VACANCES ou un séjour temporaire. Focus sur: facilité d'accès, coût du séjour court, sécurité touriste, précautions sanitaires, meilleures saisons, visa touriste."
      : "L'utilisateur envisage une INSTALLATION permanente ou long terme. Focus sur: processus d'immigration, coût de vie mensuel, marché du travail, système de santé, qualité de vie, intégration sociale, éducation.";

    const destinationName = typeof destination === 'string' 
      ? destination 
      : destination?.name || destination?.countryName || 'destination';

    const nationalitiesStr = Array.isArray(nationalities) ? nationalities.join(', ') : nationalities || 'Non spécifié';

    const systemPrompt = `Tu es un expert en expatriation et voyages internationaux. Tu fournis des conseils personnalisés et pratiques.

Contexte:
- Nationalité(s) de l'utilisateur: ${nationalitiesStr}
- Pays actuel: ${currentCountry || 'Non spécifié'}
- Destination analysée: ${destinationName}
- Aspiration principale: ${aspiration || 'Non spécifié'}
- ${modeContext}

RÈGLES ABSOLUES:
- Style descriptif, JAMAIS prescriptif (interdit "tu dois", "il faut")
- Aucun conseil juridique/financier/immigration définitif
- Pas de promesse, pas de garantie
- Formule en "pourrait", "une option serait", "tend à"
- Inclure les nuances et incertitudes

Réponds en français de manière concise et structurée. Sois direct et pratique.`;

    const userPrompt = mode === 'vacation' 
      ? `Donne-moi une analyse pour des VACANCES à ${destinationName}:

1. **Accès** (visa requis pour mes nationalités, durée autorisée)
2. **Budget** (estimation journalière: hébergement, repas, transport)
3. **Meilleure période** (saison idéale, événements à éviter)
4. **Précautions** (santé, sécurité, arnaques courantes)
5. **Incontournables** (3 expériences uniques liées à mon aspiration: ${aspiration})

Sois concis mais complet.`
      : `Donne-moi une analyse pour une INSTALLATION à ${destinationName}:

1. **Immigration** (processus visa/permis pour mes nationalités, délais)
2. **Coût de vie** (loyer, courses, transport mensuel - comparaison avec ${currentCountry})
3. **Travail** (marché de l'emploi, salaires moyens, secteurs porteurs)
4. **Qualité de vie** (santé, éducation, sécurité, climat social)
5. **Intégration** (langue, culture, communauté expatriée, conseils pratiques)
6. **Plan d'action** (étapes concrètes pour préparer l'installation en lien avec: ${aspiration})

Sois concis mais complet.`;

    let response;
    
    if (useLovableAI) {
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          stream: true,
        }),
      });
    } else {
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          stream: true,
        }),
      });
    }

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please check your AI credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI API error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI API error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("destination-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Handler for vacation recommendations (returns JSON with structured recommendations)
async function handleVacationRecommendations(
  originCountry: string,
  nationalities: string[],
  preferences: Record<string, unknown>,
  apiKey: string,
  useLovableAI: boolean
): Promise<Response> {
  const systemPrompt = `Tu es un expert en recommandations de voyages. Génère des recommandations personnalisées.

RÈGLES:
- Retourne UNIQUEMENT du JSON valide
- Pas de markdown, pas de code blocks
- Recommandations basées sur le pouvoir d'achat et l'accessibilité visa

Format JSON attendu:
{
  "recommendations": [
    {
      "countryId": "portugal",
      "name": "Portugal",
      "score": 92,
      "reasons": ["Climat agréable", "Coût de vie abordable"],
      "climate": "temperate",
      "bestSeason": "Printemps/Automne"
    }
  ]
}`;

  const userPrompt = `Génère 5 recommandations de destinations vacances pour:
- Pays d'origine: ${originCountry || 'Non spécifié'}
- Nationalités: ${nationalities.length > 0 ? nationalities.join(', ') : 'Non spécifié'}
- Préférences climat: ${preferences?.climate || 'any'}
- Budget: ${preferences?.budget || 'medium'}
- Activités préférées: ${Array.isArray(preferences?.activities) ? preferences.activities.join(', ') : 'diverses'}
- Durée souhaitée: ${preferences?.duration || 14} jours

Retourne UNIQUEMENT le JSON, sans autre texte.`;

  const apiUrl = useLovableAI 
    ? "https://ai.gateway.lovable.dev/v1/chat/completions"
    : "https://api.openai.com/v1/chat/completions";

  const model = useLovableAI ? "google/gemini-3-flash-preview" : "gpt-4o-mini";

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI API error for vacation recommendations:", response.status, errorText);
    return new Response(
      JSON.stringify({ error: "Failed to generate recommendations" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const data = await response.json();
  let content = data.choices?.[0]?.message?.content || "";

  // Parse JSON from response
  try {
    // Extract JSON from potential markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : content;
    const parsed = JSON.parse(jsonStr.trim());
    
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Failed to parse vacation recommendations JSON:", e, content);
    // Return fallback recommendations
    return new Response(JSON.stringify({
      recommendations: [
        {
          countryId: "portugal",
          name: "Portugal",
          score: 92,
          reasons: ["Climat agréable", "Coût de vie abordable", "Culture riche"],
          climate: "temperate",
          bestSeason: "Printemps/Automne",
        },
        {
          countryId: "thailand",
          name: "Thaïlande",
          score: 88,
          reasons: ["Plages magnifiques", "Cuisine exceptionnelle", "Budget friendly"],
          climate: "tropical",
          bestSeason: "Novembre-Février",
        },
        {
          countryId: "japan",
          name: "Japon",
          score: 85,
          reasons: ["Culture unique", "Sécurité", "Gastronomie"],
          climate: "temperate",
          bestSeason: "Printemps (Sakura)",
        },
      ],
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}
