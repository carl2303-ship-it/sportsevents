import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2.57.4";
import { getResendFrom } from "./boostStoreClient.ts";

export type ProvisionTourParams = {
  email: string;
  name: string;
  slug: string;
  planType: string;
  contractStart: string;
  contractExpiresAt: string;
  language?: string;
  sendCredentialsEmail?: boolean;
  resetPasswordIfExists?: boolean;
};

export type ProvisionTourResult = {
  userId: string;
  isNew: boolean;
  password: string | null;
  passwordReset: boolean;
  organizerId: string | null;
};

function generatePassword(length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

async function findUserByEmail(
  tourSupabase: SupabaseClient,
  emailLower: string,
): Promise<string | null> {
  let page = 1;
  const perPage = 100;

  while (true) {
    const { data } = await tourSupabase.auth.admin.listUsers({ page, perPage });
    const users = data?.users ?? [];
    const found = users.find((u) => u.email?.toLowerCase() === emailLower);
    if (found?.id) return found.id;
    if (users.length < perPage) break;
    page++;
  }

  return null;
}

export async function provisionTourOrganizer(
  tourSupabase: SupabaseClient,
  params: ProvisionTourParams,
): Promise<ProvisionTourResult> {
  const emailLower = params.email.trim().toLowerCase();
  if (!emailLower) {
    throw new Error("Email do owner é obrigatório para criar login Tour");
  }

  const password = generatePassword();
  let userId: string | null = null;
  let isNew = false;
  let passwordReset = false;

  const { data: created, error: createError } = await tourSupabase.auth.admin.createUser({
    email: emailLower,
    password,
    email_confirm: true,
    user_metadata: {
      source: "boost_saas",
      organization_slug: params.slug,
      organization_name: params.name,
    },
  });

  if (!createError && created?.user?.id) {
    userId = created.user.id;
    isNew = true;
    passwordReset = true;
  } else {
    userId = await findUserByEmail(tourSupabase, emailLower);
    if (!userId) {
      throw new Error(createError?.message || "Não foi possível criar nem encontrar utilizador Tour");
    }

    if (params.resetPasswordIfExists !== false) {
      const { error: updateError } = await tourSupabase.auth.admin.updateUserById(userId, {
        password,
        email_confirm: true,
        user_metadata: {
          source: "boost_saas",
          organization_slug: params.slug,
          organization_name: params.name,
        },
      });
      if (updateError) {
        console.warn(`Não foi possível repor password para ${emailLower}:`, updateError.message);
      } else {
        passwordReset = true;
      }
    }
  }

  const tier = (params.planType || "gold").toLowerCase();
  const allowedTiers = ["bronze", "silver", "gold", "platinum"];
  const normalizedTier = allowedTiers.includes(tier) ? tier : "gold";

  const { data: existingOrganizer } = await tourSupabase
    .from("organizers")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  let organizerId = existingOrganizer?.id ?? null;

  const organizerPayload = {
    user_id: userId,
    email: emailLower,
    name: params.name,
    club_name: params.name,
    source: "boost",
    subscription_plan: normalizedTier,
    organizer_tier: normalizedTier,
    subscription_status: "active",
    is_active: true,
    contract_start: params.contractStart,
    subscription_expires_at: params.contractExpiresAt,
  };

  if (existingOrganizer?.id) {
    await tourSupabase.from("organizers").update(organizerPayload).eq("id", existingOrganizer.id);
    organizerId = existingOrganizer.id;
  } else {
    const { data: inserted, error: insertError } = await tourSupabase
      .from("organizers")
      .insert(organizerPayload)
      .select("id")
      .maybeSingle();

    if (insertError) throw new Error(`Erro ao criar organizador Tour: ${insertError.message}`);
    organizerId = inserted?.id ?? null;
  }

  await tourSupabase.from("user_logo_settings").upsert(
    {
      user_id: userId,
      role: "organizer",
      is_paid_organizer: true,
      logo_url: null,
    },
    { onConflict: "user_id" },
  );

  await enableBoostSaasModules(
    tourSupabase,
    userId,
    normalizedTier,
    params.contractExpiresAt,
  );

  return {
    userId,
    isNew,
    password: passwordReset ? password : null,
    passwordReset,
    organizerId,
  };
}

const BOOST_SAAS_MODULES: Record<string, string[]> = {
  bronze: ["tournaments"],
  silver: ["tournaments", "ai_light"],
  gold: ["tournaments", "ai_light"],
  platinum: ["tournaments", "ai_light", "ai_full"],
};

async function enableBoostSaasModules(
  tourSupabase: SupabaseClient,
  userId: string,
  planType: string,
  expiresAt: string | null,
): Promise<void> {
  const modules = BOOST_SAAS_MODULES[planType] ?? BOOST_SAAS_MODULES.gold;

  for (const moduleCode of modules) {
    const { error } = await tourSupabase.from("client_modules").upsert(
      {
        entity_type: "organizer",
        entity_id: userId,
        module_code: moduleCode,
        enabled: true,
        enabled_at: new Date().toISOString(),
        expires_at: expiresAt,
        notes: `Boost SaaS Tour (${planType})`,
      },
      { onConflict: "entity_type,entity_id,module_code" },
    );

    if (error) {
      throw new Error(`Erro ao ativar módulo ${moduleCode}: ${error.message}`);
    }
  }
}

export async function getTourSupabaseClient(): Promise<SupabaseClient | null> {
  const tourUrl = Deno.env.get("TOUR_SUPABASE_URL") || "https://rqiwnxcexsccguruiteq.supabase.co";
  const tourServiceKey = Deno.env.get("TOUR_SUPABASE_SERVICE_ROLE_KEY");

  if (!tourServiceKey) {
    console.warn("TOUR_SUPABASE_SERVICE_ROLE_KEY not configured — login Tour não provisionado");
    return null;
  }

  return createClient(tourUrl, tourServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function sendTourCredentialsEmail(
  email: string,
  name: string,
  password: string,
  slug: string,
) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.log(`Tour credentials (no email): ${email} / ${password}`);
    return;
  }

  const loginUrl = (
    Deno.env.get("TOUR_APP_URL") ||
    Deno.env.get("TOUR_LOGIN_URL") ||
    "https://tour.padel1.app"
  ).replace(/\/+$/, "");
  const brandedUrl = `${loginUrl}/${slug}`;
  const html = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:#007BFF;color:white;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
      <h1 style="margin:0;">PADEL ONE Tour — SportsEvents</h1>
    </div>
    <div style="background:#f9fafb;padding:24px;border-radius:0 0 12px 12px;">
      <p>Olá ${name},</p>
      <p>A sua licença SaaS foi ativada. Utilize as credenciais abaixo para aceder à App Tour:</p>
      <div style="background:white;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #FF9900;">
        <p><strong>App Tour (login):</strong> <a href="${loginUrl}">${loginUrl}</a></p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> <code style="background:#eee;padding:4px 8px;border-radius:4px;">${password}</code></p>
        <p><strong>Entrada com marca:</strong> <a href="${brandedUrl}">${brandedUrl}</a></p>
        <p style="font-size:12px;color:#666;">A entrada com marca é a mesma App Tour com as cores deste organizador (antigo rótulo «página pública»).</p>
      </div>
      <p>Recomendamos alterar a password após o primeiro login em Definições.</p>
    </div>
  </body></html>`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: getResendFrom(),
      to: [email],
      subject: "Credenciais App Tour — SportsEvents",
      html,
    }),
  }).then(async (response) => {
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Resend API error:", errorText);
      throw new Error(`Falha ao enviar email: ${errorText}`);
    }
    console.log(`Tour credentials email sent to ${email}`);
  });
}
