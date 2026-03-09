import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";
import { corsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

interface DigestPayload {
  userId?: string;
  email?: string;
  displayName?: string;
  isTest?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body: DigestPayload = await req.json();

    // Determine target user
    let userId = body.userId;
    let email = body.email;
    let displayName = body.displayName || "";

    // If called with auth header, extract user
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabase.auth.getUser(token);
      if (userData?.user) {
        userId = userId || userData.user.id;
        email = email || userData.user.email;
        displayName = displayName || userData.user.user_metadata?.display_name || "";
      }
    }

    if (!userId || !email) {
      throw new Error("userId and email are required");
    }

    console.log(`[weekly-digest] Building digest for ${email} (${userId})`);

    // 1. Fetch watched countries
    const { data: watchlist } = await supabase
      .from("user_country_watchlist")
      .select("country_id")
      .eq("user_id", userId);

    const watchedCountryIds = (watchlist || []).map((w: any) => w.country_id);

    // 2. Fetch country names for context
    let countryNames: Record<string, string> = {};
    if (watchedCountryIds.length > 0) {
      const { data: countries } = await supabase
        .from("countries")
        .select("id, name")
        .in("id", watchedCountryIds);
      if (countries) {
        countries.forEach((c: any) => { countryNames[c.id] = c.name; });
      }
    }

    // 3. Fetch recent geopolitical alerts (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: allAlerts } = await supabase
      .from("geopolitical_alerts_ai")
      .select("*")
      .eq("is_active", true)
      .gte("detected_at", weekAgo)
      .order("detected_at", { ascending: false })
      .limit(20);

    const geoAlerts = (allAlerts || []).filter((a: any) => {
      if (watchedCountryIds.length === 0) return true; // show all if no watchlist
      const codes = a.country_codes || [];
      return codes.some((c: string) => watchedCountryIds.includes(c.toLowerCase()));
    });

    // 4. Fetch recent regulatory changes (country_data_updates)
    const { data: allUpdates } = await supabase
      .from("country_data_updates")
      .select("id, country_id, change_type, change_summary, detected_at, validation_status")
      .gte("detected_at", weekAgo)
      .eq("validation_status", "approved")
      .order("detected_at", { ascending: false })
      .limit(20);

    const regChanges = (allUpdates || []).filter((u: any) => {
      if (watchedCountryIds.length === 0) return true;
      return watchedCountryIds.includes(u.country_id);
    });

    // 5. Build email HTML
    const html = buildDigestHtml({
      displayName,
      watchedCountries: watchedCountryIds.map(id => countryNames[id] || id),
      geoAlerts,
      regChanges,
      countryNames,
    });

    // 6. Send via Resend
    const { data: sendData, error: sendError } = await resend.emails.send({
      from: "Compass <noreply@emotionscare.com>",
      to: [email],
      subject: `🧭 Votre synthèse hebdomadaire — ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`,
      html,
    });

    if (sendError) {
      console.error("[weekly-digest] Resend error:", sendError);
      throw sendError;
    }

    console.log("[weekly-digest] Digest sent:", sendData);

    return new Response(
      JSON.stringify({
        success: true,
        stats: {
          geoAlerts: geoAlerts.length,
          regChanges: regChanges.length,
          watchedCountries: watchedCountryIds.length,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err) {
    const error = err as Error;
    console.error("[weekly-digest] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

// ─── HTML Builder ───────────────────────────────────────────────
interface DigestData {
  displayName: string;
  watchedCountries: string[];
  geoAlerts: any[];
  regChanges: any[];
  countryNames: Record<string, string>;
}

function severityColor(s: string): string {
  switch (s) {
    case "critical": return "#ef4444";
    case "warning": return "#f59e0b";
    default: return "#3b82f6";
  }
}

function severityLabel(s: string): string {
  switch (s) {
    case "critical": return "🔴 Critique";
    case "warning": return "🟠 Attention";
    default: return "🔵 Info";
  }
}

function buildDigestHtml(data: DigestData): string {
  const greeting = data.displayName ? `Bonjour ${data.displayName},` : "Bonjour,";

  const alertsHtml = data.geoAlerts.length > 0
    ? data.geoAlerts.map(a => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;">
          <span style="display:inline-block;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;color:#fff;background:${severityColor(a.severity)};">
            ${severityLabel(a.severity)}
          </span>
          <p style="margin:6px 0 2px;font-weight:600;color:#111827;">${a.title}</p>
          <p style="margin:0;font-size:13px;color:#6b7280;">${a.region} — ${a.summary?.substring(0, 120) || ""}…</p>
        </td>
      </tr>
    `).join("")
    : `<tr><td style="padding:16px;color:#6b7280;text-align:center;">Aucune alerte géopolitique cette semaine ✅</td></tr>`;

  const changesHtml = data.regChanges.length > 0
    ? data.regChanges.map(c => `
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;">
          <span style="font-size:12px;color:#8b5cf6;font-weight:600;">${(c.change_type || "").toUpperCase()}</span>
          <span style="font-size:12px;color:#9ca3af;margin-left:8px;">${data.countryNames[c.country_id] || c.country_id}</span>
          <p style="margin:4px 0 0;font-size:13px;color:#374151;">${c.change_summary || "Mise à jour détectée"}</p>
        </td>
      </tr>
    `).join("")
    : `<tr><td style="padding:16px;color:#6b7280;text-align:center;">Aucun changement réglementaire cette semaine</td></tr>`;

  const countriesHtml = data.watchedCountries.length > 0
    ? data.watchedCountries.map(c => `<span style="display:inline-block;margin:2px 4px;padding:4px 10px;background:#f0f9ff;color:#0369a1;border-radius:12px;font-size:12px;">${c}</span>`).join("")
    : `<span style="color:#9ca3af;font-size:13px;">Aucun pays suivi — ajoutez des pays à votre watchlist</span>`;

  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
    <tr>
      <td align="center" style="padding:20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e40af,#7c3aed);padding:32px 24px;text-align:center;">
              <h1 style="margin:0;font-size:24px;color:#ffffff;">🧭 Synthèse Hebdomadaire</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
                Semaine du ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:24px 24px 12px;">
              <p style="margin:0;color:#374151;font-size:15px;">${greeting}</p>
              <p style="margin:8px 0 0;color:#6b7280;font-size:14px;">Voici le résumé de votre veille stratégique de la semaine.</p>
            </td>
          </tr>

          <!-- Watched Countries -->
          <tr>
            <td style="padding:12px 24px;">
              <h2 style="margin:0 0 8px;font-size:14px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">🌍 Pays suivis</h2>
              <div style="padding:8px 0;">${countriesHtml}</div>
            </td>
          </tr>

          <!-- Geopolitical Alerts -->
          <tr>
            <td style="padding:12px 24px;">
              <h2 style="margin:0 0 8px;font-size:14px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">⚠️ Alertes Géopolitiques (${data.geoAlerts.length})</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border-radius:8px;overflow:hidden;">
                ${alertsHtml}
              </table>
            </td>
          </tr>

          <!-- Regulatory Changes -->
          <tr>
            <td style="padding:12px 24px;">
              <h2 style="margin:0 0 8px;font-size:14px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">📋 Changements Réglementaires (${data.regChanges.length})</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border-radius:8px;overflow:hidden;">
                ${changesHtml}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:24px;text-align:center;">
              <a href="https://system-compass.app/dashboard" style="display:inline-block;padding:12px 32px;background:#7c3aed;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
                Voir mon tableau de bord →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 24px;background:#f9fafb;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:11px;">
                Vous recevez cet email car la synthèse hebdomadaire est activée dans vos paramètres.<br/>
                <a href="https://system-compass.app/notification-settings" style="color:#7c3aed;">Gérer mes préférences</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
