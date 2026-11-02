import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'
import { AddToCartButton } from '@/components/store/add-to-cart-button'
import { ProductGallery } from '@/components/store/product-gallery'
import { StoreCartLink } from '@/components/store/store-cart-link'
import { localizeStoreProduct } from '@/lib/boost-store/localize'
import { formatEuro, getProductById } from '@/lib/boost-store/products'
import {
  productFeatures,
  productImageList,
  stripHtml,
} from '@/lib/boost-store/types'
import { numberLocaleFor, withLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { getLocale } from '@/i18n/get-locale'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ id: string }> }

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params
  const locale = await getLocale()
  const raw = await getProductById(id)
  if (!raw) return { title: 'Loja — SportsEvents.app' }
  const product = localizeStoreProduct(raw, locale)
  return {
    title: `${product.name} — SportsEvents.app`,
    description:
      stripHtml(product.short_description || product.description || '') ||
      undefined,
  }
}

function youtubeId(url: string): string | null {
  const m = url.match(
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  )
  return m && m[2].length === 11 ? m[2] : null
}

export default async function StoreProductPage({ params }: PageProps) {
  const { id } = await params
  const locale = await getLocale()
  const t = getDictionary(locale).store
  const raw = await getProductById(id)
  if (!raw) notFound()

  const product = localizeStoreProduct(raw, locale)
  const numberLocale = numberLocaleFor(locale)
  const images = productImageList(product)
  const features = productFeatures(product)
  const descriptionHtml =
    product.description || product.short_description || ''
  const yt = product.video_url ? youtubeId(product.video_url) : null

  return (
    <div className="min-h-screen bg-navy text-app-white">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-14">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <Link
            href={withLocale('/store', locale)}
            className="text-sm text-app-white/55 hover:text-cyan"
          >
            ← {t.backToStore}
          </Link>
          <StoreCartLink locale={locale} label={t.cart} />
        </div>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <ProductGallery images={images} alt={product.name} />

          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gold">
                {product.category?.name || t.eyebrow}
              </p>
              <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold text-white md:text-4xl">
                {product.name}
              </h1>
              {product.brand?.name ? (
                <p className="mt-2 text-sm text-app-white/45">
                  {product.brand.name}
                </p>
              ) : null}
            </div>

            <div className="flex items-baseline gap-3">
              {product.compare_at_price &&
              Number(product.compare_at_price) > Number(product.price) ? (
                <span className="text-lg text-app-white/35 line-through">
                  {formatEuro(Number(product.compare_at_price), numberLocale)}
                </span>
              ) : null}
              <span className="text-3xl font-extrabold text-cyan">
                {formatEuro(Number(product.price), numberLocale)}
              </span>
            </div>

            {!product.is_digital && product.stock === 0 ? (
              <p className="font-semibold text-red-400">{t.soldOut}</p>
            ) : !product.is_digital && product.stock > 0 && product.stock <= 5 ? (
              <p className="text-sm font-semibold text-gold">
                {t.onlyLeft.replace('{n}', String(product.stock))}
              </p>
            ) : !product.is_digital ? (
              <p className="text-sm font-semibold text-emerald-400">
                {t.inStock}
              </p>
            ) : null}

            {features.length > 0 ? (
              <div>
                <h2 className="mb-3 text-lg font-bold text-white">
                  {t.featuresTitle}
                </h2>
                <ul className="space-y-2">
                  {features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-app-white/75"
                    >
                      <span className="mt-0.5 text-cyan">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {descriptionHtml ? (
              <div
                className="store-prose text-sm leading-relaxed text-app-white/75 md:text-base"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            ) : null}

            {yt ? (
              <div className="overflow-hidden rounded-2xl border border-white/10 aspect-video">
                <iframe
                  title={product.name}
                  src={`https://www.youtube.com/embed/${yt}`}
                  className="h-full w-full"
                  allowFullScreen
                />
              </div>
            ) : null}

            {product.learn_more_url ? (
              <Link
                href={product.learn_more_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-xl bg-cyan px-6 py-3 text-sm font-bold text-navy hover:bg-cyan/90"
              >
                {t.learnMore}
              </Link>
            ) : product.stock === 0 && !product.is_digital ? null : (
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
