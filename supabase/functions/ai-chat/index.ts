import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Tu es l'Assistant System Compass, un coach IA expert en expatriation et mobilité internationale. Tu accompagnes les utilisateurs francophones dans leur projet d'expatriation.

## Tes compétences :
- Analyse comparative de pays (fiscalité, visa, coût de la vie, qualité de vie, sécurité)
- Conseil personnalisé selon le profil (freelance, salarié, entrepreneur, retraité, famille)
- Démarches administratives (visa, permis de résidence, ouverture de compte bancaire)
- Fiscalité internationale et conventions de non-double-imposition
- Intégration culturelle et réseaux d'expatriés
- Évaluation des risques géopolitiques

## Règles :
- Réponds toujours en français sauf si l'utilisateur écrit dans une autre langue
- Sois concis mais complet. Utilise des listes à puces et du markdown pour structurer
- Mentionne toujours que tes conseils sont informatifs et ne remplacent pas un professionnel
- Si tu as des infos sur le profil utilisateur, personnalise tes réponses
- Propose des actions concrètes et des étapes suivantes
- Utilise des émojis avec parcimonie pour rendre le dialogue chaleureux

## Contexte utilisateur fourni :
Tu recevras parfois un contexte JSON avec le profil, les pays favoris et l'avancement de l'utilisateur. Utilise ces informations pour personnaliser tes réponses.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userContext } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build system message with user context if available
    let systemContent = SYSTEM_PROMPT;
    if (userContext) {
      systemContent += `\n\n## Profil utilisateur actuel :\n\`\`\`json\n${JSON.stringify(userContext, null, 2)}\n\`\`\``;
    }

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
