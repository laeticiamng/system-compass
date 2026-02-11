import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://system-compass.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const LANGUAGE_NAMES: Record<string, string> = {
  de: "German",
  es: "Spanish",
  it: "Italian",
  nl: "Dutch",
  pt: "Portuguese",
  fr: "French",
  en: "English",
};

interface CountryData {
  name: string;
  region: string;
  ruleOfGold: string;
  pyramid: {
    top: string;
    institutions: string;
    gatekeepers: string;
    valueCreators: string;
    base: string;
    realAsset: string;
  };
  whoWins: string[];
  whoLoses: string[];
  playbook: {
    do: string[];
    dont: string[];
    plan30Days: string[];
    plan12Months: string[];
    plan5Years: string[];
    planB: string;
  };
}

interface TranslationJobInput {
  countryId: string;
  sourceCountry: CountryData;
}

interface JobLogEntry {
  timestamp: string;
  level: "info" | "warning" | "error";
  message: string;
}

const buildLog = (message: string, level: JobLogEntry["level"] = "info"): JobLogEntry => ({
  timestamp: new Date().toISOString(),
  level,
  message,
});

async function translateCountry(
  countryId: string,
  sourceCountry: CountryData,
  targetLang: string,
  onRetry: (attempt: number, error: Error) => Promise<void>,
): Promise<CountryData> {
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const targetLangName = LANGUAGE_NAMES[targetLang] || targetLang;

  const systemPrompt = `You are a professional translator specializing in geopolitical and strategic content.
Your task is to translate country analysis data from English to ${targetLangName}.

CRITICAL RULES:
1. Maintain the EXACT same JSON structure as input
2. Translate ALL text values to ${targetLangName}
3. Keep the JSON keys in English (only translate values)
4. Adapt idioms and expressions naturally for ${targetLangName} speakers
5. Maintain the analytical and strategic tone
6. For country names that have official translations in ${targetLangName}, use them
7. Return ONLY valid JSON, no explanations or markdown`;

  const userPrompt = `Translate this country analysis to ${targetLangName}. Return ONLY the JSON object:

${JSON.stringify(sourceCountry, null, 2)}`;

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }

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
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          lastError = new Error("Rate limit exceeded");
          continue;
        }
        if (response.status === 402) {
          throw new Error("Payment required - please check your OpenAI credits");
        }
        const errorText = await response.text();
        console.error("OpenAI API error:", response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("No translation received from AI");
      }

      let jsonContent = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1];
      }

      const cleanJson = jsonContent.trim();
      const parsed: CountryData = JSON.parse(cleanJson);

      const requiredFields = ["name", "region", "ruleOfGold", "pyramid", "playbook"];
      for (const field of requiredFields) {
        if (!(field in parsed)) {
          throw new Error(`Missing required field in translation: ${field}`);
        }
      }

      return parsed;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries - 1) {
        await onRetry(attempt + 1, lastError);
      }
    }
  }

  throw lastError ?? new Error(`Translation failed for ${countryId}`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { targetLang, countries } = await req.json();

    if (!targetLang || !Array.isArray(countries) || countries.length === 0) {
      throw new Error("Missing required fields: targetLang, countries");
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const jobLogs: Record<string, JobLogEntry[]> = {};

    const jobRows = (countries as TranslationJobInput[]).map((entry) => {
      const logs = [buildLog(`Job queued for ${entry.countryId}/${targetLang}`)];
      return {
        country_id: entry.countryId,
        target_lang: targetLang,
        status: "queued",
        logs,
        created_by: user?.id ?? null,
      };
    });

    const { data: jobs, error: jobError } = await supabase
      .from("translation_jobs")
      .insert(jobRows)
      .select();

    if (jobError) throw jobError;

    for (const job of jobs ?? []) {
      const jobId = job.id as string;
      const jobCountryId = job.country_id as string;
      const countryEntry = (countries as TranslationJobInput[]).find(
        (entry) => entry.countryId === jobCountryId,
      );

      jobLogs[jobId] = Array.isArray(job.logs) ? (job.logs as JobLogEntry[]) : [];

      if (!countryEntry) {
        jobLogs[jobId].push(buildLog(`Missing payload for ${jobCountryId}`, "error"));
        await supabase
          .from("translation_jobs")
          .update({
            status: "failed",
            error_message: "Missing payload",
            completed_at: new Date().toISOString(),
            logs: jobLogs[jobId],
          })
          .eq("id", jobId);
        continue;
      }

      jobLogs[jobId].push(buildLog(`Starting translation for ${jobCountryId}`));
      await supabase
        .from("translation_jobs")
        .update({
          status: "running",
          started_at: new Date().toISOString(),
          logs: jobLogs[jobId],
        })
        .eq("id", jobId);

      try {
        const { data: existingTranslation } = await supabase
          .from("generated_translations")
          .select("id, is_approved")
          .eq("country_id", jobCountryId)
          .eq("target_lang", targetLang)
          .maybeSingle();

        if (existingTranslation?.is_approved) {
          jobLogs[jobId].push(buildLog("Translation already approved. Skipping update.", "warning"));
          await supabase
            .from("translation_jobs")
            .update({
              status: "completed",
              completed_at: new Date().toISOString(),
              logs: jobLogs[jobId],
            })
            .eq("id", jobId);
          continue;
        }

        const translation = await translateCountry(
          jobCountryId,
          countryEntry.sourceCountry,
          targetLang,
          async (attempt, retryError) => {
            jobLogs[jobId].push(buildLog(`Retry ${attempt}/3: ${retryError.message}`, "warning"));
            await supabase
              .from("translation_jobs")
              .update({
                retries: attempt,
                logs: jobLogs[jobId],
              })
              .eq("id", jobId);
          },
        );

        jobLogs[jobId].push(buildLog(`Translation completed for ${jobCountryId}`));

        const { error: upsertError } = await supabase
          .from("generated_translations")
          .upsert(
            {
              country_id: jobCountryId,
              target_lang: targetLang,
              translation,
              created_by: user?.id ?? null,
              is_approved: existingTranslation?.is_approved ?? false,
            },
            { onConflict: "country_id,target_lang" },
          );

        if (upsertError) throw upsertError;

        await supabase
          .from("translation_jobs")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
            logs: jobLogs[jobId],
          })
          .eq("id", jobId);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        jobLogs[jobId].push(buildLog(message, "error"));

        await supabase
          .from("translation_jobs")
          .update({
            status: "failed",
            error_message: message,
            completed_at: new Date().toISOString(),
            logs: jobLogs[jobId],
          })
          .eq("id", jobId);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        jobsCreated: jobs?.length ?? 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Batch translation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
