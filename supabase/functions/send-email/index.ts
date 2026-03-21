import React from 'npm:react@18.3.1'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { ConfirmationEmail } from './_templates/confirmation-email.tsx'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)

import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    // Authenticate the caller
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token)
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const { email, displayName, type } = await req.json()

    if (!email) {
      throw new Error('Email is required')
    }

    const maskedEmail = email.replace(/^(.{2})(.*)(@.*)$/, '$1***$3');
    console.log(`[send-email] Sending ${type || 'welcome'} email to ${maskedEmail} (by user ${String(claimsData.claims.sub).slice(0, 8)}...)`)

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''

    const html = await renderAsync(
      React.createElement(ConfirmationEmail, {
        supabase_url: supabaseUrl,
        token: '',
        token_hash: '',
        redirect_to: '',
        email_action_type: type || 'welcome',
        displayName: displayName || '',
      })
    )

    const senderDomain = Deno.env.get('EMAIL_SENDER_DOMAIN') || 'system-compass.app';
    const senderFrom = `Compass <noreply@${senderDomain}>`;

    const { data, error } = await resend.emails.send({
      from: senderFrom,
      to: [email],
      subject: 'Bienvenue sur Compass 🧭',
      html,
    })

    if (error) {
      console.error('[send-email] Resend error:', error)
      throw error
    }

    console.log('[send-email] Email sent successfully:', data)

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (err) {
    const error = err as Error
    console.error('[send-email] Error:', error)

    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    )
  }
})
