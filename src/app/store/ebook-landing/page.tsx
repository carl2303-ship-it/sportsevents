import type { Metadata } from 'next'
import { EbookLandingClient } from '@/components/store/ebook-landing-client'
import { getLocale } from '@/i18n/get-locale'
import type { Locale } from '@/i18n/config'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const titles: Record<Locale, string> = {
    pt: 'Guia Completo de Equipamento de Padel - Ebook Gratuito | SportsEvents',
    en: 'Complete Padel Equipment Guide - Free Ebook | SportsEvents',
    es: 'Guía Completa de Equipamiento de Padel - Ebook Gratuito | SportsEvents',
    fr: "Guide Complet de l'Équipement Padel - Ebook Gratuit | SportsEvents",
    de: 'Kompletter Padel-Ausrüstungsguide - Kostenloses Ebook | SportsEvents',
  }
  return {
    title: titles[locale] || titles.pt,
    description:
      'Descubra o que realmente faz diferença no equipamento de padel. Download gratuito do guia completo.',
  }
}

export default function EbookLandingPage() {
  return <EbookLandingClient />
}
