import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  HUB_ID_TO_CODE,
  rowToView,
  type HubId,
  type HubPackageRow,
} from '@/lib/hub-packages'

/** Public list of published packages (optional ?hub=algarve|barcelona|marbella). */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const hub = searchParams.get('hub') as HubId | null
  const supabase = await createClient()

  let query = supabase
    .from('hub_packages')
    .select('*, destinations!inner(id, code, name)')
    .eq('published', true)
    .order('sort_order', { ascending: true })

  if (hub && HUB_ID_TO_CODE[hub]) {
    query = query.eq('destinations.code', HUB_ID_TO_CODE[hub])
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    packages: ((data || []) as HubPackageRow[]).map(rowToView),
  })
}
