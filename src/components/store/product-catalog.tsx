'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { AddToCartButton } from '@/components/store/add-to-cart-button'
import { formatEuro } from '@/lib/boost-store/products'
import type { BoostCategory, BoostProduct } from '@/lib/boost-store/types'
import { withLocale, type Locale } from '@/i18n/config'

type CatalogCopy = {
  filterAll: string
  featured: string
  digital: string
  soldOut: string
  addToCart: string
  added: string
  learnMore: string
  empty: string
  onlyLeft: string
}

export function ProductCatalog({
  products,
  categories,
  locale,
  numberLocale,
  copy,
}: {
  products: BoostProduct[]
  categories: BoostCategory[]
  locale: Locale
  numberLocale: string
  copy: CatalogCopy
}) {
  const [category, setCategory] = useState('all')

  const filtered = useMemo(() => {
    if (category === 'all') return products
    const cat = categories.find((c) => c.slug === category)
    if (!cat) return products
    return products.filter((p) => p.category_id === cat.id)
  }, [products, categories, category])

  return (
    <div className="space-y-10">
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
            label={c.name}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-app-white/50">{copy.empty}</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => {
            const href = product.learn_more_url
              ? product.learn_more_url
              : withLocale(`/store/${product.id}`, locale)
            const external = Boolean(product.learn_more_url)

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
                  <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-white">
                    <Link href={href}>{product.name}</Link>
                  </h2>
                  <p className="line-clamp-2 text-sm text-app-white/55">
                    {product.short_description || product.description || ''}
                  </p>
                  <div className="flex items-end justify-between gap-3 pt-1">
                    <div>
                      {product.compare_at_price ? (
                        <p className="text-xs text-app-white/35 line-through">
                          {formatEuro(Number(product.compare_at_price), numberLocale)}
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
                    <p className="text-sm font-semibold text-red-400">{copy.soldOut}</p>
                  ) : null}
                  {!product.is_digital &&
                  product.stock > 0 &&
                  product.stock <= 5 ? (
                    <p className="text-sm text-gold">
                      {copy.onlyLeft.replace('{n}', String(product.stock))}
                    </p>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      )}
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
