import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/admin'
import { maskSecret, requireAdminUser } from '@/lib/admin-auth'

const ALLOWED_KEYS = [
  'stripe_secret_key',
  'stripe_publishable_key',
  'site_url',
  'support_email',
  'company_name',
] as const

type SettingKey = (typeof ALLOWED_KEYS)[number]

function envStatus() {
  return {
    stripe_secret_key: Boolean(process.env.STRIPE_SECRET_KEY),
    stripe_publishable_key: Boolean(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    ),
    site_url: Boolean(
      process.env.NEXT_PUBLIC_SITE_URL || process.env.URL
    ),
    service_role: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  }
}

export async function GET() {
  const auth = await requireAdminUser()
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const client = createServiceClient() || (await createClient())
  const { data, error } = await client.from('app_settings').select('*')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const settings = (data || []).map((row) => ({
    key: row.key,
    label: row.label,
    is_secret: row.is_secret,
    value: row.is_secret ? '' : row.value || '',
    masked: row.is_secret ? maskSecret(row.value) : null,
    has_value: Boolean(row.value),
    updated_at: row.updated_at,
  }))

  return NextResponse.json({
    settings,
    env: envStatus(),
    isBootstrap: auth.isBootstrap,
  })
}

export async function PUT(request: Request) {
  const auth = await requireAdminUser()
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const body = await request.json()
  const values = (body.values || {}) as Partial<Record<SettingKey, string>>

  const client = createServiceClient() || (await createClient())
  const now = new Date().toISOString()
  const upserts: {
    key: string
    value: string | null
    updated_at: string
    updated_by: string
  }[] = []

  for (const key of ALLOWED_KEYS) {
    if (!(key in values)) continue
    const raw = values[key]
    // Empty secret field = keep existing (don't wipe accidentally)
    if (
      (key === 'stripe_secret_key' || key === 'stripe_publishable_key') &&
      (raw === undefined || raw === '')
    ) {
      continue
    }
    upserts.push({
      key,
      value: raw?.trim() ? raw.trim() : null,
      updated_at: now,
      updated_by: auth.user!.id,
    })
  }

  if (upserts.length === 0) {
    return NextResponse.json({ ok: true, updated: 0 })
  }

  for (const row of upserts) {
    const { error } = await client.from('app_settings').upsert(
      {
        key: row.key,
        value: row.value,
        updated_at: row.updated_at,
        updated_by: row.updated_by,
        is_secret: row.key === 'stripe_secret_key',
        label:
          row.key === 'stripe_secret_key'
            ? 'Stripe Secret Key'
            : row.key === 'stripe_publishable_key'
              ? 'Stripe Publishable Key'
              : row.key === 'site_url'
                ? 'URL pública do site'
                : row.key === 'support_email'
                  ? 'Email de suporte'
                  : 'Nome da empresa',
      },
      { onConflict: 'key' }
    )
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true, updated: upserts.length })
}
