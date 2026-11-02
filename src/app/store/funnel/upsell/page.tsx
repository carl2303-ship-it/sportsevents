import type { Metadata } from 'next'
import { Suspense } from 'react'
import { FunnelUpsellClient } from '@/components/store/funnel-upsell-client'
import { getActiveFunnelBySlug } from '@/lib/boost-store/funnels'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams: Promise<{ slug?: string }>
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { slug } = await searchParams
  const funnel = slug ? await getActiveFunnelBySlug(slug) : null
  return {
    title: funnel
      ? `Oferta — ${funnel.title}`
      : 'Oferta especial — SportsEvents.app',
  }
}

export default async function StoreFunnelUpsellPage({
  searchParams,
}: PageProps) {
  const { slug } = await searchParams
  if (!slug) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy text-app-white">
        Falta ?slug=
      </div>
    )
  }
  const funnel = await getActiveFunnelBySlug(slug)
  if (!funnel) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy text-app-white">
        Funil não encontrado.
      </div>
    )
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-navy text-app-white/60">
          …
        </div>
      }
    >
      <FunnelUpsellClient funnel={funnel} slug={slug} />
    </Suspense>
  )
}
