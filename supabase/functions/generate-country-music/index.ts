import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://world-alignment.lovable.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_CONCURRENT_TASKS = 3;

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

// Placeholder callback URL - Suno requires it but we use polling
const PLACEHOLDER_CALLBACK = "https://sunoapi.org/webhook-placeholder";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUNO_API_KEY = Deno.env.get("SUNO_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!SUNO_API_KEY) {
      console.error("SUNO_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Suno API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { countryId, pyramidType, mood = 'narrative' }: MusicRequest = await req.json();

    console.log(`Generating music for ${countryId} (${pyramidType}), mood: ${mood}`);

    const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
      ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      : null;

    // Check cache first
    if (supabase) {
      const { data: cached } = await supabase
        .from('music_cache')
        .select('audio_url, stream_url, task_id')
        .eq('country_id', countryId)
        .eq('pyramid_type', pyramidType)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();
      
      if (cached?.audio_url) {
        console.log(`Cache hit for ${countryId}/${pyramidType}`);
        return new Response(
          JSON.stringify({ 
            success: true,
            audioUrl: cached.audio_url,
            streamUrl: cached.stream_url,
            countryId,
            pyramidType,
            cached: true
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    let existingTask: { id: string; status: string } | null = null;

    if (supabase) {
      const { data: existingTaskData } = await supabase
        .from('music_generation_tasks')
        .select('id, status')
        .eq('country_id', countryId)
        .eq('pyramid_type', pyramidType)
        .eq('mood', mood)
        .in('status', ['queued', 'in_progress'])
        .order('updated_at', { ascending: false })
        .maybeSingle();

      if (existingTaskData) {
        existingTask = existingTaskData;
      }
    }

    // Build the music prompt
    const pyramidStyle = PYRAMID_MUSIC_STYLES[pyramidType] || PYRAMID_MUSIC_STYLES.HYBRID_TRANSITION;
    const countryStyle = COUNTRY_MUSIC_STYLES[countryId] || { 
      instruments: "World music instruments", 
      cultural: "Global fusion" 
    };

    const style = `${pyramidStyle.style}, ${countryStyle.cultural}`;
    const title = `${countryId.charAt(0).toUpperCase() + countryId.slice(1)} - System Sound`;

    console.log(`Style: ${style}`);

    let taskRowId: string | null = null;
    let taskAttempts = 0;

    if (supabase) {
      const { data: taskRow } = await supabase
        .from('music_generation_tasks')
        .upsert({
          country_id: countryId,
          pyramid_type: pyramidType,
          mood,
          status: 'queued',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'country_id,pyramid_type,mood' })
        .select('id, attempts')
        .single();

      if (taskRow) {
        taskRowId = taskRow.id;
        taskAttempts = taskRow.attempts ?? 0;
      }

      const { count: activeCount } = await supabase
        .from('music_generation_tasks')
        .select('*', { count: 'exact', head: true })
        .in('status', ['in_progress']);

      if (existingTask?.status === 'in_progress' || (activeCount ?? 0) >= MAX_CONCURRENT_TASKS) {
        return new Response(
          JSON.stringify({
            success: true,
            status: existingTask?.status ?? 'queued',
            taskId: existingTask?.id ?? taskRowId,
            message: existingTask?.status === 'in_progress'
              ? "Music generation already in progress."
              : "Music generation queued."
          }),
          { status: 202, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Call Suno API
    const generateResponse = await fetch(
      "https://api.sunoapi.org/api/v1/generate",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${SUNO_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customMode: true,
          instrumental: true,
          model: "V4_5ALL",
          callBackUrl: PLACEHOLDER_CALLBACK,
          style: style.substring(0, 200),
          title: title.substring(0, 80),
        }),
      }
    );

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      console.error("Suno API generate error:", errorText);
      if (supabase && taskRowId) {
        await supabase
          .from('music_generation_tasks')
          .update({
            status: 'failed',
            error_message: errorText,
            updated_at: new Date().toISOString(),
          })
          .eq('id', taskRowId);
      }
      return new Response(
        JSON.stringify({ error: "Failed to generate music", details: errorText }),
        { status: generateResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const generateData = await generateResponse.json();
    console.log("Suno generate response:", JSON.stringify(generateData));

    if (generateData.code !== 200) {
      console.error("Suno API error:", generateData.msg);
      if (supabase && taskRowId) {
        await supabase
          .from('music_generation_tasks')
          .update({
            status: 'failed',
            error_message: generateData.msg,
            updated_at: new Date().toISOString(),
          })
          .eq('id', taskRowId);
      }
      return new Response(
        JSON.stringify({ error: "Suno API error", details: generateData.msg }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!generateData.data?.taskId) {
      console.error("No task ID in response:", generateData);
      if (supabase && taskRowId) {
        await supabase
          .from('music_generation_tasks')
          .update({
            status: 'failed',
            error_message: 'No task ID returned',
            updated_at: new Date().toISOString(),
          })
          .eq('id', taskRowId);
      }
      return new Response(
        JSON.stringify({ error: "No task ID returned", response: generateData }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const taskId = generateData.data.taskId;
    console.log(`Task ID: ${taskId}, starting polling...`);

    if (supabase && taskRowId) {
      await supabase
        .from('music_generation_tasks')
        .update({
          status: 'in_progress',
          external_task_id: taskId,
          attempts: taskAttempts + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskRowId);
    }

    // Poll for completion (max 90 seconds)
    let audioUrl: string | null = null;
    let streamUrl: string | null = null;
    
    for (let i = 0; i < 18; i++) {
      await new Promise((resolve) => setTimeout(resolve, 5000));

      console.log(`Poll attempt ${i + 1}/18...`);

      const statusResponse = await fetch(
        `https://api.sunoapi.org/api/v1/generate/record-info?taskId=${taskId}`,
        {
          method: "GET",
          headers: { "Authorization": `Bearer ${SUNO_API_KEY}` },
        }
      );

      if (!statusResponse.ok) {
        console.error(`Status check failed (${statusResponse.status})`);
        continue;
      }

      const statusData = await statusResponse.json();
      const status = statusData.data?.status;
      console.log(`Poll ${i + 1}: Status = ${status}`);

      if (status === "SUCCESS" || status === "FIRST_SUCCESS") {
        const sunoData = statusData.data?.response?.sunoData;
        if (sunoData && sunoData.length > 0) {
          audioUrl = sunoData[0].audioUrl;
          streamUrl = sunoData[0].streamAudioUrl;
          console.log(`Audio URL found: ${audioUrl}`);
          if (supabase && taskRowId) {
            await supabase
              .from('music_generation_tasks')
              .update({
                status: 'completed',
                audio_url: audioUrl,
                stream_url: streamUrl,
                updated_at: new Date().toISOString(),
              })
              .eq('id', taskRowId);
          }
          break;
        }
      } else if (status === "CREATE_TASK_FAILED" || status === "GENERATE_AUDIO_FAILED" || status === "SENSITIVE_WORD_ERROR") {
        console.error("Generation failed:", statusData.data?.errorMessage);
        if (supabase && taskRowId) {
          await supabase
            .from('music_generation_tasks')
            .update({
              status: 'failed',
              error_message: statusData.data?.errorMessage || status,
              updated_at: new Date().toISOString(),
            })
            .eq('id', taskRowId);
        }
        return new Response(
          JSON.stringify({ error: "Music generation failed", details: statusData.data?.errorMessage || status }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (!audioUrl && !streamUrl) {
      console.log("Generation timed out");
      if (supabase && taskRowId) {
        await supabase
          .from('music_generation_tasks')
          .update({
            status: 'in_progress',
            updated_at: new Date().toISOString(),
          })
          .eq('id', taskRowId);
      }
      return new Response(
        JSON.stringify({ 
          error: "Music generation timed out", 
          taskId: taskId,
          message: "Music is still being generated. Try again in a few minutes."
        }),
        { status: 202, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save to cache
    if (supabase && audioUrl) {
      await supabase.from('music_cache').upsert({
        country_id: countryId,
        pyramid_type: pyramidType,
        audio_url: audioUrl,
        stream_url: streamUrl,
        task_id: taskId,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }, {
        onConflict: 'country_id,pyramid_type'
      });
      
      console.log(`Cached music for ${countryId}/${pyramidType}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        audioUrl: audioUrl || streamUrl,
        streamUrl: streamUrl,
        countryId: countryId,
        pyramidType: pyramidType,
        taskId: taskId
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error generating music:", errorMessage);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
