import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CONSULTATION-WEBHOOK] ${step}${detailsStr}`);
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature) {
    logStep("Missing stripe-signature header");
    return new Response("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;
  const body = await req.text();

  if (!webhookSecret) {
    logStep("CRITICAL: STRIPE_WEBHOOK_SECRET not configured — rejecting webhook");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logStep("Webhook signature verification failed", { error: errorMessage });
    return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  logStep("Event received", { type: event.type, id: event.id });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Check if this is a consultation payment
        if (session.metadata?.type === "consultation" && session.metadata?.consultation_id) {
          const consultationId = session.metadata.consultation_id;
          
          logStep("Processing consultation payment", { consultationId });

          // Update consultation status
          const { error: updateError } = await supabaseAdmin
            .from("consultations")
            .update({
              payment_status: "paid",
              status: "confirmed",
              updated_at: new Date().toISOString(),
            })
            .eq("id", consultationId);

          if (updateError) {
            logStep("Error updating consultation", { error: updateError.message });
            throw updateError;
          }

          logStep("Consultation marked as paid", { consultationId });

          // Get consultation details for notification
          const { data: consultation } = await supabaseAdmin
            .from("consultations")
            .select(`
              *,
              expert:experts(display_name, user_id)
            `)
            .eq("id", consultationId)
            .single();

          if (consultation?.expert?.user_id) {
            // Create notification for expert
            await supabaseAdmin.from("user_notifications").insert({
              user_id: consultation.expert.user_id,
              type: "success",
              title: "Nouvelle consultation confirmée",
              message: `Une consultation de ${consultation.duration_minutes} minutes a été réservée et payée.`,
              action_url: `/expert/consultations/${consultationId}`,
              priority: "high",
            });
            logStep("Expert notified", { expertUserId: consultation.expert.user_id });
          }
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        if (paymentIntent.metadata?.consultation_id) {
          logStep("Payment intent succeeded", { 
            consultationId: paymentIntent.metadata.consultation_id 
          });
          
          // Double-check consultation is marked as paid
          await supabaseAdmin
            .from("consultations")
            .update({ payment_status: "paid" })
            .eq("id", paymentIntent.metadata.consultation_id);
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        
        // Try to find consultation from payment intent
        if (charge.payment_intent) {
          const paymentIntent = await stripe.paymentIntents.retrieve(
            charge.payment_intent as string
          );
          
          if (paymentIntent.metadata?.consultation_id) {
            const consultationId = paymentIntent.metadata.consultation_id;
            
            logStep("Processing refund", { consultationId });

            const { error: refundError } = await supabaseAdmin
              .from("consultations")
              .update({
                payment_status: "refunded",
                status: "cancelled",
                updated_at: new Date().toISOString(),
              })
              .eq("id", consultationId);

            if (refundError) {
              logStep("Error updating refund status", { error: refundError.message });
              throw refundError;
            }

            logStep("Consultation refunded", { consultationId });
          }
        }
        break;
      }

      case "account.updated": {
        // Handle Stripe Connect account updates
        const account = event.data.object as Stripe.Account;
        
        if (account.metadata?.expert_id) {
          const expertId = account.metadata.expert_id;
          const isComplete = account.charges_enabled && account.payouts_enabled;
          
          logStep("Connect account updated", { 
            expertId, 
            chargesEnabled: account.charges_enabled,
            payoutsEnabled: account.payouts_enabled 
          });

          if (isComplete) {
            await supabaseAdmin
              .from("experts")
              .update({ 
                stripe_account_id: account.id,
                stripe_onboarding_complete: true,
              })
              .eq("id", expertId);
          }
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Error processing webhook", { error: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
