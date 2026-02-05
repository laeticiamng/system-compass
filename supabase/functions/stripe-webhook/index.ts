import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } }
);

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Map Stripe price IDs to subscription tiers
const PRICE_TO_TIER: Record<string, string> = {
  // Add your actual Stripe price IDs here
  "price_1SxTE4DFa5Y9NR1IeeHU7qNb": "premium",
};

async function getSubscriptionTierFromPriceId(priceId: string): Promise<string> {
  // First check our hardcoded map
  if (PRICE_TO_TIER[priceId]) {
    return PRICE_TO_TIER[priceId];
  }
  
  // Fallback: check the subscription_plans table
  const { data } = await supabaseAdmin
    .from("subscription_plans")
    .select("tier")
    .eq("stripe_price_id", priceId)
    .maybeSingle();
  
  return data?.tier || "premium";
}

async function updateUserSubscription(
  customerId: string,
  tier: string,
  stripeCustomerId: string
) {
  logStep("Updating user subscription", { customerId, tier, stripeCustomerId });

  // Get customer email from Stripe
  const customer = await stripe.customers.retrieve(customerId);
  if (!customer || customer.deleted) {
    throw new Error("Customer not found or deleted");
  }
  
  const email = (customer as Stripe.Customer).email;
  if (!email) {
    throw new Error("Customer email not found");
  }
  logStep("Found customer email", { email });

  // Find user by email in auth.users
  const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
  if (userError) {
    throw new Error(`Failed to list users: ${userError.message}`);
  }

  const user = users.users.find((u) => u.email === email);
  if (!user) {
    logStep("No user found with email, skipping update", { email });
    return;
  }

  logStep("Found user", { userId: user.id });

  // Update or insert profile with subscription tier
  const { error: updateError } = await supabaseAdmin
    .from("profiles")
    .upsert({
      id: user.id,
      subscription_tier: tier,
      stripe_customer_id: stripeCustomerId,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "id",
    });

  if (updateError) {
    throw new Error(`Failed to update profile: ${updateError.message}`);
  }

  logStep("Profile updated successfully", { userId: user.id, tier });
}

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature) {
    logStep("ERROR: Missing stripe-signature header");
    return new Response("Missing signature", { status: 400 });
  }

  if (!webhookSecret) {
    logStep("ERROR: STRIPE_WEBHOOK_SECRET not configured");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    logStep("Event received", { type: event.type, id: event.id });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout session completed", {
          sessionId: session.id,
          customerId: session.customer,
          subscriptionId: session.subscription,
        });

        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          const priceId = subscription.items.data[0]?.price.id;
          
          if (priceId && session.customer) {
            const tier = await getSubscriptionTierFromPriceId(priceId);
            await updateUserSubscription(
              session.customer as string,
              tier,
              session.customer as string
            );
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription updated", {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          status: subscription.status,
        });

        if (subscription.status === "active") {
          const priceId = subscription.items.data[0]?.price.id;
          if (priceId) {
            const tier = await getSubscriptionTierFromPriceId(priceId);
            await updateUserSubscription(
              subscription.customer as string,
              tier,
              subscription.customer as string
            );
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription deleted", {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
        });

        // Reset user to free tier
        await updateUserSubscription(
          subscription.customer as string,
          "free",
          subscription.customer as string
        );
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
    logStep("ERROR processing webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
