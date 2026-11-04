import type { Metadata } from 'next'
import { StoreHomeClient } from '@/components/store/store-home-client'
import {
  listActiveBrands,
  listActiveCategories,
  listActiveProducts,
} from '@/lib/boost-store/products'
import { getDictionary } from '@/i18n/dictionaries'
import { getLocale } from '@/i18n/get-locale'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = getDictionary(locale).store
  return { title: t.metaTitle, description: t.metaDescription }
}

export default async function StorePage() {
  const [rawProducts, rawCategories, brands] = await Promise.all([
    listActiveProducts(),
    listActiveCategories(),
    listActiveBrands(),
  ])

  return (
    <StoreHomeClient
      rawProducts={rawProducts}
      rawCategories={rawCategories}
      brands={brands}
    />
  )
}
