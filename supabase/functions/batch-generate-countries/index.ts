import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Declare EdgeRuntime for background tasks
declare const EdgeRuntime: { waitUntil: (promise: Promise<unknown>) => void };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface CountryInput {
  country_id: string;
  country_name: string;
  iso2: string;
  region: string;
  primary_pyramid: string;
}

interface BatchRequest {
  batch_name: string;
  countries: CountryInput[];
  concurrency?: number;
  user_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { batch_name, countries, concurrency = 5, user_id } = await req.json() as BatchRequest;

    if (!countries || countries.length === 0) {
      throw new Error("No countries provided");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Create batch record
    const { data: batch, error: batchError } = await supabase
      .from("country_generation_batches")
      .insert({
        name: batch_name || `Batch ${new Date().toISOString()}`,
        total_countries: countries.length,
        concurrency,
        created_by: user_id || null,
        status: "running",
      })
      .select()
      .single();

    if (batchError) {
      throw new Error(`Failed to create batch: ${batchError.message}`);
    }

    console.log(`Created batch ${batch.id} with ${countries.length} countries`);

    // Create job records for each country
    const jobs = countries.map((country) => ({
      country_id: country.country_id,
      country_name: country.country_name,
      iso2: country.iso2,
      region: country.region,
      primary_pyramid: country.primary_pyramid,
      status: "pending",
    }));

    const { data: createdJobs, error: jobsError } = await supabase
      .from("country_generation_jobs")
      .insert(jobs)
      .select();

    if (jobsError) {
      throw new Error(`Failed to create jobs: ${jobsError.message}`);
    }

    console.log(`Created ${createdJobs.length} jobs`);

    // Process jobs with controlled concurrency using background task
    EdgeRuntime.waitUntil(processJobsInBackground(batch.id, createdJobs, concurrency));

    return new Response(
      JSON.stringify({
        success: true,
        batch_id: batch.id,
        jobs_created: createdJobs.length,
        message: "Batch generation started. Jobs are processing in the background.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Batch creation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function processJobsInBackground(batchId: string, jobs: any[], concurrency: number) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  let completed = 0;
  let failed = 0;
  const total = jobs.length;

  // Process in chunks based on concurrency
  for (let i = 0; i < jobs.length; i += concurrency) {
    const chunk = jobs.slice(i, i + concurrency);
    
    const promises = chunk.map(async (job) => {
      try {
        // Call the single country generation function
        const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-country-profile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            job_id: job.id,
            country: {
              country_id: job.country_id,
              country_name: job.country_name,
              iso2: job.iso2,
              region: job.region,
              primary_pyramid: job.primary_pyramid,
            },
          }),
        });

        if (response.ok) {
          completed++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Error processing job ${job.id}:`, error);
        failed++;
      }
    });

    await Promise.all(promises);

    // Update batch progress
    await supabase
      .from("country_generation_batches")
      .update({
        completed_countries: completed,
        failed_countries: failed,
      })
      .eq("id", batchId);

    console.log(`Batch ${batchId}: ${completed}/${total} completed, ${failed} failed`);
  }

  // Mark batch as completed
  await supabase
    .from("country_generation_batches")
    .update({
      status: failed === total ? "failed" : "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", batchId);

  console.log(`Batch ${batchId} completed: ${completed} success, ${failed} failed`);
}
