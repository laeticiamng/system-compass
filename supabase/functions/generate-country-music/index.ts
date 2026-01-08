import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MusicRequest {
  countryId: string;
  pyramidType: string;
  mood?: 'exploratory' | 'narrative' | 'comparison';
  duration?: number;
}

// Music prompt templates based on pyramid types
const PYRAMID_MUSIC_PROMPTS: Record<string, string> = {
  PROBLEM_RENT: "Tense, complex rhythms with minor keys. Mix of traditional instrumentation and industrial sounds. Unpredictable patterns, underlying anxiety but also resilience. African/Middle Eastern influences when applicable.",
  STABILITY_REDIS: "Steady, reassuring tempo. Classical and orchestral elements. Structured, predictable progressions. European sophistication, bureaucratic precision but warmth underneath.",
  COMPETENCE_TRUST: "Clean, precise, minimalist. Swiss/German precision. Electronic with organic touches. Efficient, reliable, trustworthy soundscape. Nordic or Central European feel.",
  GROWTH_RISK: "Fast tempo, energetic, startup vibes. American pop-rock energy with electronic drops. Ambitious, risk-taking, opportunity-focused. Silicon Valley meets Wall Street.",
  HYBRID_TRANSITION: "Eclectic mix of styles, unpredictable transitions. Emerging markets energy - traditional meets modern. Turkish, Brazilian, Indian influences. Chaos and opportunity intertwined.",
  RESOURCE_EXTRACTION: "Rich, deep bass. Oil money aesthetic. Luxury with traditional roots. Gulf states or Russian oligarch vibes. Power, wealth, but also hidden tensions.",
};

// Country-specific cultural overlays
const COUNTRY_CULTURAL_OVERLAYS: Record<string, string> = {
  cameroon: "Central African rhythms, makossa and bikutsi influences, French-colonial undertones, tropical warmth",
  france: "Chanson française elegance, café culture, intellectual depth, romantic undertones",
  switzerland: "Alpine horns, precision clockwork rhythms, yodeling echoes, chocolate-box serenity",
  usa: "Jazz-rock fusion, Hollywood grandeur, diverse cultural melting pot, entrepreneurial energy",
  germany: "Kraftwerk electronic precision, classical heritage, industrial strength, beer hall warmth",
  canada: "Folk-rock sincerity, multicultural mosaic, wilderness serenity, polite optimism",
  uae: "Arabian oud and percussion, luxury lounge, futuristic ambition, desert mystery",
  singapore: "Asian fusion, high-tech efficiency, multicultural harmony, tropical urban pulse",
  japan: "Traditional shamisen meets J-pop, zen gardens and neon cities, precision and creativity",
  uk: "British rock heritage, pub culture warmth, royal elegance, multicultural London energy",
  india: "Bollywood grandeur, classical ragas, diverse regional sounds, spiritual depth",
  southkorea: "K-pop energy, traditional gayageum, tech-forward, intense work culture rhythm",
  mexico: "Mariachi passion, ancient Aztec echoes, tequila warmth, family celebration",
  spain: "Flamenco fire, Mediterranean warmth, siesta rhythm, passionate expression",
  italy: "Opera grandeur, Renaissance elegance, espresso intensity, la dolce vita",
  thailand: "Buddhist temple serenity, tropical paradise, gentle Thai hospitality",
  vietnam: "Traditional đàn bầu, French-colonial echoes, resilient spirit, street food bustle",
  indonesia: "Gamelan orchestra, Islamic calls to prayer, island paradise diversity",
  philippines: "Spanish-American influences, karaoke culture, tropical joy, family bonds",
  colombia: "Cumbia and salsa passion, coffee culture, emerald beauty, cartel tension undertone",
  argentina: "Tango passion, European elegance, football fervor, economic roller-coaster",
  brazil: "Samba carnival, bossa nova sophistication, Amazon mystery, favela resilience",
  netherlands: "Electronic DJ culture, windmill pastoral, tolerant liberalism, cycling rhythm",
  morocco: "Gnawa spiritual trance, Berber traditions, medina bustle, desert mystery",
  australia: "Outback vastness, beach culture, Aboriginal dreamtime, laid-back optimism",
  china: "Ancient guzheng traditions, tech giant ambition, billion-strong collective rhythm",
  russia: "Vast steppe melancholy, classical grandeur, vodka intensity, resilient strength",
  norway: "Nordic noir, Viking heritage, oil wealth modernity, nature-inspired serenity",
  qatar: "Gulf luxury, Islamic traditions, World Cup modernity, desert oasis",
  saudiarabia: "Arabian Peninsula traditions, oil wealth, religious devotion, rapid modernization",
  venezuela: "Caribbean salsa, oil boom nostalgia, political tension, diaspora longing",
  turkey: "Ottoman grandeur, Sufi whirling, European-Asian bridge, political crossroads",
  portugal: "Fado melancholy, maritime exploration, gentle Atlantic breeze, saudade feeling",
  nigeria: "Afrobeats energy, oil wealth inequality, Nollywood drama, entrepreneurial hustle",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    
    if (!ELEVENLABS_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ElevenLabs API key not configured" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const { countryId, pyramidType, mood = 'narrative', duration = 30 }: MusicRequest = await req.json();

    // Build the music prompt
    const pyramidPrompt = PYRAMID_MUSIC_PROMPTS[pyramidType] || PYRAMID_MUSIC_PROMPTS.HYBRID_TRANSITION;
    const culturalOverlay = COUNTRY_CULTURAL_OVERLAYS[countryId] || "World music fusion, global perspective";
    
    const moodModifier = mood === 'exploratory' 
      ? "Curious, open, inviting exploration"
      : mood === 'comparison'
      ? "Analytical, comparative, highlighting contrasts"
      : "Narrative, storytelling, cinematic documentary feel";

    const fullPrompt = `${pyramidPrompt}. ${culturalOverlay}. ${moodModifier}. Instrumental, no vocals. Suitable as background for documentary about life systems and migration. Ultra high resolution audio quality.`;

    console.log(`Generating music for ${countryId} (${pyramidType}): ${fullPrompt.substring(0, 100)}...`);

    // Call ElevenLabs Music API
    const response = await fetch(
      "https://api.elevenlabs.io/v1/music",
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          duration_seconds: Math.min(duration, 60), // Max 60 seconds
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate music", details: errorText }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `inline; filename="${countryId}-${pyramidType}.mp3"`,
      },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error generating music:", errorMessage);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
