import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'
import { CheckoutClient } from '@/components/store/checkout-client'
import { numberLocaleFor, withLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { getLocale } from '@/i18n/get-locale'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = getDictionary(locale).store
  return { title: t.checkoutMetaTitle, description: t.metaDescription }
}

export default async function LojaCheckoutPage() {
  const locale = await getLocale()
  const t = getDictionary(locale).store

  return (
    <div className="min-h-screen bg-navy text-app-white">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-10 md:px-10 md:py-14 space-y-8">
        <div>
          <Link
            href={withLocale('/loja', locale)}
            className="text-sm text-app-white/55 hover:text-cyan"
          >
            ← {t.backToStore}
          </Link>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-extrabold md:text-4xl">
            {t.checkoutTitle}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-app-white/55">{t.checkoutLead}</p>
        </div>

        <CheckoutClient
          locale={locale}
          numberLocale={numberLocaleFor(locale)}
          copy={{
            empty: t.cartEmpty,
            continueShopping: t.continueShopping,
            title: t.checkoutTitle,
            orderSummary: t.orderSummary,
            subtotal: t.subtotal,
            shipping: t.shipping,
            total: t.total,
            remove: t.remove,
            customer: t.customer,
            name: t.name,
            email: t.email,
            phone: t.phone,
            nif: t.nif,
            address: t.address,
            postal: t.postal,
            city: t.city,
            country: t.country,
            notes: t.notes,
            placeOrder: t.placeOrder,
            processing: t.processing,
            selectShipping: t.selectShipping,
            paymentSuccess: t.paymentSuccess,
            paymentCanceled: t.paymentCanceled,
            backToStore: t.backToStore,
            shipDigital: t.shipDigital,
            shipDigitalDays: t.shipDigitalDays,
            shipFree: t.shipFree,
            shipStandard: t.shipStandard,
            shipExpress: t.shipExpress,
            days35: t.days35,
            days12: t.days12,
            days57: t.days57,
            days47: t.days47,
            days710: t.days710,
            countryPt: t.countryPt,
            countryPtIslands: t.countryPtIslands,
            countryEs: t.countryEs,
            countryEu: t.countryEu,
            countryWorld: t.countryWorld,
            errorGeneric: t.errorGeneric,
          }}
        />
      </main>
      <SiteFooter />
    </div>
  )
}
