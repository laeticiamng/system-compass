import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { destination, nationalities, aspiration, mode, currentCountry } = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const modeContext = mode === 'vacation' 
      ? "L'utilisateur envisage des VACANCES ou un séjour temporaire. Focus sur: facilité d'accès, coût du séjour court, sécurité touriste, précautions sanitaires, meilleures saisons, visa touriste."
      : "L'utilisateur envisage une INSTALLATION permanente ou long terme. Focus sur: processus d'immigration, coût de vie mensuel, marché du travail, système de santé, qualité de vie, intégration sociale, éducation.";

    const systemPrompt = `Tu es un expert en expatriation et voyages internationaux. Tu fournis des conseils personnalisés et pratiques.

Contexte:
- Nationalité(s) de l'utilisateur: ${nationalities.join(', ')}
- Pays actuel: ${currentCountry}
- Destination analysée: ${destination.name}
- Aspiration principale: ${aspiration}
- ${modeContext}

Réponds en français de manière concise et structurée. Sois direct et pratique.`;

    const userPrompt = mode === 'vacation' 
      ? `Donne-moi une analyse pour des VACANCES à ${destination.name}:

1. **Accès** (visa requis pour mes nationalités, durée autorisée)
2. **Budget** (estimation journalière: hébergement, repas, transport)
3. **Meilleure période** (saison idéale, événements à éviter)
4. **Précautions** (santé, sécurité, arnaques courantes)
5. **Incontournables** (3 expériences uniques liées à mon aspiration: ${aspiration})

Sois concis mais complet.`
      : `Donne-moi une analyse pour une INSTALLATION à ${destination.name}:

1. **Immigration** (processus visa/permis pour mes nationalités, délais)
2. **Coût de vie** (loyer, courses, transport mensuel - comparaison avec ${currentCountry})
3. **Travail** (marché de l'emploi, salaires moyens, secteurs porteurs)
4. **Qualité de vie** (santé, éducation, sécurité, climat social)
5. **Intégration** (langue, culture, communauté expatriée, conseils pratiques)
6. **Plan d'action** (étapes concrètes pour préparer l'installation en lien avec: ${aspiration})

Sois concis mais complet.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
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

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please check your OpenAI credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("OpenAI API error:", response.status, text);
      return new Response(JSON.stringify({ error: "OpenAI API error" }), {
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
