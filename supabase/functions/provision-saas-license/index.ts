// SoT: sportsevents → SE project tprbpeacicadsbmvxcqk
// Ported from boostpadel (695c814) — Auth SE (hub staff) + DB schema boost.*
// Gateway JWT: leave default ON (SE Auth). Function also validates getUser().
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  createBoostStoreServiceClient,
  createBoostStoreUserClient,
} from "../_shared/boostStoreClient.ts";
import {
  getTourSupabaseClient,
  provisionTourOrganizer,
  sendTourCredentialsEmail,
} from "../_shared/provisionTourOrganizer.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PLAN_MAX_TOURNAMENTS: Record<string, number> = {
  bronze: 4,
  silver: 10,
  gold: 15,
  platinum: 999,
};

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");

    const supabaseAdmin = createBoostStoreServiceClient();
    const supabaseUser = createBoostStoreUserClient(authHeader);

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "resend_credentials") {
      const { organization_id } = body;
      if (!organization_id) {
        return new Response(JSON.stringify({ error: "organization_id é obrigatório" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: org, error: orgError } = await supabaseAdmin
        .from("organizations")
        .select("*")
        .eq("id", organization_id)
        .eq("source", "boost")
        .maybeSingle();

      if (orgError) throw orgError;
      if (!org) {
        return new Response(JSON.stringify({ error: "Licença não encontrada" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!org.owner_email) {
        return new Response(JSON.stringify({ error: "Licença sem email de owner" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const tourSupabase = await getTourSupabaseClient();
      if (!tourSupabase) {
        return new Response(JSON.stringify({ error: "Tour Supabase não configurado" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const tourProvision = await provisionTourOrganizer(tourSupabase, {
        email: org.owner_email,
        name: org.name,
        slug: org.slug,
        planType: org.plan_type || "gold",
        contractStart: org.contract_start || new Date().toISOString(),
        contractExpiresAt: org.subscription_expires_at || addMonths(new Date(), 12).toISOString(),
        language: org.language || "pt",
        resetPasswordIfExists: true,
      });

      if (!tourProvision.password) {
        return new Response(JSON.stringify({ error: "Não foi possível gerar novas credenciais" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await sendTourCredentialsEmail(
        org.owner_email,
        org.name,
        tourProvision.password,
        org.slug,
      );

      if (!org.tour_user_id && tourProvision.userId) {
        await supabaseAdmin
          .from("organizations")
          .update({ tour_user_id: tourProvision.userId })
          .eq("id", org.id);
      }

      return new Response(JSON.stringify({
        ok: true,
        message: `Credenciais reenviadas para ${org.owner_email}`,
        credentials_sent: true,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      id,
      name,
      slug,
      owner_email,
      plan_type = "gold",
      status = "active",
      language = "pt",
      currency = "EUR",
      max_tournaments,
      contract_start,
      subscription_expires_at,
      primary_color,
      accent_color,
      provision_login = true,
      send_credentials_email = true,
    } = body;

    if (!name?.trim() || !slug?.trim()) {
      return new Response(JSON.stringify({ error: "Nome e slug são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    const contractStart = contract_start || now.toISOString();
    const contractExpires = subscription_expires_at || addMonths(now, 12).toISOString();
    const normalizedSlug = String(slug).trim().toLowerCase();
    const normalizedPlan = String(plan_type).toLowerCase();

    const orgPayload: Record<string, unknown> = {
      name: String(name).trim(),
      slug: normalizedSlug,
      source: "boost",
      plan_type: normalizedPlan,
      status,
      language,
      currency,
      max_tournaments: max_tournaments ?? PLAN_MAX_TOURNAMENTS[normalizedPlan] ?? 15,
      owner_email: owner_email?.trim().toLowerCase() || null,
      contract_start: contractStart,
      subscription_expires_at: contractExpires,
      primary_color: primary_color || null,
      accent_color: accent_color || null,
    };

    let organization;
    let tourProvision = null;

    if (id) {
      const { data, error } = await supabaseAdmin
        .from("organizations")
        .update(orgPayload)
        .eq("id", id)
        .select("*")
        .maybeSingle();

      if (error) throw error;
      organization = data;
    } else {
      if (provision_login && owner_email) {
        const tourSupabase = await getTourSupabaseClient();
        if (tourSupabase) {
          tourProvision = await provisionTourOrganizer(tourSupabase, {
            email: owner_email,
            name: String(name).trim(),
            slug: normalizedSlug,
            planType: normalizedPlan,
            contractStart,
            contractExpiresAt: contractExpires,
            language,
          });

          orgPayload.tour_user_id = tourProvision.userId;

          if (tourProvision.password && send_credentials_email) {
            await sendTourCredentialsEmail(
              owner_email,
              String(name).trim(),
              tourProvision.password,
              normalizedSlug,
            );
          }
        }
      }

      const { data, error } = await supabaseAdmin
        .from("organizations")
        .insert(orgPayload)
        .select("*")
        .maybeSingle();

      if (error) throw error;
      organization = data;
    }

    return new Response(
      JSON.stringify({
        ok: true,
        organization,
        tour_provision: tourProvision
          ? {
            user_id: tourProvision.userId,
            is_new: tourProvision.isNew,
            password_reset: tourProvision.passwordReset,
            credentials_sent: !!(tourProvision.password && send_credentials_email),
          }
          : null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("provision-saas-license error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
