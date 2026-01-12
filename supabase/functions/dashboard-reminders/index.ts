import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReminderRequest {
  userId?: string;
  checkAll?: boolean;
  testSlack?: boolean;
}

interface DeadlineInfo {
  userId: string;
  userEmail: string;
  exitKeyName: string;
  actionText: string;
  deadline: string;
  daysRemaining: number;
  phaseIndex: number;
  actionIndex: number;
}

interface UserDeadlinesGroup {
  userId: string;
  userEmail: string;
  deadlines: DeadlineInfo[];
}

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DASHBOARD-REMINDERS] ${step}${detailsStr}`);
};

const formatDeadlineSummary = (deadlines: DeadlineInfo[]) => {
  const urgentDeadlines = deadlines.filter(d => d.daysRemaining <= 3);
  const upcomingDeadlines = deadlines.filter(d => d.daysRemaining > 3);

  const urgentText = urgentDeadlines.length > 0
    ? `*Échéances urgentes (${urgentDeadlines.length})*\n${urgentDeadlines.map(d => `• ${d.actionText} — ${d.daysRemaining === 0 ? "Aujourd'hui" : `dans ${d.daysRemaining} jour${d.daysRemaining > 1 ? 's' : ''}`}`).join('\n')}`
    : '';

  const upcomingText = upcomingDeadlines.length > 0
    ? `*À venir cette semaine (${upcomingDeadlines.length})*\n${upcomingDeadlines.map(d => `• ${d.actionText} — dans ${d.daysRemaining} jours`).join('\n')}`
    : '';

  return [urgentText, upcomingText].filter(Boolean).join('\n\n');
};

const buildSlackBlocks = (deadlines: DeadlineInfo[], title: string) => {
  const summary = formatDeadlineSummary(deadlines);
  return [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: title,
        emoji: true
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: summary || "Aucune échéance imminente."
      }
    },
    {
      type: "divider"
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `📅 ${new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}`
        }
      ]
    }
  ];
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const canSendEmail = !!resendApiKey;

    const body: ReminderRequest = await req.json().catch(() => ({}));
    const { userId, checkAll = false, testSlack = false } = body;

    logStep("Processing request", { userId, checkAll });

    if (testSlack) {
      if (!userId) {
        return new Response(JSON.stringify({ error: "Missing userId for Slack test" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      const { data: slackSettings, error: slackSettingsError } = await supabase
        .from('notification_settings')
        .select('slack_webhook_url')
        .eq('user_id', userId)
        .single();

      if (slackSettingsError) {
        throw new Error(`Failed to fetch Slack settings: ${slackSettingsError.message}`);
      }

      if (!slackSettings?.slack_webhook_url) {
        return new Response(JSON.stringify({ error: "Slack webhook URL not configured" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      const slackMessage = {
        blocks: buildSlackBlocks(
          [
            {
              userId,
              userEmail: "",
              exitKeyName: "",
              actionText: "Phase 1, Action 1",
              deadline: new Date().toISOString(),
              daysRemaining: 3,
              phaseIndex: 0,
              actionIndex: 0,
            }
          ],
          "✅ Test - Rappel d'échéance (Boussole Stratégique)"
        )
      };

      const slackResponse = await fetch(slackSettings.slack_webhook_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slackMessage)
      });

      if (!slackResponse.ok) {
        const errorText = await slackResponse.text();
        throw new Error(`Slack API error: ${slackResponse.status} ${errorText}`);
      }

      return new Response(JSON.stringify({ success: true, message: "Notification Slack test envoyée" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Fetch dashboard progress with upcoming deadlines
    let query = supabase
      .from('dashboard_progress')
      .select('*');

    if (userId && !checkAll) {
      query = query.eq('user_id', userId);
    }

    const { data: progressRecords, error: progressError } = await query;

    if (progressError) {
      throw new Error(`Failed to fetch progress: ${progressError.message}`);
    }

    logStep("Fetched progress records", { count: progressRecords?.length || 0 });

    const upcomingDeadlines: DeadlineInfo[] = [];
    const now = new Date();

    for (const record of progressRecords || []) {
      const stepsProgress = record.steps_progress as Array<{
        phaseIndex: number;
        actionIndex: number;
        completed: boolean;
        deadline?: string;
        reminderEnabled?: boolean;
      }>;

      if (!stepsProgress) continue;

      // Get user email from auth
      const { data: userData } = await supabase.auth.admin.getUserById(record.user_id);
      const userEmail = userData?.user?.email;

      if (!userEmail) continue;

      for (const step of stepsProgress) {
        if (!step.deadline || step.completed || !step.reminderEnabled) continue;

        const deadlineDate = new Date(step.deadline);
        const diffTime = deadlineDate.getTime() - now.getTime();
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Only include deadlines within 7 days
        if (daysRemaining >= 0 && daysRemaining <= 7) {
          upcomingDeadlines.push({
            userId: record.user_id,
            userEmail,
            exitKeyName: record.exit_key_id,
            actionText: `Phase ${step.phaseIndex + 1}, Action ${step.actionIndex + 1}`,
            deadline: step.deadline,
            daysRemaining,
            phaseIndex: step.phaseIndex,
            actionIndex: step.actionIndex,
          });
        }
      }
    }

    logStep("Found upcoming deadlines", { count: upcomingDeadlines.length });

    // Send notifications
    const notificationsSent: string[] = [];
    const errors: string[] = [];

    // Group by user for email batching
    const userDeadlines = new Map<string, UserDeadlinesGroup>();
    for (const deadline of upcomingDeadlines) {
      const existing = userDeadlines.get(deadline.userId) || {
        userId: deadline.userId,
        userEmail: deadline.userEmail,
        deadlines: [],
      };
      existing.deadlines.push(deadline);
      userDeadlines.set(deadline.userId, existing);
    }

    // Send emails if Resend is configured
    if (canSendEmail && resendApiKey) {
      for (const [, group] of userDeadlines) {
        try {
          const urgentDeadlines = group.deadlines.filter(d => d.daysRemaining <= 3);
          const upcomingList = group.deadlines.filter(d => d.daysRemaining > 3);

          const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; }
                .urgent { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 15px 0; border-radius: 4px; }
                .upcoming { background: #fff7ed; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; border-radius: 4px; }
                .deadline-item { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }
                .days { font-weight: bold; }
                .urgent .days { color: #dc2626; }
                .upcoming .days { color: #f59e0b; }
                .cta { display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">📅 Rappel de vos échéances</h1>
                  <p style="margin: 10px 0 0;">Boussole Stratégique - Dashboard</p>
                </div>
                <div class="content">
                  ${urgentDeadlines.length > 0 ? `
                    <div class="urgent">
                      <h3 style="margin-top: 0;">⚠️ Échéances urgentes (${urgentDeadlines.length})</h3>
                      ${urgentDeadlines.map(d => `
                        <div class="deadline-item">
                          <strong>${d.actionText}</strong><br>
                          <span class="days">${d.daysRemaining === 0 ? "Aujourd'hui!" : `Dans ${d.daysRemaining} jour${d.daysRemaining > 1 ? 's' : ''}`}</span>
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}
                  
                  ${upcomingList.length > 0 ? `
                    <div class="upcoming">
                      <h3 style="margin-top: 0;">📋 À venir cette semaine (${upcomingList.length})</h3>
                      ${upcomingList.map(d => `
                        <div class="deadline-item">
                          <strong>${d.actionText}</strong><br>
                          <span class="days">Dans ${d.daysRemaining} jours</span>
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}
                  
                  <p>Consultez votre tableau de bord pour suivre votre progression.</p>
                  <a href="${supabaseUrl?.replace('.supabase.co', '.lovable.app')}/dashboard" class="cta">
                    Voir mon tableau de bord
                  </a>
                </div>
              </div>
            </body>
            </html>
          `;

          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: "Boussole Stratégique <notifications@resend.dev>",
              to: [group.userEmail],
              subject: urgentDeadlines.length > 0 
                ? `⚠️ ${urgentDeadlines.length} échéance(s) urgente(s) - Action requise`
                : `📅 ${group.deadlines.length} échéance(s) à venir cette semaine`,
              html: emailHtml,
            }),
          });

          if (!emailResponse.ok) {
            throw new Error(`Email API error: ${emailResponse.status}`);
          }

          notificationsSent.push(group.userEmail);
          logStep("Email sent", { email: group.userEmail, deadlineCount: group.deadlines.length });
        } catch (emailError) {
          const errorMsg = emailError instanceof Error ? emailError.message : String(emailError);
          errors.push(`Failed to send to ${group.userEmail}: ${errorMsg}`);
          logStep("Email error", { email: group.userEmail, error: errorMsg });
        }
      }
    } else {
      logStep("Resend not configured, skipping emails");
    }

    // Notify Slack and push notifications
    for (const [, group] of userDeadlines) {
      const { data: settings } = await supabase
        .from('notification_settings')
        .select('push_enabled, slack_webhook_url')
        .eq('user_id', group.userId)
        .single();

      if (settings?.push_enabled) {
        // Here you would trigger push notification
        // For now, we log it for the client to poll
        logStep("Push notification queued", { userId: group.userId });
      }

      if (settings?.slack_webhook_url) {
        try {
          const slackMessage = {
            blocks: buildSlackBlocks(
              group.deadlines,
              "📅 Rappels d'échéances (Boussole Stratégique)"
            )
          };

          const slackResponse = await fetch(settings.slack_webhook_url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(slackMessage)
          });

          if (!slackResponse.ok) {
            const errorText = await slackResponse.text();
            throw new Error(`Slack API error: ${slackResponse.status} ${errorText}`);
          }

          logStep("Slack notification sent", { userId: group.userId, deadlineCount: group.deadlines.length });
        } catch (slackError) {
          const errorMsg = slackError instanceof Error ? slackError.message : String(slackError);
          errors.push(`Failed Slack for ${group.userEmail}: ${errorMsg}`);
          logStep("Slack error", { userId: group.userId, error: errorMsg });
        }
      }
    }

    const response = {
      success: true,
      processed: upcomingDeadlines.length,
      emailsSent: notificationsSent.length,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        totalDeadlines: upcomingDeadlines.length,
        urgentCount: upcomingDeadlines.filter(d => d.daysRemaining <= 3).length,
        usersNotified: userDeadlines.size,
      },
    };

    logStep("Function completed", response.summary);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
