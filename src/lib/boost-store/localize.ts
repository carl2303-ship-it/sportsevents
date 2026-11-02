import type { Locale } from '@/i18n/config'
import type { BoostCategory, BoostProduct } from '@/lib/boost-store/types'
import {
  localizeProduct as legacyLocalizeProduct,
  localizeProducts as legacyLocalizeProducts,
  localizeCategory as legacyLocalizeCategory,
  localizeCategories as legacyLocalizeCategories,
} from './legacy/i18n-content.js'

/** Map SE locales → Boost i18n keys (Boost has pt/en/es/it/fr; SE has de). */
export function boostLang(locale: Locale): string {
  if (locale === 'de') return 'en'
  return locale
}

export function localizeStoreProducts(
  products: BoostProduct[],
  locale: Locale
): BoostProduct[] {
  return legacyLocalizeProducts(products, boostLang(locale)) as BoostProduct[]
}

export function localizeStoreProduct(
  product: BoostProduct,
  locale: Locale
): BoostProduct {
  return legacyLocalizeProduct(product, boostLang(locale)) as BoostProduct
}

export function localizeStoreCategories(
  categories: BoostCategory[],
  locale: Locale
): BoostCategory[] {
  return legacyLocalizeCategories(
    categories,
    boostLang(locale)
  ) as BoostCategory[]
}

export function localizeStoreCategory(
  category: BoostCategory,
  locale: Locale
): BoostCategory {
  return legacyLocalizeCategory(category, boostLang(locale)) as BoostCategory
}
