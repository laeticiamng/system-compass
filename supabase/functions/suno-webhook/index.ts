import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type SunoWebhookPayload = {
  data?: {
    taskId?: string;
    status?: string;
    response?: {
      sunoData?: Array<{
        audioUrl?: string;
        streamAudioUrl?: string;
      }>;
    };
    errorMessage?: string;
  };
  taskId?: string;
  status?: string;
  response?: {
    sunoData?: Array<{
      audioUrl?: string;
      streamAudioUrl?: string;
    }>;
  };
  errorMessage?: string;
};

const mapStatus = (status?: string) => {
  if (!status) return "processing";
  if (status === "SUCCESS" || status === "FIRST_SUCCESS") return "completed";
  if (
    status === "CREATE_TASK_FAILED" ||
    status === "GENERATE_AUDIO_FAILED" ||
    status === "SENSITIVE_WORD_ERROR"
  ) {
    return "failed";
  }
  return "processing";
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response("Supabase configuration missing", { status: 500 });
    }

    const payload: SunoWebhookPayload = await req.json().catch(() => ({}));
    const data = payload.data ?? payload;
    const taskId = data.taskId;
    const sunoStatus = data.status;
    const sunoData = data.response?.sunoData ?? payload.response?.sunoData ?? [];
    const audioUrl = sunoData[0]?.audioUrl;
    const streamUrl = sunoData[0]?.streamAudioUrl;
    const errorMessage = data.errorMessage ?? payload.errorMessage;

    if (!taskId) {
      return new Response("Missing taskId", { status: 400 });
    }

    const status = mapStatus(sunoStatus);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    await supabase
      .from("music_tasks")
      .update({
        status,
        suno_status: sunoStatus,
        audio_url: audioUrl ?? null,
        stream_url: streamUrl ?? null,
        error_message: errorMessage ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("task_id", taskId);

    if (status === "completed" && audioUrl) {
      const { data: task } = await supabase
        .from("music_tasks")
        .select("country_id, pyramid_type")
        .eq("task_id", taskId)
        .maybeSingle();

      if (task) {
        await supabase.from("music_cache").upsert(
          {
            country_id: task.country_id,
            pyramid_type: task.pyramid_type,
            audio_url: audioUrl,
            stream_url: streamUrl ?? null,
            task_id: taskId,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
          { onConflict: "country_id,pyramid_type" },
        );
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
