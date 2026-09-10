import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DigitalCard } from '@/components/digital-card'
import {
  RESERVED_CARD_SLUGS,
  rowToProfile,
  siteBaseUrl,
  type DigitalCardRow,
} from '@/lib/cards'

type Ctx = { params: Promise<{ slug: string }> }

async function getActiveCard(slug: string) {
  if (RESERVED_CARD_SLUGS.has(slug)) return null
  const supabase = await createClient()
  const { data } = await supabase
    .from('digital_cards')
    .select('*')
    .eq('slug', slug.toLowerCase())
    .eq('active', true)
    .maybeSingle()
  return (data as DigitalCardRow | null) || null
}

export async function generateMetadata({ params }: Ctx): Promise<Metadata> {
  const { slug } = await params
  const row = await getActiveCard(slug)
  if (!row) return { title: 'Cartão — SportsEvents.app' }
  return {
    title: `${row.full_name} — SportsEvents.app`,
    description: row.title || `Cartão digital · ${row.full_name}`,
    openGraph: {
      title: `${row.full_name} — SportsEvents.app`,
      description: row.title || undefined,
      url: `${siteBaseUrl()}/${row.slug}`,
      ...(row.photo_url ? { images: [{ url: row.photo_url }] } : {}),
    },
  }
}

export default async function CardSlugPage({ params }: Ctx) {
  const { slug } = await params
  const row = await getActiveCard(slug)
  if (!row) notFound()
  return <DigitalCard profile={rowToProfile(row)} />
}
