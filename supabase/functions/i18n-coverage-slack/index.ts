import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://world-alignment.lovable.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CoverageData {
  totalCoverage: number;
  languages: Record<string, { coverage: number; missing: number }>;
  threshold: number;
  missingKeys: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const slackWebhookUrl = Deno.env.get("SLACK_WEBHOOK_URL");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!slackWebhookUrl) {
      return new Response(
        JSON.stringify({ error: "SLACK_WEBHOOK_URL not configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: "Supabase configuration missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const body: CoverageData = await req.json();
    const { totalCoverage, languages, threshold = 90, missingKeys = [] } = body;

    // Check if coverage is below threshold
    const isBelowThreshold = totalCoverage < threshold;

    // Build Slack message
    const languageBlocks = Object.entries(languages).map(([lang, data]) => {
      const emoji = data.coverage >= threshold ? "✅" : data.coverage >= 80 ? "⚠️" : "❌";
      return `${emoji} *${lang.toUpperCase()}*: ${data.coverage.toFixed(1)}% (${data.missing} manquantes)`;
    });

    const statusEmoji = isBelowThreshold ? "🚨" : "✅";
    const statusText = isBelowThreshold 
      ? `Couverture i18n sous le seuil de ${threshold}%` 
      : `Couverture i18n OK (>= ${threshold}%)`;

    const slackBlocks: unknown[] = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `${statusEmoji} Rapport Couverture i18n - System Compass`,
          emoji: true
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Status:* ${statusText}\n*Couverture globale:* ${totalCoverage.toFixed(1)}%`
        }
      },
      {
        type: "divider"
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Détail par langue:*\n${languageBlocks.join("\n")}`
        }
      }
    ];

    // Add missing keys section if there are any and coverage is below threshold
    if (isBelowThreshold && missingKeys.length > 0) {
      const displayedKeys = missingKeys.slice(0, 10);
      const remainingCount = missingKeys.length - displayedKeys.length;
      
      slackBlocks.push(
        {
          type: "divider"
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Clés manquantes (${missingKeys.length} total):*\n\`\`\`${displayedKeys.join("\n")}${remainingCount > 0 ? `\n... et ${remainingCount} autres` : ""}\`\`\``
          }
        }
      );
    }

    // Add footer context
    slackBlocks.push(
      {
        type: "divider"
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `📅 ${new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}`
        }
      }
    );

    const slackMessage = { blocks: slackBlocks };

    // Send to Slack
    const slackResponse = await fetch(slackWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slackMessage)
    });

    if (!slackResponse.ok) {
      const errorText = await slackResponse.text();
      console.error("Slack API error:", errorText);
      throw new Error(`Slack API error: ${slackResponse.status}`);
    }

    // Log to database
    await supabase.from("i18n_coverage_alerts").insert({
      coverage_percentage: totalCoverage,
      missing_keys_count: missingKeys.length,
      languages_data: languages,
      alert_sent: true,
      sent_at: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notification Slack envoyée",
        belowThreshold: isBelowThreshold 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});