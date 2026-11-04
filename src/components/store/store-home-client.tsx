'use client'

import { useMemo } from 'react'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'
import { ProductCatalog } from '@/components/store/product-catalog'
import { StoreCartLink } from '@/components/store/store-cart-link'
import {
  localizeStoreCategories,
  localizeStoreProducts,
} from '@/lib/boost-store/localize'
import type {
  BoostBrand,
  BoostCategory,
  BoostProduct,
} from '@/lib/boost-store/types'
import { numberLocaleFor } from '@/i18n/config'
import { useDictionary } from '@/i18n/use-locale'

/**
 * Client store home so locale soft-nav (rewrite i18n) re-localizes copy + products
 * without a full page refresh.
 */
export function StoreHomeClient({
  rawProducts,
  rawCategories,
  brands,
}: {
  rawProducts: BoostProduct[]
  rawCategories: BoostCategory[]
  brands: BoostBrand[]
}) {
  const { locale, t } = useDictionary()
  const s = t.store

  const products = useMemo(
    () => localizeStoreProducts(rawProducts, locale),
    [rawProducts, locale]
  )
  const categories = useMemo(
    () => localizeStoreCategories(rawCategories, locale),
    [rawCategories, locale]
  )

  return (
    <div className="min-h-screen bg-navy text-app-white">
      <SiteHeader />
      <main className="px-5 md:px-10 pb-20">
        <section className="relative mx-auto mt-6 max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-cyan/15 via-navy to-gold/10 px-6 py-14 md:px-12 md:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(6,182,212,0.18),_transparent_50%)]" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-3">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-gold">
                {s.eyebrow}
              </p>
              <h1 className="font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                {s.title}
              </h1>
              <p className="text-base text-app-white/65 md:text-lg">{s.lead}</p>
            </div>
            <StoreCartLink locale={locale} label={s.cart} />
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
              filterAll: s.filterAll,
              filtersTitle: s.filtersTitle,
              categoriesTitle: s.categoriesTitle,
              brandsTitle: s.brandsTitle,
              priceTitle: s.priceTitle,
              allProducts: s.allProducts,
              allBrands: s.allBrands,
              priceAll: s.priceAll,
              price0to20: s.price0to20,
              price20to40: s.price20to40,
              price40plus: s.price40plus,
              featured: s.featured,
              digital: s.digital,
              soldOut: s.soldOut,
              addToCart: s.addToCart,
              added: s.added,
              learnMore: s.learnMore,
              empty: s.empty,
              onlyLeft: s.onlyLeft,
              categoryTitle: s.categoryTitle,
              categoryDescription: s.categoryDescription,
            }}
          />
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
