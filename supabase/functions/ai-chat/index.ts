import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { corsHeaders } from "../_shared/cors.ts";
import { checkRateLimit, getRateLimitKey, rateLimitResponse } from "../_shared/rate-limit.ts";

const SYSTEM_PROMPT = `Tu es l'Assistant Compass, un coach IA expert en expatriation et mobilité internationale. Tu accompagnes les utilisateurs dans leur projet d'expatriation.

## Tes compétences :
- Analyse comparative de pays (fiscalité, visa, coût de la vie, qualité de vie, sécurité)
- Conseil personnalisé selon le profil (freelance, salarié, entrepreneur, retraité, famille)
- Démarches administratives (visa, permis de résidence, ouverture de compte bancaire)
- Fiscalité internationale et conventions de non-double-imposition
- Intégration culturelle et réseaux d'expatriés
- Évaluation des risques géopolitiques
- Connaissance approfondie de 80+ pays avec données actualisées mars 2026

## Règles :
- Réponds toujours en français sauf si l'utilisateur écrit dans une autre langue
- Sois concis mais complet. Utilise des listes à puces et du markdown pour structurer
- Mentionne toujours que tes conseils sont informatifs et ne remplacent pas un professionnel
- Personnalise tes réponses en fonction du profil utilisateur ci-dessous
- Propose des actions concrètes et des étapes suivantes
- Si l'utilisateur suit des pays, fais référence à ces pays dans tes réponses
- Si l'utilisateur a un parcours en cours, tiens compte de sa progression
- Utilise des émojis avec parcimonie pour rendre le dialogue chaleureux`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limit: 20 AI requests per minute per IP
  const rl = checkRateLimit(getRateLimitKey(req, 'ai-chat'), { maxRequests: 20, windowSeconds: 60 });
  if (!rl.allowed) {
    return rateLimitResponse(rl, corsHeaders);
  }

  try {
    const { messages } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Authenticate user and fetch context server-side
    let userContextBlock = "";
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_ANON_KEY")!,
          { global: { headers: { Authorization: authHeader } } }
        );

        const token = authHeader.replace("Bearer ", "");
        const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);

        if (!claimsError && claimsData?.claims?.sub) {
          const userId = claimsData.claims.sub;

          // Fetch profile, watchlist, and progress in parallel
          const [profileRes, watchlistRes, progressRes] = await Promise.all([
            supabase
              .from("profiles")
              .select("display_name, current_country, birth_country, nationalities, profession_id, motor_profile, desired_life, education_level, risk_tolerance, subscription_tier")
              .eq("id", userId)
              .maybeSingle(),
            supabase
              .from("user_country_watchlist")
              .select("country_id")
              .eq("user_id", userId)
              .limit(20),
            supabase
              .from("dashboard_progress")
              .select("exit_key_id, steps_progress, phase_notes, started_at")
              .eq("user_id", userId)
              .order("updated_at", { ascending: false })
              .limit(5),
          ]);

          const profile = profileRes.data;
          const watchlist = watchlistRes.data?.map((w: any) => w.country_id) || [];
          const progress = progressRes.data || [];

          // Build rich context
          const ctx: Record<string, any> = {};

          if (profile) {
            ctx.profil = {
              nom: profile.display_name,
              pays_actuel: profile.current_country,
              pays_naissance: profile.birth_country,
              nationalites: profile.nationalities,
              profession: profile.profession_id,
              profil_moteur: profile.motor_profile,
              vie_souhaitee: profile.desired_life,
              niveau_etudes: profile.education_level,
              tolerance_risque: profile.risk_tolerance,
              abonnement: profile.subscription_tier,
            };
          }

          if (watchlist.length > 0) {
            ctx.pays_suivis = watchlist;
          }

          if (progress.length > 0) {
            ctx.parcours_en_cours = progress.map((p: any) => ({
              cle_sortie: p.exit_key_id,
              debut: p.started_at,
              etapes: p.steps_progress,
            }));
          }

          if (Object.keys(ctx).length > 0) {
            userContextBlock = `\n\n## Contexte utilisateur actuel :\n\`\`\`json\n${JSON.stringify(ctx, null, 2)}\n\`\`\``;
          }
        }
      } catch (e) {
        console.warn("Failed to fetch user context:", e);
        // Continue without context — non-blocking
      }
    }

    const systemContent = SYSTEM_PROMPT + userContextBlock;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemContent },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes. Réessayez dans quelques instants." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA insuffisants." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
