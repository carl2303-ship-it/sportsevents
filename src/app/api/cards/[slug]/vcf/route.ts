import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  buildVcf,
  siteBaseUrl,
  type DigitalCardRow,
} from '@/lib/cards'

type Ctx = { params: Promise<{ slug: string }> }

export async function GET(_request: Request, context: Ctx) {
  const { slug } = await context.params
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('digital_cards')
    .select('*')
    .eq('slug', slug.toLowerCase())
    .eq('active', true)
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json({ error: 'Cartão não encontrado' }, { status: 404 })
  }

  const vcf = buildVcf(data as DigitalCardRow, siteBaseUrl())
  return new NextResponse(vcf, {
    status: 200,
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${data.slug}.vcf"`,
      'Cache-Control': 'public, max-age=60',
    },
  })
}
