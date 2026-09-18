import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireStaffUser } from '@/lib/admin-auth'
import {
  rowToView,
  sanitizePackagePayload,
} from '@/lib/hub-packages-admin'
import type { HubPackageRow } from '@/lib/hub-packages'

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(request: Request, context: Ctx) {
  const auth = await requireStaffUser()
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id } = await context.params
  const body = await request.json()
  const payload = sanitizePackagePayload(body)
  if ('error' in payload) {
    return NextResponse.json({ error: payload.error }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('hub_packages')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
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

export async function DELETE(_request: Request, context: Ctx) {
  const auth = await requireStaffUser()
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id } = await context.params
  const supabase = await createClient()
  const { error } = await supabase.from('hub_packages').delete().eq('id', id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
