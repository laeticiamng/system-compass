import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireAuth, requireAdmin, authErrorResponse, AuthError } from "../_shared/auth.ts";
import { validate, validationErrorResponse } from "../_shared/validation.ts";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

// Declare EdgeRuntime for background tasks
declare const EdgeRuntime: { waitUntil: (promise: Promise<unknown>) => void };

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
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
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return handleCorsPreflightRequest(req);
  }

  const corsHeaders = getCorsHeaders(req);

  try {
    // Create Supabase client for auth validation
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
    });

    // Authenticate user - admin only for batch operations
    let authResult;
    try {
      authResult = await requireAuth(req, supabaseAuth);
      // This is an admin-only operation (expensive batch AI generation)
      await requireAdmin(authResult.userId, supabaseAuth);
    } catch (err) {
      return authErrorResponse(err as AuthError, corsHeaders);
    }

    console.log(`[batch-generate-countries] Admin user ${authResult.userId} authenticated`);

    const body = await req.json();
    const { batch_name, countries, concurrency = 5 } = body as BatchRequest;

    if (!countries || countries.length === 0) {
      throw new Error("No countries provided");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Create batch record with authenticated user
    const { data: batch, error: batchError } = await supabase
      .from("country_generation_batches")
      .insert({
        name: batch_name || `Batch ${new Date().toISOString()}`,
        total_countries: countries.length,
        concurrency,
        created_by: authResult.userId,
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
        console.log(`Processing country: ${job.country_name} (${job.country_id})`);
        
        // Step 1: Generate base country profile
        const profileResponse = await fetch(`${SUPABASE_URL}/functions/v1/generate-country-profile`, {
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

        if (!profileResponse.ok) {
          console.error(`Profile generation failed for ${job.country_name}`);
          failed++;
          return;
        }

        console.log(`Profile generated for ${job.country_name}, generating variants...`);

        // Step 2: Generate detailed variants (practical daily life content)
        const variantsResponse = await fetch(`${SUPABASE_URL}/functions/v1/generate-country-variants`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            country_id: job.country_id,
            country_name: job.country_name,
            region: job.region,
            primary_pyramid: job.primary_pyramid,
          }),
        });

        if (!variantsResponse.ok) {
          console.error(`Variants generation failed for ${job.country_name}`);
          // Continue anyway, don't fail the whole job
        } else {
          console.log(`Variants generated for ${job.country_name}, generating intelligence...`);
        }

        // Step 3: Generate deep intelligence (strategic insider knowledge)
        const intelligenceResponse = await fetch(`${SUPABASE_URL}/functions/v1/generate-country-intelligence`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            country_id: job.country_id,
            country_name: job.country_name,
            region: job.region,
            primary_pyramid: job.primary_pyramid,
          }),
        });

        if (!intelligenceResponse.ok) {
          console.error(`Intelligence generation failed for ${job.country_name}`);
          // Continue anyway, don't fail the whole job
        } else {
          console.log(`Intelligence generated for ${job.country_name}`);
        }

        completed++;
        console.log(`✅ Full generation completed for ${job.country_name}`);
        
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
