import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14.11.0";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import {
  createBoostStoreServiceClient,
  getAdminNotifyEmail,
  getResendFrom,
} from "../_shared/boostStoreClient.ts";
import { getTranslation, detectLanguageFromEmail } from "../email-translations.ts";
import {
  getTourSupabaseClient,
  provisionTourOrganizer,
  sendTourCredentialsEmail,
} from "../_shared/provisionTourOrganizer.ts";

const CHECKOUT_BUILD = "funnel-v2-20261110-webhook";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, stripe-signature",
};

/** True when request path is the Stripe webhook route (.../stripe-checkout/webhook). */
function isWebhookPath(pathname: string): boolean {
  return pathname === "/webhook" || pathname.endsWith("/webhook");
}

type EbookFunnelRow = {
  id: string;
  slug: string;
  title: string;
  ebook_price_cents: number;
  upsell_price_cents: number;
  ebook_product_type: string;
  upsell_product_type: string;
  stripe_ebook_name: string;
  stripe_upsell_name: string;
  status: string;
};

function isEbookProductType(productType: string | null | undefined): boolean {
  if (!productType) return false;
  return productType === "ebook" || productType.startsWith("ebook_");
}

function isUpsellProductType(productType: string | null | undefined): boolean {
  if (!productType) return false;
  return productType === "upsell" || productType.startsWith("upsell_");
}

function isEbookFunnelProductType(productType: string | null | undefined): boolean {
  return isEbookProductType(productType) || isUpsellProductType(productType);
}

async function resolveFunnelByProductType(
  supabase: ReturnType<typeof createClient>,
  productType: string
): Promise<{ funnel: EbookFunnelRow | null; kind: "ebook" | "upsell" | null }> {
  if (productType === "ebook" || productType === "upsell") {
    return { funnel: null, kind: productType };
  }

  const kind = isUpsellProductType(productType)
    ? "upsell"
    : isEbookProductType(productType)
      ? "ebook"
      : null;
  if (!kind) return { funnel: null, kind: null };

  const column = kind === "ebook" ? "ebook_product_type" : "upsell_product_type";
  const { data, error } = await supabase
    .from("ebook_funnels")
    .select(
      "id, slug, title, ebook_price_cents, upsell_price_cents, ebook_product_type, upsell_product_type, stripe_ebook_name, stripe_upsell_name, status"
    )
    .eq(column, productType)
    .maybeSingle();

  if (error) {
    console.error("Funnel lookup error:", error);
    return { funnel: null, kind };
  }
  return { funnel: (data as EbookFunnelRow) || null, kind };
}

async function loadFunnelAssets(
  supabase: ReturnType<typeof createClient>,
  funnelId: string,
  language: string
): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from("ebook_funnel_assets")
    .select("kind, public_url, language")
    .eq("funnel_id", funnelId)
    .in("language", [language, "pt"]);

  if (error || !data) {
    if (error) console.error("Funnel assets error:", error);
    return {};
  }

  const preferred: Record<string, string> = {};
  const fallback: Record<string, string> = {};
  for (const row of data) {
    if (row.language === language) preferred[row.kind] = row.public_url;
    else fallback[row.kind] = row.public_url;
  }
  return { ...fallback, ...preferred };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;

    // Webhook first: needs STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET only.
    // Gateway JWT must be disabled (config.toml verify_jwt=false / --no-verify-jwt)
    // because Stripe does not send Authorization.
    if (isWebhookPath(path) && req.method === "POST") {
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      const webhookSecret = (Deno.env.get("STRIPE_WEBHOOK_SECRET") || "").trim();
      if (!stripeKey) {
        console.error("STRIPE_SECRET_KEY not found (webhook)");
        return new Response(
          JSON.stringify({ error: "Stripe not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (!webhookSecret) {
        console.error("STRIPE_WEBHOOK_SECRET missing — set whsec_ from SE Stripe endpoint");
        return new Response(
          JSON.stringify({ error: "Webhook secret not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const stripe = new Stripe(stripeKey, {
        apiVersion: "2024-11-20.acacia",
      });
      const supabase = createBoostStoreServiceClient();
      const signature = req.headers.get("stripe-signature");
      const body = await req.text();

      let event: Stripe.Event;
      try {
        event = await stripe.webhooks.constructEventAsync(
          body,
          signature || "",
          webhookSecret
        );
      } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      try {
        await handleStripeWebhookEvent(stripe, supabase, event);
      } catch (handlerErr) {
        // Signature OK — acknowledge to Stripe so the endpoint stays enabled.
        // Handler failures are logged for ops; Stripe retries are not useful for app bugs.
        console.error("Webhook handler error (acking 200):", handlerErr);
      }

      return new Response(
        JSON.stringify({ received: true, build: CHECKOUT_BUILD }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "X-Boost-Checkout-Build": CHECKOUT_BUILD,
          },
        }
      );
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error("STRIPE_SECRET_KEY not found");
      return new Response(
        JSON.stringify({ error: "Stripe not configured" }),
        { status: 500, headers: corsHeaders }
      );
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2024-11-20.acacia",
    });

    const supabase = createBoostStoreServiceClient();

    if (path.endsWith("/create-checkout-session") && req.method === "POST") {
      const {
        items,
        orderId,
        customerEmail,
        shippingMethod,
        language,
        successUrl,
        cancelUrl,
      } = await req.json();
      console.log("Creating checkout session for order:", orderId);

      const line_items = items.map((item: any) => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }));

      if (shippingMethod && shippingMethod.cost > 0) {
        line_items.push({
          price_data: {
            currency: "eur",
            product_data: {
              name: `Envio - ${shippingMethod.name}`,
            },
            unit_amount: Math.round(shippingMethod.cost * 100),
          },
          quantity: 1,
        });
      }

      const origin = req.headers.get("origin") || "";
      const siteUrl = origin || "https://sportsevents.app";
      const defaultSuccess =
        `${siteUrl}/store/checkout?success=true&order_id=${orderId}`;
      const defaultCancel = `${siteUrl}/store/checkout?canceled=true`;

      const session = await stripe.checkout.sessions.create({
        line_items,
        mode: "payment",
        success_url: successUrl || defaultSuccess,
        cancel_url: cancelUrl || defaultCancel,
        customer_email: customerEmail,
        automatic_tax: { enabled: false },
        metadata: {
          orderId,
          language: language || detectLanguageFromEmail(customerEmail) || 'pt',
        },
      });

      console.log("Checkout session created:", session.id);

      return new Response(
        JSON.stringify({ url: session.url }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (req.method === "POST" && !path.endsWith("/create-checkout-session") && !isWebhookPath(path)) {
      const body = await req.json();

      if (isEbookFunnelProductType(body.productType)) {
        const { productType, amount, customerEmail, customerName, originalSessionId, successUrl, cancelUrl, language } = body;

        console.log(`Creating ${productType} checkout session`);

        const siteUrl = req.headers.get("origin") || "https://sportsevents.app";
        const detectedLang = language || detectLanguageFromEmail(customerEmail) || 'pt';

        const { funnel, kind } = await resolveFunnelByProductType(supabase, productType);
        const isUpsell = kind === "upsell" || isUpsellProductType(productType);

        let unitAmount = typeof amount === "number" ? amount : null;
        let productName: string;

        if (funnel) {
          unitAmount = isUpsell ? funnel.upsell_price_cents : funnel.ebook_price_cents;
          productName = isUpsell
            ? (funnel.stripe_upsell_name || `${funnel.title} — Upsell`)
            : (funnel.stripe_ebook_name || funnel.title);
        } else if (productType === "ebook") {
          productName = "O Sistema de Posicionamento Completo para Jogadores de Padel Inteligentes";
        } else if (productType === "upsell") {
          productName = "O Sistema de Confiança no Padel - Mini-Curso em Vídeo";
        } else {
          return new Response(
            JSON.stringify({ error: `Funil não encontrado para productType ${productType}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (!unitAmount || unitAmount <= 0) {
          return new Response(
            JSON.stringify({ error: "Montante inválido" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const defaultSuccess = funnel
          ? (isUpsell
            ? `${siteUrl}/store/funnel/thank-you?slug=${funnel.slug}&bundle=1&session_id={CHECKOUT_SESSION_ID}`
            : `${siteUrl}/store/funnel/upsell?slug=${funnel.slug}&session_id={CHECKOUT_SESSION_ID}`)
          : (isUpsell
            ? `${siteUrl}/store/funnel/thank-you?slug=smartpadelstrategy&bundle=1`
            : `${siteUrl}/store/funnel/upsell?slug=smartpadelstrategy&session_id={CHECKOUT_SESSION_ID}`);

        const defaultCancel = funnel
          ? (isUpsell
            ? `${siteUrl}/store/funnel/thank-you?slug=${funnel.slug}`
            : `${siteUrl}/store/funnel?slug=${funnel.slug}`)
          : (isUpsell
            ? `${siteUrl}/store/funnel/thank-you?slug=smartpadelstrategy`
            : `${siteUrl}/store/funnel?slug=smartpadelstrategy`);

        const sessionConfig: any = {
          line_items: [{
            price_data: {
              currency: "eur",
              product_data: {
                name: productName,
              },
              unit_amount: unitAmount,
            },
            quantity: 1,
          }],
          mode: "payment",
          success_url: successUrl || defaultSuccess,
          cancel_url: cancelUrl || defaultCancel,
          automatic_tax: { enabled: false },
          metadata: {
            productType,
            originalSessionId: originalSessionId || '',
            language: detectedLang,
            funnelSlug: funnel?.slug || '',
          },
        };

        if (customerEmail) {
          sessionConfig.customer_email = customerEmail;
        }

        const session = await stripe.checkout.sessions.create(sessionConfig);

        console.log("Ebook checkout session created:", session.id);

        return new Response(
          JSON.stringify({ url: session.url, sessionId: session.id, build: CHECKOUT_BUILD }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      if (body.productType === 'app-access') {
        const { amount, customerEmail, successUrl, cancelUrl, language } = body;
        const siteUrl = req.headers.get("origin") || "https://boostpadel.netlify.app";
        const detectedLang = language || detectLanguageFromEmail(customerEmail) || 'pt';

        const session = await stripe.checkout.sessions.create({
          line_items: [{
            price_data: {
              currency: "eur",
              product_data: { name: "Acesso à App de Gestão de Torneios BOOST PADEL" },
              unit_amount: amount,
            },
            quantity: 1,
          }],
          mode: "payment",
          success_url: successUrl || `${siteUrl}/app-thank-you.html`,
          cancel_url: cancelUrl || `${siteUrl}/digital.html`,
          automatic_tax: { enabled: false },
          customer_email: customerEmail,
          metadata: {
            productType: 'app-access',
            language: detectedLang,
          },
        });

        return new Response(
          JSON.stringify({ sessionId: session.id }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (body.productType === 'saas-tour-subscription') {
        const {
          planType,
          billingPeriod = 'mensal',
          organizationName,
          organizationSlug,
          ownerEmail,
          language,
          currency = 'EUR',
          successUrl,
          cancelUrl,
          sendPaymentLinkEmail = false,
        } = body;

        const planPrices: Record<string, { mensal: number; anual: number }> = {
          bronze: { mensal: 990, anual: 10098 },
          silver: { mensal: 1990, anual: 20298 },
          gold: { mensal: 2990, anual: 30498 },
          platinum: { mensal: 3990, anual: 40698 },
        };

        const planMaxTournaments: Record<string, number> = {
          bronze: 4,
          silver: 10,
          gold: 15,
          platinum: 999,
        };

        const normalizedPlan = String(planType || 'gold').toLowerCase();
        const period = billingPeriod === 'anual' ? 'anual' : 'mensal';
        const amount = planPrices[normalizedPlan]?.[period];

        if (!amount || !organizationName || !organizationSlug || !ownerEmail) {
          return new Response(
            JSON.stringify({ error: "Dados de subscrição incompletos" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const tourAppUrl =
          Deno.env.get("TOUR_APP_URL") ||
          Deno.env.get("NEXT_PUBLIC_TOUR_APP_URL") ||
          "https://tour.padel1.app";
        const siteUrl = req.headers.get("origin") || tourAppUrl;
        const detectedLang = language || detectLanguageFromEmail(ownerEmail) || 'pt';
        const slug = String(organizationSlug).trim().toLowerCase();
        const interval = period === 'anual' ? 'year' : 'month';
        const planLabel = normalizedPlan.charAt(0).toUpperCase() + normalizedPlan.slice(1);
        const currencyCode = String(currency || 'EUR').toUpperCase();

        const session = await stripe.checkout.sessions.create({
          line_items: [{
            price_data: {
              currency: currencyCode.toLowerCase(),
              product_data: {
                name: `PADEL ONE Tour - Plano ${planLabel}`,
                description: `Licença SaaS Boost Padel (${organizationName})`,
              },
              unit_amount: amount,
              recurring: { interval },
            },
            quantity: 1,
          }],
          mode: "subscription",
          success_url: successUrl || `${tourAppUrl}/?subscription=success&slug=${encodeURIComponent(slug)}`,
          cancel_url: cancelUrl || `${tourAppUrl}/`,
          automatic_tax: { enabled: false },
          customer_email: ownerEmail,
          metadata: {
            productType: 'saas-tour-subscription',
            plan_type: normalizedPlan,
            billing_period: period,
            organization_name: organizationName,
            organization_slug: slug,
            max_tournaments: String(planMaxTournaments[normalizedPlan] ?? 15),
            source: 'boost',
            language: detectedLang,
            currency: currencyCode,
          },
        });

        let emailSent = false;
        if (sendPaymentLinkEmail && session.url) {
          emailSent = await sendSaasPaymentLinkEmail({
            to: ownerEmail,
            organizationName,
            planLabel,
            period,
            amountLabel: `${(amount / 100).toFixed(2)} ${currencyCode}`,
            paymentUrl: session.url,
            language: detectedLang,
          });
        }

        return new Response(
          JSON.stringify({ url: session.url, sessionId: session.id, emailSent }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: "Not found", build: CHECKOUT_BUILD }),
      {
        status: 404,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "X-Boost-Checkout-Build": CHECKOUT_BUILD,
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

async function handleStripeWebhookEvent(
  stripe: Stripe,
  supabase: ReturnType<typeof createClient>,
  event: Stripe.Event
): Promise<void> {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    const productType = session.metadata?.productType;
    const language = session.metadata?.language || "pt";

    if (isEbookFunnelProductType(productType)) {
      console.log(`Processing ${productType} purchase:`, session.id);

      const { data, error } = await supabase.from("ebook_purchases").insert({
        customer_email: session.customer_email || session.customer_details?.email,
        customer_name: session.customer_details?.name || "Cliente",
        stripe_session_id: session.id,
        product_type: productType,
        amount: (session.amount_total || 0) / 100,
        status: "completed",
        language: language,
      });

      if (error) {
        console.error("Error inserting ebook purchase:", error);
      } else {
        console.log("Ebook purchase inserted successfully:", data);
      }

      await sendEbookEmail(
        supabase,
        session.customer_email || session.customer_details?.email || "",
        session.customer_details?.name || "",
        productType!,
        session.id,
        language
      );

      await sendAdminOrderNotification({
        type: isUpsellProductType(productType) ? "Upsell Ebook" : "Ebook",
        customerEmail: session.customer_email || session.customer_details?.email || "",
        customerName: session.customer_details?.name || "Cliente",
        amount: ((session.amount_total || 0) / 100).toFixed(2),
        currency: (session.currency || "eur").toUpperCase(),
        reference: session.id,
      });

      console.log(`${productType} purchase recorded and email sent in ${language}`);
    }

    if (productType === "app-access") {
      const customerEmail = session.customer_details?.email;
      const customerName = session.customer_details?.name || "Cliente";

      if (customerEmail) {
        const password = generatePassword(12);

        try {
          await supabase.auth.admin.createUser({
            email: customerEmail,
            password: password,
            email_confirm: true,
            user_metadata: {
              name: customerName,
              access_granted: new Date().toISOString(),
              stripe_session_id: session.id,
            },
          });
        } catch (userError: any) {
          if (userError.message.includes("already registered")) {
            const { data: existingUser } = await supabase.auth.admin.listUsers();
            const user = existingUser.users.find((u: any) => u.email === customerEmail);
            if (user) {
              await supabase.auth.admin.updateUserById(user.id, { password });
            }
          }
        }

        await sendAppAccessEmail(customerEmail, customerName, password, language);

        await sendAdminOrderNotification({
          type: "App Access",
          customerEmail,
          customerName,
          amount: ((session.amount_total || 0) / 100).toFixed(2),
          currency: (session.currency || "eur").toUpperCase(),
          reference: session.id,
        });
      }
    }

    if (productType === "saas-tour-subscription") {
      const metadata = session.metadata || {};
      const slug = metadata.organization_slug;
      const orgName = metadata.organization_name;
      const ownerEmail =
        session.customer_details?.email || session.customer_email || metadata.owner_email;

      if (slug && orgName) {
        const maxTournaments = parseInt(metadata.max_tournaments || "15", 10);
        let contractStart = new Date().toISOString();
        let contractExpires = new Date(Date.now() + 30 * 86400000).toISOString();

        if (typeof session.subscription === "string") {
          try {
            const subscription = await stripe.subscriptions.retrieve(session.subscription);
            contractStart = new Date(subscription.current_period_start * 1000).toISOString();
            contractExpires = new Date(subscription.current_period_end * 1000).toISOString();
          } catch (subErr) {
            console.error("Could not retrieve Stripe subscription:", subErr);
          }
        }

        let tourUserId: string | null = null;

        if (ownerEmail) {
          const tourSupabase = await getTourSupabaseClient();
          if (tourSupabase) {
            try {
              const tourProvision = await provisionTourOrganizer(tourSupabase, {
                email: ownerEmail,
                name: orgName,
                slug,
                planType: metadata.plan_type || "gold",
                contractStart,
                contractExpiresAt: contractExpires,
                language: metadata.language || "pt",
              });
              tourUserId = tourProvision.userId;

              if (tourProvision.isNew && tourProvision.password) {
                await sendTourCredentialsEmail(ownerEmail, orgName, tourProvision.password, slug);
              }
            } catch (provisionErr) {
              console.error("Tour provision error:", provisionErr);
            }
          }
        }

        const { error: orgError } = await supabase.from("organizations").upsert(
          {
            name: orgName,
            slug,
            source: metadata.source || "boost",
            plan_type: metadata.plan_type || "gold",
            status: "active",
            currency: metadata.currency || "EUR",
            language: metadata.language || "pt",
            owner_email: ownerEmail || null,
            max_tournaments: Number.isFinite(maxTournaments) ? maxTournaments : 15,
            stripe_subscription_id:
              typeof session.subscription === "string" ? session.subscription : null,
            contract_start: contractStart,
            subscription_expires_at: contractExpires,
            tour_user_id: tourUserId,
          },
          { onConflict: "slug" }
        );

        if (orgError) {
          console.error("Error creating SaaS organization:", orgError);
        } else {
          console.log(`SaaS organization activated: ${slug} (${metadata.plan_type})`);
          await sendAdminOrderNotification({
            type: "Subscrição Tour SaaS",
            customerEmail: ownerEmail || "",
            customerName: orgName,
            amount: ((session.amount_total || 0) / 100).toFixed(2),
            currency: (session.currency || metadata.currency || "eur").toUpperCase(),
            reference: `${slug} · ${metadata.plan_type || "gold"} · ${metadata.billing_period || ""}`,
            extraLines: [
              `Organização: ${orgName}`,
              `Slug: tour.padel1.app/${slug}`,
              `Plano: ${metadata.plan_type || "gold"}`,
            ],
          });
        }
      }
    }

    if (orderId) {
      await supabase
        .from("orders")
        .update({
          status: "paid",
          stripe_session_id: session.id,
        })
        .eq("id", orderId);

      const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single();

      if (order) {
        if (order.items) {
          const digitalProductIds = order.items
            .filter((item: any) => item.type === "digital")
            .map((item: any) => item.id);

          if (digitalProductIds.length > 0) {
            const { data: products } = await supabase
              .from("products")
              .select("id, name, download_url")
              .in("id", digitalProductIds)
              .eq("is_digital", true);

            if (products && products.length > 0) {
              await sendDigitalProductEmail(
                order.customer_email,
                order.customer_name,
                products,
                orderId,
                language
              );
            }
          }
        }

        const itemSummary = Array.isArray(order.items)
          ? order.items
              .map((item: any) => `${item.quantity || 1}× ${item.name || item.id}`)
              .join(", ")
          : "";

        await sendAdminOrderNotification({
          type: "Pedido Loja",
          customerEmail: order.customer_email || "",
          customerName: order.customer_name || "Cliente",
          amount: Number(order.total || 0).toFixed(2),
          currency: "EUR",
          reference: order.order_number || orderId,
          extraLines: [
            itemSummary ? `Itens: ${itemSummary}` : "",
            order.shipping_method ? `Envio: ${order.shipping_method}` : "",
          ].filter(Boolean),
        });
      }
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const subscriptionId = subscription.id;
    const isActive = subscription.status === "active" || subscription.status === "trialing";
    const newStatus = isActive ? "active" : "suspended";
    const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();
    const periodStart = new Date(subscription.current_period_start * 1000).toISOString();

    const { error } = await supabase
      .from("organizations")
      .update({
        status: newStatus,
        subscription_expires_at: periodEnd,
        contract_start: periodStart,
        cancel_at_period_end: subscription.cancel_at_period_end ?? false,
      })
      .eq("stripe_subscription_id", subscriptionId);

    if (error) {
      console.error("Error updating organization subscription status:", error);
    }
  }
}

function generatePassword(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

async function sendSaasPaymentLinkEmail(payload: {
  to: string;
  organizationName: string;
  planLabel: string;
  period: string;
  amountLabel: string;
  paymentUrl: string;
  language: string;
}): Promise<boolean> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.log("RESEND_API_KEY not configured. Payment link email not sent.");
    return false;
  }

  const periodLabel = payload.period === 'anual' ? 'anual' : 'mensal';
  const subject = `Link de pagamento PADEL ONE Tour — ${payload.organizationName}`;
  const emailHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${subject}</title></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #111; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background:linear-gradient(135deg,#0EA5E9,#7C3AED); padding:24px; border-radius:12px 12px 0 0;">
    <h1 style="color:#fff; margin:0; font-size:22px;">PADEL ONE Tour</h1>
    <p style="color:#e0f2fe; margin:8px 0 0;">Subscrição Boost Padel</p>
  </div>
  <div style="background:#fff; padding:28px; border:1px solid #e2e8f0; border-top:0; border-radius:0 0 12px 12px;">
    <p>Olá,</p>
    <p>Segue o link de pagamento Stripe para a organização <strong>${payload.organizationName}</strong>.</p>
    <p style="margin:16px 0;">
      <strong>Plano:</strong> ${payload.planLabel}<br>
      <strong>Periodicidade:</strong> ${periodLabel}<br>
      <strong>Valor:</strong> ${payload.amountLabel}
    </p>
    <p style="text-align:center; margin:28px 0;">
      <a href="${payload.paymentUrl}" style="display:inline-block; background:#0EA5E9; color:#fff; padding:14px 28px; border-radius:10px; text-decoration:none; font-weight:bold;">
        Pagar agora
      </a>
    </p>
    <p style="font-size:13px; color:#64748b;">Se o botão não funcionar, copia este link:<br>
      <a href="${payload.paymentUrl}" style="color:#0EA5E9; word-break:break-all;">${payload.paymentUrl}</a>
    </p>
    <p style="margin-top:24px;">Obrigado,<br><strong>Equipa Boost Padel</strong></p>
  </div>
</body></html>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: getResendFrom(),
        to: [payload.to],
        subject,
        html: emailHtml,
      }),
    });

    if (response.ok) {
      console.log(`Payment link email sent to ${payload.to}`);
      return true;
    }

    console.error("Failed to send payment link email:", await response.text());
    return false;
  } catch (error) {
    console.error("Error sending payment link email:", error);
    return false;
  }
}

async function sendAdminOrderNotification(payload: {
  type: string;
  customerEmail: string;
  customerName: string;
  amount: string;
  currency: string;
  reference: string;
  extraLines?: string[];
}) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const adminEmail = getAdminNotifyEmail();

  if (!resendApiKey) {
    console.log("RESEND_API_KEY not configured. Admin notification not sent.");
    return;
  }

  const extraHtml = (payload.extraLines || [])
    .map((line) => `<p style="margin: 4px 0; color: #374151;">${line}</p>`)
    .join("");

  const emailHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Novo pedido Boost Padel</title></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #111; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background:#1E293B; padding:20px; border-radius:12px 12px 0 0;">
    <h1 style="color:#fff; margin:0; font-size:20px;">Novo ${payload.type}</h1>
  </div>
  <div style="background:#f8fafc; padding:24px; border:1px solid #e2e8f0; border-top:0; border-radius:0 0 12px 12px;">
    <p style="margin:0 0 12px;"><strong>Cliente:</strong> ${payload.customerName}</p>
    <p style="margin:0 0 12px;"><strong>Email:</strong> ${payload.customerEmail}</p>
    <p style="margin:0 0 12px;"><strong>Valor:</strong> ${payload.amount} ${payload.currency}</p>
    <p style="margin:0 0 12px;"><strong>Referência:</strong> ${payload.reference}</p>
    ${extraHtml}
    <p style="margin:20px 0 0; font-size:13px; color:#64748b;">Ver no painel admin → Pedidos / Licenças SaaS Tour</p>
  </div>
</body></html>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: getResendFrom(),
        to: [adminEmail],
        subject: `[Boost] Novo ${payload.type} · ${payload.amount} ${payload.currency}`,
        html: emailHtml,
      }),
    });

    if (response.ok) {
      console.log(`Admin notification sent to ${adminEmail} (${payload.type})`);
    } else {
      const error = await response.text();
      console.error("Failed to send admin notification:", error);
    }
  } catch (error) {
    console.error("Error sending admin notification:", error);
  }
}

async function sendDigitalProductEmail(
  customerEmail: string,
  customerName: string,
  products: Array<{ id: string; name: string; download_url: string | null }>,
  orderId: string,
  language: string = 'pt'
) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");

  if (!resendApiKey) {
    console.log("RESEND_API_KEY not configured. Email not sent.");
    console.log("Digital products for order", orderId, ":");
    products.forEach(p => {
      console.log(`- ${p.name}: ${p.download_url || 'No download URL set'}`);
    });
    return;
  }

  const year = new Date().getFullYear().toString();
  const t = (key: string, vars?: Record<string, string>) =>
    getTranslation(language, 'digitalProduct', key, vars);

  const productsList = products
    .map(p => {
      if (p.download_url) {
        return `<li style="margin-bottom: 15px;">
          <strong>${p.name}</strong><br>
          <a href="${p.download_url}" style="display: inline-block; margin-top: 8px; background-color: #007BFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">${t('downloadButton')}</a>
        </li>`;
      } else {
        return `<li style="margin-bottom: 15px;">
          <strong>${p.name}</strong><br>
          <span style="color: #FF9900;">${t('comingSoon')}</span>
        </li>`;
      }
    })
    .join("");

  const emailHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${t('subject', { orderId })}</title></head><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background-color: #111111; padding: 20px; text-align: center;"><h1 style="color: #007BFF; margin: 0;">${t('title')}</h1></div><div style="padding: 30px; background-color: #f9f9f9;"><h2 style="color: #111111;">${t('greeting', { customerName })}</h2><p>${t('orderProcessed', { orderId })}</p><p>${t('downloadBelow')}</p><ul style="list-style: none; padding: 0;">${productsList}</ul><div style="margin-top: 30px; padding: 15px; background-color: #FFF9E6; border-left: 4px solid #FF9900;"><p style="margin: 0; font-size: 14px;"><strong>${t('importantNote')}</strong> ${t('noteText')}</p></div><p style="margin-top: 30px;">${t('questions')}</p><p style="margin-top: 20px;">${t('goodTraining')}<br><strong>${t('team')}</strong></p></div><div style="text-align: center; padding: 20px; font-size: 12px; color: #666;"><p>${t('copyright', { year })}</p></div></body></html>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: getResendFrom(),
        to: [customerEmail],
        subject: t('subject', { orderId }),
        html: emailHtml,
      }),
    });

    if (response.ok) {
      console.log(`Digital product email sent successfully to ${customerEmail} in ${language}`);
    } else {
      const error = await response.text();
      console.error("Failed to send email:", error);
    }
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

async function sendAppAccessEmail(
  customerEmail: string,
  customerName: string,
  password: string,
  language: string = 'pt'
) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");

  if (!resendApiKey) {
    console.log("RESEND_API_KEY not configured. Email not sent.");
    console.log(`App access - Email: ${customerEmail}, Password: ${password}`);
    return;
  }

  const year = new Date().getFullYear().toString();
  const t = (key: string, vars?: Record<string, string>) =>
    getTranslation(language, 'appAccess', key, vars);

  const emailHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${t('subject')}</title></head><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background-color: #111111; padding: 20px; text-align: center;"><h1 style="color: #007BFF; margin: 0;">${t('title')}</h1></div><div style="padding: 30px; background-color: #f9f9f9;"><h2 style="color: #111111;">${t('greeting', { customerName })}</h2><p>${t('credentialsText')}</p><div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;"><p><strong>${t('email')}</strong> ${customerEmail}</p><p><strong>${t('password')}</strong> <code style="background-color: #fff; padding: 5px 10px; border-radius: 4px; font-size: 16px;">${password}</code></p></div><a href="https://app.boostpadel.store" style="display: inline-block; margin-top: 20px; background-color: #007BFF; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">${t('accessButton')}</a><p style="margin-top: 30px;">${t('goodTraining')}<br><strong>${t('team')}</strong></p></div><div style="text-align: center; padding: 20px; font-size: 12px; color: #666;"><p>${t('copyright', { year })}</p></div></body></html>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: getResendFrom(),
        to: [customerEmail],
        subject: t('subject'),
        html: emailHtml,
      }),
    });

    if (response.ok) {
      console.log(`App access email sent successfully to ${customerEmail} in ${language}`);
    } else {
      const error = await response.text();
      console.error("Failed to send app access email:", error);
    }
  } catch (error) {
    console.error("Error sending app access email:", error);
  }
}

async function sendEbookEmail(
  supabase: ReturnType<typeof createClient>,
  customerEmail: string,
  customerName: string,
  productType: string,
  sessionId: string,
  language: string = 'pt'
) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");

  if (!resendApiKey) {
    console.log("RESEND_API_KEY not configured. Email not sent.");
    console.log(`Ebook purchase - Email: ${customerEmail}, Type: ${productType}`);
    return;
  }

  const isBundle = isUpsellProductType(productType);
  const year = new Date().getFullYear().toString();
  const t = (key: string, vars?: Record<string, string>) =>
    getTranslation(language, 'ebook', key, vars);

  const subject = isBundle ? t('subjectBundle') : t('subjectSingle');
  const greetingName = customerName || t('greeting', { customerName: 'Jogador Inteligente' });

  const legacyEbookPdf =
    "https://gmpyjnufuvsoewbtirsg.supabase.co/storage/v1/object/public/ebook-materials/position%20ebook%20POR/POSICIONAMENTO_NO_PADEL.pdf";
  const legacyCheat =
    "https://gmpyjnufuvsoewbtirsg.supabase.co/storage/v1/object/public/ebook-materials/position%20ebook%20POR/Cheat%20Sheet%20Padel%20POR.pdf";
  const legacyMental =
    "https://gmpyjnufuvsoewbtirsg.supabase.co/storage/v1/object/public/ebook-materials/position%20ebook%20POR/Bonus%20upsell%20Cheat%20sheet%20mental%20POR.pdf";
  const legacyAudio =
    "https://gmpyjnufuvsoewbtirsg.supabase.co/storage/v1/object/public/ebook-materials/position%20ebook%20POR/audio%20pre-jogo.mp3";
  const legacyVideo =
    "https://drive.google.com/file/d/1KlVywqRlLKphoACw5v0vFWPFoNQU2Ke5/view?usp=sharing";
  const legacyTracker = "https://forms.gle/PP8xdE2kddyXYwan9";

  let ebookPdf = legacyEbookPdf;
  let cheatSheet = legacyCheat;
  let mentalCheat = legacyMental;
  let audioUrl = legacyAudio;
  let videoUrl = legacyVideo;
  let trackerUrl = legacyTracker;

  const { funnel } = await resolveFunnelByProductType(supabase, productType);
  if (funnel) {
    const assets = await loadFunnelAssets(supabase, funnel.id, language);
    if (assets.ebook_pdf) ebookPdf = assets.ebook_pdf;
    // Genéricos + legados (thankyou_bonus / upsell)
    if (assets.thankyou_bonus || assets.cheat_sheet) {
      cheatSheet = assets.thankyou_bonus || assets.cheat_sheet;
    }
    if (assets.mental_cheat_sheet) mentalCheat = assets.mental_cheat_sheet;
    else if (assets.thankyou_bonus && assets.cheat_sheet) {
      mentalCheat = assets.thankyou_bonus;
    }
    if (assets.audio) audioUrl = assets.audio;
    if (assets.upsell || assets.upsell_video) {
      videoUrl = assets.upsell || assets.upsell_video;
    }
  }

  const btn = (href: string, label: string) =>
    `<a href="${href}" style="display: inline-block; margin-top: 8px; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">${label}</a>`;

  const productsList = isBundle
    ? `<li style="margin-bottom: 15px;"><strong>${t('ebookTitle')}</strong><br>${btn(ebookPdf, t('ebookButton'))}</li><li style="margin-bottom: 15px;"><strong>${t('videoTitle')}</strong><br>${btn(videoUrl, t('videoButton'))}</li><li style="margin-bottom: 15px;"><strong>${t('cheatSheetTitle')}</strong><br>${btn(cheatSheet, t('cheatSheetButton'))}</li><li style="margin-bottom: 15px;"><strong>${t('mentalCheatSheetTitle')}</strong><br>${btn(mentalCheat, t('cheatSheetButton'))}</li><li style="margin-bottom: 15px;"><strong>${t('trackerTitle')}</strong><br>${btn(trackerUrl, t('trackerButton'))}</li><li style="margin-bottom: 15px;"><strong>${t('audioTitle')}</strong><br>${btn(audioUrl, t('audioButton'))}</li>`
    : `<li style="margin-bottom: 15px;"><strong>${t('ebookTitle')}</strong><br>${btn(ebookPdf, t('ebookButton'))}</li><li style="margin-bottom: 15px;"><strong>${t('cheatSheetTitle')}</strong><br>${btn(cheatSheet, t('cheatSheetButton'))}</li><li style="margin-bottom: 15px;"><strong>${t('trackerTitle')}</strong><br>${btn(trackerUrl, t('trackerButton'))}</li>`;

  const emailHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${subject}</title></head><body style="font-family: Inter, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;"><div style="background: linear-gradient(135deg, #3b82f6 0%, #f97316 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;"><h1 style="color: white; margin: 0; font-size: 28px; font-weight: 900;">${t('title')}</h1><p style="color: #e0f2fe; margin: 10px 0 0 0; font-size: 16px;">${t('subtitle')}</p></div><div style="padding: 40px 30px; background-color: white; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"><h2 style="color: #111827; margin-top: 0; font-size: 24px; font-weight: 800;">${greetingName}</h2><p style="font-size: 18px; color: #374151; margin: 20px 0;">${t('congratsText')}</p><div style="background: linear-gradient(135deg, #dbeafe 0%, #fed7aa 100%); padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #3b82f6;"><p style="margin: 0; font-size: 16px; font-weight: 600; color: #1e40af;">${t('accessText')}</p></div><h3 style="color: #111827; margin-top: 30px; font-size: 20px; font-weight: 700;">${t('materialsTitle')}</h3><ul style="list-style: none; padding: 0; margin: 20px 0;">${productsList}</ul><div style="margin: 30px 0; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;"><p style="margin: 0; font-size: 15px; color: #92400e;"><strong>${t('nextStepTitle')}</strong> ${t('nextStepText')}</p></div><p style="margin-top: 30px; font-size: 14px; color: #6b7280;">${t('sessionText')} <code style="background-color: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 12px;">${sessionId}</code></p><hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;"><p style="font-size: 14px; color: #6b7280;">${t('helpText')} <a href="mailto:info@boostpadel.pt" style="color: #3b82f6;">info@boostpadel.pt</a></p><p style="margin-top: 25px; font-size: 16px; color: #111827;">${t('goodGames')}<br><strong style="color: #3b82f6;">${t('team')}</strong></p></div><div style="text-align: center; padding: 20px; font-size: 12px; color: #9ca3af;"><p>${t('copyright', { year })}</p></div></body></html>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: getResendFrom(),
        to: [customerEmail],
        subject: subject,
        html: emailHtml,
      }),
    });

    if (response.ok) {
      console.log(`Ebook email sent successfully to ${customerEmail} in ${language}`);
    } else {
      const error = await response.text();
      console.error("Failed to send ebook email:", error);
    }
  } catch (error) {
    console.error("Error sending ebook email:", error);
  }
}
