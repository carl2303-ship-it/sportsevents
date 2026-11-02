import type { Metadata } from 'next'
import { Suspense } from 'react'
import { FunnelThankYouClient } from '@/components/store/funnel-thank-you-client'
import {
  getActiveFunnelBySlug,
  listFunnelAssets,
} from '@/lib/boost-store/funnels'

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
      ? `Obrigado — ${funnel.title}`
      : 'Obrigado — SportsEvents.app',
  }
}

export default async function StoreFunnelThankYouPage({
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
  const assets = await listFunnelAssets(funnel.id)

  return (
    <Suspense fallback={<div className="min-h-screen bg-navy" />}>
      <FunnelThankYouClient funnel={funnel} initialAssets={assets} />
    </Suspense>
  )
}
