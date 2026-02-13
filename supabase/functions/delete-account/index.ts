import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://system-compass.app",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user with anon client
    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAnon.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Authentication failed" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;
    console.log(`[delete-account] Starting account deletion for user ${userId}`);

    // Use service role to delete all user data
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Tables with user_id column to clean up (order matters for FK constraints)
    const userTables = [
      "dashboard_progress",
      "exit_keys_history",
      "challenge_progress",
      "game_statistics",
      "user_achievements",
      "user_country_watchlist",
      "user_notifications",
      "push_subscriptions",
      "notification_settings",
      "event_registrations",
      "expert_review_votes",
      "expert_reviews",
      "consultations",
      "analytics_events",
      "analytics_sessions",
      "ai_activity_log",
      "ai_usage_metering",
      "b2b_usage_metering",
      "gdpr_consent_log",
      "newsletter_subscriptions",
      "user_roles",
      "profiles",
    ];

    const deletionResults: Record<string, string> = {};

    for (const table of userTables) {
      try {
        const { error } = await supabaseAdmin
          .from(table)
          .delete()
          .eq("user_id", userId);

        if (error) {
          console.warn(`[delete-account] Warning deleting from ${table}: ${error.message}`);
          deletionResults[table] = `warning: ${error.message}`;
        } else {
          deletionResults[table] = "deleted";
        }
      } catch (e) {
        console.warn(`[delete-account] Error deleting from ${table}:`, e);
        deletionResults[table] = "skipped";
      }
    }

    // Write audit log before deleting auth user (RGPD compliance)
    try {
      await supabaseAdmin.from('account_deletion_audit').insert({
        user_id: userId,
        user_email: userData.user.email,
        deletion_results: deletionResults,
        tables_cleaned: Object.keys(deletionResults).length,
        requested_at: new Date().toISOString(),
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown',
      });
    } catch (auditErr) {
      console.warn('[delete-account] Audit log failed (non-blocking):', auditErr);
    }

    // Delete the auth user last
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      console.error(`[delete-account] Failed to delete auth user: ${deleteAuthError.message}`);
      return new Response(
        JSON.stringify({ error: "Failed to delete account", details: deleteAuthError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[delete-account] Successfully deleted user ${userId}`);

    return new Response(
      JSON.stringify({ success: true, message: "Account and all data deleted" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[delete-account] Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
