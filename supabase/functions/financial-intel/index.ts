import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validate, validationErrorResponse } from "../_shared/validation.ts";

import { corsHeaders } from "../_shared/cors.ts";
import { checkRateLimit, getRateLimitKey, rateLimitResponse } from "../_shared/rate-limit.ts";

interface FinancialIntelRequest {
  country: string;
  sector_focus?: string;
  audience?: string;
  language?: string;
}

interface ScamItem {
  name: string;
  category: string;
  process: string;
  typical_targets: string;
  red_flags: string[];
  psychological_tactics: string[];
  risks: string[];
  protection_checklist: string[];
  where_to_verify: string[];
  where_to_report: string[];
}

interface LegitOption {
  name: string;
  category: string;
  why_safer: string;
  what_its_not: string;
  verification_checklist: string[];
  when_to_avoid: string[];
  official_resources: string[];
}

interface CountryProfile {
  name: string;
  currency: string;
  main_regulators: string[];
  source_confidence: 'high' | 'medium' | 'low';
}

interface FinancialIntelResponse {
  country_profile: CountryProfile;
  scam_top7: ScamItem[];
  legit_top7: LegitOption[];
  sources: Array<{ name: string; url?: string; type: string; date?: string }>;
  confidence: number;
  disclaimer: string;
}

const SYSTEM_PROMPT = `Tu es un expert en sécurité financière et prévention des arnaques. Tu génères du contenu éducatif pour aider les citoyens à reconnaître les risques financiers et identifier les options régulées.

RÈGLES ABSOLUES:
1. JAMAIS de conseil d'investissement personnalisé
2. JAMAIS d'incitation à la fraude
3. JAMAIS de recommandation de produit spécifique
4. Toujours des CATÉGORIES, pas des noms de sociétés sauf pour les régulateurs officiels
5. Priorité aux sources officielles (banques centrales, AMF équivalents, protection consommateurs)
6. Si pas de sources fiables pour un pays, le signaler clairement

FORMAT DE RÉPONSE (JSON strict):
{
  "country_profile": {
    "name": "Nom officiel du pays",
    "currency": "Code devise",
    "main_regulators": ["Liste des régulateurs financiers principaux"],
    "source_confidence": "high|medium|low"
  },
  "scam_top7": [
    {
      "name": "Nom du schéma",
      "category": "ponzi|fake_broker|advance_fee|pyramid|crypto_scam|loan_fraud|real_estate_fraud",
      "process": "Comment ça fonctionne (2-3 phrases)",
      "typical_targets": "Profils ciblés typiques",
      "red_flags": ["Signal 1", "Signal 2", ...],
      "psychological_tactics": ["Urgence", "Exclusivité", ...],
      "risks": ["Perte argent", "Vol identité", ...],
      "protection_checklist": ["Vérifier agrément", ...],
      "where_to_verify": ["Site régulateur", ...],
      "where_to_report": ["Police", "Régulateur", ...]
    }
  ],
  "legit_top7": [
    {
      "name": "Nom de l'option",
      "category": "savings|bonds|funds|retirement|insurance|micro_savings|real_estate",
      "why_safer": "Pourquoi c'est plus sûr",
      "what_its_not": "Ce que ça ne garantit PAS",
      "verification_checklist": ["Agrément", "Prospectus", ...],
      "when_to_avoid": ["Besoin liquidité", ...],
      "official_resources": ["URL ou nom ressource officielle"]
    }
  ],
  "sources": [
    {"name": "Nom source", "url": "URL si disponible", "type": "regulator|government|ngo|international", "date": "2024"}
  ],
  "confidence": 0.8
}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limit: 10 financial-intel generations / 5 min / IP — heavy AI workload
  const rl = checkRateLimit(getRateLimitKey(req, 'financial-intel'), { maxRequests: 10, windowSeconds: 300 });
  if (!rl.allowed) return rateLimitResponse(rl, corsHeaders);

  try {
    const body = await req.json();
    
    // Validate input with schema validation
    const validation = validate<FinancialIntelRequest>(body)
      .string('country', { required: true, min: 2, max: 100 })
      .string('sector_focus', { max: 200 })
      .string('audience', { max: 200 })
      .enum('language', ['fr', 'en', 'es', 'de', 'pt', 'ar', 'zh'], { default: 'fr' })
      .validate();

    if (!validation.success) {
      return validationErrorResponse(validation.errors!, corsHeaders);
    }

    const { country, sector_focus, audience, language } = validation.data!;

    console.log(`Financial Intel request for: ${country}, sector: ${sector_focus}, audience: ${audience}, lang: ${language}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check for cached snapshot
    const { data: cachedSnapshot } = await supabase
      .from('financial_intel_country_snapshots')
      .select('*')
      .eq('country', country.toLowerCase())
      .eq('language', language)
      .eq('sector_focus', sector_focus || '')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (cachedSnapshot) {
      console.log('Returning cached snapshot');
      return new Response(
        JSON.stringify({
          country_profile: cachedSnapshot.country_profile,
          scam_top7: cachedSnapshot.scam_top7_json,
          legit_top7: cachedSnapshot.legit_top7_json,
          sources: cachedSnapshot.sources_json,
          confidence: cachedSnapshot.confidence,
          disclaimer: cachedSnapshot.disclaimer,
          cached: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get auth user if available
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Create generation run
    const { data: runData, error: runError } = await supabase
      .from('financial_intel_generation_runs')
      .insert({
        user_id: userId,
        country: country.toLowerCase(),
        params_json: { sector_focus, audience, language },
        status: 'processing'
      })
      .select()
      .single();

    if (runError) {
      console.error('Error creating run:', runError);
    }

    // Build prompt
    const userPrompt = `Génère l'analyse "Financial Safety Intel" pour le pays: ${country}

${sector_focus ? `Focus sectoriel: ${sector_focus}` : ''}
${audience ? `Audience cible: ${audience}` : ''}
Langue de réponse: ${language === 'fr' ? 'Français' : language === 'en' ? 'English' : language}

Génère:
1. Le profil du pays avec ses régulateurs financiers principaux
2. Top 7 des montages à risque (arnaques courantes dans ce pays/région)
3. Top 7 des options légitimes et régulées disponibles
4. Sources utilisées avec niveau de confiance

Si tu n'as pas d'informations spécifiques pour ce pays, utilise la taxonomie universelle des arnaques et indique clairement "À confirmer localement" avec un score de confiance bas.`;

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
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
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
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
    let parsedResponse: FinancialIntelResponse;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      parsedResponse = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse AI response as JSON');
    }

    const disclaimer = language === 'fr' 
      ? "Ce contenu est fourni à titre éducatif et de prévention uniquement. Il ne constitue pas un conseil financier personnalisé. Vérifiez toujours l'agrément des opérateurs auprès des régulateurs officiels de votre pays."
      : "This content is provided for educational and prevention purposes only. It does not constitute personalized financial advice. Always verify operator licenses with your country's official regulators.";

    // Store snapshot
    const { data: snapshotData, error: snapshotError } = await supabase
      .from('financial_intel_country_snapshots')
      .insert({
        country: country.toLowerCase(),
        sector_focus: sector_focus || '',
        audience: audience || '',
        language,
        scam_top7_json: parsedResponse.scam_top7 || [],
        legit_top7_json: parsedResponse.legit_top7 || [],
        sources_json: parsedResponse.sources || [],
        country_profile: parsedResponse.country_profile,
        confidence: parsedResponse.confidence || 0.5,
        disclaimer
      })
      .select()
      .single();

    if (snapshotError) {
      console.error('Error storing snapshot:', snapshotError);
    }

    // Update generation run
    if (runData) {
      await supabase
        .from('financial_intel_generation_runs')
        .update({
          status: 'completed',
          snapshot_id: snapshotData?.id,
          tokens_cost: aiData.usage?.total_tokens,
          completed_at: new Date().toISOString()
        })
        .eq('id', runData.id);
    }

    return new Response(
      JSON.stringify({
        country_profile: parsedResponse.country_profile,
        scam_top7: parsedResponse.scam_top7,
        legit_top7: parsedResponse.legit_top7,
        sources: parsedResponse.sources,
        confidence: parsedResponse.confidence,
        disclaimer,
        cached: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in financial-intel function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
