import type { Metadata } from 'next'
import { TourLandingClient } from '@/components/store/tour-landing-client'
import { getTourLandingCopy } from '@/lib/boost-store/tour-landing-i18n'
import { getLocale } from '@/i18n/get-locale'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = getTourLandingCopy(locale)
  return {
    title: t.metaTitle,
    description: t.metaDescription,
  }
}

export default function StoreTourLandingPage() {
  return <TourLandingClient />
}
