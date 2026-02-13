import React from 'npm:react@18.3.1'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { ConfirmationEmail } from './_templates/confirmation-email.tsx'

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
    const { email, displayName, type } = await req.json()

    if (!email) {
      throw new Error('Email is required')
    }

    console.log(`[send-email] Sending ${type || 'welcome'} email to ${email}`)

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

    const { data, error } = await resend.emails.send({
      from: 'System Compass <noreply@pyramid-compass.com>',
      to: [email],
      subject: 'Bienvenue sur System Compass 🧭',
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
