import type { Metadata } from 'next'
import { FunnelLandingClient } from '@/components/store/funnel-landing-client'
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
  if (!slug) return { title: 'Funil — SportsEvents.app' }
  const funnel = await getActiveFunnelBySlug(slug)
  return {
    title: funnel ? `${funnel.title} — SportsEvents.app` : 'Funil — SportsEvents.app',
  }
}

export default async function StoreFunnelPage({ searchParams }: PageProps) {
  const { slug } = await searchParams
  if (!slug) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy px-5 text-center text-app-white">
        <p>Falta o parâmetro ?slug= na URL.</p>
      </div>
    )
  }

  const funnel = await getActiveFunnelBySlug(slug)
  if (!funnel) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy px-5 text-center text-app-white">
        <p>Funil não encontrado ou ainda em rascunho.</p>
      </div>
    )
  }

  const assets = await listFunnelAssets(funnel.id)

  return (
    <FunnelLandingClient funnel={funnel} assets={assets} slug={slug} />
  )
}
