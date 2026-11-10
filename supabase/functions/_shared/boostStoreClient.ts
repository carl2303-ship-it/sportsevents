import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.57.4";

/**
 * Client service-role para dados da loja Boost.
 * No SportsEvents as tabelas vivem no schema `boost` (não `public`).
 * Override: BOOST_DB_SCHEMA=public (só se redeployares no projecto Boost legado).
 */
export function getBoostDbSchema(): string {
  const raw = (Deno.env.get("BOOST_DB_SCHEMA") || "boost").trim();
  return raw || "boost";
}

export function createBoostStoreServiceClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL") || "";
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: getBoostDbSchema() },
  });
}

/** Anon + Authorization header (Auth getUser). Schema boost para queries de dados. */
export function createBoostStoreUserClient(
  authHeader: string | null | undefined,
): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL") || "";
  const anon = Deno.env.get("SUPABASE_ANON_KEY") || "";
  return createClient(url, anon, {
    global: { headers: { Authorization: authHeader ?? "" } },
    db: { schema: getBoostDbSchema() },
  });
}

/** Resend From — domínio SE. Override: RESEND_FROM="Name <addr@sportsevents.app>" */
export function getResendFrom(): string {
  return (
    Deno.env.get("RESEND_FROM") ||
    "SportsEvents <noreply@sportsevents.app>"
  );
}

/** Destino notificações admin loja. */
export function getAdminNotifyEmail(): string {
  return (
    Deno.env.get("ADMIN_NOTIFY_EMAIL") ||
    "info@sportsevents.app"
  );
}
