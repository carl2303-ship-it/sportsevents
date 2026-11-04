import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { StoreProductClient } from '@/components/store/store-product-client'
import { localizeStoreProduct } from '@/lib/boost-store/localize'
import { getProductById } from '@/lib/boost-store/products'
import { stripHtml } from '@/lib/boost-store/types'
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

export default async function StoreProductPage({ params }: PageProps) {
  const { id } = await params
  const raw = await getProductById(id)
  if (!raw) notFound()
  return <StoreProductClient raw={raw} />
}
