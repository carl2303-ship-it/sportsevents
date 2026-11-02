import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'
import { AddToCartButton } from '@/components/store/add-to-cart-button'
import { StoreCartLink } from '@/components/store/store-cart-link'
import { formatEuro, getProductById } from '@/lib/boost-store/products'
import { numberLocaleFor, withLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { getLocale } from '@/i18n/get-locale'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ id: string }> }

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params
  const product = await getProductById(id)
  if (!product) return { title: 'Loja — SportsEvents.app' }
  return {
    title: `${product.name} — SportsEvents.app`,
    description: product.short_description || product.description || undefined,
  }
}

export default async function LojaProductPage({ params }: PageProps) {
  const { id } = await params
  const locale = await getLocale()
  const t = getDictionary(locale).store
  const product = await getProductById(id)
  if (!product) notFound()

  const numberLocale = numberLocaleFor(locale)

  return (
    <div className="min-h-screen bg-navy text-app-white">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-14">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <Link
            href={withLocale('/loja', locale)}
            className="text-sm text-app-white/55 hover:text-cyan"
          >
            ← {t.backToStore}
          </Link>
          <StoreCartLink locale={locale} label={t.cart} />
        </div>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-black/30">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-cyan/25 via-navy to-gold/15" />
            )}
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gold">
                {product.category?.name || t.eyebrow}
              </p>
              <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold text-white md:text-4xl">
                {product.name}
              </h1>
              {product.brand?.name ? (
                <p className="mt-2 text-sm text-app-white/45">{product.brand.name}</p>
              ) : null}
            </div>

            <div className="flex items-baseline gap-3">
              {product.compare_at_price ? (
                <span className="text-lg text-app-white/35 line-through">
                  {formatEuro(Number(product.compare_at_price), numberLocale)}
                </span>
              ) : null}
              <span className="text-3xl font-extrabold text-cyan">
                {formatEuro(Number(product.price), numberLocale)}
              </span>
            </div>

            <p className="whitespace-pre-line text-sm leading-relaxed text-app-white/70 md:text-base">
              {product.description || product.short_description || ''}
            </p>

            {!product.is_digital && product.stock === 0 ? (
              <p className="font-semibold text-red-400">{t.soldOut}</p>
            ) : (
              <AddToCartButton
                product={product}
                label={t.addToCart}
                addedLabel={t.added}
              />
            )}

            <p className="text-xs text-app-white/40">
              {t.legalNote}{' '}
              <Link
                href={withLocale('/privacidade', locale)}
                className="text-cyan hover:underline"
              >
                {t.privacy}
              </Link>
              {' · '}
              <Link
                href={withLocale('/termos', locale)}
                className="text-cyan hover:underline"
              >
                {t.terms}
              </Link>
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
