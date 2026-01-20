import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Top 10 countries to pre-cache
const TOP_COUNTRIES = [
  'France',
  'Germany',
  'United States',
  'United Kingdom',
  'Canada',
  'Morocco',
  'Cameroon',
  'Brazil',
  'India',
  'Japan'
];

const LANGUAGES = ['fr', 'en'];

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
      "red_flags": ["Signal 1", "Signal 2"],
      "psychological_tactics": ["Urgence", "Exclusivité"],
      "risks": ["Perte argent", "Vol identité"],
      "protection_checklist": ["Vérifier agrément"],
      "where_to_verify": ["Site régulateur"],
      "where_to_report": ["Police", "Régulateur"]
    }
  ],
  "legit_top7": [
    {
      "name": "Nom de l'option",
      "category": "savings|bonds|funds|retirement|insurance|micro_savings|real_estate",
      "why_safer": "Pourquoi c'est plus sûr",
      "what_its_not": "Ce que ça ne garantit PAS",
      "verification_checklist": ["Agrément", "Prospectus"],
      "when_to_avoid": ["Besoin liquidité"],
      "official_resources": ["URL ou nom ressource officielle"]
    }
  ],
  "sources": [
    {"name": "Nom source", "url": "URL si disponible", "type": "regulator|government|ngo|international", "date": "2024"}
  ],
  "confidence": 0.8
}`;

async function generateForCountry(
  country: string,
  language: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  apiKey: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if already cached
    const { data: existing } = await supabase
      .from('financial_intel_country_snapshots')
      .select('id')
      .eq('country', country.toLowerCase())
      .eq('language', language)
      .eq('sector_focus', '')
      .gt('expires_at', new Date().toISOString())
      .limit(1)
      .maybeSingle();

    if (existing) {
      console.log(`Cache already exists for ${country} (${language})`);
      return { success: true };
    }

    const userPrompt = `Génère l'analyse "Financial Safety Intel" pour le pays: ${country}

Langue de réponse: ${language === 'fr' ? 'Français' : 'English'}

Génère:
1. Le profil du pays avec ses régulateurs financiers principaux
2. Top 7 des montages à risque (arnaques courantes dans ce pays/région)
3. Top 7 des options légitimes et régulées disponibles
4. Sources utilisées avec niveau de confiance

Si tu n'as pas d'informations spécifiques pour ce pays, utilise la taxonomie universelle des arnaques et indique clairement "À confirmer localement" avec un score de confiance bas.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error(`AI error for ${country}:`, errorText);
      return { success: false, error: `AI error: ${aiResponse.status}` };
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      return { success: false, error: 'No content in AI response' };
    }

    // Parse JSON
    let parsedResponse;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      parsedResponse = JSON.parse(jsonStr.trim());
    } catch {
      console.error(`Failed to parse response for ${country}`);
      return { success: false, error: 'JSON parse error' };
    }

    const disclaimer = language === 'fr' 
      ? "Ce contenu est fourni à titre éducatif et de prévention uniquement. Il ne constitue pas un conseil financier personnalisé. Vérifiez toujours l'agrément des opérateurs auprès des régulateurs officiels de votre pays."
      : "This content is provided for educational and prevention purposes only. It does not constitute personalized financial advice. Always verify operator licenses with your country's official regulators.";

    // Store snapshot with 30 day expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { error: insertError } = await supabase
      .from('financial_intel_country_snapshots')
      .insert({
        country: country.toLowerCase(),
        sector_focus: '',
        audience: '',
        language,
        scam_top7_json: parsedResponse.scam_top7 || [],
        legit_top7_json: parsedResponse.legit_top7 || [],
        sources_json: parsedResponse.sources || [],
        country_profile: parsedResponse.country_profile,
        confidence: parsedResponse.confidence || 0.5,
        disclaimer,
        expires_at: expiresAt.toISOString()
      });

    if (insertError) {
      console.error(`Insert error for ${country}:`, insertError);
      return { success: false, error: insertError.message };
    }

    console.log(`Successfully cached ${country} (${language})`);
    return { success: true };

  } catch (error) {
    console.error(`Error generating for ${country}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const apiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find next country/language combo that needs caching
    let nextToProcess: { country: string; language: string } | null = null;

    for (const country of TOP_COUNTRIES) {
      for (const language of LANGUAGES) {
        const { data: existing } = await supabase
          .from('financial_intel_country_snapshots')
          .select('id')
          .eq('country', country.toLowerCase())
          .eq('language', language)
          .gt('expires_at', new Date().toISOString())
          .limit(1)
          .maybeSingle();

        if (!existing) {
          nextToProcess = { country, language };
          break;
        }
      }
      if (nextToProcess) break;
    }

    if (!nextToProcess) {
      return new Response(
        JSON.stringify({
          message: 'All countries are already cached',
          status: 'complete'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${nextToProcess.country} (${nextToProcess.language})...`);
    
    const result = await generateForCountry(
      nextToProcess.country, 
      nextToProcess.language, 
      supabase, 
      apiKey
    );

    // Count remaining
    let remaining = 0;
    for (const country of TOP_COUNTRIES) {
      for (const language of LANGUAGES) {
        const { data: existing } = await supabase
          .from('financial_intel_country_snapshots')
          .select('id')
          .eq('country', country.toLowerCase())
          .eq('language', language)
          .gt('expires_at', new Date().toISOString())
          .limit(1)
          .maybeSingle();
        if (!existing) remaining++;
      }
    }

    return new Response(
      JSON.stringify({
        processed: nextToProcess,
        success: result.success,
        error: result.error,
        remaining,
        message: result.success 
          ? `Cached ${nextToProcess.country} (${nextToProcess.language}). ${remaining} remaining.`
          : `Failed: ${result.error}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in batch-financial-intel:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
