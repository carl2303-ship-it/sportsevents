// v2 - no-verify-jwt — valida JWT Tour (Padel1) manualmente
// SoT: sportsevents → SE project tprbpeacicadsbmvxcqk
// Ported from boostpadel (695c814) — DB schema boost.* via createBoostStoreServiceClient
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import { createBoostStoreServiceClient } from "../_shared/boostStoreClient.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tourUrl = Deno.env.get("TOUR_SUPABASE_URL") || "https://rqiwnxcexsccguruiteq.supabase.co";
    const tourAnonKey = Deno.env.get("TOUR_SUPABASE_ANON_KEY");
    if (!tourAnonKey) {
      throw new Error("TOUR_SUPABASE_ANON_KEY não configurada");
    }

    const tourClient = createClient(tourUrl, tourAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await tourClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Sessão Tour inválida" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { primary_color, accent_color } = await req.json();
    const normalizeColor = (value: unknown) => {
      if (!value || typeof value !== "string") return null;
      const trimmed = value.trim();
      return /^#[0-9A-Fa-f]{6}$/.test(trimmed) ? trimmed : null;
    };

    const boostAdmin = createBoostStoreServiceClient();

    const { data, error } = await boostAdmin
      .from("organizations")
      .update({
        primary_color: normalizeColor(primary_color),
        accent_color: normalizeColor(accent_color),
      })
      .eq("tour_user_id", user.id)
      .select("id, slug, primary_color, accent_color")
      .maybeSingle();

    if (error) throw error;

    return new Response(
      JSON.stringify({ ok: true, organization: data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("sync-org-branding error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
