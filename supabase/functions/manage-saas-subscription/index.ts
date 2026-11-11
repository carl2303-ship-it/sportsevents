// v2 - no-verify-jwt — valida JWT Tour (Padel1) manualmente
// SoT: sportsevents → SE project tprbpeacicadsbmvxcqk
// Ported from boostpadel (695c814) — DB schema boost.* via createBoostStoreServiceClient
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14.11.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import { createBoostStoreServiceClient } from "../_shared/boostStoreClient.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function getTourUserId(authHeader: string | null): Promise<string> {
  if (!authHeader) throw new Error("Não autorizado");

  const tourUrl = Deno.env.get("TOUR_SUPABASE_URL") || "https://rqiwnxcexsccguruiteq.supabase.co";
  const tourAnonKey = Deno.env.get("TOUR_SUPABASE_ANON_KEY");
  if (!tourAnonKey) throw new Error("TOUR_SUPABASE_ANON_KEY não configurada");

  const tourClient = createClient(tourUrl, tourAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error } = await tourClient.auth.getUser();
  if (error || !user) throw new Error("Sessão Tour inválida");
  return user.id;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const tourUserId = await getTourUserId(authHeader);
    const { action } = await req.json();

    const boostAdmin = createBoostStoreServiceClient();

    const { data: org, error: orgError } = await boostAdmin
      .from("organizations")
      .select("*")
      .eq("tour_user_id", tourUserId)
      .eq("source", "boost")
      .maybeSingle();

    if (orgError) throw orgError;
    if (!org) {
      return new Response(JSON.stringify({ error: "Licença Boost não encontrada para este utilizador" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "cancel_at_period_end") {
      if (!org.stripe_subscription_id) {
        return new Response(JSON.stringify({
          error: "Esta licença foi criada manualmente e não tem subscrição Stripe associada. Contacte info@sportsevents.app para cancelar.",
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (!stripeKey) throw new Error("Stripe não configurado");

      const stripe = new Stripe(stripeKey, { apiVersion: "2024-11-20.acacia" });

      const subscription = await stripe.subscriptions.update(org.stripe_subscription_id, {
        cancel_at_period_end: true,
      });

      const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();

      await boostAdmin
        .from("organizations")
        .update({
          cancel_at_period_end: true,
          subscription_expires_at: periodEnd,
        })
        .eq("id", org.id);

      return new Response(JSON.stringify({
        ok: true,
        cancel_at_period_end: true,
        subscription_expires_at: periodEnd,
        message: "A subscrição será cancelada no fim do período atual. Mantém acesso até essa data.",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "reactivate") {
      if (!org.stripe_subscription_id) {
        return new Response(JSON.stringify({ error: "Sem subscrição Stripe para reativar" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (!stripeKey) throw new Error("Stripe não configurado");

      const stripe = new Stripe(stripeKey, { apiVersion: "2024-11-20.acacia" });

      const subscription = await stripe.subscriptions.update(org.stripe_subscription_id, {
        cancel_at_period_end: false,
      });

      const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();

      await boostAdmin
        .from("organizations")
        .update({
          cancel_at_period_end: false,
          status: "active",
          subscription_expires_at: periodEnd,
        })
        .eq("id", org.id);

      return new Response(JSON.stringify({
        ok: true,
        cancel_at_period_end: false,
        subscription_expires_at: periodEnd,
        message: "Renovação automática reativada.",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Ação inválida" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("manage-saas-subscription error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
