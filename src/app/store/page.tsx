import type { Metadata } from 'next'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'
import { ProductCatalog } from '@/components/store/product-catalog'
import { StoreCartLink } from '@/components/store/store-cart-link'
import {
  localizeStoreCategories,
  localizeStoreProducts,
} from '@/lib/boost-store/localize'
import {
  listActiveBrands,
  listActiveCategories,
  listActiveProducts,
} from '@/lib/boost-store/products'
import { numberLocaleFor } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { getLocale } from '@/i18n/get-locale'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = getDictionary(locale).store
  return { title: t.metaTitle, description: t.metaDescription }
}

export default async function StorePage() {
  const locale = await getLocale()
  const t = getDictionary(locale).store
  const [rawProducts, rawCategories, brands] = await Promise.all([
    listActiveProducts(),
    listActiveCategories(),
    listActiveBrands(),
  ])

  const products = localizeStoreProducts(rawProducts, locale)
  const categories = localizeStoreCategories(rawCategories, locale)

  return (
    <div className="min-h-screen bg-navy text-app-white">
      <SiteHeader />
      <main className="px-5 md:px-10 pb-20">
        <section className="relative mx-auto mt-6 max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-cyan/15 via-navy to-gold/10 px-6 py-14 md:px-12 md:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(6,182,212,0.18),_transparent_50%)]" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-3">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-gold">
                {t.eyebrow}
              </p>
              <h1 className="font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                {t.title}
              </h1>
              <p className="text-base text-app-white/65 md:text-lg">{t.lead}</p>
            </div>
            <StoreCartLink locale={locale} label={t.cart} />
          </div>
        </section>

        <section className="mx-auto mt-12 max-w-7xl">
          <ProductCatalog
            products={products}
            categories={categories}
            brands={brands}
            locale={locale}
            numberLocale={numberLocaleFor(locale)}
            copy={{
              filterAll: t.filterAll,
              filtersTitle: t.filtersTitle,
              categoriesTitle: t.categoriesTitle,
              brandsTitle: t.brandsTitle,
              priceTitle: t.priceTitle,
              allProducts: t.allProducts,
              allBrands: t.allBrands,
              priceAll: t.priceAll,
              price0to20: t.price0to20,
              price20to40: t.price20to40,
              price40plus: t.price40plus,
              featured: t.featured,
              digital: t.digital,
              soldOut: t.soldOut,
              addToCart: t.addToCart,
              added: t.added,
              learnMore: t.learnMore,
              empty: t.empty,
              onlyLeft: t.onlyLeft,
              categoryTitle: t.categoryTitle,
              categoryDescription: t.categoryDescription,
            }}
          />
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
