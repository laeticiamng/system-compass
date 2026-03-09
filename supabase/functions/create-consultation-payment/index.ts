import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CONSULTATION-PAYMENT] ${step}${detailsStr}`);
};

// Platform fee: 15%
const PLATFORM_FEE_PERCENT = 0.15;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return handleCorsPreflightRequest(req);
  }

  const corsHeaders = getCorsHeaders(req);

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    logStep("Function started");

    // Parse request body
    const { 
      expertId, 
      expertName,
      consultationType, 
      durationMinutes, 
      amount, 
      currency,
      scheduledAt,
      subject 
    } = await req.json();

    if (!expertId || !amount || !durationMinutes) {
      throw new Error("Missing required fields: expertId, amount, durationMinutes");
    }

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required", code: "AUTH_REQUIRED" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !userData.user?.email) {
      return new Response(
        JSON.stringify({ error: "User not authenticated", code: "AUTH_FAILED" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const user = userData.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get expert info
    const { data: expert, error: expertError } = await supabaseAdmin
      .from("experts")
      .select("id, display_name, user_id, stripe_account_id")
      .eq("id", expertId)
      .single();

    if (expertError || !expert) {
      throw new Error("Expert not found");
    }
    logStep("Expert found", { expertId: expert.id, name: expert.display_name });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Calculate platform fee
    const amountCents = Math.round(amount * 100);
    const platformFeeCents = Math.round(amountCents * PLATFORM_FEE_PERCENT);

    // Create or get Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
      logStep("Created new customer", { customerId });
    }

    // Create consultation record first
    const { data: consultation, error: consultationError } = await supabaseAdmin
      .from("consultations")
      .insert({
        expert_id: expertId,
        user_id: user.id,
        status: "requested",
        scheduled_at: scheduledAt,
        duration_minutes: durationMinutes,
        amount: amount,
        platform_fee: amount * PLATFORM_FEE_PERCENT,
        payment_status: "pending",
        notes: subject,
      })
      .select()
      .single();

    if (consultationError) {
      logStep("Error creating consultation", { error: consultationError.message });
      throw new Error("Failed to create consultation record");
    }
    logStep("Consultation created", { consultationId: consultation.id });

    // Create Stripe Checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency?.toLowerCase() || "eur",
            unit_amount: amountCents,
            product_data: {
              name: `Consultation avec ${expertName || expert.display_name}`,
              description: `${consultationType || 'Consultation'} - ${durationMinutes} minutes`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get("origin")}/consultation/${consultation.id}/success`,
      cancel_url: `${req.headers.get("origin")}/experts/${expertId}?cancelled=true`,
      metadata: {
        consultation_id: consultation.id,
        expert_id: expertId,
        user_id: user.id,
        type: "consultation",
      },
    };

    // If expert has Stripe Connect, use destination payment
    if (expert.stripe_account_id) {
      sessionParams.payment_intent_data = {
        application_fee_amount: platformFeeCents,
        transfer_data: {
          destination: expert.stripe_account_id,
        },
      };
      logStep("Using Stripe Connect", { 
        stripeAccountId: expert.stripe_account_id,
        applicationFee: platformFeeCents 
      });
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(
      JSON.stringify({ 
        paymentUrl: session.url,
        sessionId: session.id,
        consultationId: consultation.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
