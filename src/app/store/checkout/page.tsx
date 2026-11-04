import type { Metadata } from 'next'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'
import { CheckoutClient } from '@/components/store/checkout-client'
import { CheckoutHeading } from '@/components/store/checkout-heading'
import { getDictionary } from '@/i18n/dictionaries'
import { getLocale } from '@/i18n/get-locale'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = getDictionary(locale).store
  return { title: t.checkoutMetaTitle, description: t.metaDescription }
}

export default function LojaCheckoutPage() {
  return (
    <div className="min-h-screen bg-navy text-app-white">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-10 md:px-10 md:py-14 space-y-8">
        <CheckoutHeading />
        <CheckoutClient />
      </main>
      <SiteFooter />
    </div>
  )
}
