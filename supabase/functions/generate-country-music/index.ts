import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MusicRequest {
  countryId: string;
  pyramidType: string;
  mood?: 'exploratory' | 'narrative' | 'comparison';
}

// Music style templates based on pyramid types
const PYRAMID_MUSIC_STYLES: Record<string, { style: string; mood: string }> = {
  PROBLEM_RENT: {
    style: "World Music, Fusion, Dramatic Orchestral",
    mood: "Tense, complex, unpredictable, resilient"
  },
  STABILITY_REDIS: {
    style: "Classical, Orchestral, European Folk",
    mood: "Steady, reassuring, structured, warm"
  },
  COMPETENCE_TRUST: {
    style: "Minimal Electronic, Ambient, Nordic",
    mood: "Clean, precise, efficient, trustworthy"
  },
  GROWTH_RISK: {
    style: "Indie Rock, Electronic Pop, Upbeat",
    mood: "Fast, energetic, ambitious, optimistic"
  },
  HYBRID_TRANSITION: {
    style: "World Fusion, Eclectic, Progressive",
    mood: "Dynamic, unpredictable, hopeful, chaotic"
  },
  RESOURCE_EXTRACTION: {
    style: "Arabic, Deep Bass, Cinematic",
    mood: "Rich, powerful, luxurious, mysterious"
  },
};

// Country-specific cultural music styles
const COUNTRY_MUSIC_STYLES: Record<string, { instruments: string; cultural: string }> = {
  cameroon: { instruments: "African drums, balafon, talking drums", cultural: "Makossa, Bikutsi, Central African rhythms" },
  france: { instruments: "Accordion, piano, violin", cultural: "Chanson française, café jazz, romantic" },
  switzerland: { instruments: "Alpine horns, zither, bells", cultural: "Swiss folk, precision classical" },
  usa: { instruments: "Electric guitar, brass, drums", cultural: "Jazz, rock, blues fusion" },
  germany: { instruments: "Synthesizers, classical orchestra", cultural: "Electronic, Kraftwerk-inspired, classical" },
  canada: { instruments: "Acoustic guitar, violin, piano", cultural: "Folk rock, multicultural blend" },
  uae: { instruments: "Oud, qanun, percussion", cultural: "Arabian classical, luxury lounge" },
  singapore: { instruments: "Chinese guzheng, gamelan, electronic", cultural: "Asian fusion, tech-forward" },
  japan: { instruments: "Koto, shamisen, taiko drums, synths", cultural: "Traditional meets modern J-pop" },
  uk: { instruments: "Electric guitar, keyboards, drums", cultural: "British rock, pub folk, orchestral" },
  india: { instruments: "Sitar, tabla, harmonium, tanpura", cultural: "Classical raga, Bollywood" },
  southkorea: { instruments: "Gayageum, electronic, drums", cultural: "K-pop energy, traditional Korean" },
  mexico: { instruments: "Trumpet, violin, guitar, vihuela", cultural: "Mariachi, traditional Mexican" },
  spain: { instruments: "Flamenco guitar, castanets, palmas", cultural: "Flamenco, Mediterranean passion" },
  italy: { instruments: "Mandolin, accordion, opera vocals", cultural: "Opera, Mediterranean romance" },
  thailand: { instruments: "Khim, ranad, temple bells", cultural: "Buddhist temple, Thai traditional" },
  vietnam: { instruments: "Đàn bầu, đàn tranh, bamboo flute", cultural: "Vietnamese traditional, gentle" },
  indonesia: { instruments: "Gamelan, angklung, kendang", cultural: "Javanese gamelan, Islamic" },
  philippines: { instruments: "Kudyapi, kulintang, guitar", cultural: "OPM, Spanish-American influenced" },
  colombia: { instruments: "Accordion, drums, guacharaca", cultural: "Cumbia, vallenato, salsa" },
  argentina: { instruments: "Bandoneón, violin, piano", cultural: "Tango, passionate milonga" },
  brazil: { instruments: "Surdo, tamborim, cavaquinho", cultural: "Samba, bossa nova, forró" },
  netherlands: { instruments: "Electronic DJ, organ, synthesizers", cultural: "EDM, Dutch house" },
  morocco: { instruments: "Oud, sintir, tbel drums", cultural: "Gnawa, Berber, Andalusian" },
  australia: { instruments: "Didgeridoo, acoustic guitar", cultural: "Aboriginal, folk rock, beach vibes" },
  china: { instruments: "Erhu, guzheng, pipa", cultural: "Chinese classical, cinematic" },
  russia: { instruments: "Balalaika, bayan, orchestra", cultural: "Russian folk, dramatic classical" },
  norway: { instruments: "Hardanger fiddle, synths, strings", cultural: "Nordic folk, ambient electronic" },
  qatar: { instruments: "Oud, rebab, frame drums", cultural: "Gulf Arabic, luxury ambient" },
  saudiarabia: { instruments: "Oud, tabla, mizmar", cultural: "Arabian Peninsula traditional" },
  venezuela: { instruments: "Cuatro, maracas, harp", cultural: "Joropo, salsa, Caribbean" },
  turkey: { instruments: "Saz, ney flute, kanun", cultural: "Ottoman classical, Sufi, Anatolian" },
  portugal: { instruments: "Portuguese guitar, viola", cultural: "Fado, melancholic Atlantic" },
  nigeria: { instruments: "Talking drums, shekere, bass", cultural: "Afrobeats, highlife, juju" },
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUNO_API_KEY = Deno.env.get("SUNO_API_KEY");
    
    if (!SUNO_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Suno API key not configured" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const { countryId, pyramidType, mood = 'narrative' }: MusicRequest = await req.json();

    // Build the music prompt
    const pyramidStyle = PYRAMID_MUSIC_STYLES[pyramidType] || PYRAMID_MUSIC_STYLES.HYBRID_TRANSITION;
    const countryStyle = COUNTRY_MUSIC_STYLES[countryId] || { 
      instruments: "World music instruments", 
      cultural: "Global fusion" 
    };
    
    const moodContext = mood === 'exploratory' 
      ? "Curious and inviting exploration"
      : mood === 'comparison'
      ? "Analytical, highlighting contrasts"
      : "Narrative, cinematic documentary";

    // Create a descriptive prompt for Suno
    const prompt = `An instrumental ${pyramidStyle.style} piece. ${countryStyle.cultural} influences with ${countryStyle.instruments}. ${pyramidStyle.mood} feeling. ${moodContext}. Background music for a documentary about life and migration. No vocals.`;

    console.log(`Generating Suno music for ${countryId} (${pyramidType}): ${prompt.substring(0, 100)}...`);

    // Call Suno API to generate music
    const generateResponse = await fetch(
      "https://api.sunoapi.org/api/v1/generate",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${SUNO_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          customMode: false,
          instrumental: true,
          model: "V4",
        }),
      }
    );

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      console.error("Suno API generate error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate music", details: errorText }),
        { 
          status: generateResponse.status, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const generateData = await generateResponse.json();
    console.log("Suno generate response:", JSON.stringify(generateData));

    // Check if we got task IDs
    if (!generateData.data || !generateData.data.taskId) {
      return new Response(
        JSON.stringify({ 
          error: "No task ID returned", 
          response: generateData 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const taskId = generateData.data.taskId;

    // Poll for completion (max 60 seconds)
    let audioUrl: string | null = null;
    for (let i = 0; i < 12; i++) {
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const statusResponse = await fetch(
        `https://api.sunoapi.org/api/v1/task/${taskId}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${SUNO_API_KEY}`,
          },
        }
      );

      if (!statusResponse.ok) {
        console.error("Status check failed:", await statusResponse.text());
        continue;
      }

      const statusData = await statusResponse.json();
      console.log(`Poll ${i + 1}: Status = ${statusData.data?.status}`);

      if (statusData.data?.status === "completed" && statusData.data?.clips) {
        const clips = statusData.data.clips;
        if (clips.length > 0 && clips[0].audioUrl) {
          audioUrl = clips[0].audioUrl;
          break;
        }
      } else if (statusData.data?.status === "failed") {
        return new Response(
          JSON.stringify({ error: "Music generation failed", details: statusData }),
          { 
            status: 500, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
    }

    if (!audioUrl) {
      return new Response(
        JSON.stringify({ 
          error: "Music generation timed out", 
          taskId: taskId,
          message: "Music is still being generated. Try again in a few minutes."
        }),
        { 
          status: 202, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Return the audio URL for the client to stream
    return new Response(
      JSON.stringify({ 
        success: true,
        audioUrl: audioUrl,
        countryId: countryId,
        pyramidType: pyramidType 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

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
