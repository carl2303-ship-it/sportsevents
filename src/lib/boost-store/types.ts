export type BoostCategory = {
  id: string
  name: string
  slug: string
  description?: string | null
  active?: boolean
  display_order?: number | null
  shortName?: string
}

export type BoostBrand = {
  id: string
  name: string
  slug: string
  active?: boolean
}

export type BoostColor = {
  name: string
  hex: string
}

export type BoostProduct = {
  id: string
  name: string
  description?: string | null
  short_description?: string | null
  price: number
  compare_at_price?: number | null
  stock: number
  image_url?: string | null
  additional_images?: string[] | null
  video_url?: string | null
  features?: string[] | string | null
  colors?: BoostColor[] | null
  sizes?: string[] | null
  active?: boolean
  is_featured?: boolean | null
  is_digital?: boolean | null
  /** Custom hub order (lower = earlier within featured / in-stock buckets). */
  display_order?: number | null
  learn_more_url?: string | null
  funnel_slug?: string | null
  category_id?: string | null
  brand_id?: string | null
  created_at?: string | null
  category?: BoostCategory | null
  brand?: BoostBrand | null
  translations?: Record<string, Record<string, string>> | null
}

/** Physical stock 0 only — digitals often store stock=0 and stay buyable. */
export function isProductSoldOut(product: BoostProduct): boolean {
  return !product.is_digital && Number(product.stock) === 0
}

/**
 * Store order: in-stock first, featured first, then display_order, then created_at.
 * Sold-out physical products always sink to the end.
 */
export function compareStoreProducts(a: BoostProduct, b: BoostProduct): number {
  const soldA = isProductSoldOut(a) ? 1 : 0
  const soldB = isProductSoldOut(b) ? 1 : 0
  if (soldA !== soldB) return soldA - soldB

  const featA = a.is_featured ? 1 : 0
  const featB = b.is_featured ? 1 : 0
  if (featA !== featB) return featB - featA

  const orderA = Number(a.display_order ?? 0)
  const orderB = Number(b.display_order ?? 0)
  if (orderA !== orderB) return orderA - orderB

  const createdA = a.created_at || ''
  const createdB = b.created_at || ''
  if (createdA !== createdB) return createdB.localeCompare(createdA)

  return String(a.name || '').localeCompare(String(b.name || ''), 'pt')
}

export type StoreCartItem = {
  id: string
  name: string
  price: number
  image?: string
  type: 'physical' | 'digital'
  quantity: number
  category?: string
}

export function productImageList(product: BoostProduct): string[] {
  const extras = Array.isArray(product.additional_images)
    ? product.additional_images.filter(Boolean)
    : []
  const main = product.image_url ? [product.image_url] : []
  return [...new Set([...main, ...extras])]
}

export function productFeatures(product: BoostProduct): string[] {
  if (!product.features) return []
  if (Array.isArray(product.features)) return product.features.map(String)
  try {
    const parsed = JSON.parse(product.features)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

/** Strip tags for card previews (descriptions are HTML in Boost). */
export function stripHtml(html: string): string {
  return String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
