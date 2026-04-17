import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validate, validationErrorResponse, sanitizeString, isString } from "../_shared/validation.ts";

import { corsHeaders } from "../_shared/cors.ts";
import { checkRateLimit, getRateLimitKey, rateLimitResponse } from "../_shared/rate-limit.ts";

// Valid languages for the API
const VALID_LANGUAGES = ['fr', 'en'] as const;
type Language = typeof VALID_LANGUAGES[number];

// Input validation interface
interface TerrainRealitiesInput {
  country: string;
  language: Language;
}

// Validate and sanitize input
function validateInput(body: unknown): { valid: boolean; data?: TerrainRealitiesInput; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const input = body as Record<string, unknown>;

  // Validate country (required)
  if (!input.country || !isString(input.country)) {
    return { valid: false, error: 'country is required and must be a string' };
  }
  const country = sanitizeString(input.country).slice(0, 100);
  if (country.length < 2) {
    return { valid: false, error: 'country must be at least 2 characters' };
  }

  // Validate language (optional, defaults to 'fr')
  let language: Language = 'fr';
  if (input.language !== undefined) {
    if (!isString(input.language) || !VALID_LANGUAGES.includes(input.language as Language)) {
      return { valid: false, error: `language must be one of: ${VALID_LANGUAGES.join(', ')}` };
    }
    language = input.language as Language;
  }

  return { valid: true, data: { country, language } };
}

// Helper to get current date in YYYY-MM format
function getCurrentDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

const SYSTEM_PROMPT = `Tu es un expert en analyse des réalités systémiques des pays. Tu génères du contenu factuel et sourcé sur les dysfonctionnements institutionnels réels, basé sur des rapports d'ONG, médias internationaux, et témoignages documentés.

RÈGLES ABSOLUES:
1. FACTUEL: Uniquement des faits documentés, pas de généralisations
2. SOURÇABLE: Chaque affirmation doit pouvoir être vérifiée
3. ÉQUILIBRÉ: Mentionner aussi les progrès et initiatives positives
4. PRUDENT: Préciser "signalé" ou "rapporté" pour les faits non confirmés officiellement
5. UTILE: Focus sur ce qu'un expatrié/investisseur doit savoir pour se protéger

FORMAT JSON STRICT:
{
  "country_name": "Nom du pays",
  "last_updated": "CURRENT_DATE_PLACEHOLDER",
  "overall_risk_level": "high|medium|low",
  
  "healthcare_realities": {
    "risk_level": "high|medium|low",
    "fake_medications": {
      "prevalence": "widespread|common|rare|undocumented",
      "affected_categories": ["antibiotiques", "antipaludéens", etc.],
      "known_distribution_channels": ["marchés informels", "pharmacies non agréées"],
      "protection_measures": ["Vérifier agrément DPML", "Acheter en pharmacie hospitalière"],
      "sources": [{"name": "OMS", "year": 2024, "finding": "30% des médicaments testés non conformes"}]
    },
    "medical_equipment": {
      "issues": ["Seringues périmées", "Réactifs défectueux", "Maintenance défaillante"],
      "affected_facilities": "Centres de santé périphériques principalement",
      "reliable_alternatives": ["Hôpitaux centraux", "Cliniques internationales", "Évacuation sanitaire"],
      "sources": []
    },
    "chronic_disease_management": {
      "hiv_treatment": {
        "availability": "intermittent|stable|unreliable",
        "test_reliability": "variable|good|poor",
        "issues_reported": ["Ruptures ARV", "Tests périmés", "Personnel non formé"],
        "reliable_centers": ["Noms de centres fiables si connus"],
        "international_support": ["ONUSIDA", "Fonds Mondial", "MSF"]
      },
      "diabetes_care": { "availability": "string", "issues": [] },
      "cancer_care": { "availability": "string", "issues": [] }
    },
    "recommendations": ["Liste de recommandations pratiques"]
  },
  
  "justice_realities": {
    "risk_level": "high|medium|low",
    "corruption_patterns": {
      "lawyer_corruption": {
        "prevalence": "common|rare|undocumented",
        "mechanism": "Description du mécanisme (ex: paiement par la partie adverse)",
        "protection": ["Avocat recommandé par ambassade", "Barreaux internationaux"]
      },
      "judicial_corruption": {
        "prevalence": "string",
        "typical_bribes_range": "string or null",
        "protection": ["Médiatisation", "ONG droits de l'homme", "Pression diplomatique"]
      },
      "police_corruption": {
        "prevalence": "string",
        "common_scenarios": ["Contrôles routiers", "Garde à vue", "Plaintes classées"],
        "protection": []
      }
    },
    "average_delays": {
      "civil_cases": "en mois ou années",
      "criminal_cases": "en mois ou années",
      "commercial_disputes": "en mois ou années"
    },
    "emergency_recourses": [
      {
        "name": "Nom du recours d'urgence",
        "description": "Description courte",
        "timeline": "Délai typique",
        "cost_range": "Fourchette de coût",
        "effectiveness": "high|medium|low",
        "how_to_access": "Procédure pratique"
      }
    ],
    "reliable_contacts": [
      {
        "type": "Ambassade|ONG|Barreau international",
        "name": "Nom",
        "specialty": "Spécialité",
        "contact_info": "Info si publique"
      }
    ],
    "recommendations": []
  },
  
  "security_realities": {
    "risk_level": "high|medium|low",
    "human_trafficking": {
      "prevalence": "high|medium|low|undocumented",
      "common_scenarios": ["Travail domestique", "Exploitation sexuelle", "Enfants des rues"],
      "risk_zones": ["Zones frontalières", "Quartiers spécifiques"],
      "warning_signs": ["Propositions emploi trop belles", "Documents confisqués"],
      "emergency_contacts": ["Numéros d'urgence", "ONG locales"],
      "sources": []
    },
    "organized_crime": {
      "prevalence": "string",
      "types": ["Vol à main armée", "Enlèvements", "Racket"],
      "risk_zones": [],
      "protection": []
    },
    "petty_crime": {
      "prevalence": "string",
      "hotspots": [],
      "protection": []
    },
    "recommendations": []
  },
  
  "administration_realities": {
    "risk_level": "high|medium|low",
    "document_reliability": {
      "birth_certificates": "reliable|variable|unreliable",
      "land_titles": "string",
      "business_licenses": "string",
      "verification_methods": ["Procédures de vérification"]
    },
    "corruption_by_sector": [
      {
        "sector": "Douanes|Police|Tribunaux|Santé|Éducation",
        "prevalence": "endemic|common|occasional|rare",
        "typical_amounts": "Fourchettes si connues",
        "how_to_avoid": ["Conseils pratiques"]
      }
    ],
    "recommendations": []
  },
  
  "positive_developments": [
    {
      "domain": "healthcare|justice|security|administration",
      "development": "Description du progrès",
      "since": "Année",
      "source": "Source"
    }
  ],
  
  "sources": [
    {
      "name": "Nom de la source",
      "type": "NGO|international_org|media|academic|government",
      "url": "URL si disponible",
      "year": 2024,
      "reliability": "high|medium|low"
    }
  ],
  
  "confidence_score": 0.7,
  "disclaimer": "Ces informations sont compilées à partir de sources ouvertes et peuvent ne pas refléter la situation actuelle. Vérifiez toujours auprès des ambassades et organisations sur le terrain."
}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limit: 10 terrain-realities / 5 min / IP — heavy AI workload
  const rl = checkRateLimit(getRateLimitKey(req, 'terrain-realities'), { maxRequests: 10, windowSeconds: 300 });
  if (!rl.allowed) return rateLimitResponse(rl, corsHeaders);

  try {
    // Parse JSON body safely
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate and sanitize input
    const validation = validateInput(body);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { country, language } = validation.data!;

    console.log(`Terrain Realities request for: ${country}, lang: ${language}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check for cached data (valid for 30 days)
    const { data: cachedData } = await supabase
      .from('terrain_realities_cache')
      .select('*')
      .eq('country', country.toLowerCase())
      .eq('language', language)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (cachedData) {
      console.log('Returning cached terrain realities');
      return new Response(
        JSON.stringify({ ...cachedData.data_json, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build user prompt
    const userPrompt = `Génère l'analyse "Réalités Terrain" pour le pays: ${country}

Langue de réponse: ${language === 'fr' ? 'Français' : 'English'}

Focus sur:
1. SANTÉ: Faux médicaments, équipements médicaux défaillants, fiabilité des tests VIH, suivi maladies chroniques
2. JUSTICE: Corruption des avocats/juges, délais judiciaires, recours d'urgence disponibles avec procédures détaillées
3. SÉCURITÉ: Trafic d'êtres humains, criminalité organisée, zones à risque
4. ADMINISTRATION: Fiabilité des documents, corruption par secteur

Pour chaque domaine:
- Faits documentés avec sources
- Mécanismes concrets (comment ça se passe vraiment)
- Mesures de protection pratiques
- Contacts fiables et recours

Sois factuel et prudent. Indique clairement le niveau de confiance et les limites des informations.`;

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Replace placeholder with actual current date
    const currentSystemPrompt = SYSTEM_PROMPT.replace('CURRENT_DATE_PLACEHOLDER', getCurrentDate());

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: currentSystemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse JSON from response
    let parsedResponse;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      parsedResponse = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Cache the result (30 days expiry)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await supabase
      .from('terrain_realities_cache')
      .insert({
        country: country.toLowerCase(),
        language,
        data_json: parsedResponse,
        expires_at: expiresAt.toISOString()
      });

    return new Response(
      JSON.stringify({ ...parsedResponse, cached: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in terrain-realities function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
