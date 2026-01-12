import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReminderRequest {
  userId?: string;
  checkAll?: boolean;
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

interface PushSubscriptionRecord {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DASHBOARD-REMINDERS] ${step}${detailsStr}`);
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
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    const vapidSubject = Deno.env.get("VAPID_SUBJECT") ?? "mailto:notifications@example.com";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const canSendEmail = !!resendApiKey;
    const canSendPush = !!vapidPublicKey && !!vapidPrivateKey;

    if (canSendPush && vapidPublicKey && vapidPrivateKey) {
      webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    }

    const body: ReminderRequest = await req.json().catch(() => ({}));
    const { userId, checkAll = false } = body;

    logStep("Processing request", { userId, checkAll });

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
      const { data: settings } = await supabase
        .from('notification_settings')
        .select('deadline_reminder_days')
        .eq('user_id', record.user_id)
        .maybeSingle();

      const reminderDays = settings?.deadline_reminder_days ?? 3;
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

        // Only include deadlines within the user-configured reminder window
        if (daysRemaining >= 0 && daysRemaining <= reminderDays) {
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
    const userDeadlines = new Map<string, DeadlineInfo[]>();
    for (const deadline of upcomingDeadlines) {
      const existing = userDeadlines.get(deadline.userEmail) || [];
      existing.push(deadline);
      userDeadlines.set(deadline.userEmail, existing);
    }

    const logDelivery = async (payload: {
      userId: string;
      channel: string;
      status: string;
      destination: string;
      messageId?: string | null;
      error?: string | null;
      payload?: Record<string, unknown>;
    }) => {
      const { error } = await supabase.from('notification_delivery_logs').insert({
        user_id: payload.userId,
        channel: payload.channel,
        status: payload.status,
        destination: payload.destination,
        message_id: payload.messageId ?? null,
        error: payload.error ?? null,
        payload: payload.payload ?? {},
      });

      if (error) {
        logStep("Failed to log delivery", { error: error.message });
      }
    };

    // Send emails if Resend is configured
    if (canSendEmail && resendApiKey) {
      for (const [email, deadlines] of userDeadlines) {
        try {
          const urgentDeadlines = deadlines.filter(d => d.daysRemaining <= 3);
          const upcomingList = deadlines.filter(d => d.daysRemaining > 3);

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
              to: [email],
              subject: urgentDeadlines.length > 0 
                ? `⚠️ ${urgentDeadlines.length} échéance(s) urgente(s) - Action requise`
                : `📅 ${deadlines.length} échéance(s) à venir cette semaine`,
              html: emailHtml,
            }),
          });

          if (!emailResponse.ok) {
            throw new Error(`Email API error: ${emailResponse.status}`);
          }

          notificationsSent.push(email);
          logStep("Email sent", { email, deadlineCount: deadlines.length });
          await logDelivery({
            userId: deadlines[0]?.userId ?? '',
            channel: 'email',
            status: 'sent',
            destination: email,
            payload: {
              deadlineCount: deadlines.length,
              urgentCount: urgentDeadlines.length,
            },
          });
        } catch (emailError) {
          const errorMsg = emailError instanceof Error ? emailError.message : String(emailError);
          errors.push(`Failed to send to ${email}: ${errorMsg}`);
          logStep("Email error", { email, error: errorMsg });
          await logDelivery({
            userId: deadlines[0]?.userId ?? '',
            channel: 'email',
            status: 'failed',
            destination: email,
            error: errorMsg,
            payload: { deadlineCount: deadlines.length },
          });
        }
      }
    } else {
      logStep("Resend not configured, skipping emails");
    }

    // Store notifications in database for clients
    for (const deadline of upcomingDeadlines) {
      const title = `Échéance ${deadline.daysRemaining === 0 ? "aujourd'hui" : `dans ${deadline.daysRemaining} jour${deadline.daysRemaining > 1 ? 's' : ''}`}`;
      const message = `${deadline.actionText} arrive ${deadline.daysRemaining === 0 ? "aujourd'hui" : `dans ${deadline.daysRemaining} jour${deadline.daysRemaining > 1 ? 's' : ''}`}.`;

      const { error: notificationError } = await supabase
        .from('user_notifications')
        .insert({
          user_id: deadline.userId,
          type: 'deadline',
          title,
          message,
          priority: deadline.daysRemaining <= 1 ? 'high' : 'medium',
          action_url: '/dashboard',
        });

      if (notificationError) {
        logStep("Failed to store notification", { error: notificationError.message });
      }
    }

    // Send push notifications if configured
    if (canSendPush && vapidPublicKey && vapidPrivateKey) {
      const deadlinesByUser = new Map<string, DeadlineInfo[]>();
      for (const deadline of upcomingDeadlines) {
        const existing = deadlinesByUser.get(deadline.userId) ?? [];
        existing.push(deadline);
        deadlinesByUser.set(deadline.userId, existing);
      }

      for (const [userId, deadlines] of deadlinesByUser.entries()) {
        const { data: settings } = await supabase
          .from('notification_settings')
          .select('push_enabled')
          .eq('user_id', userId)
          .maybeSingle();

        if (!settings?.push_enabled) {
          continue;
        }

        const { data: subscriptions } = await supabase
          .from('push_subscriptions')
          .select('id, endpoint, p256dh, auth')
          .eq('user_id', userId);

        if (!subscriptions || subscriptions.length === 0) {
          logStep("No push subscriptions", { userId });
          continue;
        }

        const urgentDeadlines = deadlines.filter(d => d.daysRemaining <= 1);
        const title = urgentDeadlines.length > 0
          ? `⚠️ ${urgentDeadlines.length} échéance(s) urgente(s)`
          : `📅 ${deadlines.length} échéance(s) à venir`;
        const bodyText = urgentDeadlines.length > 0
          ? `${urgentDeadlines[0].actionText} arrive ${urgentDeadlines[0].daysRemaining === 0 ? "aujourd'hui" : "demain"}.`
          : `${deadlines[0].actionText} arrive dans ${deadlines[0].daysRemaining} jour${deadlines[0].daysRemaining > 1 ? 's' : ''}.`;

        const payload = JSON.stringify({
          title,
          body: bodyText,
          data: {
            url: '/dashboard',
            deadlines: deadlines.map((deadline) => ({
              actionText: deadline.actionText,
              daysRemaining: deadline.daysRemaining,
            })),
          },
        });

        for (const subscription of subscriptions as PushSubscriptionRecord[]) {
          try {
            await webpush.sendNotification(
              {
                endpoint: subscription.endpoint,
                keys: {
                  p256dh: subscription.p256dh,
                  auth: subscription.auth,
                },
              },
              payload,
            );

            logStep("Push notification sent", { userId, subscriptionId: subscription.id });
            await logDelivery({
              userId,
              channel: 'push',
              status: 'sent',
              destination: subscription.endpoint,
              payload: { deadlineCount: deadlines.length },
            });
          } catch (pushError) {
            const errorMsg = pushError instanceof Error ? pushError.message : String(pushError);
            logStep("Push notification failed", { userId, error: errorMsg });
            await logDelivery({
              userId,
              channel: 'push',
              status: 'failed',
              destination: subscription.endpoint,
              error: errorMsg,
              payload: { deadlineCount: deadlines.length },
            });
          }
        }
      }
    } else {
      logStep("VAPID not configured, skipping push notifications");
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
