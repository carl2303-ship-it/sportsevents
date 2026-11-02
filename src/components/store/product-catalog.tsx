'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { AddToCartButton } from '@/components/store/add-to-cart-button'
import { formatEuro } from '@/lib/boost-store/products'
import {
  stripHtml,
  type BoostBrand,
  type BoostCategory,
  type BoostProduct,
} from '@/lib/boost-store/types'
import { withLocale, type Locale } from '@/i18n/config'

type CatalogCopy = {
  filterAll: string
  filtersTitle: string
  categoriesTitle: string
  brandsTitle: string
  priceTitle: string
  allProducts: string
  allBrands: string
  priceAll: string
  price0to20: string
  price20to40: string
  price40plus: string
  featured: string
  digital: string
  soldOut: string
  addToCart: string
  added: string
  learnMore: string
  empty: string
  onlyLeft: string
  categoryTitle: string
  categoryDescription: string
}

export function ProductCatalog({
  products,
  categories,
  brands,
  locale,
  numberLocale,
  copy,
}: {
  products: BoostProduct[]
  categories: BoostCategory[]
  brands: BoostBrand[]
  locale: Locale
  numberLocale: string
  copy: CatalogCopy
}) {
  const [category, setCategory] = useState('all')
  const [brand, setBrand] = useState('all')
  const [priceRange, setPriceRange] = useState('all')

  const filtered = useMemo(() => {
    let list = products
    if (category !== 'all') {
      const cat = categories.find((c) => c.slug === category)
      if (cat) list = list.filter((p) => p.category_id === cat.id)
    }
    if (brand !== 'all') {
      const b = brands.find((x) => x.slug === brand)
      if (b) list = list.filter((p) => p.brand_id === b.id)
    }
    if (priceRange !== 'all') {
      list = list.filter((p) => {
        const price = Number(p.price)
        if (priceRange === '0-20') return price <= 20
        if (priceRange === '20-40') return price > 20 && price <= 40
        if (priceRange === '40+') return price > 40
        return true
      })
    }
    return list
  }, [products, categories, brands, category, brand, priceRange])

  const activeCategory =
    category === 'all'
      ? null
      : categories.find((c) => c.slug === category) || null

  return (
    <div className="space-y-8">
      {/* Top category chips — like legacy store */}
      <div className="flex flex-wrap justify-center gap-2">
        <FilterChip
          active={category === 'all'}
          onClick={() => setCategory('all')}
          label={copy.filterAll}
        />
        {categories.map((c) => (
          <FilterChip
            key={c.id}
            active={category === c.slug}
            onClick={() => setCategory(c.slug)}
            label={c.shortName || c.name}
          />
        ))}
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 space-y-6 rounded-2xl border border-white/10 bg-black/25 p-6">
            <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-white">
              {copy.filtersTitle}
            </h3>

            <FilterGroup title={copy.categoriesTitle}>
              <SidebarBtn
                active={category === 'all'}
                onClick={() => setCategory('all')}
                label={copy.allProducts}
              />
              {categories.map((c) => (
                <SidebarBtn
                  key={c.id}
                  active={category === c.slug}
                  onClick={() => setCategory(c.slug)}
                  label={c.name}
                />
              ))}
            </FilterGroup>

            <FilterGroup title={copy.brandsTitle} bordered>
              <SidebarBtn
                active={brand === 'all'}
                onClick={() => setBrand('all')}
                label={copy.allBrands}
              />
              {brands.map((b) => (
                <SidebarBtn
                  key={b.id}
                  active={brand === b.slug}
                  onClick={() => setBrand(b.slug)}
                  label={b.name}
                />
              ))}
            </FilterGroup>

            <FilterGroup title={copy.priceTitle} bordered>
              <SidebarBtn
                active={priceRange === 'all'}
                onClick={() => setPriceRange('all')}
                label={copy.priceAll}
              />
              <SidebarBtn
                active={priceRange === '0-20'}
                onClick={() => setPriceRange('0-20')}
                label={copy.price0to20}
              />
              <SidebarBtn
                active={priceRange === '20-40'}
                onClick={() => setPriceRange('20-40')}
                label={copy.price20to40}
              />
              <SidebarBtn
                active={priceRange === '40+'}
                onClick={() => setPriceRange('40+')}
                label={copy.price40plus}
              />
            </FilterGroup>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-6">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white">
              {activeCategory?.name || copy.categoryTitle}
            </h2>
            <p className="mt-1 text-sm text-app-white/50">
              {activeCategory?.description || copy.categoryDescription}
            </p>
          </div>

          {/* Mobile brand/price chips */}
          <div className="flex flex-wrap gap-2 lg:hidden">
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-xs text-app-white"
            >
              <option value="all">{copy.allBrands}</option>
              {brands.map((b) => (
                <option key={b.id} value={b.slug}>
                  {b.name}
                </option>
              ))}
            </select>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-xs text-app-white"
            >
              <option value="all">{copy.priceAll}</option>
              <option value="0-20">{copy.price0to20}</option>
              <option value="20-40">{copy.price20to40}</option>
              <option value="40+">{copy.price40plus}</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-app-white/50">
              {copy.empty}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((product) => {
                const href = product.learn_more_url
                  ? product.learn_more_url
                  : withLocale(`/store/${product.id}`, locale)
                const external = Boolean(product.learn_more_url)
                const blurb = stripHtml(
                  product.short_description || product.description || ''
                )

                return (
                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-2xl border border-white/10 bg-black/20 transition hover:border-cyan/35"
                  >
                    <Link
                      href={href}
                      {...(external
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                      className="block"
                    >
                      <div className="relative aspect-[4/3] bg-navy">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover opacity-90 transition group-hover:opacity-100"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-cyan/20 via-navy to-gold/10" />
                        )}
                        {product.compare_at_price &&
                        Number(product.compare_at_price) >
                          Number(product.price) ? (
                          <span className="absolute right-3 top-3 rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold text-navy">
                            -
                            {Math.round(
                              (1 -
                                Number(product.price) /
                                  Number(product.compare_at_price)) *
                                100
                            )}
                            %
                          </span>
                        ) : null}
                        {product.is_featured ? (
                          <span className="absolute left-3 top-3 rounded-full bg-cyan px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-navy">
                            {copy.featured}
                          </span>
                        ) : null}
                        {product.is_digital ? (
                          <span className="absolute bottom-3 left-3 rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-navy">
                            {copy.digital}
                          </span>
                        ) : null}
                      </div>
                    </Link>
                    <div className="space-y-3 p-5">
                      <p className="text-xs uppercase tracking-wider text-app-white/40">
                        {product.category?.name || '—'}
                      </p>
                      <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-white">
                        <Link href={href}>{product.name}</Link>
                      </h3>
                      {blurb ? (
                        <p className="line-clamp-2 text-sm text-app-white/55">
                          {blurb}
                        </p>
                      ) : null}
                      <div className="flex items-end justify-between gap-3 pt-1">
                        <div>
                          {product.compare_at_price ? (
                            <p className="text-xs text-app-white/35 line-through">
                              {formatEuro(
                                Number(product.compare_at_price),
                                numberLocale
                              )}
                            </p>
                          ) : null}
                          <p className="text-xl font-extrabold text-cyan">
                            {formatEuro(Number(product.price), numberLocale)}
                          </p>
                        </div>
                        {product.learn_more_url ? (
                          <Link
                            href={product.learn_more_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex rounded-xl border border-cyan/40 px-4 py-2.5 text-sm font-bold text-cyan hover:bg-cyan/10"
                          >
                            {copy.learnMore}
                          </Link>
                        ) : (
                          <AddToCartButton
                            product={product}
                            label={copy.addToCart}
                            addedLabel={copy.added}
                          />
                        )}
                      </div>
                      {!product.is_digital && product.stock === 0 ? (
                        <p className="text-sm font-semibold text-red-400">
                          {copy.soldOut}
                        </p>
                      ) : null}
                      {!product.is_digital &&
                      product.stock > 0 &&
                      product.stock <= 5 ? (
                        <p className="text-sm text-gold">
                          {copy.onlyLeft.replace(
                            '{n}',
                            String(product.stock)
                          )}
                        </p>
                      ) : null}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${
        active
          ? 'bg-cyan text-navy'
          : 'border border-white/15 bg-black/20 text-app-white/70 hover:border-cyan/40 hover:text-app-white'
      }`}
    >
      {label}
    </button>
  )
}

function FilterGroup({
  title,
  bordered,
  children,
}: {
  title: string
  bordered?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={bordered ? 'border-t border-white/10 pt-6' : ''}>
      <h4 className="mb-3 text-sm font-bold text-app-white/90">{title}</h4>
      <ul className="space-y-1 text-sm">{children}</ul>
    </div>
  )
}

function SidebarBtn({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`w-full rounded-lg px-3 py-2 text-left transition ${
          active
            ? 'bg-cyan font-semibold text-navy'
            : 'text-app-white/70 hover:bg-white/5 hover:text-app-white'
        }`}
      >
        {label}
      </button>
    </li>
  )
}
