import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { validate, validationErrorResponse } from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GOV-INTEL-GENERATE] ${step}${detailsStr}`);
};

// System prompt that ensures safe, legal, prevention-oriented output
const SYSTEM_PROMPT = `Tu es un expert en analyse de gouvernance pour les projets internationaux. Tu fournis des informations objectives et factuelles sur les structures institutionnelles, les processus administratifs et les réalités du terrain.

RÈGLES ABSOLUES :
1. Tu ne donnes JAMAIS d'instructions pour contourner la loi ou payer des pots-de-vin
2. Tu décris les risques d'opacité et d'intermédiation comme des SIGNAUX D'ALERTE, pas comme des opportunités
3. Tu privilégies les sources officielles : ministères, agences gouvernementales, rapports d'organisations reconnues
4. Tu proposes des PROTECTIONS légales : POC, jalons contractuels, due diligence, diversification
5. Tu indiques "inconnu / à vérifier" quand tu n'as pas d'information fiable
6. Tu ne cites JAMAIS de noms de personnes privées - uniquement des rôles et institutions
7. Chaque élément doit avoir un score de confiance honnête (0-100)

FORMAT DE SORTIE :
Tu dois retourner un JSON valide avec cette structure exacte :
{
  "actors": [
    {
      "label": "string - nom de l'institution/rôle",
      "actor_type": "institution|regulator|payer|approver|operator|judicial|local_authority|industry_body|supplier|other",
      "power_types": ["sign", "approve", "block", "grant_access", "control_budget", "control_permit", "enforce", "procure"],
      "formality_level": "formal|mixed|unknown",
      "notes": "string - description du rôle",
      "sources": [{"url": "string", "title": "string", "type": "official|research|media", "date": "string"}],
      "confidence_score": 0-100
    }
  ],
  "intermediation_patterns": [
    {
      "pattern_type": "access_chain|signature_bottleneck|delegated_negotiation|informal_queue|paper_stuck|multi_approver|joint_venture_requirement|payment_delay",
      "description_neutral": "string - description factuelle et neutre du pattern",
      "risk_level": "low|medium|high",
      "signals": ["string - signaux observables qui indiquent ce pattern"],
      "protections": ["string - actions légales de protection"],
      "sources": [...],
      "confidence_score": 0-100
    }
  ],
  "partners": [
    {
      "partner_type": "mandatory_local_partner|commercial_partner|implementation_partner|distribution_partner|equity_partner",
      "description": "string - pourquoi ce type de partenariat peut être requis",
      "is_mandatory": boolean,
      "risk_flags": ["string - risques à surveiller"],
      "due_diligence_checklist": ["string - points de vérification"],
      "sources": [...],
      "confidence_score": 0-100
    }
  ],
  "delays_reality": [
    {
      "process_name": "string - nom du processus",
      "official_timeframe": "string - délai officiel annoncé",
      "optimistic_timeframe": "string - scénario favorable",
      "realistic_timeframe": "string - scénario probable",
      "pessimistic_timeframe": "string - scénario défavorable",
      "delay_risk_signals": ["string - facteurs de retard potentiels"],
      "cashflow_implications": "string - impact sur la trésorerie",
      "sources": [...],
      "confidence_score": 0-100
    }
  ],
  "poc_recommendations": {
    "suggested_poc_scope": "string - périmètre suggéré pour un POC",
    "success_criteria": ["string - critères de succès"],
    "no_go_triggers": ["string - signaux d'abandon"],
    "max_initial_investment": "string - suggestion de limite d'investissement initial"
  },
  "overall_confidence": 0-100,
  "verification_needed": ["string - points à vérifier avec un conseil local"]
}`;

interface GovIntelRequest {
  case_id: string;
  country_code: string;
  country_name?: string;
  sector?: string;
  project_type?: string;
  intention?: string;
  constraints?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Parse and validate request
    const body = await req.json();
    
    const validation = validate<GovIntelRequest>(body)
      .uuid('case_id', { required: true })
      .string('country_code', { required: true, min: 2, max: 10 })
      .string('country_name', { max: 100 })
      .string('sector', { max: 100 })
      .string('project_type', { max: 100 })
      .string('intention', { max: 100 })
      .string('constraints', { max: 2000 })
      .validate();

    if (!validation.success) {
      return validationErrorResponse(validation.errors!, corsHeaders);
    }

    const { case_id, country_code, country_name, sector, project_type, intention, constraints } = validation.data!;
    logStep("Request validated", { case_id, country_code, sector, project_type, intention });

    // Create run log
    const { data: runData, error: runError } = await supabaseClient
      .from('gov_intel_runs')
      .insert({
        case_id,
        user_id: user.id,
        country_code,
        sector,
        project_type,
        intention,
        status: 'running'
      })
      .select()
      .single();

    if (runError) {
      logStep("Warning: Could not create run log", { error: runError.message });
    }
    const runId = runData?.id;
    logStep("Run created", { runId });

    // Build prompt
    const userPrompt = `Analyse de gouvernance pour un projet ${intention === 'entrepreneurship' ? 'entrepreneurial' : 'de relocalisation'} :

PAYS : ${country_name || country_code}
SECTEUR : ${sector || 'Non spécifié'}
TYPE DE PROJET : ${project_type || 'Non spécifié'}
${constraints ? `CONTRAINTES : ${constraints}` : ''}

Génère une analyse complète de gouvernance incluant :
1. Les acteurs institutionnels clés (qui signe, qui approuve, qui bloque)
2. Les schémas d'intermédiation typiques (en mode prévention, pas prescription)
3. Les exigences de partenariat local (obligatoire ou recommandé selon le secteur)
4. La réalité des délais (officiel vs observé)
5. Des recommandations POC si pertinent

Privilégie les sources officielles et indique honnêtement ton niveau de confiance.`;

    // Call AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    logStep("Calling AI gateway");
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      logStep("AI gateway error", { status: aiResponse.status, error: errorText });
      
      if (aiResponse.status === 429) {
        // Update run status
        if (runId) {
          await supabaseClient.from('gov_intel_runs').update({ 
            status: 'failed', 
            error_message: 'Rate limit exceeded' 
          }).eq('id', runId);
        }
        return new Response(JSON.stringify({ 
          error: "rate_limited",
          message: "Trop de requêtes. Réessayez dans quelques instants." 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (aiResponse.status === 402) {
        if (runId) {
          await supabaseClient.from('gov_intel_runs').update({ 
            status: 'failed', 
            error_message: 'Insufficient credits' 
          }).eq('id', runId);
        }
        return new Response(JSON.stringify({ 
          error: "payment_required",
          message: "Crédits IA insuffisants." 
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }
    
    logStep("AI response received");
    
    // Parse AI response
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (e) {
      logStep("Failed to parse AI response as JSON", { error: e, content: content.substring(0, 500) });
      throw new Error("Invalid JSON response from AI");
    }

    // Store results in database
    let actorsCount = 0;
    let patternsCount = 0;
    let partnersCount = 0;
    let delaysCount = 0;

    // Insert actors
    if (parsedContent.actors && Array.isArray(parsedContent.actors)) {
      for (const actor of parsedContent.actors) {
        const { error } = await supabaseClient.from('case_governance_actors').insert({
          case_id,
          country_code,
          sector,
          label: actor.label,
          actor_type: actor.actor_type || 'other',
          power_types: actor.power_types || [],
          formality_level: actor.formality_level || 'formal',
          reliability_status: 'unverified',
          notes: actor.notes,
          sources: actor.sources || [],
          confidence_score: actor.confidence_score || 50,
          is_ai_generated: true
        });
        if (!error) actorsCount++;
      }
      logStep("Actors inserted", { count: actorsCount });
    }

    // Insert intermediation patterns
    if (parsedContent.intermediation_patterns && Array.isArray(parsedContent.intermediation_patterns)) {
      for (const pattern of parsedContent.intermediation_patterns) {
        const { error } = await supabaseClient.from('case_intermediation_patterns').insert({
          case_id,
          pattern_type: pattern.pattern_type || 'access_chain',
          description_neutral: pattern.description_neutral,
          risk_level: pattern.risk_level || 'medium',
          signals: pattern.signals || [],
          protections: pattern.protections || [],
          sources: pattern.sources || [],
          confidence_score: pattern.confidence_score || 50,
          is_ai_generated: true
        });
        if (!error) patternsCount++;
      }
      logStep("Patterns inserted", { count: patternsCount });
    }

    // Insert partners
    if (parsedContent.partners && Array.isArray(parsedContent.partners)) {
      for (const partner of parsedContent.partners) {
        const { error } = await supabaseClient.from('case_governance_partners').insert({
          case_id,
          partner_type: partner.partner_type || 'commercial_partner',
          description: partner.description,
          is_mandatory: partner.is_mandatory || false,
          risk_flags: partner.risk_flags || [],
          due_diligence_checklist: partner.due_diligence_checklist || [],
          sources: partner.sources || [],
          confidence_score: partner.confidence_score || 50,
          is_ai_generated: true
        });
        if (!error) partnersCount++;
      }
      logStep("Partners inserted", { count: partnersCount });
    }

    // Insert delays
    if (parsedContent.delays_reality && Array.isArray(parsedContent.delays_reality)) {
      for (const delay of parsedContent.delays_reality) {
        const { error } = await supabaseClient.from('case_delays_reality').insert({
          case_id,
          process_name: delay.process_name,
          official_timeframe: delay.official_timeframe,
          optimistic_timeframe: delay.optimistic_timeframe,
          realistic_timeframe: delay.realistic_timeframe,
          pessimistic_timeframe: delay.pessimistic_timeframe,
          delay_risk_signals: delay.delay_risk_signals || [],
          cashflow_implications: delay.cashflow_implications,
          sources: delay.sources || [],
          confidence_score: delay.confidence_score || 50,
          is_ai_generated: true
        });
        if (!error) delaysCount++;
      }
      logStep("Delays inserted", { count: delaysCount });
    }

    // Update run status
    if (runId) {
      await supabaseClient.from('gov_intel_runs').update({
        status: 'completed',
        actors_count: actorsCount,
        patterns_count: patternsCount,
        partners_count: partnersCount,
        delays_count: delaysCount,
        completed_at: new Date().toISOString()
      }).eq('id', runId);
    }

    logStep("Generation completed successfully", { 
      actorsCount, 
      patternsCount, 
      partnersCount, 
      delaysCount 
    });

    return new Response(JSON.stringify({
      success: true,
      run_id: runId,
      counts: {
        actors: actorsCount,
        patterns: patternsCount,
        partners: partnersCount,
        delays: delaysCount
      },
      poc_recommendations: parsedContent.poc_recommendations,
      overall_confidence: parsedContent.overall_confidence,
      verification_needed: parsedContent.verification_needed
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});