import { createBoostStoreClient } from '@/lib/boost-store/client'

export type EbookFunnel = {
  id: string
  slug: string
  title: string
  status: string
  ebook_price_cents: number
  upsell_price_cents: number
  ebook_product_type: string
  upsell_product_type: string
  stripe_ebook_name?: string | null
  stripe_upsell_name?: string | null
  headline?: string | null
  subheadline?: string | null
  cta_label?: string | null
  languages?: string[] | null
  landing_body?: {
    benefits?: string[]
    body_markdown?: string
    images?: string[]
    tone?: string
  } | null
}

export type EbookFunnelAsset = {
  kind: string
  public_url: string | null
  language: string
  file_name?: string | null
}

export async function getActiveFunnelBySlug(
  slug: string
): Promise<EbookFunnel | null> {
  const supabase = createBoostStoreClient()
  const { data, error } = await supabase
    .from('ebook_funnels')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .maybeSingle()
  if (error) {
    console.error('[funnel]', error.message)
    return null
  }
  return (data as EbookFunnel) || null
}

export async function listFunnelAssets(
  funnelId: string
): Promise<EbookFunnelAsset[]> {
  const supabase = createBoostStoreClient()
  const { data, error } = await supabase
    .from('ebook_funnel_assets')
    .select('kind, public_url, language, file_name')
    .eq('funnel_id', funnelId)
  if (error) {
    console.error('[funnel assets]', error.message)
    return []
  }
  return (data as EbookFunnelAsset[]) || []
}

export function eurosFromCents(cents: number): string {
  return `€${(Number(cents) / 100).toFixed(2)}`
}

export function simpleMarkdown(md: string): string {
  if (!md) return ''
  const escape = (s: string) =>
    String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  const lines = String(md).replace(/\r\n/g, '\n').split('\n')
  const out: string[] = []
  let inList = false
  const flushList = () => {
    if (inList) {
      out.push('</ul>')
      inList = false
    }
  }
  const inline = (t: string) =>
    escape(t)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) {
      flushList()
      continue
    }
    if (/^###\s+/.test(line)) {
      flushList()
      out.push(`<h3>${inline(line.replace(/^###\s+/, ''))}</h3>`)
      continue
    }
    if (/^##\s+/.test(line)) {
      flushList()
      out.push(`<h2>${inline(line.replace(/^##\s+/, ''))}</h2>`)
      continue
    }
    if (/^[-*]\s+/.test(line)) {
      if (!inList) {
        out.push('<ul>')
        inList = true
      }
      out.push(`<li>${inline(line.replace(/^[-*]\s+/, ''))}</li>`)
      continue
    }
    flushList()
    out.push(`<p>${inline(line)}</p>`)
  }
  flushList()
  return out.join('\n')
}
