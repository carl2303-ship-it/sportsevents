import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireStaffUser } from '@/lib/admin-auth'
import {
  rowToView,
  type HubPackageRow,
  type HubPackageWrite,
  type PackageKey,
} from '@/lib/hub-packages'

const KEYS: PackageKey[] = ['weekend', 'experience', 'premium']

function sanitizePayload(body: Partial<HubPackageWrite>): HubPackageWrite | { error: string } {
  const package_key = body.package_key as PackageKey
  if (!KEYS.includes(package_key)) {
    return { error: 'package_key inválido.' }
  }
  const name = String(body.name || '').trim()
  if (!name) return { error: 'Nome é obrigatório.' }
  if (!body.destination_id) return { error: 'Destino é obrigatório.' }

  return {
    destination_id: body.destination_id,
    package_key,
    name,
    duration: String(body.duration || '').trim(),
    schedule: String(body.schedule || '').trim(),
    concept: String(body.concept || '').trim(),
    featured: Boolean(body.featured),
    court_hours: Number(body.court_hours) || 0,
    coach_hours: Number(body.coach_hours) || 0,
    local_match_hours: Number(body.local_match_hours) || 0,
    tournament_hours: Number(body.tournament_hours) || 0,
    nights: Number(body.nights) || 0,
    itinerary: Array.isArray(body.itinerary) ? body.itinerary : [],
    price_bb_double: Number(body.price_bb_double) || 0,
    price_bb_single: Number(body.price_bb_single) || 0,
    price_hb_double: Number(body.price_hb_double) || 0,
    price_hb_single: Number(body.price_hb_single) || 0,
    price_full_double: Number(body.price_full_double) || 0,
    price_full_single: Number(body.price_full_single) || 0,
    airport_label: String(body.airport_label || '').trim(),
    local_network: String(body.local_network || '').trim(),
    inclusions: Array.isArray(body.inclusions)
      ? body.inclusions.map(String)
      : [],
    routine: Array.isArray(body.routine) ? body.routine : [],
    published: body.published !== false,
    sort_order: Number(body.sort_order) || 0,
  }
}

export async function GET() {
  const auth = await requireStaffUser()
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const supabase = await createClient()
  const [{ data: packages, error }, { data: destinations }] = await Promise.all([
    supabase
      .from('hub_packages')
      .select('*, destinations(id, code, name)')
      .order('sort_order', { ascending: true }),
    supabase
      .from('destinations')
      .select('id, code, name')
      .in('code', ['ALG', 'BCN', 'MAR'])
      .order('name'),
  ])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    packages: ((packages || []) as HubPackageRow[]).map(rowToView),
    destinations: destinations || [],
  })
}

export async function POST(request: Request) {
  const auth = await requireStaffUser()
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const body = await request.json()
  const payload = sanitizePayload(body)
  if ('error' in payload) {
    return NextResponse.json({ error: payload.error }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('hub_packages')
    .insert({ ...payload, updated_at: new Date().toISOString() })
    .select('*, destinations(id, code, name)')
    .single()

  if (error) {
    const msg =
      error.code === '23505'
        ? 'Já existe este pacote neste destino.'
        : error.message
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  return NextResponse.json({ package: rowToView(data as HubPackageRow) })
}
