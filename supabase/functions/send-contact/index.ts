import { Resend } from "https://esm.sh/resend@4.0.0"
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";
import { checkRateLimit, getRateLimitKey, rateLimitResponse } from "../_shared/rate-limit.ts";

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest(req)
  }

  const corsHeaders = getCorsHeaders(req)

  // Rate limit: 5 contact submissions per 10 minutes per IP
  const rateLimitResult = checkRateLimit(
    getRateLimitKey(req, 'send-contact'),
    { maxRequests: 5, windowSeconds: 600 }
  );
  if (!rateLimitResult.allowed) {
    return rateLimitResponse(rateLimitResult, corsHeaders);
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const { name, email, subject, message } = await req.json()

    // Validation
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Email invalide' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return new Response(JSON.stringify({ error: 'Message trop court (min 5 caractères)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    if (name && typeof name === 'string' && name.length > 200) {
      return new Response(JSON.stringify({ error: 'Nom trop long' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    if (subject && typeof subject === 'string' && subject.length > 300) {
      return new Response(JSON.stringify({ error: 'Sujet trop long' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const sanitizedName = (name || 'Anonyme').toString().slice(0, 200).replace(/[&<>"']/g, (c: string) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c))
    const sanitizedSubject = (subject || 'Contact via Compass').toString().slice(0, 300).replace(/[&<>"']/g, (c: string) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c))
    const sanitizedMessage = message.toString().slice(0, 5000).replace(/[&<>"']/g, (c: string) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c))
    const sanitizedEmail = email.toString().slice(0, 320)

    console.log(`[send-contact] Contact from ${sanitizedEmail} — subject: ${sanitizedSubject}`)

    const { data, error } = await resend.emails.send({
      from: 'Compass <noreply@emotionscare.com>',
      to: ['contact@emotionscare.com'],
      replyTo: sanitizedEmail,
      subject: `[Contact] ${sanitizedSubject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a1a;">Nouveau message de contact</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; font-weight: bold; color: #666;">Nom</td><td style="padding: 8px;">${sanitizedName}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; color: #666;">Email</td><td style="padding: 8px;"><a href="mailto:${sanitizedEmail}">${sanitizedEmail}</a></td></tr>
            <tr><td style="padding: 8px; font-weight: bold; color: #666;">Sujet</td><td style="padding: 8px;">${sanitizedSubject}</td></tr>
          </table>
          <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin-top: 16px;">
            <p style="white-space: pre-wrap; color: #333;">${sanitizedMessage}</p>
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 24px;">Envoyé depuis le formulaire de contact Compass</p>
        </div>
      `,
    })

    if (error) {
      console.error('[send-contact] Resend error:', error)
      throw error
    }

    console.log('[send-contact] Email sent successfully:', data)

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (err) {
    const error = err as Error
    console.error('[send-contact] Error:', error)

    return new Response(
      JSON.stringify({ error: error.message || 'Erreur interne' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    )
  }
})
