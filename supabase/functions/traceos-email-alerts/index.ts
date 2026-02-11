import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PendingDecision {
  id: string;
  title: string;
  context: string;
  author: string;
  decision_date: string;
  days_pending: number;
}

interface AlertRequest {
  user_email: string;
  user_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Invalid token");
    }

    // Get request body
    const { user_email, user_name }: AlertRequest = await req.json();

    if (!user_email) {
      throw new Error("Email is required");
    }

    // Calculate dates
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch pending decisions older than 7 days
    const { data: pendingDecisions, error: fetchError } = await supabaseClient
      .from("traceos_decisions")
      .select("id, title, context, author, decision_date")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .lt("decision_date", sevenDaysAgo.toISOString().split("T")[0])
      .order("decision_date", { ascending: true });

    if (fetchError) {
      throw fetchError;
    }

    if (!pendingDecisions || pendingDecisions.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending decisions to alert" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Calculate days pending for each decision
    const decisionsWithDays: PendingDecision[] = pendingDecisions.map((d) => {
      const decisionDate = new Date(d.decision_date);
      const diffTime = Math.abs(today.getTime() - decisionDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        ...d,
        days_pending: diffDays,
      };
    });

    // Build email HTML
    const decisionsHtml = decisionsWithDays
      .map(
        (d) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">
            <strong>${d.title}</strong>
            <br/>
            <span style="color: #666; font-size: 12px;">
              Auteur: ${d.author} | En attente depuis ${d.days_pending} jours
            </span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
            <span style="background-color: ${d.days_pending > 30 ? '#fee2e2' : '#fef3c7'}; 
                         color: ${d.days_pending > 30 ? '#dc2626' : '#d97706'}; 
                         padding: 4px 8px; border-radius: 4px; font-size: 12px;">
              ${d.days_pending > 30 ? "⚠️ Critique" : "🕐 À traiter"}
            </span>
          </td>
        </tr>
      `
      )
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🧠 TraceOS - Rappel</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Décisions en attente de traitement</p>
          </div>
          
          <div style="padding: 30px;">
            <p style="color: #374151; margin-bottom: 20px;">
              Bonjour ${user_name || ""},
            </p>
            <p style="color: #374151; margin-bottom: 20px;">
              Vous avez <strong>${decisionsWithDays.length} décision(s)</strong> en attente depuis plus de 7 jours dans TraceOS.
            </p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th style="padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #6b7280;">Décision</th>
                  <th style="padding: 12px; text-align: center; font-size: 12px; text-transform: uppercase; color: #6b7280;">Statut</th>
                </tr>
              </thead>
              <tbody>
                ${decisionsHtml}
              </tbody>
            </table>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              Nous vous recommandons de valider ou abandonner ces décisions pour maintenir une traçabilité claire.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${Deno.env.get("SITE_URL") || "https://pyramid-compass.lovable.app"}/b2b" 
                 style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); 
                        color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 500;">
                Accéder à TraceOS
              </a>
            </div>
          </div>
          
          <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              System Compass - TraceOS | Mémoire Décisionnelle<br/>
              <a href="#" style="color: #6366f1;">Se désabonner des alertes</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email using Resend API directly
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "TraceOS <onboarding@resend.dev>",
        to: [user_email],
        subject: `🔔 ${decisionsWithDays.length} décision(s) en attente - TraceOS`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      throw new Error(`Failed to send email: ${errorText}`);
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Alert sent for ${decisionsWithDays.length} pending decisions`,
        decisions_count: decisionsWithDays.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in traceos-email-alerts function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
