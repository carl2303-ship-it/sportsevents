'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getBoostStoreBrowserClient } from '@/lib/boost-store/client'
import type { EbookFunnel, EbookFunnelAsset } from '@/lib/boost-store/funnels'

const LABELS: Record<string, string> = {
  ebook_pdf: 'PDF ebook',
  upsell: 'Upsell',
  downsell: 'Downsell',
  thankyou_bonus: 'Materiais thank-you / bónus',
  cover: 'Capa',
  landing_image: 'Imagem landing',
  cheat_sheet: 'Materiais thank-you / bónus',
  mental_cheat_sheet: 'Materiais thank-you / bónus',
  audio: 'Materiais thank-you / bónus',
  upsell_video: 'Upsell',
}

const ORDER_SINGLE = [
  'ebook_pdf',
  'thankyou_bonus',
  'cheat_sheet',
  'audio',
  'cover',
]
const ORDER_BUNDLE = [
  'ebook_pdf',
  'upsell',
  'upsell_video',
  'downsell',
  'thankyou_bonus',
  'cheat_sheet',
  'mental_cheat_sheet',
  'audio',
  'cover',
]

export function FunnelThankYouClient({
  funnel,
  initialAssets,
}: {
  funnel: EbookFunnel
  initialAssets: EbookFunnelAsset[]
}) {
  const search = useSearchParams()
  const bundle = search.get('bundle') === '1'
  const [assets, setAssets] = useState(initialAssets)

  useEffect(() => {
    if (initialAssets.length) return
    const supabase = getBoostStoreBrowserClient()
    void supabase
      .from('ebook_funnel_assets')
      .select('kind, public_url, language, file_name')
      .eq('funnel_id', funnel.id)
      .then(({ data }) => {
        if (data) setAssets(data as EbookFunnelAsset[])
      })
  }, [funnel.id, initialAssets.length])

  const lang = (funnel.languages && funnel.languages[0]) || 'pt'
  const preferred = assets.filter((a) => a.language === lang)
  const fallback = assets.filter((a) => a.language === 'pt')
  const byKind = new Map<string, EbookFunnelAsset>()
  for (const a of fallback) byKind.set(a.kind, a)
  for (const a of preferred) byKind.set(a.kind, a)

  const order = bundle ? ORDER_BUNDLE : ORDER_SINGLE
  const items = order
    .map((kind) => byKind.get(kind))
    .filter((a): a is EbookFunnelAsset => Boolean(a?.public_url))

  return (
    <div className="min-h-screen bg-navy px-5 py-16 text-app-white md:px-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan">
          SportsEvents
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-extrabold">
          Obrigado pela compra
        </h1>
        <p className="text-app-white/65">
          {bundle
            ? 'Recebeste o pack completo (ebook + upsell). Os links também foram enviados por email.'
            : 'Os materiais foram enviados para o teu email. Também podes descarregar abaixo.'}
        </p>
        <ul className="space-y-3">
          {items.map((a) => (
            <li key={`${a.kind}-${a.public_url}`}>
              <a
                href={a.public_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-semibold text-cyan hover:border-cyan/40"
              >
                <span>{LABELS[a.kind] || a.file_name || a.kind}</span>
                <span className="text-xs text-app-white/45">Download →</span>
              </a>
            </li>
          ))}
        </ul>
        {items.length === 0 ? (
          <p className="text-sm text-app-white/45">
            Materiais a sincronizar — verifica o teu email.
          </p>
        ) : null}
      </div>
    </div>
  )
}
