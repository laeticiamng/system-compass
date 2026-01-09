import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  webhookId?: string;
  userId?: string;
  event: string;
  payload: Record<string, unknown>;
}

// Format payload for specific platforms
function formatPayloadForPlatform(
  platform: string,
  event: string,
  payload: Record<string, unknown>
): Record<string, unknown> {
  switch (platform) {
    case 'slack':
      return {
        text: `🔔 TraceOS: ${event}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*TraceOS Notification*\n\n*Event:* ${event}\n*Title:* ${payload.title || 'N/A'}\n*Status:* ${payload.status || 'N/A'}`,
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `Timestamp: ${new Date().toISOString()}`,
              },
            ],
          },
        ],
      };

    case 'teams':
      return {
        '@type': 'MessageCard',
        '@context': 'http://schema.org/extensions',
        themeColor: '0076D7',
        summary: `TraceOS: ${event}`,
        sections: [
          {
            activityTitle: `TraceOS: ${event}`,
            facts: [
              { name: 'Titre', value: String(payload.title || 'N/A') },
              { name: 'Statut', value: String(payload.status || 'N/A') },
              { name: 'Auteur', value: String(payload.author || 'N/A') },
            ],
            markdown: true,
          },
        ],
      };

    case 'notion':
      return {
        parent: { database_id: payload.database_id || '' },
        properties: {
          Name: {
            title: [{ text: { content: String(payload.title || 'TraceOS Decision') } }],
          },
          Status: {
            select: { name: String(payload.status || 'pending') },
          },
          Event: {
            rich_text: [{ text: { content: event } }],
          },
        },
      };

    default:
      return {
        event,
        timestamp: new Date().toISOString(),
        ...payload,
      };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { webhookId, userId, event, payload } = (await req.json()) as WebhookPayload;

    console.log(`Processing webhook event: ${event}`);

    let webhooksToTrigger = [];

    if (webhookId) {
      // Single webhook test
      const { data: webhook, error } = await supabase
        .from('traceos_webhooks')
        .select('*')
        .eq('id', webhookId)
        .single();

      if (error || !webhook) {
        throw new Error('Webhook not found');
      }
      webhooksToTrigger = [webhook];
    } else if (userId) {
      // Get all active webhooks for user that match the event
      const { data: webhooks, error } = await supabase
        .from('traceos_webhooks')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) throw error;

      // Filter webhooks that have this event enabled
      webhooksToTrigger = (webhooks || []).filter(w => {
        const events = w.events as string[];
        return events.includes(event);
      });
    }

    console.log(`Found ${webhooksToTrigger.length} webhooks to trigger`);

    // Send webhooks
    const results = await Promise.allSettled(
      webhooksToTrigger.map(async (webhook) => {
        const formattedPayload = formatPayloadForPlatform(
          webhook.platform,
          event,
          payload
        );

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...(webhook.headers as Record<string, string> || {}),
        };

        console.log(`Sending to ${webhook.platform}: ${webhook.url}`);

        const response = await fetch(webhook.url, {
          method: 'POST',
          headers,
          body: JSON.stringify(formattedPayload),
        });

        if (!response.ok) {
          throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
        }

        // Update last triggered timestamp
        await supabase
          .from('traceos_webhooks')
          .update({ last_triggered_at: new Date().toISOString() })
          .eq('id', webhook.id);

        return { webhookId: webhook.id, success: true };
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`Webhooks completed: ${successful} successful, ${failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        triggered: webhooksToTrigger.length,
        successful,
        failed,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
